import { Identity } from "@semaphore-protocol/identity";
import { MerkleProof } from "@zk-kit/incremental-merkle-tree";
import { BigNumberish } from "ethers";
import { Proof } from "@semaphore-protocol/proof";
export declare type FullProof = {
    proof: Proof;
    publicSignals: PublicSignals;
};
export declare type PublicSignals = {
    rc: BigNumberish;
    merkleRoot: BigNumberish;
};
export default function generateProof(identity: Identity, merkleProof: MerkleProof, rand: bigint, wasmFile: string, zkeyFile: string): Promise<FullProof>;
