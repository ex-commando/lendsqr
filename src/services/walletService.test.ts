import { WalletService } from "./walletService";
import db from "../config/database";

// Mock the db module
jest.mock("../config/database", () => {
    const mKnex = {
        transaction: jest.fn(),
    };
    return {
        __esModule: true,
        default: mKnex,
    };
});

describe("WalletService", () => {
    let mockTrx: any;
    let mockQueryBuilder: any;

    beforeEach(() => {
        jest.clearAllMocks();

        mockQueryBuilder = {
            where: jest.fn().mockReturnThis(),
            first: jest.fn(),
            increment: jest.fn().mockReturnThis(),
            decrement: jest.fn().mockReturnThis(),
            insert: jest.fn().mockResolvedValue([1]),
            forUpdate: jest.fn().mockReturnThis(),
            then: jest.fn().mockImplementation((cb) => cb && cb()),
        };

        mockTrx = jest.fn(() => mockQueryBuilder);
        // Allow trx("table") calls
        Object.assign(mockTrx, mockQueryBuilder);

        // Make db.transaction execute the callback immediately
        (db.transaction as jest.Mock).mockImplementation(async (callback) => {
            return callback(mockTrx);
        });
    });

    describe("fundWallet", () => {
        it("should fund a wallet successfully", async () => {
            // Setup mock returns
            mockQueryBuilder.first.mockResolvedValue({ id: "wallet-123", balance: 100 });

            const result = await WalletService.fundWallet("user-123", 500);

            expect(db.transaction).toHaveBeenCalled();
            expect(mockTrx).toHaveBeenCalledWith("wallets");
            expect(mockTrx).toHaveBeenCalledWith("transactions");
            expect(mockQueryBuilder.increment).toHaveBeenCalledWith("balance", 500);
            expect(result.status).toBe("SUCCESS");
            expect(result.walletId).toBe("wallet-123");
        });

        it("should throw error if wallet not found", async () => {
            mockQueryBuilder.first.mockResolvedValue(null);

            await expect(WalletService.fundWallet("user-123", 500)).rejects.toThrow("Wallet not found");
        });
    });

    describe("withdrawWallet", () => {
        it("should withdraw successfully if balance is sufficient", async () => {
            mockQueryBuilder.first.mockResolvedValue({ id: "wallet-123", balance: 1000 });

            const result = await WalletService.withdrawWallet("user-123", 500);

            expect(mockQueryBuilder.decrement).toHaveBeenCalledWith("balance", 500);
            expect(result.status).toBe("SUCCESS");
        });

        it("should fail if insufficient funds", async () => {
            mockQueryBuilder.first.mockResolvedValue({ id: "wallet-123", balance: 100 }); // Low balance

            await expect(WalletService.withdrawWallet("user-123", 500)).rejects.toThrow("Insufficient funds");
            expect(mockQueryBuilder.decrement).not.toHaveBeenCalled();
        });
    });
});
