"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const anchor = __importStar(require("@project-serum/anchor"));
const web3_js_1 = require("@solana/web3.js");
const chai_1 = require("chai");
describe("donations", () => {
    const provider = anchor.AnchorProvider.env();
    // Configure the client to use the local cluster.
    anchor.setProvider(provider);
    const program = anchor.workspace.Donations;
    it("Is initialized!", () => __awaiter(void 0, void 0, void 0, function* () {
        const [walletPDA, _] = yield web3_js_1.PublicKey
            .findProgramAddress([
            anchor.utils.bytes.utf8.encode("wallet"),
            provider.wallet.publicKey.toBuffer()
        ], program.programId);
        yield program.methods.createFundraising(provider.wallet.publicKey).accounts({
            user: provider.wallet.publicKey,
            wallet: walletPDA,
        }).rpc();
        let userBalanceBeforeDonation = yield provider.connection.getBalance(provider.wallet.publicKey);
        console.log('userBalanceBeforeDonation', userBalanceBeforeDonation);
        let programWalletBalanceBeforeDonation = yield provider.connection.getBalance(walletPDA);
        console.log('programWalletBalanceBeforeDonation', programWalletBalanceBeforeDonation);
        yield program.methods.donate(new anchor.BN(web3_js_1.LAMPORTS_PER_SOL)).accounts({
            user: provider.wallet.publicKey,
            wallet: walletPDA,
        }).rpc();
        let userBalanceAfterDonation = yield provider.connection.getBalance(provider.wallet.publicKey);
        console.log('userBalanceAfterDonation', userBalanceAfterDonation);
        let programWalletBalanceAfterDonation = yield provider.connection.getBalance(walletPDA);
        console.log('programWalletBalanceAfterDonation', programWalletBalanceAfterDonation);
        chai_1.assert.ok((userBalanceBeforeDonation - userBalanceAfterDonation) === web3_js_1.LAMPORTS_PER_SOL);
        chai_1.assert.ok((programWalletBalanceAfterDonation - programWalletBalanceBeforeDonation) === web3_js_1.LAMPORTS_PER_SOL);
        yield program.methods.withdraw(new anchor.BN(web3_js_1.LAMPORTS_PER_SOL)).accounts({
            authority: provider.wallet.publicKey,
            wallet: walletPDA,
        }).rpc();
        let userBalanceAfterWithdraw = yield provider.connection.getBalance(provider.wallet.publicKey);
        console.log('userBalanceAfterDonation', userBalanceAfterWithdraw);
        let programWalletBalanceAfterWithdraw = yield provider.connection.getBalance(walletPDA);
        console.log('programWalletBalanceAfterDonation', programWalletBalanceAfterDonation);
    }));
});
