import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import * as RT from '@midnight-ntwrk/compact-runtime'
import { Contract, ledger } from '../contracts/managed/safety-oracle/contract/index.js'
import { createPrivateState, witnesses } from '../src/witnesses.js'
import { targetIdFromAddress } from '../src/encoding.js'

const artifactsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../contracts/managed/safety-oracle/contract/index.js')

const COIN = '0'.repeat(64)
const ADDR = RT.sampleContractAddress()
const TARGET = targetIdFromAddress('0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640')
const MODEL = new Uint8Array(32).fill(0x7e)
const OTHER_MODEL = new Uint8Array(32).fill(0x11)
const THRESHOLD = 50n
const NOW = 1_700_000_000n

function setup(score = 10n, modelHash = MODEL) {
  const privateState = createPrivateState(score, modelHash)
  const contract = new Contract(witnesses)
  const ctor = contract.initialState(RT.createConstructorContext(privateState, COIN), MODEL, THRESHOLD)
  const ctx = RT.createCircuitContext(ADDR, COIN, ctor.currentContractState, privateState)
  return { contract, ctx, privateState }
}

describe('SafetyOracle compact circuit', () => {
  it('compiled artifacts exist (real Compact output, not a stub)', () => {
    expect(existsSync(artifactsDir)).toBe(true)
  })

  it('initializes public config and does not record a score', () => {
    const { ctx } = setup()
    const view = ledger(ctx.currentQueryContext.state)
    expect(view.safetyThreshold).toBe(THRESHOLD)
    expect(view.expectedModelHash).toEqual(MODEL)
    expect(view.attestationCount).toBe(0n)
    expect(view.attestations.isEmpty()).toBe(true)
  })

  it('records SAFE when private score is below the threshold', () => {
    const { contract, ctx } = setup(12n)
    const call = contract.impureCircuits.submitAttestation(ctx, TARGET, NOW)
    const view = ledger(call.context.currentQueryContext.state)
    const att = view.attestations.lookup(TARGET)
    expect(att.isSafe).toBe(true)
    expect(att.threshold).toBe(THRESHOLD)
    expect(att.modelHash).toEqual(MODEL)
    expect(att.attestedAt).toBe(NOW)
    expect(view.attestationCount).toBe(1n)
    expect(att).not.toHaveProperty('riskScore')
    expect(Object.keys(att).sort()).toEqual(['attestedAt', 'isSafe', 'modelHash', 'threshold'])
    expect(call.proofData.publicTranscript.length).toBeGreaterThan(0)
  })

  it('records NOT SAFE when private score is at or above the threshold', () => {
    const { contract, ctx } = setup(76n)
    const call = contract.impureCircuits.submitAttestation(ctx, TARGET, NOW)
    const att = ledger(call.context.currentQueryContext.state).attestations.lookup(TARGET)
    expect(att.isSafe).toBe(false)
  })

  it('treats the threshold boundary as NOT SAFE (score < threshold)', () => {
    const below = setup(49n)
    const at = setup(50n)
    const belowCall = below.contract.impureCircuits.submitAttestation(below.ctx, TARGET, NOW)
    const atCall = at.contract.impureCircuits.submitAttestation(at.ctx, TARGET, NOW)
    expect(ledger(belowCall.context.currentQueryContext.state).attestations.lookup(TARGET).isSafe).toBe(true)
    expect(ledger(atCall.context.currentQueryContext.state).attestations.lookup(TARGET).isSafe).toBe(false)
  })

  it('rejects a submitted model hash that does not match the registered hash', () => {
    const { contract, ctx } = setup(10n, OTHER_MODEL)
    expect(() => contract.impureCircuits.submitAttestation(ctx, TARGET, NOW)).toThrow(
      /Model hash does not match the registered model/,
    )
  })

  it('rejects an out-of-range private risk score', () => {
    const { contract, ctx } = setup(101n)
    expect(() => contract.impureCircuits.submitAttestation(ctx, TARGET, NOW)).toThrow(
      /Risk score must be at most 100/,
    )
  })

  it('rejects constructor thresholds outside 1..=100', () => {
    const privateState = createPrivateState(1n, MODEL)
    const contract = new Contract(witnesses)
    expect(() =>
      contract.initialState(RT.createConstructorContext(privateState, COIN), MODEL, 0n),
    ).toThrow(/Threshold must be greater than 0/)
    expect(() =>
      contract.initialState(RT.createConstructorContext(privateState, COIN), MODEL, 101n),
    ).toThrow(/Threshold must be at most 100/)
  })

  it('replaces a previous attestation for the same target', () => {
    const first = setup(10n)
    const afterFirst = first.contract.impureCircuits.submitAttestation(first.ctx, TARGET, NOW)
    const secondState = createPrivateState(90n, MODEL)
    const secondCtx = {
      ...afterFirst.context,
      currentPrivateState: secondState,
    }
    const afterSecond = first.contract.impureCircuits.submitAttestation(secondCtx, TARGET, NOW + 5n)
    const view = ledger(afterSecond.context.currentQueryContext.state)
    expect(view.attestations.lookup(TARGET).isSafe).toBe(false)
    expect(view.attestationCount).toBe(2n)
  })

  it('hasAttestation / getAttestation read the public ledger only', () => {
    const { contract, ctx } = setup(8n)
    expect(contract.impureCircuits.hasAttestation(ctx, TARGET).result).toBe(false)
    expect(() => contract.impureCircuits.getAttestation(ctx, TARGET)).toThrow(/No attestation for target/)

    const submitted = contract.impureCircuits.submitAttestation(ctx, TARGET, NOW)
    expect(contract.impureCircuits.hasAttestation(submitted.context, TARGET).result).toBe(true)
    const got = contract.impureCircuits.getAttestation(submitted.context, TARGET).result
    expect(got.isSafe).toBe(true)
    expect(got).not.toHaveProperty('riskScore')
  })

  it('does not require a witnesses object missing declared private inputs', () => {
    expect(() => new Contract({} as never)).toThrow(/privateRiskScore/)
  })
})
