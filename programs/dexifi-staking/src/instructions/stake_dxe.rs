use anchor_spl::token::{self, Token, TokenAccount};

use crate::*;

#[derive(Accounts)]
pub struct StakeDxe<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    //  PDA that stores user's stake info
    #[account(
        mut,
        seeds = [user.key().as_ref(), USER_POOL_SEED.as_ref()],
        bump,
    )]
    pub user_pool: Account<'info, UserPool>,

    //  program vault that stores DXE tokens
    #[account(
        mut,
        seeds = [ DXE_ADDRESS.parse::<Pubkey>().unwrap().as_ref() ],
        bump,
    )]
    pub dxe_vault: Account<'info, TokenAccount>,

    //  user token account that stores DXE
    #[account(mut)]
    pub dxe_user: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

impl StakeDxe<'_> {
    pub fn process_instruction(ctx: &mut Context<Self>, amount: u64, locker: u32) -> Result<()> {
        //  locker is 0 - 3
        require!(locker < 4, DexifiError::LockerIndexTooBig);

        //  Transfer token from user ATA to vault
        let cpi_ctx: CpiContext<_> = CpiContext::new(
            ctx.accounts.token_program.to_account_info().clone(),
            token::Transfer {
                from: ctx.accounts.dxe_user.to_account_info().clone(),
                authority: ctx.accounts.user.to_account_info().clone(),
                to: ctx.accounts.dxe_vault.to_account_info().clone(),
            },
        );
        token::transfer(cpi_ctx, amount)?;

        //  Add stake info in user pool
        let user_pool = &mut ctx.accounts.user_pool;
        user_pool.add_stake_info(amount, locker)
    }
}
