import type { WitnessContext } from '@midnight-ntwrk/compact-runtime'
import type { Ledger } from '../contracts/managed/safety-oracle/contract/index.js'

export type SafetyOraclePrivateState = {
  readonly riskScore: bigint
  readonly modelHash: Uint8Array
}

export function createPrivateState(
  riskScore: bigint,
  modelHash: Uint8Array,
): SafetyOraclePrivateState {
  if (modelHash.length !== 32) {
    throw new Error('modelHash must be 32 bytes')
  }
  return { riskScore, modelHash }
}

export const witnesses = {
  privateRiskScore({
    privateState,
  }: WitnessContext<Ledger, SafetyOraclePrivateState>): [SafetyOraclePrivateState, bigint] {
    return [privateState, privateState.riskScore]
  },
  privateModelHash({
    privateState,
  }: WitnessContext<Ledger, SafetyOraclePrivateState>): [SafetyOraclePrivateState, Uint8Array] {
    return [privateState, privateState.modelHash]
  },
}
