use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod donations {
    use super::*;

    pub fn create_fundraising(ctx: Context<Fundraising>, authority: Pubkey) -> Result<()> {
        let wallet = &mut ctx.accounts.wallet;
        wallet.bump = *ctx.bumps.get("wallet").unwrap();
        wallet.authority = authority;
        Ok(())
    }
}

#[account]
pub struct Wallet {
    bump: u8,
    authority: Pubkey,
}

#[derive(Accounts)]
pub struct Fundraising<'info> {
    // TODO: compute space
    #[account(init, payer=user, space=1000, seeds=[b"wallet", user.key().as_ref()], bump)]
    pub wallet: Account<'info, Wallet>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}
