
import { 
    PublicKey, 
} from "@solana/web3.js";

export const LAMPORTS = 1000000000;
export const TOKEN_DECIMAL = 1000000000;
export const GLOBAL_AUTHORITY_SEED = "global-authority";
export const USER_POOL_SEED = "user-stake-pool";

export const PROGRAM_ID = new PublicKey("CFaNXr6zPn8Kaf5ARhdw3hmXwHLR28rBJPzzR4rcpMaG");
export const DXE_ADDRESS = new PublicKey("CnMjCokabKZmLeLcpvhczVb14C54mTtsuB85KjMT9Z2Y");

export const LOCKER: number[] = [
    60,      //60 * 60 * 24 * 30; // 30 day
    60 * 3,  //60 * 60 * 24 * 30 * 3; // 3 month
    60 * 6,  //60 * 60 * 24 * 30 * 6; // 6 month
    60 * 12, //60 * 60 * 24 * 30 * 12; // 1 year
];

export const LOCKER_RATE: number[] = [6250, 22500, 52500, 150000];
