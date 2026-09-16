import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as CompiledContract from '@midnight-ntwrk/compact-js/effect/CompiledContract'
import {
  Contract,
  ledger,
  type Ledger,
  type ImpureCircuits,
  type PureCircuits,
} from './managed/safety-oracle/contract/index.js'
import { witnesses } from '../src/witnesses.js'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
export const zkConfigPath = path.resolve(currentDir, 'managed', 'safety-oracle')

export {
  Contract,
  ledger,
  type Ledger,
  type ImpureCircuits,
  type PureCircuits,
}

export const CompiledSafetyOracleContract = CompiledContract.make(
  'SafetyOracle',
  Contract,
).pipe(
  CompiledContract.withWitnesses(witnesses),
  CompiledContract.withCompiledFileAssets(zkConfigPath),
)
