export type VerdictType = 'SAFE' | 'EXPLOIT_DETECTED' | 'SUSPICIOUS'

export type ProofStatus = 'verified' | 'generating' | 'failed' | 'unverified'

export interface FeatureTelemetry {
  /** Rate of liquidity removal (% pool / hour) */
  lpRemovalVelocity: {
    value: number
    label: string
    isAnomalous: boolean
  }
  /** Number of admin/owner key changes in past 30 days */
  ownershipChangeCount: {
    value: number
    label: string
    isAnomalous: boolean
  }
  /** Percentage of supply or LP tokens held by top 10 wallets */
  topHolderConcentration: {
    value: number
    label: string
    isAnomalous: boolean
  }
  /** Age since contract deployment in days */
  contractAgeDays: {
    value: number
    label: string
    isAnomalous: boolean
  }
  /** Whether the source code bytecode is verified against on-chain metadata */
  isVerifiedSource: {
    value: boolean
    label: string
    isAnomalous: boolean
  }
  /** Growth or decline percentage in unique wallet interactions over 7d */
  holderGrowthRate: {
    value: number
    label: string
    isAnomalous: boolean
  }
}

export interface ZKProofMetadata {
  /** Circuit identifier matching Midnight Compact circuit */
  circuitName: string
  /** Reference identifier or on-chain transaction hash for proof verification */
  proofRef: string
  /** SHA-256 hash of the serialized ML model weights registered on-chain */
  modelHash: string
  /** Version tag of the registered model */
  modelVersionId: string
  /** Risk score threshold set in the ZK circuit constraint (e.g., 50) */
  threshold: number
  /** Midnight ledger block height where attestation is recorded */
  blockHeight: number
  /** Timestamp in ms */
  verifiedAt: number
  /** Network name */
  network: 'Midnight Preprod' | 'Midnight Devnet' | 'Midnight Local'
  /** Oracle contract address on Midnight */
  oracleAddress: string
  /** Public inputs disclosed to the Midnight circuit */
  publicInputs: {
    contractAddress: string
    expectedModelHash: string
    threshold: number
    timestamp: number
  }
  /** Cryptographic statement proven in zero-knowledge */
  statement: string
}

export interface ContractSafetyAttestation {
  /** Target contract or liquidity pool address */
  targetAddress: string
  /** Optional human-readable name or label (e.g., "Uniswap V3 USDC/ETH Pool") */
  targetName?: string
  /** Protocol name (e.g., "MidnightSwap", "Uniswap", "ShadowToken") */
  protocol?: string
  /** Evaluated verdict */
  verdict: VerdictType
  /** Binary safety indicator directly written to Midnight Oracle ledger */
  isSafe: boolean
  /** Risk classification summary */
  summary: string
  /** Telemetry signals ingested by the off-chain pipeline */
  telemetry: FeatureTelemetry
  /** Zero-knowledge proof and on-chain oracle metadata */
  proof: ZKProofMetadata
  /** Key security flags or risk drivers observed */
  riskFlags: string[]
  /** Where the displayed attestation came from. Optional so existing mock/ML data stays valid. */
  attestationSource?: 'mock' | 'ml' | 'midnight'
}

export interface OracleStats {
  totalAttestations: number
  verifiedSafePools: number
  exploitsPrevented: number
  activeMonitoredContracts: number
  avgProofTimeMs: number
  registeredModelVersion: string
  registeredModelHash: string
}

export type AnalysisStage = 
  | 'idle'
  | 'ingesting_telemetry'
  | 'ml_scoring'
  | 'compact_proving'
  | 'midnight_verifying'
  | 'complete'
  | 'error'

export interface AnalysisProgress {
  stage: AnalysisStage
  stepNumber: number
  totalSteps: number
  message: string
}
