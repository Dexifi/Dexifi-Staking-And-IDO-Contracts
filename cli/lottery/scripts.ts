import {Program, web3} from '@project-serum/anchor';
import * as anchor from '@project-serum/anchor';
import fs from 'fs';
import NodeWallet from '@project-serum/anchor/dist/cjs/nodewallet';
import { GLOBAL_AUTHORITY_SEED, PROGRAM_ID, USER_POOL_SEED } from '../../lib/lottery/constant';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';

import {IDL} from "../../target/types/dexifi_lottery";
import { 
    createBuyTicketTx,
    createClaimTokenTx,
    createClaimUsdcTx,
    createInitLotteryTx,
    createInitUserTx, 
    createInitializeTx,
    createSetWinnerTx,
    createWithdrawUsdcTx, 
} from '../../lib/lottery/scripts';
import { GlobalPool, LotteryPool, UserPool } from '../../lib/lottery/types';

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
 * Initialize global pool
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
 * Initialize lottery pool
 */
export const initializeLotteryPool = async (
    tttMint: PublicKey,
    openTime: number,
    closeTime: number,
    launchTime: number,
    totalRase: number,
    winner_count: number,
    ticket_price: number
) => {
    try {
        const tx = await createInitLotteryTx(
            payer.publicKey, 
            program,
            tttMint,
            openTime,
            closeTime,
            launchTime,
            totalRase,
            winner_count,
            ticket_price);

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
export const initUser = async (
    lotteryPool: PublicKey
) => {
    try {
        const tx = await createInitUserTx(payer.publicKey, lotteryPool, program);

        const txId = await provider.sendAndConfirm(tx, [], {
            commitment: "confirmed",
        });

        console.log("txHash: ", txId);
    } catch (e) {
        console.log(e);
    }
}

export const buyTicket = async (
    lotteryPool: PublicKey,
    tttMint: PublicKey,
    amount: number
) => {
    try {
        const tx = await createBuyTicketTx(
            payer.publicKey, 
            lotteryPool, 
            tttMint,
            amount,
            program);

        const txId = await provider.sendAndConfirm(tx, [], {
            commitment: "confirmed",
        });

        console.log("txHash: ", txId);
    } catch (e) {
        console.log(e);
    }
}

export const setWinner = async (
    lotteryPool: PublicKey,
) => {
    try {
        const tx = await createSetWinnerTx(
            payer.publicKey, 
            lotteryPool, 
            program);

        const txId = await provider.sendAndConfirm(tx, [], {
            commitment: "confirmed",
        });

        console.log("txHash: ", txId);
    } catch (e) {
        console.log(e);
    }
}

export const claimUsdc = async (
    lotteryPool: PublicKey,
) => {
    try {
        const tx = await createClaimUsdcTx(
            payer.publicKey, 
            lotteryPool, 
            program);

        const txId = await provider.sendAndConfirm(tx, [], {
            commitment: "confirmed",
        });

        console.log("txHash: ", txId);
    } catch (e) {
        console.log(e);
    }
}

export const claimToken = async (
    lotteryPool: PublicKey,
    tokenMint: PublicKey
) => {
    try {
        const tx = await createClaimTokenTx(
            payer.publicKey, 
            lotteryPool, 
            tokenMint,
            program);

        const txId = await provider.sendAndConfirm(tx, [], {
            commitment: "confirmed",
        });

        console.log("txHash: ", txId);
    } catch (e) {
        console.log(e);
    }
}

export const withdrawUsdc = async (
    lotteryPool: PublicKey,
    amount: number
) => {
    try {
        const tx = await createWithdrawUsdcTx(
            payer.publicKey, 
            lotteryPool, 
            amount,
            program);

        const txId = await provider.sendAndConfirm(tx, [], {
            commitment: "confirmed",
        });

        console.log("txHash: ", txId);
    } catch (e) {
        console.log(e);
    }
}

export const getGlobalState = async (): Promise<GlobalPool | null> => {

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

export const printGlobalInfo = async () => {

    const globalPool: GlobalPool = await getGlobalState();
    
    return {
        admin: globalPool.superAdmin.toBase58(),
        stakeProgram: globalPool.stakeProgram.toBase58()
    };
}

export const getLotteryState = async (
    lotteryAddress: PublicKey
): Promise<LotteryPool | null> => {
    let lotteryPool = await program.account.lotteryPool.fetch(lotteryAddress);
    return lotteryPool as unknown as LotteryPool;
}

export const printLotteryInfo = async (
    lotteryAddress: PublicKey
) => {

    const lotteryPool: LotteryPool = await getLotteryState(lotteryAddress);
    
    return {
        creator: lotteryPool.creator.toBase58(),
        token: lotteryPool.tokenAddress.toBase58(),
        open: (new Date(lotteryPool.openTime.toNumber() * 1000)).toLocaleString(),
        close: (new Date(lotteryPool.closeTime.toNumber() * 1000)).toLocaleString(),
        launch: (new Date(lotteryPool.launchTime.toNumber() * 1000)).toLocaleString(),
        totalRaise: lotteryPool.totalRaise,
        totalTickets: lotteryPool.totalTickets,
        winnerCount: lotteryPool.winnerCount,
        ticketPrice: lotteryPool.ticketPrice,

        endingCount: lotteryPool.endingCount,
        winners: lotteryPool.winnerEnding,
        minPartial: lotteryPool.minPartial,
    };
}

export const getUserState = async (
    lotteryPool: PublicKey,
    userAddress: PublicKey
): Promise<UserPool | null> => {
    const [userPool, bump] = PublicKey.findProgramAddressSync(
        [
            lotteryPool.toBuffer(),
            userAddress.toBuffer(), 
            Buffer.from(USER_POOL_SEED)
        ], 
        program.programId );
    console.log("userPool: ", userPool.toBase58());

    try
    {
        let userState = await program.account.userPool.fetch(userPool);
        return userState as unknown as UserPool;
    }
    catch
    {
        return null;
    }
}

export const printUserInfo = async (
    lotteryPool: PublicKey,
    userAddress: PublicKey
) => {

    const userPool: UserPool = await getUserState(lotteryPool, userAddress);
    
    return {
        creator: userPool.user.toBase58(),
        token: userPool.lottery.toBase58(),
        ticketAmount: userPool.ticketAmount,
        tickets: userPool.tickets,
        usdcClaimed: userPool.usdcClaimed,
        tttClaimed: userPool.tttClaimed,
        winCount: userPool.winCount
    }
}
