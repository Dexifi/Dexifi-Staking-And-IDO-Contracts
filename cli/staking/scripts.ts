import {Program, web3} from '@project-serum/anchor';
import * as anchor from '@project-serum/anchor';
import fs from 'fs';
import NodeWallet from '@project-serum/anchor/dist/cjs/nodewallet';
import { GLOBAL_AUTHORITY_SEED, LOCKER, LOCKER_RATE, PROGRAM_ID, TOKEN_DECIMAL, USER_POOL_SEED } from '../../lib/staking/constant';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';

import {IDL} from "../../target/types/dexifi_staking";
import { 
    createInitUserTx, 
    createInitializeTx, 
    createStakeDxeTx, 
    createUnstakeDxeTx, 
    createWithdrawTx 
} from '../../lib/staking/scripts';
import { GlobalPool, UserPool } from '../../lib/staking/types';

let solConnection: Connection = null;
let program: Program = null;
let provider: anchor.Provider = null;
let payer: NodeWallet = null;

// Address of the deployed program.
let programId = new anchor.web3.PublicKey(PROGRAM_ID);

/**
 * Set cluster, provider, program
 * If rpc != null use rpc, otherwise use cluster param
 * @param cluster - cluster ex. mainnet-beta, devnet ...
 * @param keypair - wallet keypair
 * @param rpc - rpc
 */
export const setClusterConfig = async (
    cluster: web3.Cluster, 
    keypair: string, rpc?: string
) => {

    if (!rpc) {
        solConnection = new web3.Connection(web3.clusterApiUrl(cluster));
    } else {
        solConnection = new web3.Connection(rpc);
    }

    const walletKeypair = Keypair.fromSecretKey(
        Uint8Array.from(JSON.parse(fs.readFileSync(keypair, 'utf-8'))), 
        {skipValidation: true});
    const wallet = new NodeWallet(walletKeypair);

    // Configure the client to use the local cluster.
    anchor.setProvider(new anchor.AnchorProvider(
        solConnection, 
        wallet, 
        { skipPreflight: true, commitment: 'confirmed'}));
    payer = wallet;

    provider = anchor.getProvider();
    console.log('Wallet Address: ', wallet.publicKey.toBase58());

    // Generate the program client from IDL.
    program = new anchor.Program(IDL as anchor.Idl, programId);
    console.log('ProgramId: ', program.programId.toBase58());
}

/**
 * Initialize global pool, vault
 */
export const initProject = async () => {
    try {
        const tx = await createInitializeTx(payer.publicKey, program);

        const txId = await provider.sendAndConfirm(tx, [], {
            commitment: "confirmed",
        });

        console.log("txHash: ", txId);
    } catch (e) {
        console.log(e);
    }
}

/**
 * Initialize user pool
 */
export const initializeUserPool = async () => {
    try {
        const tx = await createInitUserTx(payer.publicKey, program);

        const txId = await provider.sendAndConfirm(tx, [], {
            commitment: "confirmed",
        });

        console.log("txHash: ", txId);
    } catch (e) {
        console.log(e);
    }
}

/**
 * Stake DXE token
 * @param amount - DXE amount to stake
 * @param locker - index of the locker to stake
 */
export const stakeDxe = async (
    amount: number,
    locker: number
) => {
    try {
        const tx = await createStakeDxeTx(payer.publicKey, amount, locker, program);

        const txId = await provider.sendAndConfirm(tx, [], {
            commitment: "confirmed",
        });

        console.log("txHash: ", txId);
    } catch (e) {
        console.log(e);
    }
}

/**
 * Unstake DXE token
 * @param locker - index of the locker to unstake
 */
export const unstakeDxe = async (
    locker: number
) => {
    try {
        const tx = await createUnstakeDxeTx(payer.publicKey, locker, program);

        const txId = await provider.sendAndConfirm(tx, [], {
            commitment: "confirmed",
        });

        console.log("txHash: ", txId);
    } catch (e) {
        console.log(e);
    }
}

/**
 * Withdraw tokens
 * @param amount - amount to withdraw
 */
export const withdraw = async (
    amount: number
) => {
    try {
        const tx = await createWithdrawTx(payer.publicKey, amount, program);

        const txId = await provider.sendAndConfirm(tx, [], {
            commitment: "confirmed",
        });

        console.log("txHash: ", txId);
    } catch (e) {
        console.log(e);
    }
}

export const getGlobalState = async (program: anchor.Program): Promise<GlobalPool | null> => {

    const [globalPool, bump] = PublicKey.findProgramAddressSync(
        [Buffer.from(GLOBAL_AUTHORITY_SEED)], 
        program.programId );
    console.log("globalPool: ", globalPool.toBase58());

    try
    {
        let globalState = await program.account.globalPool.fetch(globalPool);
        return globalState as unknown as GlobalPool;
    }
    catch
    {
        return null;
    }
}

export const getGlobalInfo = async () => {

    const globalPool: GlobalPool = await getGlobalState(program);
    
    return {
      admin: globalPool.superAdmin.toBase58()
    };
}

export const getUserPoolState = async (
    userAddress: PublicKey
): Promise<UserPool | null> => {

    if (!userAddress) return null;

    const [userPoolKey, bump] = PublicKey.findProgramAddressSync(
        [userAddress.toBuffer(), Buffer.from(USER_POOL_SEED)], 
        program.programId );

    console.log('User Pool: ', userPoolKey.toBase58());
    try
    {
        let poolState = await program.account.userPool.fetch(userPoolKey, "confirmed");
        return poolState as unknown as UserPool;
    }
    catch
    {
        return null;
    }
}

export const getUserInfo = async (
    userAddress: PublicKey
) => {
    const userPool: UserPool = await getUserPoolState(userAddress);
    
    return {
        user: userPool.user.toBase58(),
        stakeData: userPool.stakeData
            .map((data) => `time: ${new Date(data.time.toNumber() * 1000).toLocaleString()}, amount: ${data.amount.toNumber() / TOKEN_DECIMAL}, locker: ${data.locker}`),
    };
}

export const getUnstakableInfo = async (
    userAddress: PublicKey
) => {
    const userPool: UserPool = await getUserPoolState(userAddress);
    
    const staked: number[] = [0, 0, 0, 0];
    const unstakable: number[] = [0, 0, 0, 0];
    const now: number = new Date().getTime();

    for (const data of userPool.stakeData) {
        let amount = data.amount.toNumber() / TOKEN_DECIMAL;

        staked[data.locker] += amount;
        if (now / 1000 - data.time.toNumber() >= LOCKER[data.locker]) {
            unstakable[data.locker] += amount;
            
            const rate = LOCKER_RATE[data.locker];
            unstakable[data.locker] += amount / 100 / 10000 * rate;
        }
    }

    const result = {
        staked,
        unstakable
    };

    return result;
}

