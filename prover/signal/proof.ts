var snarkjs = require('snarkjs');

import { Identity } from "@semaphore-protocol/identity"
var circom_0_0_8 = require("circomlibjs-0-0-8")
const poseidon = circom_0_0_8.poseidon
import { BigNumberish } from "ethers"
import { generateSignalHash, Proof } from "@semaphore-protocol/proof"

export declare type FullProof = {
    proof: Proof;
    publicSignals: PublicSignals;
};
export type PublicSignals = {
    rc: BigNumberish;
    nullifierHash: BigNumberish
    signalHash: BigNumberish
    externalNullifier: BigNumberish
}

export default async function generateProof(
    identity: Identity,
    rand : bigint,
    externalNullifier: BigNumberish,
    signal: string,
    wasmFile : string,
    zkeyFile : string
): Promise<FullProof> {
    console.log(new Date().toUTCString() + " generateProof...")

    console.log("rand : ", rand)
    const rc = poseidon([rand, identity.getNullifier()])
    console.log("rc : ", rc)

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        {
            r : rand,
            identityNullifier: identity.getNullifier(),
            externalNullifier : externalNullifier,
            signalHash: generateSignalHash(signal)
        },
        wasmFile,
        zkeyFile
    )

    console.log("original publicSignals : ", publicSignals)

    const fullProof = {
        proof,
        publicSignals: {
            rc: publicSignals[0],
            nullifierHash: publicSignals[1],
            signalHash: publicSignals[2],
            externalNullifier: publicSignals[3]
        }
    }

    console.log(new Date().toUTCString() + " fullProof.publicSignals : ", fullProof.publicSignals)
    return fullProof
}