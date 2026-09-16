import { WebSocket } from 'ws'
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id'
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider'
import {
  deployContract,
  findDeployedContract,
} from '@midnight-ntwrk/midnight-js-contracts'
import {
  MidnightWalletProvider,
  initializeMidnightProviders,
  type EnvironmentConfiguration,
} from '@midnight-ntwrk/testkit-js'
import { CompiledSafetyOracleContract, ledger, zkConfigPath } from '../contracts/index.js'
import { getConfig, getNetworkName, resolveWalletSecret, type NetworkConfig } from './config.js'
import { bytesToHex, parseHexBytes32, parseRiskScore, parseThreshold, targetIdFromAddress } from './encoding.js'
import { SentinelMidnightError, userFacingError } from './errors.js'
import { createPrivateState, type SafetyOraclePrivateState } from './witnesses.js'
import { createLogger } from './logger.js'

// GraphQL subscriptions in Node require a WebSocket implementation.
globalThis.WebSocket = WebSocket as unknown as typeof globalThis.WebSocket

const PRIVATE_STATE_ID = 'sentinelzk-safety-oracle'

export type PublicOracleAttestation = {
  target: string
  targetId: string
  isSafe: boolean
  modelHash: string
  threshold: number
  attestedAt: number
  contractAddress: string
  network: string
}

export type SubmitAttestationInput = {
  target: string
  riskScore: number | bigint | string
  modelHash: string
  contractAddress?: string
}

function toEnvConfig(config: NetworkConfig): EnvironmentConfiguration {
  return {
    walletNetworkId: config.networkId as EnvironmentConfiguration['walletNetworkId'],
    networkId: config.networkId,
    indexer: config.indexer,
    indexerWS: config.indexerWS,
    node: config.node,
    nodeWS: config.nodeWS,
    proofServer: config.proofServer,
    faucet: config.faucet || undefined,
  }
}

export function createPublicDataProvider(config: NetworkConfig = getConfig()) {
  setNetworkId(config.networkId)
  return indexerPublicDataProvider(config.indexer, config.indexerWS)
}

export async function getSafetyAttestation(
  target: string,
  contractAddress = process.env.MIDNIGHT_CONTRACT_ADDRESS?.trim(),
): Promise<PublicOracleAttestation | null> {
  if (!contractAddress) {
    throw new SentinelMidnightError(
      'DEPLOY_CONFIG_MISSING',
      'The Midnight oracle address is not configured.',
    )
  }

  const config = getConfig()
  setNetworkId(config.networkId)
  const provider = createPublicDataProvider(config)
  const targetId = targetIdFromAddress(target)

  let state
  try {
    state = await provider.queryContractState(contractAddress)
  } catch (err) {
    throw userFacingError(err)
  }

  if (!state) {
    throw new SentinelMidnightError(
      'NETWORK_UNAVAILABLE',
      'No contract state was found at the configured oracle address.',
    )
  }

  const view = ledger(state.data)
  if (!view.attestations.member(targetId)) {
    return null
  }

  const att = view.attestations.lookup(targetId)
  return {
    target,
    targetId: bytesToHex(targetId),
    isSafe: att.isSafe,
    modelHash: bytesToHex(att.modelHash),
    threshold: Number(att.threshold),
    attestedAt: Number(att.attestedAt),
    contractAddress,
    network: config.networkId,
  }
}

export async function withWalletProviders() {
  const logger = createLogger()
  const config = getConfig()
  const network = getNetworkName()
  const secret = resolveWalletSecret(network)
  const env = toEnvConfig(config)
  setNetworkId(config.networkId)

  const seedOrMnemonic = secret.kind === 'seed' ? secret.value : undefined
  if (secret.kind === 'mnemonic') {
    throw new SentinelMidnightError(
      'DEPLOY_CONFIG_MISSING',
      'This toolchain build expects MIDNIGHT_*_SEED (hex). Mnemonic support is available via FluentWalletBuilder if you need it.',
    )
  }

  const wallet = await MidnightWalletProvider.build(logger, env, seedOrMnemonic)
  await wallet.start()

  const providers = initializeMidnightProviders(wallet, env, {
    privateStateStoreName: 'sentinelzk-safety-oracle',
    zkConfigPath,
  })

  return { wallet, providers, logger, config, network }
}

export async function deploySafetyOracle(options?: {
  expectedModelHash?: string
  threshold?: number | bigint | string
}): Promise<{
  network: string
  contractAddress: string
  expectedModelHash: string
  threshold: number
}> {
  const expectedModelHash = parseHexBytes32(
    options?.expectedModelHash ?? process.env.MIDNIGHT_EXPECTED_MODEL_HASH ?? '',
    'MIDNIGHT_EXPECTED_MODEL_HASH',
  )
  const threshold = parseThreshold(options?.threshold ?? process.env.MIDNIGHT_SAFETY_THRESHOLD ?? '50')

  const { wallet, providers, logger, config, network } = await withWalletProviders()
  try {
    const initialPrivateState = createPrivateState(0n, expectedModelHash)
    logger.info({ network, threshold: Number(threshold) }, 'Deploying SafetyOracle')

    const deployed = await deployContract(providers, {
      compiledContract: CompiledSafetyOracleContract,
      privateStateId: PRIVATE_STATE_ID,
      initialPrivateState,
      args: [expectedModelHash, threshold],
    })

    const contractAddress = deployed.deployTxData.public.contractAddress
    logger.info({ contractAddress, network }, 'SafetyOracle deployed')

    return {
      network: config.networkId,
      contractAddress,
      expectedModelHash: bytesToHex(expectedModelHash),
      threshold: Number(threshold),
    }
  } catch (err) {
    throw userFacingError(err)
  } finally {
    await wallet.stop()
  }
}

export async function submitSafetyAttestation(input: SubmitAttestationInput): Promise<{
  txId?: string
  blockHeight?: number
  attestation: PublicOracleAttestation
}> {
  const contractAddress = input.contractAddress ?? process.env.MIDNIGHT_CONTRACT_ADDRESS?.trim()
  if (!contractAddress) {
    throw new SentinelMidnightError(
      'DEPLOY_CONFIG_MISSING',
      'The Midnight oracle address is not configured.',
    )
  }

  const modelHash = parseHexBytes32(input.modelHash, 'modelHash')
  const riskScore = parseRiskScore(input.riskScore)
  const targetId = targetIdFromAddress(input.target)
  const attestedAt = BigInt(Math.floor(Date.now() / 1000))
  const privateState: SafetyOraclePrivateState = createPrivateState(riskScore, modelHash)

  const { wallet, providers, logger } = await withWalletProviders()
  try {
    const found = await findDeployedContract(providers, {
      compiledContract: CompiledSafetyOracleContract,
      contractAddress,
      privateStateId: PRIVATE_STATE_ID,
      initialPrivateState: privateState,
    })

    logger.info({ target: input.target }, 'Submitting safety attestation')

    const call = await found.callTx.submitAttestation(targetId, attestedAt)
    const txId = call.public.txId
    const blockHeight = Number(call.public.blockHeight ?? 0)

    const attestation = await getSafetyAttestation(input.target, contractAddress)
    if (!attestation) {
      throw new SentinelMidnightError(
        'MISSING_ATTESTATION',
        'The attestation was submitted but could not be read back from the ledger yet.',
      )
    }

    return { txId, blockHeight, attestation }
  } catch (err) {
    if (err instanceof SentinelMidnightError) throw err
    throw userFacingError(err)
  } finally {
    await wallet.stop()
  }
}
