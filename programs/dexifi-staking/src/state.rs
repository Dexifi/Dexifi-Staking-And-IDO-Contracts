use crate::*;

/**
 * Global pool stores admin address
 */
#[account]
#[derive(Default)]
pub struct GlobalPool {
    pub super_admin: Pubkey, //  32
}

impl GlobalPool {
    pub const DATA_SIZE: usize = 32;
}

/**
 * User pool stores user's stake data
 */
#[account]
#[derive(Default)]
pub struct UserPool {
    pub user: Pubkey,               // 32
    pub stake_data: Vec<StakeInfo>, // 4 + StakeInfo::DATA_SIZE * StakeInfo::MAX_CNT
}

impl UserPool {
    pub const DATA_SIZE: usize = 4 + StakeInfo::DATA_SIZE * StakeInfo::MAX_CNT;

    //  Add new StakeInfo to vector
    pub fn add_stake_info(&mut self, amount: u64, locker: u32) -> Result<()> {
        //  User can only store MAX_CNT times
        require!(
            self.stake_data.len() < StakeInfo::MAX_CNT,
            DexifiError::ExceedMaxCount
        );

        //  Add stake info
        self.stake_data.push(StakeInfo {
            time: Clock::get()?.unix_timestamp,
            amount,
            locker,
        });

        Ok(())
    }

    //  Calculate withraw amount and remove from StakeInfo vector
    pub fn unstake(&mut self, now: i64, locker: u32) -> u64 {
        let mut amount: u64 = 0;

        for i in (0..self.stake_data.len()).rev() {
            let info = self.stake_data[i].clone();

            //  Can withdraw tokens that staked enough time from specific locker
            if info.locker == locker && (now - info.time) >= LOCKER[locker as usize] {
                //  Calculate withdraw amount
                let rate: u64 = LOCKER_RATE[locker as usize];
                amount += info.amount + info.amount / 100 / 10000 * rate;

                //  Remove from stake list
                self.stake_data.remove(i);
            }
        }

        return amount;
    }

    //  Calculate max ticket amount can be used
    pub fn max_ticket(&self) -> u8 {
        let mut amount: [u16; 4] = [0, 0, 0, 0];

        for i in 0..self.stake_data.len() {
            let info = self.stake_data[i].clone();
            amount[info.locker as usize] += (info.amount / DXE_DECIMAL) as u16;
        }

        let mut ticket_count: u8 = 0;
        for i in 0..4 {
            let mut tmp = amount[i];
            if tmp > MAX_STAKE_AMOUNT {
                tmp = 500;
            }
            ticket_count += (tmp / 100) as u8 * LOCKER_TICKET_RATE[i];
        }

        return ticket_count;
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Default, Clone)]
pub struct StakeInfo {
    //  Staked time
    pub time: i64, // 8
    //  Staked amount
    pub amount: u64, // 8
    //  Locker DXE staked
    pub locker: u32, // 4
}

impl StakeInfo {
    pub const DATA_SIZE: usize = 8 + 8 + 4;
    pub const MAX_CNT: usize = 50;
}
