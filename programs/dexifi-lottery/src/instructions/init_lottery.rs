use anchor_spl::token::{Mint, Token, TokenAccount, self};
use crate::*;

#[derive(Accounts)]
pub struct InitLottery<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    //  Lottery pool stores lottery info
    #[account(
        init,
        space = 8 + LotteryPool::DATA_SIZE,
        seeds = [ creator.key().as_ref(), 
            LOTTERY_POOL_SEED.as_ref() ],
        bump,
        payer = creator
    )]
    pub lottery_pool: Box<Account<'info, LotteryPool>>,

    // USDC token account for this lottery
    #[account(
        init,
        payer = creator,
        seeds = [ 
            USDC_ADDRESS.parse::<Pubkey>().unwrap().as_ref(),
            lottery_pool.key().as_ref() ],
        bump,
        token::mint = usdc_mint,
        
        //  Authority is set to usdc_vault itself
        token::authority = usdc_vault
    )]
    pub usdc_vault: Account<'info, TokenAccount>,

    // The mint of $USDC because it's needed from above ⬆ token::mint = ...
    #[account(
        address = USDC_ADDRESS.parse::<Pubkey>().unwrap(),
    )]
    pub usdc_mint: Account<'info, Mint>,

    // TTT token account for this lottery
    #[account(
        init,
        payer = creator,
        seeds = [ lottery_pool.key().as_ref(),
            ttt_mint.key().as_ref() ],
        bump,
        token::mint = ttt_mint,
        
        //  Authority is set to ttt_vault itself
        token::authority = ttt_vault,
    )]
    pub ttt_vault: Account<'info, TokenAccount>,

    //  ATA stores reward TTT that will be transfered to reward vault
    #[account(mut)]
    pub ttt_creator: Account<'info, TokenAccount>,

    // The mint of $TTT that's gonna be used as reward in this lottery
    pub ttt_mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,

    //  Needed to init new account
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

impl InitLottery<'_> {
    pub fn process_instruction(
        ctx: &mut Context<Self>, 
        open_time: i64,
        close_time: i64,
        launch_time: i64,
        total_raise: u64, 
        winner_count: u32,
        ticket_price: u64,
    ) -> Result<()> {
        let lottery_pool: &mut Account<LotteryPool> = &mut ctx.accounts.lottery_pool;

        lottery_pool.creator = ctx.accounts.creator.key();
        lottery_pool.token_address = ctx.accounts.ttt_mint.key();

        lottery_pool.open_time = open_time;
        lottery_pool.close_time = close_time;
        lottery_pool.launch_time = launch_time;

        lottery_pool.total_raise = total_raise;
        lottery_pool.winner_count = winner_count;
        lottery_pool.ticket_price = ticket_price;

        lottery_pool.ending_count = 0;

        // Transfer TTT to program vault
        let cpi_ctx: CpiContext<_> = CpiContext::new(
            ctx.accounts.token_program.to_account_info().clone(),
            token::Transfer {
                from: ctx.accounts.ttt_creator.to_account_info().clone(),
                authority: ctx.accounts.creator.to_account_info().clone(),
                to: ctx.accounts.ttt_vault.to_account_info().clone(),
            },
        );
        token::transfer(cpi_ctx, total_raise)?;

        Ok(())
    }
}
