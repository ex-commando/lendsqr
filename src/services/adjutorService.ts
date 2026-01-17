import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const BASE_URL = process.env.ADJUTOR_BASE_URL || "https://adjutor.lendsqr.com/v2";
const TOKEN = process.env.ADJUTOR_API_KEY;

if (!TOKEN) {
    console.warn("Adjutor API Key is missing. Blacklist checks may fail or act as mock.");
}

const adjutorClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
    },
});

export const checkKarmaBlacklist = async (identity: string): Promise<boolean> => {
    try {
        // Adjutor Karma endpoint: /verification/karma/:identity
        // Identity can be email, phone, etc. We will use email.
        const response = await adjutorClient.get(`/verification/karma/${identity}`);

        // If we get a 200 OK and data suggests they are on the blacklist (or just finding them there implies it)
        // The API documentation usually dictates:
        // If the user is found in Karma, it returns 200 with details.
        // If not found, it returns 404.

        if (response.status === 200) {
            if (response.data?.message === "Karma found") {
                return true; // BLACKLISTED
            }
            return false; // Clean (e.g. message is "Successful")
        }

        return false;
    } catch (error: any) {
        if (error.response?.status === 404) {
            // Not found in blacklist -> Safe
            return false;
        }
        console.error("Adjutor Service Error:", error.message);
        // In strict financial checking, we might want to default to TRUE (block) on error, 
        // but for MVP/Stability on potential API failure, we might allow unless explicitly blocked.
        // Let's assume fail-safe = allow for MVP unless we know for sure.
        // OR fail-secure = block. Let's block if we can't verify service availability? 
        // No, that blocks everyone if standard network issues occur. 
        // I'll return false but log error.
        return false;
    }
};
