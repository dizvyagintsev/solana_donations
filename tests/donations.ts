import * as anchor from "@project-serum/anchor";
import { Program, AnchorError } from "@project-serum/anchor";
import { Donations } from "../target/types/donations";
import { PublicKey, LAMPORTS_PER_SOL, Keypair } from '@solana/web3.js';
import {assert} from "chai";

describe("donations", () => {
  const provider = anchor.AnchorProvider.env();

  // Configure the client to use the local cluster.
  anchor.setProvider(provider);

  const program = anchor.workspace.Donations as Program<Donations>;

  it("full flow", async () => {
    const [walletPDA, _] = await PublicKey
        .findProgramAddress(
            [
              anchor.utils.bytes.utf8.encode("wallet"),
              provider.wallet.publicKey.toBuffer()
            ],
            program.programId
        );

    await program.methods.createFundraising(provider.wallet.publicKey).accounts({
      user: provider.wallet.publicKey,
      wallet: walletPDA,
    }).rpc();

    let userBalanceBeforeDonation = await provider.connection.getBalance(provider.wallet.publicKey);
    // console.log('userBalanceBeforeDonation', userBalanceBeforeDonation);
    let programWalletBalanceBeforeDonation = await provider.connection.getBalance(walletPDA);
    // console.log('programWalletBalanceBeforeDonation', programWalletBalanceBeforeDonation);

    await program.methods.donate(new anchor.BN(LAMPORTS_PER_SOL)).accounts({
        user: provider.wallet.publicKey,
        wallet: walletPDA,
    }).rpc();

   let userBalanceAfterDonation = await provider.connection.getBalance(provider.wallet.publicKey);
   let programWalletBalanceAfterDonation = await provider.connection.getBalance(walletPDA);

   assert.ok((userBalanceBeforeDonation - userBalanceAfterDonation) === LAMPORTS_PER_SOL);
   assert.ok((programWalletBalanceAfterDonation - programWalletBalanceBeforeDonation) === LAMPORTS_PER_SOL);

   await program.methods.withdraw(new anchor.BN(LAMPORTS_PER_SOL)).accounts({
      authority: provider.wallet.publicKey,
      wallet: walletPDA,
   }).rpc();

  let userBalanceAfterWithdraw = await provider.connection.getBalance(provider.wallet.publicKey);
  let programWalletBalanceAfterWithdraw = await provider.connection.getBalance(walletPDA);

  assert.ok((userBalanceAfterWithdraw - userBalanceAfterDonation) == LAMPORTS_PER_SOL);
  assert.ok((programWalletBalanceAfterDonation - programWalletBalanceAfterWithdraw) == LAMPORTS_PER_SOL);

  let keypair = Keypair.generate();
  let raised = false;

  // test that only owner can withdraw
  try {
      await program.methods.withdraw(new anchor.BN(LAMPORTS_PER_SOL)).accounts({
          authority: keypair.publicKey,
          wallet: walletPDA,
      }).signers([keypair]).rpc().catch();
  } catch (e: unknown) {
      assert.ok(e instanceof AnchorError)
      raised = true;
  }

  assert.ok(raised == true);



  });
});
