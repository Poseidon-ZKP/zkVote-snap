//var snarkjs = require('snarkjs');
import * as snarkjs from "snarkjs"

import { Identity } from "@semaphore-protocol/identity"
import { MerkleProof } from "@zk-kit/incremental-merkle-tree"
var circom_0_0_8 = require("circomlibjs-0-0-8")
const poseidon = circom_0_0_8.poseidon
import { BigNumberish } from "ethers"
import { Proof } from "@semaphore-protocol/proof"

export declare type FullProof = {
    proof: Proof;
    publicSignals: PublicSignals;
};
export declare type PublicSignals = {
    rc: BigNumberish;
    merkleRoot: BigNumberish;
};

export default async function generateProof(
    identity: Identity,
    merkleProof: MerkleProof,
    rand : bigint,
    wasmFile : string,
    zkeyFile : string
): Promise<FullProof> {
    console.log(new Date().toUTCString() + " generateProof...")

    console.log("rand : ", rand)
    const rc = poseidon([rand, identity.getNullifier()])
    console.log("rc : ", rc)

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        {
            identityTrapdoor: identity.getTrapdoor(),
            identityNullifier: identity.getNullifier(),
            treePathIndices: merkleProof.pathIndices,
            treeSiblings: merkleProof.siblings,
            r : rand
        },
        wasmFile,
        zkeyFile
    )

    console.log("original publicSignals : ", publicSignals)

    const fullProof = {
        proof,
        publicSignals: {
            rc: publicSignals[0],
            merkleRoot: publicSignals[1]
        }
    }

    console.log(new Date().toUTCString() + " fullProof.publicSignals : ", fullProof.publicSignals)
    return fullProof
}