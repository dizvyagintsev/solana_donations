import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Donations } from "../target/types/donations";
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import {assert} from "chai";

describe("donations", () => {
  const provider = anchor.AnchorProvider.env();

  // Configure the client to use the local cluster.
  anchor.setProvider(provider);

  const program = anchor.workspace.Donations as Program<Donations>;

  it("Is initialized!", async () => {
    const [walletPDA, _] = await PublicKey
        .findProgramAddress(
            [
              anchor.utils.bytes.utf8.encode("wallet"),
              provider.wallet.publicKey.toBuffer()
            ],
            program.programId
        );

    let tx = await program.methods.createFundraising(provider.wallet.publicKey).accounts({
      user: provider.wallet.publicKey,
      wallet: walletPDA,
    }).rpc();

    let userBalanceBeforeTX = await provider.connection.getBalance(provider.wallet.publicKey);
    console.log('user balance before donation', userBalanceBeforeTX);
    let programWalletBalanceBeforeTX = await provider.connection.getBalance(walletPDA);
    console.log('wallet balance before donation', programWalletBalanceBeforeTX);

    tx = await program.methods.donate(new anchor.BN(LAMPORTS_PER_SOL)).accounts({
        user: provider.wallet.publicKey,
        wallet: walletPDA,
    }).rpc();

   let userBalanceAfterTX = await provider.connection.getBalance(provider.wallet.publicKey);
   console.log('user balance after donation', userBalanceAfterTX);
   let programWalletBalanceAfterTX = await provider.connection.getBalance(walletPDA);
   console.log('wallet balance after donation', programWalletBalanceAfterTX);

   assert.ok((userBalanceBeforeTX - userBalanceAfterTX) === LAMPORTS_PER_SOL);
   assert.ok((programWalletBalanceAfterTX - programWalletBalanceBeforeTX) === LAMPORTS_PER_SOL);
  });
});
