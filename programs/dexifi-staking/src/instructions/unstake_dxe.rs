use anchor_spl::token::{self, Mint, Token, TokenAccount};

use crate::*;

#[derive(Accounts)]
pub struct UnstakeDxe<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    //  User pool stores user's stake info
    #[account(
        mut,
        seeds = [user.key().as_ref(), USER_POOL_SEED.as_ref()],
        bump,
    )]
    pub user_pool: Account<'info, UserPool>,

    //  PDA for store DXE tokens in the program
    #[account(
        mut,
        seeds = [ DXE_ADDRESS.parse::<Pubkey>().unwrap().as_ref() ],
        bump,
    )]
    pub dxe_vault: Account<'info, TokenAccount>,

    #[account(
        address = DXE_ADDRESS.parse::<Pubkey>().unwrap(),
    )]
    pub dxe_mint: Account<'info, Mint>,

    //  ATA that stores users's DXE
    #[account(mut)]
    pub dxe_user: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

impl UnstakeDxe<'_> {
    pub fn process_instruction(ctx: &mut Context<Self>, locker: u32) -> Result<()> {
        //  locker is 0 - 3
        require!(locker < 4, DexifiError::LockerIndexTooBig);

        //  Change stake info, calculate possible amounts user can withdraw
        let user_pool = &mut ctx.accounts.user_pool;
        let now = Clock::get()?.unix_timestamp;
        let amount = user_pool.unstake(now, locker);

        //  Transfer DXE to user from PDA
        if amount > 0 {
            //  Authority of vault is vault itself
            let dxe_address = ctx.accounts.dxe_mint.key();
            let dxe_bump = *ctx.bumps.get("dxe_vault").unwrap();
            let seeds = &[dxe_address.as_ref(), &[dxe_bump]];
            let signer = [&seeds[..]];

            let cpi_ctx = CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                token::Transfer {
                    from: ctx.accounts.dxe_vault.to_account_info(),
                    authority: ctx.accounts.dxe_vault.to_account_info(),
                    to: ctx.accounts.dxe_user.to_account_info(),
                },
                &signer,
            );
            token::transfer(cpi_ctx, amount)?;
        }

        Ok(())
    }
}
