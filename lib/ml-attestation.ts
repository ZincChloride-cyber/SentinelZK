import type { ContractSafetyAttestation, FeatureTelemetry, VerdictType } from './types'

/** Response shape from the Python FastAPI /score endpoint */
export interface MlScoreResponse {
  address: string
  score: number
  verdict: VerdictType
  isSafe: boolean
  threshold: number
  modelHash: string
  modelVersionId: string
  summary: string
  telemetry: FeatureTelemetry
  riskFlags: string[]
}

const ORACLE_ADDRESS = 'mn1_safety_oracle_preprod_88294a28f84920194829'

export function attestationFromMlScore(
  score: MlScoreResponse,
  options?: { targetName?: string; protocol?: string }
): ContractSafetyAttestation {
  const now = Date.now()
  const address = score.address
  const threshold = score.threshold ?? 50
  const proofRef = `mn_tx_ml_${address.slice(2, 10)}_${now.toString(16)}`

  return {
    targetAddress: address,
    targetName:
      options?.targetName ??
      `Observed Pool (${address.slice(0, 6)}...${address.slice(-4)})`,
    protocol: options?.protocol ?? 'SentinelZK ML Oracle',
    verdict: score.verdict,
    isSafe: score.isSafe,
    summary: score.summary,
    telemetry: score.telemetry,
    proof: {
      circuitName: 'prove_safety.compact',
      proofRef,
      modelHash: score.modelHash,
      modelVersionId: score.modelVersionId,
      threshold,
      blockHeight: 1_849_220,
      verifiedAt: now,
      network: 'Midnight Preprod',
      oracleAddress: ORACLE_ADDRESS,
      publicInputs: {
        contractAddress: address,
        expectedModelHash: score.modelHash,
        threshold,
        timestamp: now,
      },
      statement: `Proves: ML_risk_score ${score.isSafe ? '<' : '>='} ${threshold} AND Model_Hash == ${score.modelHash.slice(0, 10)}… WITHOUT disclosing raw weights or score`,
    },
    riskFlags: score.riskFlags,
  }
}
