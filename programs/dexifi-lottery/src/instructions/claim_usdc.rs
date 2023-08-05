use crate::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint};

#[derive(Accounts)]
pub struct ClaimUsdc<'info> {
    #[account(mut)]
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

impl ClaimUsdc<'_> {
    pub fn process_instruction(ctx: &mut Context<Self>) -> Result<()> {
        let user_pool = &mut ctx.accounts.user_pool;
        let lottery_pool = &mut ctx.accounts.lottery_pool;

        require!(user_pool.usdc_claimed == 0, DexifiError::AlreadyClaimed);
        //  Set reward taken status
        user_pool.usdc_claimed = 1;

        //  Calculate number of digits in winner ending
        let mut rate = lottery_pool.total_tickets / lottery_pool.winner_count;
        let mut decimal = 1;
        while rate > 0 {
            rate /= 10;
            decimal *= 10;
        }
        msg!("decimal: {}", decimal);

        //  Count user's win number
        let mut win_count = 0;
        if decimal == 1 {
            win_count = user_pool.ticket_amount;
        } else {
            for i in 0..user_pool.ticket_amount {
                let ticket = user_pool.tickets[i as usize];

                //  Not partial endings
                for j in 0..(lottery_pool.ending_count - 1) {
                    let ending = lottery_pool.winner_ending[j as usize];
                    
                    if ticket % decimal == ending as u32 {
                        win_count += 1;
                        break;
                    }
                }
                //  If partial ending
                if ticket % decimal == lottery_pool.winner_ending[lottery_pool.ending_count as usize] as u32 
                && ticket >= lottery_pool.min_partial {
                    win_count += 1;
                }
            }
        }
        user_pool.win_count = win_count;
        msg!("win_count: {}", win_count);

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
        token::transfer(cpi_ctx, lottery_pool.ticket_price * (user_pool.ticket_amount - win_count) as u64)?;

        Ok(())
    }
}
