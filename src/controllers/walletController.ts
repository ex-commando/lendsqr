import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { WalletService } from "../services/walletService";
import { successResponse, errorResponse } from "../utils/response";
import db from "../config/database";

export class WalletController {

    static async getBalance(req: AuthRequest, res: Response) {
        try {
            if (!req.user) return errorResponse(res, "Unauthorized", 401);

            const wallet = await db("wallets").where({ user_id: req.user.id }).first();
            if (!wallet) return errorResponse(res, "Wallet not found", 404);

            return successResponse(res, "Wallet details retrieved", wallet);
        } catch (error: any) {
            return errorResponse(res, "Error fetching balance", 500, error.message);
        }
    }

    static async fund(req: AuthRequest, res: Response) {
        try {
            const { amount } = req.body;
            if (!amount || isNaN(amount) || Number(amount) <= 0) {
                return errorResponse(res, "Invalid amount");
            }
            if (!req.user) return errorResponse(res, "Unauthorized", 401);

            const result = await WalletService.fundWallet(req.user.id, Number(amount));
            return successResponse(res, "Wallet funded successfully", result);
        } catch (error: any) {
            // Distinguish errors?
            return errorResponse(res, error.message || "Transaction failed", 400);
        }
    }

    static async withdraw(req: AuthRequest, res: Response) {
        try {
            const { amount } = req.body;
            if (!amount || isNaN(amount) || Number(amount) <= 0) {
                return errorResponse(res, "Invalid amount");
            }
            if (!req.user) return errorResponse(res, "Unauthorized", 401);

            const result = await WalletService.withdrawWallet(req.user.id, Number(amount));
            return successResponse(res, "Withdrawal successful", result);
        } catch (error: any) {
            return errorResponse(res, error.message || "Transaction failed", 400);
        }
    }

    static async transfer(req: AuthRequest, res: Response) {
        try {
            const { amount, email } = req.body;
            if (!amount || isNaN(amount) || Number(amount) <= 0) {
                return errorResponse(res, "Invalid amount");
            }
            if (!email || typeof email !== 'string') {
                return errorResponse(res, "Valid recipient email is required");
            }
            if (!req.user) return errorResponse(res, "Unauthorized", 401);

            if (email === req.user.email) {
                return errorResponse(res, "Cannot transfer to self");
            }

            const result = await WalletService.transferFunds(req.user.id, email, Number(amount));
            return successResponse(res, "Transfer successful", result);
        } catch (error: any) {
            return errorResponse(res, error.message || "Transaction failed", 400);
        }
    }
}
