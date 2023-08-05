use anchor_lang::{prelude::*, AnchorDeserialize};

pub mod constant;
pub mod error;
pub mod instructions;
pub mod state;
use constant::*;
use error::*;
use instructions::*;
use state::*;

declare_id!("GTDpu3YpUcRiG7LBUb1u9QDnv3F8hWRhNVWHxHjdFwej");

#[program]
pub mod dexifi_lottery {
    use super::*;

    /**
     * Initialize global pool
     * super admin sets to the caller of this instruction
     */
    pub fn initialize(mut ctx: Context<Initialize>, staking_program: Pubkey) -> Result<()> {
        Initialize::process_instruction(&mut ctx, staking_program)
    }

    //  Initialize new lottery
    pub fn init_lottery(
        mut ctx: Context<InitLottery>,
        open_time: i64,
        close_time: i64,
        launch_time: i64,
        total_raise: u64,
        winner_count: u32,
        ticket_price: u64,
    ) -> Result<()> {
        InitLottery::process_instruction(
            &mut ctx,
            open_time,
            close_time,
            launch_time,
            total_raise,
            winner_count,
            ticket_price,
        )
    }

    //  Initialize user pool
    pub fn init_user(mut ctx: Context<InitUser>, lottery: Pubkey) -> Result<()> {
        InitUser::process_instruction(&mut ctx, lottery)
    }

    //  But ticket
    pub fn buy_ticket(mut ctx: Context<BuyTicket>, amount: u8) -> Result<()> {
        BuyTicket::process_instruction(&mut ctx, amount)
    }

    //  Admin set winners after lottery ended
    pub fn set_winner(mut ctx: Context<SetWinner>, nonce: u64) -> Result<()> {
        SetWinner::process_instruction(&mut ctx, nonce)
    }

    //  User takes USDC for tickets not drawn
    pub fn claim_usdc(mut ctx: Context<ClaimUsdc>) -> Result<()> {
        ClaimUsdc::process_instruction(&mut ctx)
    }

    // User can claim TTT after IDO launch
    pub fn claim_ttt(mut ctx: Context<ClaimTtt>) -> Result<()> {
        ClaimTtt::process_instruction(&mut ctx)
    }

    // Pool creator can withdraw usdc after IDO launch
    pub fn withdraw_usdc(mut ctx: Context<WithdrawUsdc>, amount: u64) -> Result<()> {
        WithdrawUsdc::process_instruction(&mut ctx, amount)
    }
}
