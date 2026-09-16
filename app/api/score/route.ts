import { NextRequest, NextResponse } from 'next/server'
import { attestationFromMlScore, type MlScoreResponse } from '@/lib/ml-attestation'

export const runtime = 'nodejs'

function mlBaseUrl(): string | null {
  const url = process.env.SENTINEL_ML_URL?.trim()
  return url || null
}

export async function POST(request: NextRequest) {
  const base = mlBaseUrl()
  if (!base) {
    return NextResponse.json(
      { error: 'SENTINEL_ML_URL is not configured' },
      { status: 503 }
    )
  }

  let body: { address?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const address = body.address?.trim()
  if (!address) {
    return NextResponse.json({ error: 'address is required' }, { status: 400 })
  }

  try {
    const res = await fetch(`${base.replace(/\/$/, '')}/score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address }),
      cache: 'no-store',
    })

    if (!res.ok) {
      const detail = await res.text()
      return NextResponse.json(
        { error: 'ML service error', detail },
        { status: 502 }
      )
    }

    const score = (await res.json()) as MlScoreResponse
    const attestation = attestationFromMlScore(score)
    return NextResponse.json(attestation)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown ML proxy error'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}

export async function GET() {
  const base = mlBaseUrl()
  if (!base) {
    return NextResponse.json({ configured: false, status: 'disabled' })
  }

  try {
    const res = await fetch(`${base.replace(/\/$/, '')}/health`, {
      cache: 'no-store',
    })
    if (!res.ok) {
      return NextResponse.json(
        { configured: true, status: 'unreachable', httpStatus: res.status },
        { status: 502 }
      )
    }
    const health = await res.json()
    return NextResponse.json({ configured: true, status: 'ok', health })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unreachable'
    return NextResponse.json(
      { configured: true, status: 'unreachable', error: message },
      { status: 502 }
    )
  }
}
