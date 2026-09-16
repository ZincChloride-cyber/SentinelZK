import type { ContractSafetyAttestation, VerdictType } from '@/lib/types'
import { displayNetworkLabel, midnightContractAddress, useMockOracle } from './config'
import { MidnightClientError, toMidnightClientError } from './errors'
import { bytesToHex, parseModelHash, targetIdFromAddress } from './encoding'

export type MidnightAttestationRecord = {
  target: string
  targetId: string
  isSafe: boolean
  modelHash: string
  threshold: number
  attestedAt: number
  contractAddress: string
  network: string
  txId?: string
  blockHeight?: number
}

export type SubmitSafetyAttestationInput = {
  target: string
}

export async function getSafetyAttestation(target: string): Promise<ContractSafetyAttestation> {
  if (useMockOracle()) {
    throw new MidnightClientError(
      'DEPLOY_CONFIG_MISSING',
      'Midnight oracle is disabled while NEXT_PUBLIC_USE_MOCK_ORACLE is true.',
    )
  }

  const address = midnightContractAddress()
  if (!address) {
    throw new MidnightClientError(
      'DEPLOY_CONFIG_MISSING',
      'The Midnight oracle address is not configured.',
    )
  }

  try {
    const res = await fetch(`/api/midnight/attestation?target=${encodeURIComponent(target)}`, {
      cache: 'no-store',
    })
    const payload = await res.json()
    if (res.status === 404 || payload?.found === false) {
      throw new MidnightClientError(
        'MISSING_ATTESTATION',
        'No safety attestation has been published for this contract yet.',
      )
    }
    if (!res.ok) {
      throw new MidnightClientError(
        (payload?.code as MidnightClientError['code']) || 'CONTRACT_CALL_FAILED',
        payload?.error || 'Could not read the Midnight oracle.',
      )
    }
    return toUiAttestation(payload as MidnightAttestationRecord)
  } catch (err) {
    throw toMidnightClientError(err)
  }
}

export async function submitSafetyAttestation(
  input: SubmitSafetyAttestationInput,
): Promise<ContractSafetyAttestation> {
  if (useMockOracle()) {
    throw new MidnightClientError(
      'DEPLOY_CONFIG_MISSING',
      'Publishing is disabled while the mock oracle is enabled.',
    )
  }

  try {
    const res = await fetch('/api/midnight/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: input.target }),
    })
    const payload = await res.json()
    if (!res.ok) {
      throw new MidnightClientError(
        (payload?.code as MidnightClientError['code']) || 'CONTRACT_CALL_FAILED',
        payload?.error || 'Could not publish the attestation.',
      )
    }
    return toUiAttestation(payload.attestation as MidnightAttestationRecord, payload.txId, payload.blockHeight)
  } catch (err) {
    throw toMidnightClientError(err)
  }
}

export function toUiAttestation(
  record: MidnightAttestationRecord,
  txId?: string,
  blockHeight?: number,
): ContractSafetyAttestation {
  const verdict: VerdictType = record.isSafe ? 'SAFE' : 'EXPLOIT_DETECTED'
  const verifiedAt = record.attestedAt > 1_000_000_000_000 ? record.attestedAt : record.attestedAt * 1000
  const proofRef = txId || record.txId || record.targetId

  return {
    targetAddress: record.target,
    targetName: `Midnight Oracle (${record.target.slice(0, 6)}...${record.target.slice(-4)})`,
    protocol: 'SentinelZK Midnight Oracle',
    verdict,
    isSafe: record.isSafe,
    summary: record.isSafe
      ? 'Midnight Compact circuit verified that the private risk score is below the registered threshold for the bound model.'
      : 'Midnight Compact circuit verified that the private risk score is not below the registered threshold for the bound model.',
    telemetry: emptyTelemetry(),
    proof: {
      circuitName: 'submitAttestation',
      proofRef,
      modelHash: record.modelHash,
      modelVersionId: 'registered-on-chain',
      threshold: record.threshold,
      blockHeight: blockHeight ?? record.blockHeight ?? 0,
      verifiedAt,
      network: displayNetworkLabel() as ContractSafetyAttestation['proof']['network'],
      oracleAddress: record.contractAddress,
      publicInputs: {
        contractAddress: record.target,
        expectedModelHash: record.modelHash,
        threshold: record.threshold,
        timestamp: verifiedAt,
      },
      statement: `Proves: private ML_risk_score ${record.isSafe ? '<' : '>='} ${record.threshold} AND model_hash matches the registered oracle model. The raw score is not on ledger.`,
    },
    riskFlags: record.isSafe
      ? ['On-chain Compact verdict: SAFE']
      : ['On-chain Compact verdict: NOT SAFE'],
    attestationSource: 'midnight',
  }
}

function emptyTelemetry(): ContractSafetyAttestation['telemetry'] {
  const unknown = (label: string) => ({ value: 0, label, isAnomalous: false })
  return {
    lpRemovalVelocity: unknown('Not disclosed on Midnight ledger'),
    ownershipChangeCount: unknown('Not disclosed on Midnight ledger'),
    topHolderConcentration: unknown('Not disclosed on Midnight ledger'),
    contractAgeDays: unknown('Not disclosed on Midnight ledger'),
    isVerifiedSource: { value: false, label: 'Telemetry stays off-chain', isAnomalous: false },
    holderGrowthRate: unknown('Not disclosed on Midnight ledger'),
  }
}

export async function describeTargetBinding(address: string): Promise<{ targetId: string }> {
  const id = await targetIdFromAddress(address)
  return { targetId: bytesToHex(id) }
}

export function assertModelHashShape(modelHash: string): void {
  parseModelHash(modelHash)
}
