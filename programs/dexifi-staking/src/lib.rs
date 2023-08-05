use anchor_lang::{prelude::*, AnchorDeserialize};

pub mod constant;
pub mod error;
pub mod instructions;
pub mod state;
use constant::*;
use error::*;
use instructions::*;
use state::*;

declare_id!("CFaNXr6zPn8Kaf5ARhdw3hmXwHLR28rBJPzzR4rcpMaG");

#[program]
pub mod dexifi_staking {
    use super::*;

    /**
     * Initialize global pool
     * super admin sets to the caller of this instruction
     */
    pub fn initialize(mut ctx: Context<Initialize>) -> Result<()> {
        Initialize::process_instruction(&mut ctx)
    }

    //  Initialize user pool
    pub fn init_user(mut ctx: Context<InitUser>) -> Result<()> {
        InitUser::process_instruction(&mut ctx)
    }

    /**
     * User can stake a specified amount of DXE tokens into one of four lockers
     * - amount: number of DXE to be staked
     * - locker: locker ID specifying where the tokens will be deposited
     */
    pub fn stake_dxe(mut ctx: Context<StakeDxe>, amount: u64, locker: u32) -> Result<()> {
        StakeDxe::process_instruction(&mut ctx, amount, locker)
    }

    /**
     * User can unstake possible DXE in one locker that has staked enough time
     * - locker: locker ID specifying which one to unstake
     */
    pub fn unstake_dxe(mut ctx: Context<UnstakeDxe>, locker: u32) -> Result<()> {
        UnstakeDxe::process_instruction(&mut ctx, locker)
    }

    /**
     * Admin can withdraw DXE from the vault
     * - amount: amount of DXE to withdraw
     */
    pub fn withdraw(mut ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        Withdraw::process_instruction(&mut ctx, amount)
    }
}
