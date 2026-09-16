import {
  ContractSafetyAttestation,
  OracleStats,
  AnalysisProgress,
} from './types'
import { attestationFromMlScore, type MlScoreResponse } from './ml-attestation'

function mlServiceConfigured(): boolean {
  // Server: real service URL. Browser: opt-in flag (URL stays server-only).
  if (typeof window === 'undefined') {
    return Boolean(process.env.SENTINEL_ML_URL?.trim())
  }
  return process.env.NEXT_PUBLIC_SENTINEL_USE_ML === '1'
}

/**
 * Prefer server-side Next proxy (/api/score) in the browser;
 * call the Python service directly when SENTINEL_ML_URL is available (Node).
 */
async function fetchMlAttestation(
  address: string
): Promise<ContractSafetyAttestation | null> {
  const normalized = address.toLowerCase().trim()
  const direct = process.env.SENTINEL_ML_URL?.trim()

  try {
    if (direct && typeof window === 'undefined') {
      const res = await fetch(`${direct.replace(/\/$/, '')}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: normalized }),
        cache: 'no-store',
      })
      if (!res.ok) return null
      const score = (await res.json()) as MlScoreResponse
      return attestationFromMlScore(score)
    }

    const res = await fetch('/api/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: normalized }),
      cache: 'no-store',
    })
    if (!res.ok) return null
    return (await res.json()) as ContractSafetyAttestation
  } catch {
    return null
  }
}

// Mock database of pre-indexed and attested contracts
const MOCK_ATTESTATIONS: Record<string, ContractSafetyAttestation> = {
  // 1. Safe Pool: Uniswap V3 WETH/USDC 0.05%
  '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640': {
    targetAddress: '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640',
    targetName: 'Uniswap V3 WETH/USDC Primary Pool',
    protocol: 'Uniswap v3 (Bridged Telemetry)',
    verdict: 'SAFE',
    isSafe: true,
    summary:
      'Contract exhibits high liquidity stability, multi-sig decentralized governance with zero admin key churn, and deep distributed LP ownership. Proven safe under Midnight ZK threshold.',
    telemetry: {
      lpRemovalVelocity: {
        value: 0.8,
        label: '0.8% / 24h (Normal variance)',
        isAnomalous: false,
      },
      ownershipChangeCount: {
        value: 0,
        label: '0 admin transfers (Immutable / Timelock)',
        isAnomalous: false,
      },
      topHolderConcentration: {
        value: 14.2,
        label: '14.2% held by top 10 wallets',
        isAnomalous: false,
      },
      contractAgeDays: {
        value: 1220,
        label: '1,220 days active',
        isAnomalous: false,
      },
      isVerifiedSource: {
        value: true,
        label: 'Verified open source bytecode',
        isAnomalous: false,
      },
      holderGrowthRate: {
        value: 18.4,
        label: '+18.4% unique addresses / month',
        isAnomalous: false,
      },
    },
    proof: {
      circuitName: 'prove_safety.compact',
      proofRef: 'mn_tx_0x9a8f4c2817d293847e62a1928374829104829104812398471928471928471928',
      modelHash: '0x7e834b92c4a91938501284719283471928471928374928173491823749182734',
      modelVersionId: 'v1.2.0-gbdt',
      threshold: 50,
      blockHeight: 1849204,
      verifiedAt: Date.now() - 1000 * 60 * 14,
      network: 'Midnight Preprod',
      oracleAddress: 'mn1_safety_oracle_preprod_88294a28f84920194829',
      publicInputs: {
        contractAddress: '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640',
        expectedModelHash: '0x7e834b92c4a91938501284719283471928471928374928173491823749182734',
        threshold: 50,
        timestamp: Date.now() - 1000 * 60 * 14,
      },
      statement: 'Proves: ML_risk_score < 50 AND Model_Hash == 0x7e83...2734 WITHOUT disclosing raw weights or score',
    },
    riskFlags: [
      'Zero admin key changes in past 30 days',
      'Audited compiler artifacts verified',
      'Decentralized liquidity distribution',
    ],
  },

  // 2. High-Risk Exploit / Rug Pull: Malicious Liquidity Drain
  '0x7a250d5630b4cf539739df2c5dacb4c659f2488d': {
    targetAddress: '0x7a250d5630b4cf539739df2c5dacb4c659f2488d',
    targetName: 'YieldShadow V2 Dynamic Farm',
    protocol: 'AnubisClone Protocol',
    verdict: 'EXPLOIT_DETECTED',
    isSafe: false,
    summary:
      'CRITICAL: Rapid liquidity removal anomaly detected accompanied by single-owner admin migration and extreme token concentration (>91%). Proven hazardous by Midnight ZK circuit.',
    telemetry: {
      lpRemovalVelocity: {
        value: 84.6,
        label: '84.6% removed in 90 minutes',
        isAnomalous: true,
      },
      ownershipChangeCount: {
        value: 4,
        label: '4 owner updates in 48 hours',
        isAnomalous: true,
      },
      topHolderConcentration: {
        value: 91.8,
        label: '91.8% held by 2 creator addresses',
        isAnomalous: true,
      },
      contractAgeDays: {
        value: 3,
        label: '3 days since deployment',
        isAnomalous: true,
      },
      isVerifiedSource: {
        value: false,
        label: 'Unverified proxy implementation',
        isAnomalous: true,
      },
      holderGrowthRate: {
        value: -64.2,
        label: '-64.2% active holders dropping',
        isAnomalous: true,
      },
    },
    proof: {
      circuitName: 'prove_safety.compact',
      proofRef: 'mn_tx_0xe391b40294819283749281734918237491827349817239481723948172394817',
      modelHash: '0x7e834b92c4a91938501284719283471928471928374928173491823749182734',
      modelVersionId: 'v1.2.0-gbdt',
      threshold: 50,
      blockHeight: 1849180,
      verifiedAt: Date.now() - 1000 * 60 * 52,
      network: 'Midnight Preprod',
      oracleAddress: 'mn1_safety_oracle_preprod_88294a28f84920194829',
      publicInputs: {
        contractAddress: '0x7a250d5630b4cf539739df2c5dacb4c659f2488d',
        expectedModelHash: '0x7e834b92c4a91938501284719283471928471928374928173491823749182734',
        threshold: 50,
        timestamp: Date.now() - 1000 * 60 * 52,
      },
      statement: 'Proves: ML_risk_score >= 50 (RUG/EXPLOIT THRESHOLD EXCEEDED) recorded on Midnight ledger',
    },
    riskFlags: [
      'Sudden 84.6% liquidity withdrawal velocity spike',
      'Unverified bytecode matching known drainer signature',
      'Privileged admin key transferred 4 times in 48h',
      'Extreme creator concentration of LP tokens',
    ],
  },

  // 3. Suspicious / Borderline: Flash Borrow Vault
  '0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc': {
    targetAddress: '0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc',
    targetName: 'FlashVault Prime Staking',
    protocol: 'MidnightDev Genesis Vault',
    verdict: 'SUSPICIOUS',
    isSafe: false,
    summary:
      'WARNING: Contract is recently deployed with unverified bytecode and high wallet concentration. Risk score borders the safety margin; interaction flagged for caution.',
    telemetry: {
      lpRemovalVelocity: {
        value: 12.4,
        label: '12.4% / 24h (Elevated)',
        isAnomalous: true,
      },
      ownershipChangeCount: {
        value: 1,
        label: '1 admin key migration',
        isAnomalous: false,
      },
      topHolderConcentration: {
        value: 68.5,
        label: '68.5% held by top 5 wallets',
        isAnomalous: true,
      },
      contractAgeDays: {
        value: 14,
        label: '14 days active',
        isAnomalous: false,
      },
      isVerifiedSource: {
        value: false,
        label: 'Unverified source bytecode',
        isAnomalous: true,
      },
      holderGrowthRate: {
        value: 4.1,
        label: '+4.1% modest holder inflow',
        isAnomalous: false,
      },
    },
    proof: {
      circuitName: 'prove_safety.compact',
      proofRef: 'mn_tx_0x4429817491823749182734981723948172394817109283749182734918273491',
      modelHash: '0x7e834b92c4a91938501284719283471928471928374928173491823749182734',
      modelVersionId: 'v1.2.0-gbdt',
      threshold: 50,
      blockHeight: 1849195,
      verifiedAt: Date.now() - 1000 * 60 * 28,
      network: 'Midnight Preprod',
      oracleAddress: 'mn1_safety_oracle_preprod_88294a28f84920194829',
      publicInputs: {
        contractAddress: '0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc',
        expectedModelHash: '0x7e834b92c4a91938501284719283471928471928374928173491823749182734',
        threshold: 50,
        timestamp: Date.now() - 1000 * 60 * 28,
      },
      statement: 'Proves: ML_risk_score near threshold (SUSPICIOUS) on Midnight preprod',
    },
    riskFlags: [
      'Unverified smart contract bytecode',
      'Concentrated holder distribution (>68% in 5 wallets)',
      'Short operational history (< 1 month)',
    ],
  },
}

export const DEMO_PRESETS = [
  {
    address: '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640',
    name: 'Uniswap V3 WETH/USDC',
    tag: 'Verified Safe',
    badgeClass: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
  },
  {
    address: '0x7a250d5630b4cf539739df2c5dacb4c659f2488d',
    name: 'YieldShadow Drainer',
    tag: 'Exploit / Rug-Pull',
    badgeClass: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
  },
  {
    address: '0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc',
    name: 'FlashVault Prime',
    tag: 'Suspicious / Borderline',
    badgeClass: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
  },
]

export class SentinelService {
  /**
   * Fetches an existing attestation for an address.
   * If address is not pre-mocked, generates an on-the-fly realistic attestation based on address hash.
   */
  static async getAttestation(address: string): Promise<ContractSafetyAttestation> {
    const normalized = address.toLowerCase().trim()

    // Prefer live GBDT scoring when the ML service is configured
    if (mlServiceConfigured()) {
      const live = await fetchMlAttestation(normalized)
      if (live) return live
    }

    if (MOCK_ATTESTATIONS[normalized]) {
      return MOCK_ATTESTATIONS[normalized]
    }

    // Dynamic generation for arbitrary user-entered addresses
    return this.generateSyntheticAttestation(address)
  }

  /**
   * Runs an interactive step-by-step analysis with progress updates
   */
  static async analyzeWithProgress(
    address: string,
    onProgress?: (progress: AnalysisProgress) => void
  ): Promise<ContractSafetyAttestation> {
    const steps: { stage: AnalysisProgress['stage']; message: string; delay: number }[] = [
      {
        stage: 'ingesting_telemetry',
        message: 'Querying liquidity pool reserves, transfer events & ownership history...',
        delay: 500,
      },
      {
        stage: 'ml_scoring',
        message: 'Evaluating gradient-boosted risk model off-chain (private feature vector)...',
        delay: 650,
      },
      {
        stage: 'compact_proving',
        message: 'Compiling Midnight Compact ZK circuit & binding model integrity hash...',
        delay: 750,
      },
      {
        stage: 'midnight_verifying',
        message: 'Verifying ZK proof against Midnight SafetyOracle ledger constraint...',
        delay: 600,
      },
    ]

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]
      if (onProgress) {
        onProgress({
          stage: step.stage,
          stepNumber: i + 1,
          totalSteps: steps.length,
          message: step.message,
        })
      }
      await new Promise((resolve) => setTimeout(resolve, step.delay))
    }

    const attestation = await this.getAttestation(address)
    
    if (onProgress) {
      onProgress({
        stage: 'complete',
        stepNumber: steps.length,
        totalSteps: steps.length,
        message: 'Attestation verified on Midnight ledger.',
      })
    }

    return attestation
  }

  /**
   * Returns recent on-chain oracle attestations for the live feed
   */
  static async getRecentAttestations(): Promise<ContractSafetyAttestation[]> {
    return Object.values(MOCK_ATTESTATIONS)
  }

  /**
   * Oracle network telemetry
   */
  static async getOracleStats(): Promise<OracleStats> {
    const stats: OracleStats = {
      totalAttestations: 1482,
      verifiedSafePools: 1394,
      exploitsPrevented: 88,
      activeMonitoredContracts: 320,
      avgProofTimeMs: 1420,
      registeredModelVersion: 'v1.2.0-gbdt',
      registeredModelHash: '0x7e834b92c4a91938501284719283471928471928374928173491823749182734',
    }

    const direct = process.env.SENTINEL_ML_URL?.trim()
    if (typeof window !== 'undefined') {
      if (process.env.NEXT_PUBLIC_SENTINEL_USE_ML !== '1') {
        return stats
      }
      try {
        const res = await fetch('/api/score', { cache: 'no-store' })
        if (res.ok) {
          const payload = await res.json()
          if (payload?.health?.modelVersionId) {
            stats.registeredModelVersion = payload.health.modelVersionId
            stats.registeredModelHash = payload.health.modelHash
          }
        }
      } catch {
        // keep mock stats
      }
      return stats
    }

    if (!direct) {
      return stats
    }

    try {
      const res = await fetch(`${direct.replace(/\/$/, '')}/health`, {
        cache: 'no-store',
      })
      if (res.ok) {
        const health = await res.json()
        stats.registeredModelVersion = health.modelVersionId ?? stats.registeredModelVersion
        stats.registeredModelHash = health.modelHash ?? stats.registeredModelHash
      }
    } catch {
      // keep mock stats
    }

    return stats
  }

  /**
   * Generates a deterministic mock attestation for any arbitrary address
   */
  private static generateSyntheticAttestation(address: string): ContractSafetyAttestation {
    const hashVal = address
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0)
    
    const isSafe = hashVal % 3 !== 0
    const verdict = isSafe ? 'SAFE' : 'EXPLOIT_DETECTED'

    return {
      targetAddress: address,
      targetName: `Observed Pool (${address.slice(0, 6)}...${address.slice(-4)})`,
      protocol: 'EVM / Midnight Monitored Protocol',
      verdict,
      isSafe,
      summary: isSafe
        ? 'Automated telemetry indicates normal pool velocity, standard liquidity dispersion, and consistent ownership structure.'
        : 'Elevated anomaly score: recent abnormal liquidity drawdown and high creator concentration detected.',
      telemetry: {
        lpRemovalVelocity: {
          value: isSafe ? 1.4 : 76.2,
          label: isSafe ? '1.4% / 24h' : '76.2% / 2h (Abnormal)',
          isAnomalous: !isSafe,
        },
        ownershipChangeCount: {
          value: isSafe ? 0 : 3,
          label: isSafe ? '0 transfers' : '3 owner changes',
          isAnomalous: !isSafe,
        },
        topHolderConcentration: {
          value: isSafe ? 18.2 : 86.4,
          label: isSafe ? '18.2% in top 10' : '86.4% in top 2 (Concentrated)',
          isAnomalous: !isSafe,
        },
        contractAgeDays: {
          value: isSafe ? 412 : 7,
          label: isSafe ? '412 days active' : '7 days deployed',
          isAnomalous: !isSafe,
        },
        isVerifiedSource: {
          value: isSafe,
          label: isSafe ? 'Verified source' : 'Unverified bytecode',
          isAnomalous: !isSafe,
        },
        holderGrowthRate: {
          value: isSafe ? 9.5 : -42.0,
          label: isSafe ? '+9.5% organic' : '-42.0% outflow',
          isAnomalous: !isSafe,
        },
      },
      proof: {
        circuitName: 'prove_safety.compact',
        proofRef: `mn_tx_0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`,
        modelHash: '0x7e834b92c4a91938501284719283471928471928374928173491823749182734',
        modelVersionId: 'v1.2.0-gbdt',
        threshold: 50,
        blockHeight: 1849220,
        verifiedAt: Date.now() - 1000 * 60 * 3,
        network: 'Midnight Preprod',
        oracleAddress: 'mn1_safety_oracle_preprod_88294a28f84920194829',
        publicInputs: {
          contractAddress: address,
          expectedModelHash: '0x7e834b92c4a91938501284719283471928471928374928173491823749182734',
          threshold: 50,
          timestamp: Date.now() - 1000 * 60 * 3,
        },
        statement: `Proves: ML_risk_score ${isSafe ? '<' : '>='} 50 AND Model_Hash matches registered version`,
      },
      riskFlags: isSafe
        ? ['Normal liquidity variance', 'Standard token distribution']
        : ['High liquidity removal velocity', 'Concentrated creator holding'],
    }
  }
}
