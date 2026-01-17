const axios = require('axios');
const assert = require('assert');

const BASE_URL = 'http://localhost:3000/api/v1';

async function runTest() {
    try {
        console.log("Starting API Integration Test...");

        // 1. Register User A (Sender)
        const emailA = `sender_${Date.now()}@test.com`;
        console.log(`\n1. Registering Sender (${emailA})...`);
        const resA = await axios.post(`${BASE_URL}/auth/register`, {
            name: "Sender",
            email: emailA,
            password: "password123"
        });
        const tokenA = resA.data.data.token;
        console.log("   -> Success! Token A obtained.");

        // 2. Register User B (Receiver)
        const emailB = `receiver_${Date.now()}@test.com`;
        console.log(`\n2. Registering Receiver (${emailB})...`);
        const resB = await axios.post(`${BASE_URL}/auth/register`, {
            name: "Receiver",
            email: emailB,
            password: "password123"
        });
        // const tokenB = resB.data.data.token; // Not needed for receiving
        console.log("   -> Success! Receiver created.");

        // 3. Fund Wallet A
        console.log(`\n3. Funding Sender Wallet with 5000...`);
        const fundRes = await axios.post(`${BASE_URL}/wallets/fund`, {
            amount: 5000
        }, {
            headers: { Authorization: `Bearer ${tokenA}` }
        });
        console.log("   -> Fund Response:", JSON.stringify(fundRes.data.data));

        // 4. Check Balance A
        console.log(`\n4. Checking Sender Balance...`);
        let balRes = await axios.get(`${BASE_URL}/wallets`, {
            headers: { Authorization: `Bearer ${tokenA}` }
        });
        console.log(`   -> Balance: ${balRes.data.data.balance}`);

        // 5. Transfer A -> B
        console.log(`\n5. Transferring 1000 to Receiver...`);
        const transferRes = await axios.post(`${BASE_URL}/wallets/transfer`, {
            email: emailB,
            amount: 1000
        }, {
            headers: { Authorization: `Bearer ${tokenA}` }
        });
        console.log("   -> Transfer Response:", JSON.stringify(transferRes.data.data));

        // 6. Withdraw from A
        console.log(`\n6. Withdrawing 500 from Sender...`);
        const withdrawRes = await axios.post(`${BASE_URL}/wallets/withdraw`, {
            amount: 500
        }, {
            headers: { Authorization: `Bearer ${tokenA}` }
        });
        console.log("   -> Withdraw Response:", JSON.stringify(withdrawRes.data.data));

        // 7. Final Balance Check A
        console.log(`\n7. Checking Final Sender Balance...`);
        balRes = await axios.get(`${BASE_URL}/wallets`, {
            headers: { Authorization: `Bearer ${tokenA}` }
        });
        console.log(`   -> Final Balance: ${balRes.data.data.balance}`);
        const expected = 5000 - 1000 - 500; // 3500

        if (Number(balRes.data.data.balance) === expected) {
            console.log(`\n✅ TEST PASSED! Final balance matches expected ${expected}.`);
        } else {
            console.log(`\n❌ TEST FAILED! Expected ${expected}, got ${balRes.data.data.balance}`);
        }

    } catch (error) {
        console.error("\n❌ TEST FAILED WITH ERROR:");
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
    }
}

runTest();
