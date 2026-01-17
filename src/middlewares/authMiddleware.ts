import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { errorResponse } from "../utils/response";

const SECRET = process.env.JWT_SECRET || "default_secret";

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
    };
}

export const generateToken = (user: { id: string; email: string }) => {
    return jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: "1d" });
};

export const verifyToken = (token: string) => {
    return jwt.verify(token, SECRET) as { id: string; email: string };
};

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return errorResponse(res, "Unauthorized: No token provided", 401);
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        return errorResponse(res, "Unauthorized: Invalid token", 401);
    }
};
