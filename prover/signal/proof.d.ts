import { Identity } from "@semaphore-protocol/identity";
import { BigNumberish } from "ethers";
import { Proof } from "@semaphore-protocol/proof";
export declare type FullProof = {
    proof: Proof;
    publicSignals: PublicSignals;
};
export declare type PublicSignals = {
    rc: BigNumberish;
    nullifierHash: BigNumberish;
    signalHash: BigNumberish;
    externalNullifier: BigNumberish;
};
export default function generateProof(identity: Identity, rand: bigint, externalNullifier: BigNumberish, signal: string, wasmFile: string, zkeyFile: string): Promise<FullProof>;
