use crate::*;

/**
 * Global pool stores admin address
 */
#[account]
#[derive(Default)]
pub struct GlobalPool {
    pub super_admin: Pubkey, //  32
    //  Needed to calculate user's stake pool address
    pub stake_program: Pubkey, //  32
}

impl GlobalPool {
    pub const DATA_SIZE: usize = 32 + 32;
}

/**
 * LotteryPool stores lottery information
 */
#[account]
#[derive(Default)]
pub struct LotteryPool {
    //  Lottery Pool creator
    pub creator: Pubkey, //  32

    //  Token mint address
    pub token_address: Pubkey, //  32
    //  Token total raise amount
    pub total_raise: u64, // 8

    //  Pool open time
    pub open_time: i64, // 8
    //  Pool close time
    pub close_time: i64, // 8
    //  IDO lauch time
    pub launch_time: i64, // 8

    //  Total tickets deposit
    pub total_tickets: u32, // 4
    //  Number of winner tickets
    pub winner_count: u32, // 4

    //  Allocation per winning ticket
    //  Ticket_price in USDC
    pub ticket_price: u64, // 8

    //  ----- Information for winners -----
    //  Ticket numbers ends with winner_ending are winners
    //  last ending is partial, means not all numbers end with that are winners
    //  only greater than or equal to min_partial are winners
    pub ending_count: u32,        // 4
    pub winner_ending: [u16; 10], // 20
    pub min_partial: u32,         // 4
}

impl LotteryPool {
    pub const DATA_SIZE: usize = 32 + 32 + 8 + 8 + 8 + 8 + 4 + 4 + 8 + 4 + 20 + 4;
}

/**
 * UserPool stores user's ticket information in one lottery
 */
#[account]
pub struct UserPool {
    //  User address
    pub user: Pubkey, // 32
    //  Lottery address
    pub lottery: Pubkey, // 32
    //  Ticket count user participate
    pub ticket_amount: u8, // 1
    //  Ticket numbers
    pub tickets: [u32; 65], // 4 * 65 = 260

    //  Reward info
    pub usdc_claimed: u8,
    pub ttt_claimed: u8,
    pub win_count: u8,
}

impl Default for UserPool {
    #[inline]
    fn default() -> UserPool {
        UserPool {
            user: Pubkey::default(),
            lottery: Pubkey::default(),
            ticket_amount: 0,
            tickets: [0; 65],
            usdc_claimed: 0,
            ttt_claimed: 0,
            win_count: 0,
        }
    }
}

impl UserPool {
    pub const DATA_SIZE: usize = 32 + 32 + 1 + 4 * 65 + 1 + 1 + 1;
}
