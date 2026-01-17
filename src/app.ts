import express from "express";
import helmet from "helmet";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import walletRoutes from "./routes/walletRoutes";
import { errorResponse } from "./utils/response";

const app = express();

// Security & Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
    res.send("Demo Credit API (Lendsqr MVP) is running.");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/wallets", walletRoutes);

// 404 Handler
app.use((req, res) => {
    errorResponse(res, "Endpoint not found", 404);
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    errorResponse(res, "Internal Server Error", 500);
});

export default app;
