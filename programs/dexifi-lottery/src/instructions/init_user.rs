use crate::*;

#[derive(Accounts)]
#[instruction(lottery: Pubkey)]
pub struct InitUser<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    //  User pool stores user's stake info
    #[account(
        init,
        space = 8 + UserPool::DATA_SIZE,
        seeds = [
            lottery.as_ref(), 
            user.key().as_ref(),
            USER_POOL_SEED.as_ref() ],
        bump,
        payer = user
    )]
    pub user_pool: Account<'info, UserPool>,

    //  Needed to init new account
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

impl InitUser<'_> {
    pub fn process_instruction(ctx: &mut Context<Self>, lottery: Pubkey) -> Result<()> {
        let user_pool = &mut ctx.accounts.user_pool;

        user_pool.user = ctx.accounts.user.key();
        user_pool.lottery = lottery;
        Ok(())
    }
}
