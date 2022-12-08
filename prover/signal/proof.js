"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var snarkjs = require('snarkjs');
var circom_0_0_8 = require("circomlibjs-0-0-8");
const poseidon = circom_0_0_8.poseidon;
const proof_1 = require("@semaphore-protocol/proof");
async function generateProof(identity, rand, externalNullifier, signal, wasmFile, zkeyFile) {
    console.log(new Date().toUTCString() + " generateProof...");
    console.log("rand : ", rand);
    const rc = poseidon([rand, identity.getNullifier()]);
    console.log("rc : ", rc);
    const { proof, publicSignals } = await snarkjs.groth16.fullProve({
        r: rand,
        identityNullifier: identity.getNullifier(),
        externalNullifier: externalNullifier,
        signalHash: (0, proof_1.generateSignalHash)(signal)
    }, wasmFile, zkeyFile);
    console.log("original publicSignals : ", publicSignals);
    const fullProof = {
        proof,
        publicSignals: {
            rc: publicSignals[0],
            nullifierHash: publicSignals[1],
            signalHash: publicSignals[2],
            externalNullifier: publicSignals[3]
        }
    };
    console.log(new Date().toUTCString() + " fullProof.publicSignals : ", fullProof.publicSignals);
    return fullProof;
}
exports.default = generateProof;
//# sourceMappingURL=proof.js.map