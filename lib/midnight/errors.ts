export type MidnightClientErrorCode =
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

export class MidnightClientError extends Error {
  readonly code: MidnightClientErrorCode
  readonly userMessage: string

  constructor(code: MidnightClientErrorCode, userMessage: string, cause?: unknown) {
    super(userMessage)
    this.name = 'MidnightClientError'
    this.code = code
    this.userMessage = userMessage
    if (cause !== undefined) {
      this.cause = cause
    }
  }
}

export function toMidnightClientError(err: unknown): MidnightClientError {
  if (err instanceof MidnightClientError) return err

  const api = err as { type?: string; code?: string; reason?: string; message?: string }
  if (api?.type === 'DAppConnectorAPIError') {
    if (api.code === 'Rejected' || api.code === 'PermissionRejected') {
      return new MidnightClientError(
        'TX_REJECTED',
        'The wallet declined this request. No transaction was sent.',
        err,
      )
    }
    if (api.code === 'Disconnected') {
      return new MidnightClientError(
        'WALLET_NOT_CONNECTED',
        'The Midnight wallet disconnected. Connect again to continue.',
        err,
      )
    }
  }

  const message = err instanceof Error ? err.message : String(err)
  const lower = message.toLowerCase()
  if (lower.includes('rejected') || lower.includes('denied')) {
    return new MidnightClientError(
      'TX_REJECTED',
      'The wallet declined this request. No transaction was sent.',
      err,
    )
  }
  if (lower.includes('failed to fetch') || lower.includes('network')) {
    return new MidnightClientError(
      'NETWORK_UNAVAILABLE',
      'Could not reach the Midnight network. Check your connection and try again.',
      err,
    )
  }

  return new MidnightClientError(
    'CONTRACT_CALL_FAILED',
    'The Midnight request failed. Private scoring data is not shown.',
    err,
  )
}
