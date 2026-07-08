const request = require('supertest');

// We mock the external dependencies so the tests can run anywhere (like in GitHub Actions)
// without needing a live MySQL database, Stripe API key, or Gemini API key.
jest.mock('mysql2/promise', () => ({
    createPool: jest.fn(() => ({
        query: jest.fn().mockResolvedValue([[]]), // Mock an empty query result
        execute: jest.fn().mockResolvedValue([[]]),
    }))
}));

jest.mock('stripe', () => {
    return jest.fn(() => ({
        webhooks: { 
            constructEvent: jest.fn(() => {
                throw new Error("Invalid payload or signature");
            }) 
        }
    }));
});

jest.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: jest.fn(() => ({
        getGenerativeModel: jest.fn()
    }))
}));

// Now we can safely require the app
const app = require('../server');

describe('YTECH Backend API Tests', () => {
    
    describe('Routing & Security', () => {
        it('should return 404 for unknown API routes', async () => {
            const res = await request(app).get('/api/does-not-exist');
            expect(res.statusCode).toEqual(404);
        });

        it('should block unauthenticated access to Admin routes', async () => {
            const res = await request(app).get('/api/admin/projects');
            expect(res.statusCode).toEqual(401); // 401 Unauthorized
        });

        it('should block unauthenticated access to Manager routes', async () => {
            const res = await request(app).get('/api/manager/projects');
            expect(res.statusCode).toEqual(401); 
        });

        it('should block unauthenticated access to Client routes', async () => {
            const res = await request(app).get('/api/client/projects');
            expect(res.statusCode).toEqual(401); 
        });
    });

    describe('Public Routes', () => {
        it('should process contact inquiries (Mocked DB)', async () => {
            const res = await request(app)
                .post('/api/contact')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    message: 'Hello world'
                });
            
            // Assuming publicRoutes handles this correctly, it should be 201 or 200
            expect(res.statusCode).toBeLessThan(300);
            expect(res.body).toHaveProperty('message');
        });
    });

    describe('Stripe Webhook', () => {
        it('should handle invalid webhooks gracefully', async () => {
            const res = await request(app)
                .post('/api/webhook')
                .send('some invalid payload')
                .set('stripe-signature', 'fake-sig');
            
            // Should fail parsing or signature check
            expect(res.statusCode).toEqual(400);
        });
    });

});
