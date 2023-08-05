use crate::*;
use sha2::Digest;
use sha2::Sha256;

#[derive(Accounts)]
pub struct SetWinner<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    //  Needed to get admin address
    //  Admin can set winners as well as the pool creator
    #[account(
        seeds = [GLOBAL_AUTHORITY_SEED.as_ref()],
        bump,
    )]
    pub global_pool: Account<'info, GlobalPool>,

    //  Lottery pool stores lottery info
    #[account(
        mut,
        constraint = lottery_pool.creator == *user.key
    )]
    pub lottery_pool: Account<'info, LotteryPool>,
}

impl SetWinner<'_> {
    pub fn process_instruction(ctx: &mut Context<Self>, mut nonce: u64) -> Result<()> {
        let lottery_pool = &mut ctx.accounts.lottery_pool;

        //  Check whether winner is set
        require!(lottery_pool.ending_count == 0, DexifiError::WinnerAlreadySet);
        
        //  Calculate number of digits in winner ending
        let mut rate = lottery_pool.total_tickets / lottery_pool.winner_count;
        // msg!("rate: {}", rate);
        if rate == 0 {
            //  total_tickets less than winner_count
            //  means all tickets are winners
            return Ok(());
        }

        let mut decimal = 1;
        while rate > 0 {
            rate /= 10;
            decimal *= 10;
        }
        // msg!("decimal: {}", decimal);

        //  Calculate header part and tail part of total tickets
        let header = lottery_pool.total_tickets / decimal;
        let tail = lottery_pool.total_tickets % decimal;
        // msg!("header: {}", header);
        // msg!("tail: {}", tail);

        loop {
            //  Generate random numbers
            let clock = Clock::get()?;
            let hashstruct = HashStruct {
                nonce,
                initial_seed: clock.slot,
            };
            let vec_to_hash = unsafe { self::any_as_u8_slice(&hashstruct) };
            let hash: &[u8] = &(Sha256::new().chain_update(vec_to_hash).finalize()[..32]);

            let mut ending_cnt = 0;
            let mut ending_idx = 0;
            let mut ticket_cnt = 0;
            for i in 0..31 {
                //  Find unique random number
                let rand_num = (hash[i as usize] as u16 * 256 + hash[(i + 1) as usize] as u16)
                    % decimal as u16;
                //  Check this random number is not used before
                if ending_idx != 0 {
                    let mut flag = 0;
                    for j in 0..ending_idx {
                        if lottery_pool.winner_ending[j] == rand_num {
                            flag = 1;
                            break;
                        }
                    }
                    if flag == 1 {
                        continue;
                    }
                }
                //  Set random number to winner ending
                lottery_pool.winner_ending[ending_idx as usize] = rand_num;
                ending_idx += 1;

                // msg!("rand_num: {}", rand_num);
                ticket_cnt += header;
                if rand_num <= tail as u16 {
                    ticket_cnt += 1;
                }

                ending_cnt += 1;
                if ticket_cnt >= lottery_pool.winner_count {
                    break;
                }
            }

            //  Check all endings set
            if ticket_cnt >= lottery_pool.winner_count {
                lottery_pool.ending_count = ending_cnt;

                // msg!("ticket_cnt: {}", ticket_cnt);

                //  partial endings are only winners if greater than or equal to min_partial
                lottery_pool.min_partial = (ticket_cnt - lottery_pool.winner_count) * decimal;
                break;
            }

            //  Try with another hash value
            nonce += 1;
        }
        Ok(())
    }
}

//  Used while generating pseudo random number
pub struct HashStruct {
    pub nonce: u64,
    pub initial_seed: u64,
}

unsafe fn any_as_u8_slice<T: Sized>(p: &T) -> &[u8] {
    ::std::slice::from_raw_parts((p as *const T) as *const u8, ::std::mem::size_of::<T>())
}
