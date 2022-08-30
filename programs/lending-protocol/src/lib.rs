use anchor_lang::prelude::*;

declare_id!("EsRUR46kq9vBqzzqNwTUSyZDz7VDp6H6EoxQ44D8VYSw");
// J57zpbkxpJPVRvvvHZ9a7RzRTPAJ1LAcUmE4sK7ZBVqa Windows
#[program]
pub mod lending_protocol {
    use super::*;

    pub fn logger(ctx: Context<Logger>, log: String) -> Result<()> {
        msg!("hello world budala");
        let log_acc = &mut ctx.accounts.log;
        log_acc.log = log;
        log_acc.admin = *ctx.accounts.user.key;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Logger<'info> {
    #[account(init, payer=user, space=9000, seeds=[b"CAMPAIG".as_ref(), user.key().as_ref()], bump)] // creating a new campaign account
    pub log: Account<'info, Log>,
    #[account(mut)] // user account is mutable
    pub user: Signer<'info>, // user is the signer
    pub system_program: Program<'info, System>, // the system program, system specs of Sol blockchain
}

#[account]
pub struct Log {
    pub admin: Pubkey,
    pub log: String,
}
