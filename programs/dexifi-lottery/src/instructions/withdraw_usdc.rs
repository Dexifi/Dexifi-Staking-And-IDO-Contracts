use anchor_spl::token::{self, Mint, Token, TokenAccount};

use crate::*;

#[derive(Accounts)]
pub struct WithdrawUsdc<'info> {
    //  Only creator can withdraw from the vault
    #[account(
        mut,
        constraint = lottery_pool.creator == *user.key @DexifiError::InvalidCreator
    )]
    pub user: Signer<'info>,

    //  Lottery pool stores lottery info
    #[account(mut)]
    pub lottery_pool: Box<Account<'info, LotteryPool>>,

    // USDC token account for this lottery
    #[account(
        mut,
        seeds = [ 
            USDC_ADDRESS.parse::<Pubkey>().unwrap().as_ref(),
            lottery_pool.key().as_ref() ],
        bump
    )]
    pub usdc_vault: Account<'info, TokenAccount>,

    //  user token account that stores USDC
    #[account(mut)]
    pub usdc_user: Account<'info, TokenAccount>,

    #[account(
        address = USDC_ADDRESS.parse::<Pubkey>().unwrap(),
    )]
    pub usdc_mint: Account<'info, Mint>,

    //  User pool stores user's lottery info
    #[account(
        mut,
        seeds = [
            lottery_pool.key().as_ref(), 
            user.key().as_ref(),
            USER_POOL_SEED.as_ref() ],
        bump
    )]
    pub user_pool: Box<Account<'info, UserPool>>,

    pub token_program: Program<'info, Token>,
}

impl WithdrawUsdc<'_> {
    pub fn process_instruction(ctx: &mut Context<Self>, amount: u64) -> Result<()> {
        let lottery_pool = &mut ctx.accounts.lottery_pool;

        //  Transfer USDC from vault to user
        let usdc_address = ctx.accounts.usdc_mint.key();
        let lottery_addr = lottery_pool.key();
        let usdc_bump = *ctx.bumps.get("usdc_vault").unwrap();
        let seeds = &[
            usdc_address.as_ref(), 
            lottery_addr.as_ref(), 
            &[usdc_bump]];
        let signer = [&seeds[..]];

        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            token::Transfer {
                from: ctx.accounts.usdc_vault.to_account_info(),
                authority: ctx.accounts.usdc_vault.to_account_info(),
                to: ctx.accounts.usdc_user.to_account_info(),
            },
            &signer,
        );

        token::transfer(cpi_ctx, amount)?;

        Ok(())
    }
}
