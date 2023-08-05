pub const GLOBAL_AUTHORITY_SEED: &str = "global-authority";
pub const USER_POOL_SEED: &str = "user-stake-pool";

pub const DXE_ADDRESS: &str = "CnMjCokabKZmLeLcpvhczVb14C54mTtsuB85KjMT9Z2Y";

pub const LOCKER: [i64; 4] = [
    60,      //60 * 60 * 24 * 30; // 30 day
    60 * 3,  //60 * 60 * 24 * 30 * 3; // 3 month
    60 * 6,  //60 * 60 * 24 * 30 * 6; // 6 month
    60 * 12, //60 * 60 * 24 * 30 * 12; // 1 year
];

/**
 * Reward APY is 7.5, 9.0, 10.5, 15.0 respectively
 * Lock time is 1, 3, 6, 12 month
 * So the amount user gets when withdraw is
 * Locker1: 7.5 * 1 / 12 = 0.625
 * Locker2: 9.0 * 3 / 12 = 2.25
 * Locker3: 10.5 * 6 / 12 = 5.25
 * Locker4: 15.0 * 12 / 12 = 15
 * multiply by 10000 to easy to use in program
 */
pub const LOCKER_RATE: [u64; 4] = [6250, 22500, 52500, 150000];

//  pub const MAX_STAKE_AMOUNT: u64 = 500 * 1000000000;

pub const LOCKER_TICKET_RATE: [u8; 4] = [1, 2, 4, 6];

pub const MAX_STAKE_AMOUNT: u16 = 500;
pub const DXE_DECIMAL: u64 = 1000000000;
