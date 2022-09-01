use anchor_lang::prelude::*;
use anchor_lang::solana_program::entrypoint::ProgramResult;

declare_id!("8CbXfcqsoiJ755MPa7WCXRTgpiisP5Ycr7HBbYzh1E9z");

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

    pub fn withdraw_funds(ctx: Context<WithdrawLoan>, amount: u64) -> ProgramResult {
        let loan = &mut ctx.accounts.loan;
        let user = &mut ctx.accounts.user;
        if loan.admin != *user.key { // the withdraw id needs to be the adming of the loan
            return Err(ProgramError::IncorrectProgramId);
        }
        msg!("withdrawn on the chain");
        let rent_balance = Rent::get()?.minimum_balance(loan.to_account_info().data_len());
        if **loan.to_account_info().lamports.borrow() - rent_balance < amount { // if number of lamports in the account is less than the required amount (without the rent)
            return Err(ProgramError::InsufficientFunds);
        }
        **loan.to_account_info().try_borrow_mut_lamports()? -= amount;
        **user.to_account_info().try_borrow_mut_lamports()? += amount;
        Ok(())
    }

    pub fn loan_funds(ctx: Context<LoanFunds>, amount: u64) -> ProgramResult {
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
pub struct WithdrawLoan<'info> {
    #[account(mut)]
    pub loan: Account<'info, Loan>,
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

#[account]
pub struct Loan {
    pub admin: Pubkey,
    pub name: String,
    pub description: String,
    pub amount_loaned: u64,
}
