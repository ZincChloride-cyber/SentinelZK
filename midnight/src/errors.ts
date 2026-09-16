export type SentinelErrorCode =
  | 'WALLET_NOT_CONNECTED'
  | 'WALLET_NOT_FOUND'
  | 'WRONG_NETWORK'
  | 'TX_REJECTED'
  | 'CONTRACT_CALL_FAILED'
  | 'INVALID_ATTESTATION'
  | 'INVALID_PROOF'
  | 'MISSING_ATTESTATION'
  | 'NETWORK_UNAVAILABLE'
  | 'DEPLOY_CONFIG_MISSING'
  | 'ARTIFACTS_MISSING'

export class SentinelMidnightError extends Error {
  readonly code: SentinelErrorCode
  readonly userMessage: string

  constructor(code: SentinelErrorCode, userMessage: string, cause?: unknown) {
    super(userMessage)
    this.name = 'SentinelMidnightError'
    this.code = code
    this.userMessage = userMessage
    if (cause !== undefined) {
      this.cause = cause
    }
  }
}

export function userFacingError(err: unknown): SentinelMidnightError {
  if (err instanceof SentinelMidnightError) return err

  const message = err instanceof Error ? err.message : String(err)
  const lower = message.toLowerCase()

  if (lower.includes('rejected') || lower.includes('denied')) {
    return new SentinelMidnightError(
      'TX_REJECTED',
      'The wallet declined this request. No transaction was sent.',
      err,
    )
  }
  if (lower.includes('insufficient') || lower.includes('funds')) {
    return new SentinelMidnightError(
      'CONTRACT_CALL_FAILED',
      'The wallet does not have enough tDUST to pay the network fee.',
      err,
    )
  }
  if (lower.includes('model hash')) {
    return new SentinelMidnightError(
      'INVALID_PROOF',
      'This attestation was rejected because the model hash does not match the registered oracle model.',
      err,
    )
  }
  if (lower.includes('no attestation')) {
    return new SentinelMidnightError(
      'MISSING_ATTESTATION',
      'No safety attestation has been published for this contract yet.',
      err,
    )
  }
  if (lower.includes('fetch') || lower.includes('network') || lower.includes('econnrefused')) {
    return new SentinelMidnightError(
      'NETWORK_UNAVAILABLE',
      'Could not reach the Midnight network. Check your connection and try again.',
      err,
    )
  }

  return new SentinelMidnightError(
    'CONTRACT_CALL_FAILED',
    'The Midnight contract request failed. No private scoring data is shown.',
    err,
  )
}
