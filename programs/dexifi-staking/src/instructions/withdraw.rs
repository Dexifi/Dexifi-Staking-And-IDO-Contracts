use anchor_spl::token::{self, Mint, Token, TokenAccount};

use crate::*;

#[derive(Accounts)]
pub struct Withdraw<'info> {
    //  Only admin can withdraw from the vault
    #[account(
        mut,
        constraint = global_pool.super_admin == *user.key @DexifiError::InvalidAdmin
    )]
    pub user: Signer<'info>,

    //  Global pool needed to get admin address
    #[account(
        mut,
        seeds = [GLOBAL_AUTHORITY_SEED.as_ref()],
        bump
    )]
    pub global_pool: Account<'info, GlobalPool>,

    #[account(
        address = DXE_ADDRESS.parse::<Pubkey>().unwrap(),
    )]
    pub dxe_mint: Account<'info, Mint>,

    //  Program vault needed to withdraw DXE
    #[account(
        mut,
        seeds = [ DXE_ADDRESS.parse::<Pubkey>().unwrap().as_ref() ],
        bump,
    )]
    pub dxe_vault: Account<'info, TokenAccount>,

    //  Admin's token account to receive DXE from the vault
    #[account(mut)]
    pub dxe_user: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

impl Withdraw<'_> {
    pub fn process_instruction(ctx: &mut Context<Self>, amount: u64) -> Result<()> {
        //  Vault's authority is vault itself
        let dxe_address = ctx.accounts.dxe_mint.key();
        let dxe_bump = *ctx.bumps.get("dxe_vault").unwrap();
        let seeds = &[dxe_address.as_ref(), &[dxe_bump]];
        let signer = [&seeds[..]];

        //  Transfer DXE to user from PDA
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

        Ok(())
    }
}
