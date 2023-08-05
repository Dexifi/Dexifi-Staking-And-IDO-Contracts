import * as anchor from '@project-serum/anchor';
import {
    PublicKey,
    Keypair,
    Connection,
    SystemProgram,
    SYSVAR_RENT_PUBKEY,
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

import { getAssociatedTokenAccount } from './util';
import { DXE_ADDRESS, GLOBAL_AUTHORITY_SEED, TOKEN_DECIMAL, USER_POOL_SEED } from './constant'

export const createInitializeTx = async (
    userAddress: PublicKey,
    program: anchor.Program,
) => {
    const [globalPool, bump] = PublicKey.findProgramAddressSync(
        [Buffer.from(GLOBAL_AUTHORITY_SEED)], 
        program.programId );
    const [dxeVault, dxeBump] = PublicKey.findProgramAddressSync(
        [DXE_ADDRESS.toBuffer()],
        program.programId
    );

    console.log("globalPool: ", globalPool.toBase58());
    console.log("dxeVault: ", dxeVault.toBase58());

    const txId = await program.methods
        .initialize()
        .accounts({
            admin: userAddress,
            globalPool,
            dxeVault,
            dxeMint: DXE_ADDRESS,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY })
        .transaction();

    return txId;
}

export const createInitUserTx = async (
    userAddress: PublicKey,
    program: anchor.Program,
) => {
    const [userPool, bump] = PublicKey.findProgramAddressSync(
        [userAddress.toBuffer(), Buffer.from(USER_POOL_SEED)], 
        program.programId );

    console.log("userPool: ", userPool.toBase58());

    const txId = await program.methods
        .initUser()
        .accounts({
            user: userAddress,
            userPool,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY })
        .transaction();

    return txId;
}

export const createStakeDxeTx = async (
    userAddress: PublicKey,
    amount: number,
    locker: number,
    program: anchor.Program,
) => {
    const [dxeVault, dxeBump] = PublicKey.findProgramAddressSync(
        [DXE_ADDRESS.toBuffer()],
        program.programId
    );
    console.log("dxeVault: ", dxeVault.toBase58());

    const [userPool, bump] = PublicKey.findProgramAddressSync(
        [userAddress.toBuffer(), Buffer.from(USER_POOL_SEED)], 
        program.programId );
    console.log("userPool: ", userPool.toBase58());

    const dxeUser = await getAssociatedTokenAccount(userAddress, DXE_ADDRESS);
    console.log("user DXE account:", dxeUser.toBase58());

    const txId = await program.methods
        .stakeDxe(new anchor.BN(amount * TOKEN_DECIMAL), new anchor.BN(locker))
        .accounts({
            user: userAddress,
            userPool,
            dxeVault,
            dxeUser,
            tokenProgram: TOKEN_PROGRAM_ID })
        .transaction();

    return txId;
}

export const createUnstakeDxeTx = async (
    userAddress: PublicKey,
    locker: number,
    program: anchor.Program,
) => {
    const [dxeVault, dxeBump] = PublicKey.findProgramAddressSync(
        [DXE_ADDRESS.toBuffer()],
        program.programId
    );
    console.log("dxeVault: ", dxeVault.toBase58());

    const [userPool, bump] = PublicKey.findProgramAddressSync(
        [userAddress.toBuffer(), Buffer.from(USER_POOL_SEED)], 
        program.programId );
    console.log("userPool: ", userPool.toBase58());

    const dxeUser = await getAssociatedTokenAccount(userAddress, DXE_ADDRESS);
    console.log("user DXE account:", dxeUser.toBase58());

    const txId = await program.methods
        .unstakeDxe(new anchor.BN(locker))
        .accounts({
            user: userAddress,
            userPool,
            dxeVault,
            dxeUser,
            dxeMint: DXE_ADDRESS,
            tokenProgram: TOKEN_PROGRAM_ID })
        .transaction();

    return txId;
}

export const createWithdrawTx = async (
    userAddress: PublicKey,
    amount: number,
    program: anchor.Program,
) => {
    const [globalPool, bump] = PublicKey.findProgramAddressSync(
        [Buffer.from(GLOBAL_AUTHORITY_SEED)], 
        program.programId );
    console.log("globalPool: ", globalPool.toBase58());

    const [dxeVault, dxeBump] = PublicKey.findProgramAddressSync(
        [DXE_ADDRESS.toBuffer()],
        program.programId
    );
    console.log("dxeVault: ", dxeVault.toBase58());

    const dxeUser = await getAssociatedTokenAccount(userAddress, DXE_ADDRESS);
    console.log("user DXE account:", dxeUser.toBase58());

    const txId = await program.methods
        .withdraw(new anchor.BN(amount * TOKEN_DECIMAL))
        .accounts({
            user: userAddress,
            globalPool,
            dxeVault,
            dxeUser,
            dxeMint: DXE_ADDRESS,
            tokenProgram: TOKEN_PROGRAM_ID })
        .transaction();

    return txId;
}
