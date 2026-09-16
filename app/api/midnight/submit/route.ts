import { NextRequest, NextResponse } from 'next/server'
import { midnightContractAddress, useMockOracle } from '@/lib/midnight/config'
import { MidnightClientError } from '@/lib/midnight/errors'

export const runtime = 'nodejs'

function mlBaseUrl(): string | null {
  return process.env.SENTINEL_ML_URL?.trim() || null
}

export async function POST(request: NextRequest) {
  if (useMockOracle()) {
    return NextResponse.json(
      { error: 'Publishing is disabled while the mock oracle is enabled.', code: 'DEPLOY_CONFIG_MISSING' },
      { status: 503 },
    )
  }

  const contractAddress = process.env.MIDNIGHT_CONTRACT_ADDRESS?.trim() || midnightContractAddress()
  if (!contractAddress) {
    return NextResponse.json(
      { error: 'The Midnight oracle address is not configured.', code: 'DEPLOY_CONFIG_MISSING' },
      { status: 503 },
    )
  }

  if (!process.env.MIDNIGHT_PREPROD_SEED && !process.env.MIDNIGHT_LOCAL_SEED && !process.env.MIDNIGHT_PREVIEW_SEED) {
    return NextResponse.json(
      {
        error: 'Verifier wallet is not configured on the server. Connect Lace for network checks, then run midnight/npm run submit as the operator.',
        code: 'DEPLOY_CONFIG_MISSING',
      },
      { status: 503 },
    )
  }

  let body: { target?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body', code: 'INVALID_ATTESTATION' }, { status: 400 })
  }

  const target = body.target?.trim()
  if (!target) {
    return NextResponse.json({ error: 'target is required', code: 'INVALID_ATTESTATION' }, { status: 400 })
  }

  const ml = mlBaseUrl()
  if (!ml) {
    return NextResponse.json(
      { error: 'SENTINEL_ML_URL is not configured, so the operator cannot obtain a private score to prove.', code: 'INVALID_ATTESTATION' },
      { status: 503 },
    )
  }

  try {
    const scoreRes = await fetch(`${ml.replace(/\/$/, '')}/score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: target.toLowerCase() }),
      cache: 'no-store',
    })
    if (!scoreRes.ok) {
      return NextResponse.json(
        { error: 'Could not obtain a model result to attest.', code: 'INVALID_ATTESTATION' },
        { status: 502 },
      )
    }
    const score = (await scoreRes.json()) as { score: number; modelHash: string }

    const { submitSafetyAttestation } = await import('../../../../midnight/src/oracle-api')
    const result = await submitSafetyAttestation({
      target,
      riskScore: score.score,
      modelHash: score.modelHash,
      contractAddress,
    })

    return NextResponse.json({
      txId: result.txId,
      blockHeight: result.blockHeight,
      attestation: result.attestation,
    })
  } catch (err) {
    const mapped =
      err instanceof MidnightClientError
        ? err
        : new MidnightClientError(
            'CONTRACT_CALL_FAILED',
            'The Midnight attestation could not be published.',
            err,
          )
    return NextResponse.json({ error: mapped.userMessage, code: mapped.code }, { status: 502 })
  }
}
