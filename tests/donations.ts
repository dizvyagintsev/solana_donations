import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Donations } from "../target/types/donations";
import { PublicKey } from '@solana/web3.js';

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

    const tx = await program.methods.createFundraising(provider.wallet.publicKey).accounts({
      user: provider.wallet.publicKey,
      wallet: walletPDA,
    }).rpc();
    console.log("Your transaction signature", tx);
  });
});
