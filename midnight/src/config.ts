import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

function loadEnvFile(filePath: string) {
  if (!existsSync(filePath)) return
  const text = readFileSync(filePath, 'utf8')
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq <= 0) continue
    const key = line.slice(0, eq).trim()
    let value = line.slice(eq + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

loadEnvFile(path.resolve(process.cwd(), '.env'))
loadEnvFile(path.resolve(process.cwd(), `.env.${process.env.MIDNIGHT_NETWORK ?? 'preprod'}`))
loadEnvFile(path.resolve(process.cwd(), '.env.local'))

export type NetworkName = 'local' | 'preview' | 'preprod'

export type NetworkConfig = {
  networkId: string
  indexer: string
  indexerWS: string
  node: string
  nodeWS: string
  proofServer: string
  faucet: string
}

export const LOCAL_CONFIG: NetworkConfig = {
  networkId: 'undeployed',
  indexer: 'http://127.0.0.1:8088/api/v4/graphql',
  indexerWS: 'ws://127.0.0.1:8088/api/v4/graphql/ws',
  node: 'http://127.0.0.1:9944',
  nodeWS: 'ws://127.0.0.1:9944',
  proofServer: 'http://127.0.0.1:6300',
  faucet: '',
}

export const PREVIEW_CONFIG: NetworkConfig = {
  networkId: 'preview',
  indexer: 'https://indexer.preview.midnight.network/api/v4/graphql',
  indexerWS: 'wss://indexer.preview.midnight.network/api/v4/graphql/ws',
  node: 'https://rpc.preview.midnight.network',
  nodeWS: 'wss://rpc.preview.midnight.network',
  proofServer: process.env.MIDNIGHT_PROOF_SERVER ?? 'http://127.0.0.1:6300',
  faucet: 'https://midnight-tmnight-preview.nethermind.dev/',
}

export const PREPROD_CONFIG: NetworkConfig = {
  networkId: 'preprod',
  indexer: 'https://indexer.preprod.midnight.network/api/v4/graphql',
  indexerWS: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
  node: 'https://rpc.preprod.midnight.network',
  nodeWS: 'wss://rpc.preprod.midnight.network',
  proofServer: process.env.MIDNIGHT_PROOF_SERVER ?? 'http://127.0.0.1:6300',
  faucet: 'https://midnight-tmnight-preprod.nethermind.dev/',
}

export function getNetworkName(): NetworkName {
  const network = (process.env.MIDNIGHT_NETWORK ?? 'preprod').trim().toLowerCase()
  if (network === 'local' || network === 'preview' || network === 'preprod') {
    return network
  }
  throw new Error(`Unknown MIDNIGHT_NETWORK '${network}'. Use local, preview, or preprod.`)
}

export function getConfig(): NetworkConfig {
  const network = getNetworkName()
  if (network === 'local') return LOCAL_CONFIG
  if (network === 'preview') return PREVIEW_CONFIG
  return PREPROD_CONFIG
}

export type WalletSecret =
  | { kind: 'seed'; value: string }
  | { kind: 'mnemonic'; value: string }

export function resolveWalletSecret(network: NetworkName): WalletSecret {
  if (network === 'local') {
    return {
      kind: 'seed',
      value: process.env.MIDNIGHT_LOCAL_SEED?.trim() || '0000000000000000000000000000000000000000000000000000000000000001',
    }
  }

  const upper = network.toUpperCase()
  const mnemonic = process.env[`MIDNIGHT_${upper}_MNEMONIC`]?.trim().replace(/\s+/g, ' ')
  const seed = process.env[`MIDNIGHT_${upper}_SEED`]?.trim()

  if (mnemonic && seed) {
    throw new Error(`Set only one of MIDNIGHT_${upper}_MNEMONIC or MIDNIGHT_${upper}_SEED.`)
  }
  if (mnemonic) return { kind: 'mnemonic', value: mnemonic }
  if (seed) {
    const hex = seed.replace(/^0x/, '')
    if (!/^[0-9a-fA-F]+$/.test(hex) || hex.length % 2 !== 0) {
      throw new Error(`MIDNIGHT_${upper}_SEED must be even-length hex with no 0x prefix.`)
    }
    return { kind: 'seed', value: hex }
  }
  throw new Error(
    `Deployment configuration missing: set MIDNIGHT_${upper}_SEED or MIDNIGHT_${upper}_MNEMONIC in midnight/.env.${network}.`,
  )
}

export function getContractAddress(): string {
  const address = process.env.MIDNIGHT_CONTRACT_ADDRESS?.trim()
  if (!address) {
    throw new Error(
      'MIDNIGHT_CONTRACT_ADDRESS is not set. Deploy the contract first (`npm run deploy`) and copy the address into your env file.',
    )
  }
  return address
}
