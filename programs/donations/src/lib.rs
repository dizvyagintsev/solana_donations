use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod donations {
    use super::*;

    pub fn create_fundraising(ctx: Context<CreateFundraising>, authority: Pubkey) -> Result<()> {
        let wallet = &mut ctx.accounts.wallet;
        wallet.bump = *ctx.bumps.get("wallet").unwrap();
        wallet.authority = authority;
        Ok(())
    }

    pub fn donate(ctx: Context<Donate>, amount: u64) -> Result<()> {
        // TODO: implement saving amount of donation

        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.user.key(),
            &ctx.accounts.wallet.key(),
            amount,
        );
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.user.to_account_info(),
                ctx.accounts.wallet.to_account_info(),
            ],
        )?;
        Ok(())
    }
}

#[account]
pub struct Wallet {
    bump: u8,
    authority: Pubkey,
}

#[derive(Accounts)]
pub struct CreateFundraising<'info> {
    pub system_program: Program<'info, System>,
    #[account(mut)]
    pub user: Signer<'info>,
    // TODO: compute space
    #[account(init, payer=user, space=1000, seeds=[b"wallet", user.key().as_ref()], bump)]
    pub wallet: Account<'info, Wallet>,
}

#[derive(Accounts)]
pub struct Donate<'info> {
    pub system_program: Program<'info, System>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut, seeds=[b"wallet", user.key().as_ref()], bump = wallet.bump)]
    pub wallet: Account<'info, Wallet>,
}

