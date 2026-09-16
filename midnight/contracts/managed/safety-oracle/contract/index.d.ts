import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type PublicAttestation = { isSafe: boolean;
                                  modelHash: Uint8Array;
                                  threshold: bigint;
                                  attestedAt: bigint
                                };

export type Witnesses<PS> = {
  privateRiskScore(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  privateModelHash(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  submitAttestation(context: __compactRuntime.CircuitContext<PS>,
                    target_0: Uint8Array,
                    attestedAt_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  hasAttestation(context: __compactRuntime.CircuitContext<PS>,
                 target_0: Uint8Array): __compactRuntime.CircuitResults<PS, boolean>;
  getAttestation(context: __compactRuntime.CircuitContext<PS>,
                 target_0: Uint8Array): __compactRuntime.CircuitResults<PS, PublicAttestation>;
}

export type ProvableCircuits<PS> = {
  submitAttestation(context: __compactRuntime.CircuitContext<PS>,
                    target_0: Uint8Array,
                    attestedAt_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  hasAttestation(context: __compactRuntime.CircuitContext<PS>,
                 target_0: Uint8Array): __compactRuntime.CircuitResults<PS, boolean>;
  getAttestation(context: __compactRuntime.CircuitContext<PS>,
                 target_0: Uint8Array): __compactRuntime.CircuitResults<PS, PublicAttestation>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  submitAttestation(context: __compactRuntime.CircuitContext<PS>,
                    target_0: Uint8Array,
                    attestedAt_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  hasAttestation(context: __compactRuntime.CircuitContext<PS>,
                 target_0: Uint8Array): __compactRuntime.CircuitResults<PS, boolean>;
  getAttestation(context: __compactRuntime.CircuitContext<PS>,
                 target_0: Uint8Array): __compactRuntime.CircuitResults<PS, PublicAttestation>;
}

export type Ledger = {
  readonly expectedModelHash: Uint8Array;
  readonly safetyThreshold: bigint;
  attestations: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): PublicAttestation;
    [Symbol.iterator](): Iterator<[Uint8Array, PublicAttestation]>
  };
  readonly attestationCount: bigint;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>,
               modelHash_0: Uint8Array,
               threshold_0: bigint): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
