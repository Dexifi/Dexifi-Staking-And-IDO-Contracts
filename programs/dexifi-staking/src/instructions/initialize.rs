use anchor_spl::token::{Mint, Token, TokenAccount};
use crate::*;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    //  Global pool stores admin address
    #[account(
        init,
        space = 8 + GlobalPool::DATA_SIZE,
        seeds = [GLOBAL_AUTHORITY_SEED.as_ref()],
        bump,
        payer = admin
    )]
    pub global_pool: Account<'info, GlobalPool>,

    // PDA (so pubkey) for the soon-to-be created DXE token account for our program.
    #[account(
        init,
        payer = admin,
        seeds = [ DXE_ADDRESS.parse::<Pubkey>().unwrap().as_ref() ],
        bump,
        token::mint = dxe_mint,
        
        //  Authority is itself
        token::authority = dxe_vault,
    )]
    pub dxe_vault: Account<'info, TokenAccount>,

    // The mint of $DXE because it's needed from above ⬆ token::mint = ...
    #[account(
        address = DXE_ADDRESS.parse::<Pubkey>().unwrap(),
    )]
    pub dxe_mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,

    //  Needed to init new account
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

impl Initialize<'_> {
    pub fn process_instruction(ctx: &mut Context<Self>) -> Result<()> {
        let global_pool = &mut ctx.accounts.global_pool;

        global_pool.super_admin = ctx.accounts.admin.key();

        Ok(())
    }
}
