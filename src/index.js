"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onRpcRequest = exports.getMessage = void 0;
const ethers_1 = require("ethers");
// import * as snarkjs from "snarkjs"
const identity_1 = require("@semaphore-protocol/identity");
//"@semaphore-protocol/proof"
//import * as snarkjs from 'snarkjs';
//import { groth16 } from "snarkjs"
// var Worker = require('web-worker');
// var ffjs = require('ffjavascript');
var snarkjs = require('snarkjs');
//var circom_0_0_8 = require("/Users/sam/poseidon-vm-monorepo/packages/manta-voting/node_modules/@semaphore-protocol/identity/node_modules/circomlibjs")
var circom_0_0_8 = require("circomlibjs-0-0-8");
const poseidon = circom_0_0_8.poseidon;
const group_1 = require("@semaphore-protocol/group");
// import { default as generateGroupProof} from "../../../../manta-voting/library/group/proof";
// import { default as generateSignalProof} from "../../../../manta-voting/library/signal/proof";
const proof_1 = __importDefault(require("../prover/group/proof"));
const proof_2 = __importDefault(require("../prover/signal/proof"));
// var binFileUtils = require('@iden3/binfileutils');
// var Blake2b = require('blake2b-wasm');
// var readline = require('readline');
// var crypto = require('crypto');
// var fastFile = require('fastfile');
// var circom_runtime = require('circom_runtime');
// var r1csfile = require('r1csfile');
// var ejs = require('ejs');
//var jsSha3 = require('js-sha3');
/**
 * Get a message from the origin. For demonstration purposes only.
 *
 * @param originString - The origin string.
 * @returns A message based on the origin.
 */
const getMessage = (originString) => `Hello, ${originString}!`;
exports.getMessage = getMessage;
async function generateRC() {
    const id = new identity_1.Identity('identity');
    const rand = ethers_1.BigNumber.from(123456).toBigInt();
    const rc = poseidon([rand, id.getNullifier()]);
    console.log("generate rc : ", rc);
    return rc;
}
/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns `null` if the request succeeded.
 * @throws If the request method is not valid for this snap.
 * @throws If the `snap_confirm` call failed.
 */
const onRpcRequest = async ({ origin, request }) => {
    switch (request.method) {
        case 'hello':
            console.log("method hello...");
            return await wallet.request({
                method: 'snap_confirm',
                params: [
                    {
                        prompt: (0, exports.getMessage)(origin),
                        description: 'v2 : This custom confirmation is just for display purposes.',
                        textAreaContent: 'v2 : But you can edit the snap source code to make it do something, if you want to!',
                    },
                ],
            });
        case 'update_key':
            console.log("method update key...");
            return await wallet.request({
                method: 'snap_manageState',
                params: ['update', { rand: '0x11223344' }],
            });
        case 'get_key':
            console.log("method get key...");
            return await wallet.request({
                method: 'snap_manageState',
                params: ['get'],
            });
        case 'get_identity_commitment':
            console.log("generate identity from seed ", request.params);
            const res = await wallet.request({
                method: 'snap_manageState',
                params: ['get'],
            });
            console.log("get identity : ", res);
            //window.crypto.getRandomValues
            const identityStrs = request.params;
            const identity = new identity_1.Identity(identityStrs[0]);
            const identityCommitment = identity.getCommitment();
            console.log("identityCommitment : ", identityCommitment);
            await wallet.request({
                method: 'snap_manageState',
                params: ['update', { identity: identityStrs[0] }],
                //params: ['update', { identity: identity }],
            });
            return identityCommitment.toString();
        case 'get_group_proof':
            // TODO : from save seed
            const id = new identity_1.Identity('identity');
            // TODO : from off-line backend
            const TREE_DEPTH = 10;
            const group = new group_1.Group(TREE_DEPTH);
            group.addMembers([id.getCommitment()]);
            const merkleProof = group.generateProofOfMembership(group.indexOf(id.getCommitment()));
            const rand = await generateRC();
            const groupProof = await (0, proof_1.default)(id, merkleProof, rand, "/Users/sam/poseidon-vm-monorepo/packages/manta-voting/circuits/group/group_js/group.wasm", "/Users/sam/poseidon-vm-monorepo/packages/manta-voting/circuits/group/zkey.16");
            return groupProof;
        //console.log("snarkjs : ", snarkjs)
        case 'get_signal_proof':
            const id2 = new identity_1.Identity('identity');
            const externalNullifier = 1;
            const msg = "msg 1";
            const signalProof = await (0, proof_2.default)(id2, rand, externalNullifier, msg, "/Users/sam/poseidon-vm-monorepo/packages/manta-voting/circuits/signal/signal_js/signal.wasm", "/Users/sam/poseidon-vm-monorepo/packages/manta-voting/circuits/signal/zkey.16");
            return signalProof;
        case 'get_rc':
            return (await generateRC()).toString();
        default:
            throw new Error('Method not found.');
    }
};
exports.onRpcRequest = onRpcRequest;
//# sourceMappingURL=index.js.map