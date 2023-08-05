
import { 
    PublicKey, 
} from "@solana/web3.js";

export const GLOBAL_AUTHORITY_SEED = "global-authority";
export const USER_STAKE_SEED = "user-stake-pool";
export const LOTTERY_POOL_SEED = "lottery-pool";
export const USER_POOL_SEED = "user-lottery-pool";

export const PROGRAM_ID = new PublicKey("GTDpu3YpUcRiG7LBUb1u9QDnv3F8hWRhNVWHxHjdFwej");
export const STAKE_PROGRAM = new PublicKey("CFaNXr6zPn8Kaf5ARhdw3hmXwHLR28rBJPzzR4rcpMaG");

export const DXE_ADDRESS = new PublicKey("CnMjCokabKZmLeLcpvhczVb14C54mTtsuB85KjMT9Z2Y");
export const DXE_DECIMAL = 1000000000;

export const USDC_ADDRESS = new PublicKey("5NyADEEXaoniwHkwWYEVuuB9mAtnXSCsEfmDm4gFvhQM");  //  TEST
//export const USDC_ADDRESS = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
export const USDC_DECIMAL = 1000000;

export const LOCKER_TICKET_RATE: number[] = [1, 2, 4, 6];
export const MAX_STAKE_AMOUNT: number = 500;

export const TTT_DECIMAL = 1000000;
