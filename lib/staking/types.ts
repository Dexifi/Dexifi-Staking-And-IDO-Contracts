import * as anchor from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';

export interface GlobalPool {
    superAdmin: PublicKey,      // 32
}

export interface UserPool {
    user: PublicKey,            // 32
    stakeData: StakeInfo[],
}

export interface StakeInfo {
    time: anchor.BN,            //  8
    amount: anchor.BN,          //  8
    locker: number              //  4
}
