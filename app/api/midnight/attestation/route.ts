import { NextRequest, NextResponse } from 'next/server'
import { MidnightClientError } from '@/lib/midnight/errors'
import { midnightContractAddress, useMockOracle } from '@/lib/midnight/config'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  if (useMockOracle()) {
    return NextResponse.json(
      {
        error: 'Midnight oracle is disabled while NEXT_PUBLIC_USE_MOCK_ORACLE is true.',
        code: 'DEPLOY_CONFIG_MISSING',
      },
      { status: 503 },
    )
  }

  const target = request.nextUrl.searchParams.get('target')?.trim()
  if (!target) {
    return NextResponse.json({ error: 'target is required', code: 'INVALID_ATTESTATION' }, { status: 400 })
  }

  const address = process.env.MIDNIGHT_CONTRACT_ADDRESS?.trim() || midnightContractAddress()
  if (!address) {
    return NextResponse.json(
      { error: 'The Midnight oracle address is not configured.', code: 'DEPLOY_CONFIG_MISSING' },
      { status: 503 },
    )
  }

  try {
    const { getSafetyAttestation } = await import('../../../../midnight/src/oracle-api')
    const attestation = await getSafetyAttestation(target, address)
    if (!attestation) {
      return NextResponse.json({ found: false, target }, { status: 404 })
    }
    return NextResponse.json({ found: true, ...attestation })
  } catch (err) {
    const mapped =
      err instanceof MidnightClientError
        ? err
        : new MidnightClientError(
            'NETWORK_UNAVAILABLE',
            err instanceof Error ? err.message : 'Could not query the Midnight oracle.',
            err,
          )
    return NextResponse.json({ error: mapped.userMessage, code: mapped.code }, { status: 502 })
  }
}
