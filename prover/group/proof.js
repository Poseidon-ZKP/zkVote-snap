"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var snarkjs = require('snarkjs');
var circom_0_0_8 = require("circomlibjs-0-0-8");
const poseidon = circom_0_0_8.poseidon;
async function generateProof(identity, 
//group: Group,
merkleProof, rand, wasmFile, zkeyFile) {
    console.log(new Date().toUTCString() + " generateProof...");
    const commitment = identity.getCommitment();
    //const merkleProof: MerkleProof = group.generateProofOfMembership(group.indexOf(commitment))
    console.log("rand : ", rand);
    const rc = poseidon([rand, identity.getNullifier()]);
    console.log("rc : ", rc);
    const { proof, publicSignals } = await snarkjs.groth16.fullProve({
        identityTrapdoor: identity.getTrapdoor(),
        identityNullifier: identity.getNullifier(),
        treePathIndices: merkleProof.pathIndices,
        treeSiblings: merkleProof.siblings,
        r: rand
    }, wasmFile, zkeyFile);
    console.log("original publicSignals : ", publicSignals);
    const fullProof = {
        proof,
        publicSignals: {
            rc: publicSignals[0],
            merkleRoot: publicSignals[1]
        }
    };
    console.log(new Date().toUTCString() + " fullProof.publicSignals : ", fullProof.publicSignals);
    return fullProof;
}
exports.default = generateProof;
//# sourceMappingURL=proof.js.map