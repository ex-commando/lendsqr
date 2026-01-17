import { Router } from "express";
import { WalletController } from "../controllers/walletController";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

router.use(authenticate); // Protect all wallet routes

router.get("/", WalletController.getBalance);
router.post("/fund", WalletController.fund);
router.post("/withdraw", WalletController.withdraw);
router.post("/transfer", WalletController.transfer);

export default router;
