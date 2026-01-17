import db from "../config/database";
import { v4 as uuidv4 } from 'uuid';

export class WalletService {

    static async fundWallet(userId: string, amount: number) {
        return db.transaction(async (trx) => {
            const wallet = await trx("wallets").where({ user_id: userId }).first();
            if (!wallet) throw new Error("Wallet not found");

            await trx("wallets")
                .where({ id: wallet.id })
                .increment("balance", amount);

            const reference = uuidv4();
            await trx("transactions").insert({
                id: uuidv4(),
                wallet_id: wallet.id,
                type: "CREDIT",
                amount: amount,
                reference: reference,
                status: "SUCCESS",
                description: "Wallet Funding"
            });

            return { walletId: wallet.id, newBalance: Number(wallet.balance) + Number(amount), reference, status: "SUCCESS" };
        });
    }

    static async withdrawWallet(userId: string, amount: number) {
        return db.transaction(async (trx) => {
            const wallet = await trx("wallets").where({ user_id: userId }).forUpdate().first();
            if (!wallet) throw new Error("Wallet not found");

            if (Number(wallet.balance) < Number(amount)) {
                throw new Error("Insufficient funds");
            }

            await trx("wallets")
                .where({ id: wallet.id })
                .decrement("balance", amount);

            const reference = uuidv4();
            await trx("transactions").insert({
                id: uuidv4(),
                wallet_id: wallet.id,
                type: "DEBIT",
                amount: amount,
                reference: reference,
                status: "SUCCESS",
                description: "Withdrawal"
            });

            return { walletId: wallet.id, newBalance: Number(wallet.balance) - Number(amount), reference, status: "SUCCESS" };
        });
    }

    static async transferFunds(senderId: string, receiverEmail: string, amount: number) {
        return db.transaction(async (trx) => {
            const senderWallet = await trx("wallets").where({ user_id: senderId }).forUpdate().first();
            if (!senderWallet) throw new Error("Sender wallet not found");

            const receiverUser = await trx("users").where({ email: receiverEmail }).first();
            if (!receiverUser) throw new Error("Receiver not found");

            const receiverWallet = await trx("wallets").where({ user_id: receiverUser.id }).forUpdate().first();
            if (!receiverWallet) throw new Error("Receiver wallet not found");

            if (senderWallet.id === receiverWallet.id) throw new Error("Cannot transfer to self");

            if (Number(senderWallet.balance) < Number(amount)) {
                throw new Error("Insufficient funds");
            }

            await trx("wallets").where({ id: senderWallet.id }).decrement("balance", amount);
            await trx("wallets").where({ id: receiverWallet.id }).increment("balance", amount);

            const baseRef = uuidv4();

            await trx("transactions").insert({
                id: uuidv4(),
                wallet_id: senderWallet.id,
                type: "DEBIT",
                amount: amount,
                reference: `${baseRef}-DR`,
                status: "SUCCESS",
                description: `Transfer to ${receiverUser.email}`
            });

            await trx("transactions").insert({
                id: uuidv4(),
                wallet_id: receiverWallet.id,
                type: "CREDIT",
                amount: amount,
                reference: `${baseRef}-CR`,
                status: "SUCCESS",
                description: `Transfer from user`
            });

            return { status: "SUCCESS", reference: baseRef, message: "Transfer successful" };
        });
    }
}
