import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import db from "../config/database";
import { checkKarmaBlacklist } from "../services/adjutorService";
import { generateToken } from "../middlewares/authMiddleware";
import { successResponse, errorResponse } from "../utils/response";

const hashPassword = (password: string) => crypto.createHash("sha256").update(password).digest("hex");

export class AuthController {
    static async register(req: Request, res: Response) {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return errorResponse(res, "Missing required fields");
        }

        try {
            // 1. Check Blacklist
            const isBlacklisted = await checkKarmaBlacklist(email);
            if (isBlacklisted) {
                return errorResponse(res, "User is blacklisted and cannot be onboarded.", 403);
            }

            // 2. Check Exists
            const existingUser = await db("users").where({ email }).first();
            if (existingUser) {
                return errorResponse(res, "User already exists.");
            }

            // 3. Create User & Wallet (Transaction)
            const user = await db.transaction(async (trx) => {
                const userId = uuidv4();
                await trx("users").insert({
                    id: userId,
                    name,
                    email,
                    password: hashPassword(password),
                });

                // Create Wallet
                await trx("wallets").insert({
                    id: uuidv4(),
                    user_id: userId,
                    balance: 0.00,
                    currency: "NGN"
                });

                return { id: userId, email, name };
            });

            const token = generateToken({ id: user.id, email: user.email });

            return successResponse(res, "Account created successfully", { user, token }, 201);
        } catch (error: any) {
            console.error(error);
            return errorResponse(res, "Server error during registration", 500, error.message);
        }
    }

    static async login(req: Request, res: Response) {
        const { email, password } = req.body;

        try {
            const user = await db("users").where({ email }).first();
            if (!user) {
                return errorResponse(res, "Invalid credentials", 401);
            }

            const match = hashPassword(password) === user.password;
            if (!match) {
                return errorResponse(res, "Invalid credentials", 401);
            }

            const token = generateToken({ id: user.id, email: user.email });
            return successResponse(res, "Login successful", { token });
        } catch (error: any) {
            return errorResponse(res, "Server error", 500, error.message);
        }
    }
}
