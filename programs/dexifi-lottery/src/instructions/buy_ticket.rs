    use crate::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint};
use dexifi_staking;

#[derive(Accounts)]
pub struct BuyTicket<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    //  Needed to get DXE staking program address
    #[account(
        seeds = [GLOBAL_AUTHORITY_SEED.as_ref()],
        bump,
    )]
    pub global_pool: Account<'info, GlobalPool>,

    //  Lottery pool stores lottery info
    #[account(mut)]
    pub lottery_pool: Box<Account<'info, LotteryPool>>,

    // USDC token account for this lottery
    #[account(
        mut,
        seeds = [ 
            USDC_ADDRESS.parse::<Pubkey>().unwrap().as_ref(),
            lottery_pool.key().as_ref(), ],
        bump
    )]
    pub usdc_vault: Account<'info, TokenAccount>,

    //  user token account that stores USDC
    #[account(mut)]
    pub usdc_user: Account<'info, TokenAccount>,

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
    
    //  staking program PDA that stores user's DXE stake info
    pub user_stake_pool: Box<Account<'info, dexifi_staking::state::UserPool>>,

    // Need to figure out whether vault has enough ttt
    // TTT token account for this lottery
    #[account(
        seeds = [ lottery_pool.key().as_ref(),
            ttt_mint.key().as_ref() ],
        bump,
    )]
    pub ttt_vault: Account<'info, TokenAccount>,

    // The mint of $TTT that's gonna be used as reward in this lottery
    #[account(
        address = lottery_pool.token_address,
    )]
    pub ttt_mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
}

impl BuyTicket<'_> {
    pub fn process_instruction(ctx: &mut Context<Self>, new_amount: u8) -> Result<()> {
        let global_pool = &mut ctx.accounts.global_pool;
        let user_pool = &mut ctx.accounts.user_pool;
        let lottery_pool = &mut ctx.accounts.lottery_pool;
        let stake_pool =  &ctx.accounts.user_stake_pool;

        //  Check whether user's staking pool address is legit
        let (stake_pda, _bump) = Pubkey::find_program_address(
            &[ctx.accounts.user.key.as_ref(), USER_STAKE_SEED.as_ref()],
            &global_pool.stake_program,
        );

        require!(
            stake_pda == stake_pool.key(),
            DexifiError::InvalidStakePoolAddress
        );

        //  Check whether lottery ttt vault has enough tokens
        let ttt_amount = ctx.accounts.ttt_vault.amount;
        require!(ttt_amount >= lottery_pool.total_raise, DexifiError::InsufficientToken);

        //  Check ticket amount is less than max amount
        let max_ticket = stake_pool.max_ticket();
        msg!("max ticket: {}", max_ticket);

        require!(
            user_pool.ticket_amount + new_amount <= max_ticket,
            DexifiError::ExceedMaxAmount
        );

        //  Check lottery opened and not closed
        let now = Clock::get()?.unix_timestamp;
        require!(now >= lottery_pool.open_time, DexifiError::LotteryNotOpen);
        require!(now <= lottery_pool.close_time, DexifiError::LotteryClosed);

        // Transfer USDC to program vault
        let cpi_ctx: CpiContext<_> = CpiContext::new(
            ctx.accounts.token_program.to_account_info().clone(),
            token::Transfer {
                from: ctx.accounts.usdc_user.to_account_info().clone(),
                authority: ctx.accounts.user.to_account_info().clone(),
                to: ctx.accounts.usdc_vault.to_account_info().clone(),
            },
        );
        token::transfer(cpi_ctx, lottery_pool.ticket_price * new_amount as u64)?;

        //  Add ticket numbers, they're unique in one lottery
        let total_ticket = lottery_pool.total_tickets;
        let ticket_amount = user_pool.ticket_amount;
        for i in 0..new_amount {
            user_pool.tickets[(ticket_amount + i) as usize] = total_ticket + i as u32;
        }
        lottery_pool.total_tickets += new_amount as u32;
        user_pool.ticket_amount += new_amount;

        Ok(())
    }
}
