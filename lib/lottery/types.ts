import * as anchor from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';

export interface GlobalPool {
    superAdmin: PublicKey,      // 32
    stakeProgram: PublicKey,      // 32
}

export interface LotteryPool {
    creator: PublicKey,            // 32
    
    tokenAddress: PublicKey,       // 32
    totalRaise: anchor.BN,         // 8

    openTime: anchor.BN,           // 8
    closeTime: anchor.BN,          // 8
    launchTime: anchor.BN,         // 8

    totalTickets: number,          // 4
    winnerCount: number,           // 4
    ticketPrice: anchor.BN,       // 8

    endingCount: number,           // 4
    winnerEnding: number[],        // 20
    minPartial: number             // 4
}

export interface UserPool {
    user: PublicKey,            // 32
    lottery: PublicKey,         // 32
    ticketAmount: number,       // 1
    tickets: number[],          // 4 * 65 = 260
    usdcClaimed: number         // 1
    tttClaimed: number          // 1
    winCount: number            // 1
}

export interface StakeInfo {
    time: anchor.BN,            //  8
    amount: anchor.BN,          //  8
    locker: number              //  4
}

export interface UserStakePool {
    user: PublicKey,            // 32
    stakeData: StakeInfo[]
}
