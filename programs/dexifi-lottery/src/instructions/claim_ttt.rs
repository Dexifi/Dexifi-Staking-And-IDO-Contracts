use anchor_spl::token::{self, Mint, Token, TokenAccount};

use crate::*;

#[derive(Accounts)]
pub struct ClaimTtt<'info> {
    //  Only creator can withdraw from the vault
    #[account(mut)]
    pub user: Signer<'info>,

    //  Lottery pool stores lottery info
    #[account(mut)]
    pub lottery_pool: Box<Account<'info, LotteryPool>>,

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

    // TTT token account for this lottery
    #[account(
        seeds = [ lottery_pool.key().as_ref(),
            ttt_mint.key().as_ref() ],
        bump,
    )]
    pub ttt_vault: Account<'info, TokenAccount>,

    //  ATA that will store reward TTT
    #[account(mut)]
    pub ttt_user: Account<'info, TokenAccount>,

    // The mint of $TTT that's gonna be used as reward in this lottery
    #[account(
        address = lottery_pool.token_address
    )]
    pub ttt_mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
}

impl ClaimTtt<'_> {
    pub fn process_instruction(ctx: &mut Context<Self>) -> Result<()> {
        let user_pool = &mut ctx.accounts.user_pool;
        let lottery_pool = &mut ctx.accounts.lottery_pool;

        require!(user_pool.ttt_claimed == 0, DexifiError::AlreadyClaimed);

        user_pool.ttt_claimed = 1;
        //  Transfer TTT from vault to user
        let lottery_addr = lottery_pool.key();
        let ttt_address = ctx.accounts.ttt_mint.key();
        let ttt_bump = *ctx.bumps.get("ttt_vault").unwrap();
        let seeds = &[
            lottery_addr.as_ref(), 
            ttt_address.as_ref(), 
            &[ttt_bump]];
        let signer = [&seeds[..]];

        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            token::Transfer {
                from: ctx.accounts.ttt_vault.to_account_info(),
                authority: ctx.accounts.ttt_vault.to_account_info(),
                to: ctx.accounts.ttt_user.to_account_info(),
            },
            &signer,
        );
        token::transfer(cpi_ctx, 
            lottery_pool.total_raise / lottery_pool.winner_count as u64
                * user_pool.win_count as u64)?;
        
        Ok(())
    }
}
