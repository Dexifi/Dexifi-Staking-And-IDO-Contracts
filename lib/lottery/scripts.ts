import * as anchor from '@project-serum/anchor';
import {
    PublicKey,
    SystemProgram,
    SYSVAR_RENT_PUBKEY,
} from '@solana/web3.js';
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";

import { GLOBAL_AUTHORITY_SEED, LOTTERY_POOL_SEED, STAKE_PROGRAM, TTT_DECIMAL, USDC_ADDRESS, USDC_DECIMAL, USER_POOL_SEED, USER_STAKE_SEED } from './constant'
import { getAssociatedTokenAccount } from './util';

export const createInitializeTx = async (
    userAddress: PublicKey,
    program: anchor.Program,
) => {
    const [globalPool, bump] = PublicKey.findProgramAddressSync(
        [Buffer.from(GLOBAL_AUTHORITY_SEED)], 
        program.programId );

    console.log("globalPool: ", globalPool.toBase58());

    const txId = await program.methods
        .initialize(STAKE_PROGRAM)
        .accounts({
            admin: userAddress,
            globalPool,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY })
        .transaction();

    return txId;
}

export const createInitLotteryTx = async (
    userAddress: PublicKey,
    program: anchor.Program,
    tttMint: PublicKey,
    openTime: number,
    closeTime: number,
    launchTime: number,
    totalRase: number,
    winner_count: number,
    ticket_price: number
) => {
    const [globalPool, _bump] = PublicKey.findProgramAddressSync(
        [Buffer.from(GLOBAL_AUTHORITY_SEED)], 
        program.programId );
    console.log("globalPool: ", globalPool.toBase58());
    
    const [lotteryPool, _lottery_bump] = PublicKey.findProgramAddressSync(
        [
            userAddress.toBuffer(),
            Buffer.from(LOTTERY_POOL_SEED)
        ], 
        program.programId );
    console.log("lotteryPool: ", lotteryPool.toBase58());
    
    const [usdcVault, _usdc_bump] = PublicKey.findProgramAddressSync(
        [
            USDC_ADDRESS.toBuffer(),
            lotteryPool.toBuffer()
        ], 
        program.programId );
    console.log("usdcVault: ", usdcVault.toBase58());
    
    const [tttVault, _ttt_bump] = PublicKey.findProgramAddressSync(
        [
            lotteryPool.toBuffer(),
            tttMint.toBuffer()
        ], 
        program.programId );
    console.log("tttVault: ", tttVault.toBase58());

    const tttCreator = getAssociatedTokenAccount(userAddress, tttMint);
    console.log("tttCreator: ", tttCreator.toBase58());

    const txId = await program.methods
        .initLottery(
            new anchor.BN(openTime),
            new anchor.BN(closeTime),
            new anchor.BN(launchTime),
            new anchor.BN(totalRase * TTT_DECIMAL),
            winner_count,
            new anchor.BN(ticket_price * USDC_DECIMAL))
        .accounts({
            admin: userAddress,
            globalPool,
            lotteryPool,
            usdcVault,
            usdcMint: USDC_ADDRESS,
            tttVault,
            tttCreator,
            tttMint,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY })
        .transaction();

    return txId;
}

export const createInitUserTx = async (
    userAddress: PublicKey,
    lotteryPool: PublicKey,
    program: anchor.Program,
) => {
    const [userPool, bump] = PublicKey.findProgramAddressSync(
        [
            lotteryPool.toBuffer(),
            userAddress.toBuffer(), 
            Buffer.from(USER_POOL_SEED)
        ], 
        program.programId );
    console.log("userPool: ", userPool.toBase58());

    const txId = await program.methods
        .initUser(lotteryPool)
        .accounts({
            user: userAddress,
            userPool,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY })
        .transaction();

    return txId;
}

export const createBuyTicketTx = async (
    userAddress: PublicKey,
    lotteryPool: PublicKey,
    tttMint: PublicKey,
    amount: number,
    program: anchor.Program,
) => {
    const [globalPool, _bump] = PublicKey.findProgramAddressSync(
        [Buffer.from(GLOBAL_AUTHORITY_SEED)], 
        program.programId );
    console.log("globalPool: ", globalPool.toBase58());
    
    const [usdcVault, _usdc_bump] = PublicKey.findProgramAddressSync(
        [
            USDC_ADDRESS.toBuffer(),
            lotteryPool.toBuffer()
        ], 
        program.programId );
    console.log("usdcVault: ", usdcVault.toBase58());

    const [userPool, _userpool_bump] = PublicKey.findProgramAddressSync(
        [
            lotteryPool.toBuffer(),
            userAddress.toBuffer(), 
            Buffer.from(USER_POOL_SEED)
        ], 
        program.programId );
    console.log("userPool: ", userPool.toBase58());

    const usdcUser = getAssociatedTokenAccount(userAddress, USDC_ADDRESS);
    console.log("usdcUser: ", usdcUser.toBase58());

    const [userStakePool, bump] = PublicKey.findProgramAddressSync(
        [userAddress.toBuffer(), Buffer.from(USER_STAKE_SEED)], 
        STAKE_PROGRAM );
    console.log("userStakePool: ", userStakePool.toBase58());
    
    const [tttVault, _ttt_bump] = PublicKey.findProgramAddressSync(
        [
            lotteryPool.toBuffer(),
            tttMint.toBuffer()
        ], 
        program.programId );
    console.log("tttVault: ", tttVault.toBase58());
    
    const txId = await program.methods
        .buyTicket(amount)
        .accounts({
            user: userAddress,
            globalPool,
            lotteryPool,
            usdcVault,
            usdcUser,
            userPool,
            userStakePool,
            tttVault,
            tttMint,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY })
        .transaction();

    return txId;
}

export const createSetWinnerTx = async (
    userAddress: PublicKey,
    lotteryPool: PublicKey,
    program: anchor.Program,
) => {
    const [globalPool, _bump] = PublicKey.findProgramAddressSync(
        [Buffer.from(GLOBAL_AUTHORITY_SEED)], 
        program.programId );
    console.log("globalPool: ", globalPool.toBase58());

    const txId = await program.methods
        .setWinner(new anchor.BN(Date.now()))
        .accounts({
            user: userAddress,
            globalPool,
            lotteryPool })
        .transaction();

    return txId;
}

export const createClaimUsdcTx = async (
    userAddress: PublicKey,
    lotteryPool: PublicKey,
    program: anchor.Program,
) => {
    const [usdcVault, _usdc_bump] = PublicKey.findProgramAddressSync(
        [
            USDC_ADDRESS.toBuffer(),
            lotteryPool.toBuffer()
        ], 
        program.programId );
    console.log("usdcVault: ", usdcVault.toBase58());

    const usdcUser = getAssociatedTokenAccount(userAddress, USDC_ADDRESS);
    console.log("usdcUser: ", usdcUser.toBase58());

    const [userPool, bump] = PublicKey.findProgramAddressSync(
        [
            lotteryPool.toBuffer(),
            userAddress.toBuffer(), 
            Buffer.from(USER_POOL_SEED)
        ], 
        program.programId );
    console.log("userPool: ", userPool.toBase58());
    
    const txId = await program.methods
        .claimUsdc()
        .accounts({
            user: userAddress,
            lotteryPool,
            usdcVault,
            usdcUser,
            usdcMint: USDC_ADDRESS,
            userPool,
            tokenProgram: TOKEN_PROGRAM_ID
        })
        .transaction();

    return txId;
}

export const createClaimTokenTx = async (
    userAddress: PublicKey,
    lotteryPool: PublicKey,
    tttMint: PublicKey,
    program: anchor.Program,
) => {
    const [userPool, bump] = PublicKey.findProgramAddressSync(
        [
            lotteryPool.toBuffer(),
            userAddress.toBuffer(), 
            Buffer.from(USER_POOL_SEED)
        ], 
        program.programId );
    console.log("userPool: ", userPool.toBase58());
    
    const [tttVault, _ttt_bump] = PublicKey.findProgramAddressSync(
        [
            lotteryPool.toBuffer(),
            tttMint.toBuffer()
        ], 
        program.programId );
    console.log("tttVault: ", tttVault.toBase58());

    const tttUser = getAssociatedTokenAccount(userAddress, tttMint);
    console.log("tttUser: ", tttUser.toBase58());
    
    const txId = await program.methods
        .claimTtt()
        .accounts({
            user: userAddress,
            lotteryPool,
            userPool,
            tttVault,
            tttUser,
            tttMint,
            usdcMint: USDC_ADDRESS,
            tokenProgram: TOKEN_PROGRAM_ID
        })
        .transaction();

    return txId;
}

export const createWithdrawUsdcTx = async (
    userAddress: PublicKey,
    lotteryPool: PublicKey,
    amount: number,
    program: anchor.Program,
) => {
    const [usdcVault, _usdc_bump] = PublicKey.findProgramAddressSync(
        [
            USDC_ADDRESS.toBuffer(),
            lotteryPool.toBuffer()
        ], 
        program.programId );
    console.log("usdcVault: ", usdcVault.toBase58());

    const usdcUser = getAssociatedTokenAccount(userAddress, USDC_ADDRESS);
    console.log("usdcUser: ", usdcUser.toBase58());

    const [userPool, bump] = PublicKey.findProgramAddressSync(
        [
            lotteryPool.toBuffer(),
            userAddress.toBuffer(), 
            Buffer.from(USER_POOL_SEED)
        ], 
        program.programId );
    console.log("userPool: ", userPool.toBase58());
    
    const txId = await program.methods
        .withdrawUsdc(amount)
        .accounts({
            user: userAddress,
            lotteryPool,
            usdcVault,
            usdcUser,
            usdcMint: USDC_ADDRESS,
            userPool,
            tokenProgram: TOKEN_PROGRAM_ID
        })
        .transaction();

    return txId;
}

