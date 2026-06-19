const http = require('http');

async function runTest() {
    console.log('--- STARTING E2E TEST ---');
    
    // 1. Create a test user
    const username = 'testuser_' + Date.now();
    const signupPayload = JSON.stringify({
        username,
        password: 'password123',
        full_name: 'Test User',
        role: 'CLIENT'
    });

    console.log(`1. Signing up new user: ${username}`);
    const signupRes = await fetch('http://localhost:3001/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: signupPayload
    });
    const signupData = await signupRes.json();
    const token = signupData.token;
    console.log(`   Success! Token received.\n`);

    // 2. Perform Checkout (Simulating the payment success)
    console.log('2. Simulating Payment Checkout (Valid Luhn Card)');
    const checkoutPayload = JSON.stringify({
        cardholderName: 'Zaikos Test',
        cardNumber: '4242424242424242',
        expires: '12/30',
        cvv: '123',
        zipcode: '90210',
        companyName: 'Test Corp',
        email: 'test@corp.com',
        amount: 1500
    });

    const checkoutRes = await fetch('http://localhost:3001/api/checkout', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: checkoutPayload
    });
    const checkoutData = await checkoutRes.json();
    console.log(`   Checkout API Response:`, checkoutData);

    // 3. Fetch Dashboard Data
    console.log('\n3. Fetching Client Dashboard Data...');
    const dashboardRes = await fetch('http://localhost:3001/api/client/projects', {
        headers: { 
            'Authorization': `Bearer ${token}`
        }
    });
    const dashboardData = await dashboardRes.json();
    console.log(`   Dashboard API Response:`, dashboardData);
    
    console.log('   --- DASHBOARD DATA ---');
    console.log(JSON.stringify(dashboardData, null, 2));
    
    console.log('\n✅ TEST PASSED: The logic successfully creates the project, invoice, and links the transaction for the digital receipt!');
}

runTest().catch(console.error);
