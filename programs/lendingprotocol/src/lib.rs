use anchor_lang::prelude::*;
use anchor_lang::solana_program::entrypoint::ProgramResult;

declare_id!("85vFwbrxRPT5Z6QbAA7f6ZRCMSTZp9M58p626XA2LuDg");

#[program]
pub mod lendingprotocol {
    use super::*;

    pub fn create_application(ctx: Context<CreateApplication>, name: String, description: String) -> ProgramResult {
        let loan = &mut ctx.accounts.loan;
        loan.name = name;
        loan.description = description;
        loan.amount_loaned = 0; // loan at start raised 0
        loan.admin = *ctx.accounts.user.key;
        Ok(())
    }

    pub fn create_pool(ctx: Context<CreatePool>) -> ProgramResult {
        let pool = &mut ctx.accounts.pool;
        msg!("created pool");
        pool.amount_hold = 0; // loan at start raised 0
        Ok(())
    }

    pub fn withdraw_funds(ctx: Context<WithdrawLoan>, amount: u64) -> ProgramResult {
        let pool = &mut ctx.accounts.pool;
        let user = &mut ctx.accounts.user;
        /* if loan.admin != *user.key { // the withdraw id needs to be the adming of the loan
            return Err(ProgramError::IncorrectProgramId);
        } */
        msg!("withdrawn on the chain");
        let rent_balance = Rent::get()?.minimum_balance(pool.to_account_info().data_len());
        if **pool.to_account_info().lamports.borrow() - rent_balance < amount { // if number of lamports in the account is less than the required amount (without the rent)
            return Err(ProgramError::InsufficientFunds);
        }
        **pool.to_account_info().try_borrow_mut_lamports()? -= amount;
        **user.to_account_info().try_borrow_mut_lamports()? += amount;
        Ok(())
    }

    pub fn loan_funds(ctx: Context<LoanFunds>, amount: u64) -> ProgramResult { // voting mechanism also
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.user.key(),
            &ctx.accounts.loan.key(),
            amount
        );
        msg!("donated on the chain");
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.user.to_account_info(),
                ctx.accounts.loan.to_account_info()
            ]
        );
        (&mut ctx.accounts.loan).amount_loaned += amount;
        Ok(())
    }

    pub fn fund_pool(ctx: Context<FundPool>, amount: u64) -> ProgramResult { 
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.user.key(),
            &ctx.accounts.pool.key(),
            amount
        );
        msg!("funded liqudity pool on the chain");
        msg!("{}", ctx.accounts.pool.amount_hold);

        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.user.to_account_info(),
                ctx.accounts.pool.to_account_info()
            ]
        );
        (&mut ctx.accounts.pool).amount_hold += amount;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateApplication<'info> {
    #[account(init, payer=user, space=9000, seeds=[b"LOAN".as_ref(), user.key().as_ref()], bump)] // creating a new loan account
    pub loan: Account<'info, Loan>,
    #[account(mut)] // user account is mutable
    pub user: Signer<'info>, // user is the signer
    pub system_program: Program<'info, System>, // the system program, system specs of Sol blockchain
}

#[derive(Accounts)]
pub struct CreatePool<'info> {
    #[account(init, payer=user, space=9000, seeds=[b"POOL".as_ref(), user.key().as_ref()], bump)]
    pub pool: Account<'info, Pool>,
    #[account(mut)] // user account is mutable
    pub user: Signer<'info>, // user is the signer
    pub system_program: Program<'info, System>, // the system program, system specs of Sol blockchain
}

#[derive(Accounts)]
pub struct WithdrawLoan<'info> {
    #[account(mut)]
    pub pool: Account<'info, Pool>,
    #[account(mut)]
    pub user: Signer<'info>
}

#[derive(Accounts)]
pub struct LoanFunds<'info> {
    #[account(mut)]
    pub loan: Account<'info, Loan>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>, // the system program, system specs of Sol blockchain
}

#[derive(Accounts)]
pub struct FundPool<'info> {
    #[account(mut)]
    pub pool: Account<'info, Pool>,
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>, // the system program, system specs of Sol blockchain
}

#[account]
pub struct Pool {
    pub amount_hold: u64,
}

#[account]
pub struct Loan {
    pub admin: Pubkey,
    pub name: String,
    pub description: String,
    pub amount_loaned: u64,
}
