import { OnRpcRequestHandler } from '@metamask/snap-types';
import { BigNumber, ethers } from 'ethers';
import { Identity } from "@semaphore-protocol/identity"
import { poseidon } from 'circomlibjs-0-0-8';
import { Group } from "@semaphore-protocol/group"

import { MerkleProof } from "@zk-kit/incremental-merkle-tree"
import { default as generateGroupProof} from "../prover/group/proof";
import { default as generateSignalProof} from "../prover/signal/proof";

const FILE_SERVER_RUL = "https://vercel-file-server.vercel.app"
const GROUP_ZKEY_FILE = FILE_SERVER_RUL + "/wasm/group/zkey.16"
const GROUP_WASM_FILE = FILE_SERVER_RUL + "/wasm/group/group.wasm"
const SIGNAL_ZKEY_FILE = FILE_SERVER_RUL + "/wasm/signal/signal.wasm"
const SIGNAL_WASM_FILE = FILE_SERVER_RUL + "/wasm/signal/zkey.16"

/**
 * Get a message from the origin. For demonstration purposes only.
 *
 * @param originString - The origin string.
 * @returns A message based on the origin.
 */
export const getMessage = (originString: string): string =>
  `Hello, ${originString}!`;

async function getSeed() : Promise<string> {
  const keys = await wallet.request({
    method: 'snap_manageState',
    params: ['get'],
  });
  return keys.MANTA_VOTE_SEED
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
export const onRpcRequest: OnRpcRequestHandler = async ({ origin, request }) => {
  switch (request.method) {
    case 'show_msg': {
      const params  = request.params as string[]
      return await wallet.request({
        method: 'snap_confirm',
        params: [
          {
            prompt: origin,
            description:
              'This custom confirmation is just for display purposes.',
            textAreaContent: params[0],
          },
        ],
      });
    }
    case 'update_priv_seed': {
      const params  = request.params as string[]
      const seed = params[0]
      console.log("snap : update_priv_seed to ", seed)

      return await wallet.request({
        method: 'snap_manageState',
        params: ['update', { MANTA_VOTE_SEED: seed }],
      });
    }
  
    case 'get_key': {
      return await wallet.request({
        method: 'snap_manageState',
        params: ['get'],
      });
    }
    case 'get_seed': {
      return await getSeed()
    }

    case 'get_bip44' : {
      const ethNode = await wallet.request({
        method: 'snap_getBip44Entropy',
        params: {
          coinType: 60,
        },
      });
      console.log("ethNode : ", ethNode)
      return ethNode
    }

    case 'get_identity_commitment':
    {
      const seed = await getSeed()
      const identity = new Identity(seed)
      const identityCommitment = identity.getCommitment()
      return identityCommitment.toString()
    }

    case 'get_group_proof':
    {
      const seed = await getSeed()
      const id = new Identity(seed)

      const params  = request.params
      const rand = BigNumber.from(Number(params[0])).toBigInt()
      console.log("idcs : ")
      const idcs = params[1]
      console.log("snpa idcs : ", idcs)
      const TREE_DEPTH = 10
      const group = new Group(TREE_DEPTH)
      group.addMembers(idcs)
      const merkleProof: MerkleProof = group.generateProofOfMembership(group.indexOf(id.getCommitment()))
      console.log("snpa merkleProof : ", merkleProof)

      const groupProof =  await generateGroupProof(
        id,
        merkleProof,
        rand,
        GROUP_WASM_FILE,
        GROUP_ZKEY_FILE
      )
      console.log("snap groupProof : ", groupProof)
      return groupProof
    }

    case 'get_signal_proof':
    {
      console.log("get_signal_proof begin ...")
      const seed = await getSeed()
      console.log("seed : ", seed)
      const id = new Identity(seed)

      const params  = request.params as string[]
      const rand = BigNumber.from(Number(params[0])).toBigInt()
      const msg = params[1]
      const externalNullifier = params[2]

      const signalProof =  await generateSignalProof(
          id,
          rand,
          externalNullifier,
          msg,
          SIGNAL_ZKEY_FILE,
          SIGNAL_WASM_FILE
      )
      console.log("signalProof : ", signalProof)
      return signalProof
    }
    case 'get_rc': {
      const seed = await getSeed()
      const id = new Identity(seed)

      const params  = request.params as string[]
      const rand = BigNumber.from(Number(params[0])).toBigInt()

      const rc = poseidon([rand, id.getNullifier()])
      return rc.toString()
    }
    default:
      throw new Error('Method not found.');
  }
};
