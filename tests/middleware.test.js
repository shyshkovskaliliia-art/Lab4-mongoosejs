/**
 * Юніт-тести для middleware B (responseTime) і C (requestStats).
 */

const request = require('supertest');
const app = require('../app');
const { maskSensitive } = require('../middleware/requestStats');
const { getRateInfo } = require('../middleware/responseTime');

// Мокуємо модель щоб не потрібна була БД
jest.mock('../models/teacher.model', () => ({
    getAll: jest.fn().mockResolvedValue([]),
    getById: jest
        .fn()
        .mockResolvedValue({ teacher_id: 1, full_name: 'Test', start_date: '2020-01-01' }),
    create: jest
        .fn()
        .mockResolvedValue({ teacher_id: 1, full_name: 'Test', start_date: '2020-01-01' }),
    remove: jest.fn().mockResolvedValue(true),
}));

// ── Middleware B ───────────────────────────────────────────────────────────────
describe('Middleware B — responseTime', () => {
    it('додає заголовок X-Response-Time до відповіді', async () => {
        const res = await request(app).get('/teachers');
        expect(res.headers['x-response-time']).toMatch(/^\d+\.\d+ms$/);
    });

    it('X-Response-Time містить числове значення >= 0', async () => {
        const res = await request(app).get('/teachers');
        const ms = parseFloat(res.headers['x-response-time']);
        expect(ms).toBeGreaterThanOrEqual(0);
    });

    it('додає заголовок X-Rate-Limit-Remaining', async () => {
        const res = await request(app).get('/teachers');
        expect(res.headers['x-rate-limit-remaining']).toBeDefined();
    });
});

// ── Middleware C — maskSensitive ───────────────────────────────────────────────
describe('Middleware C — maskSensitive', () => {
    it('маскує поле password', () => {
        expect(maskSensitive({ password: 'secret' }).password).toBe('***');
    });

    it('маскує поле token', () => {
        expect(maskSensitive({ token: 'abc.xyz' }).token).toBe('***');
    });

    it('маскує поле email', () => {
        expect(maskSensitive({ email: 'user@example.com' }).email).toBe('***');
    });

    it('не маскує безпечні поля', () => {
        const result = maskSensitive({ name: 'John', age: 30 });
        expect(result.name).toBe('John');
        expect(result.age).toBe(30);
    });

    it('маскує лише чутливі поля у змішаному обʼєкті', () => {
        const result = maskSensitive({ name: 'Test', email: 'x@y.com', id: 1 });
        expect(result.name).toBe('Test');
        expect(result.email).toBe('***');
        expect(result.id).toBe(1);
    });

    it('повертає порожній обʼєкт без змін', () => {
        expect(maskSensitive({})).toEqual({});
    });
});

// ── Rate Limiting — логіка getRateInfo ───────────────────────────────────────
describe('Rate Limiting — getRateInfo', () => {
    it('збільшує лічильник при кожному виклику', () => {
        const ip = `test-${Date.now()}`;
        getRateInfo(ip); // count = 1
        getRateInfo(ip); // count = 2
        const r3 = getRateInfo(ip); // count = 3
        // Map зберігає посилання — всі змінні вказують на той самий обʼєкт
        expect(r3.count).toBe(3);
    });

    it('повертає обʼєкт з count та resetAt', () => {
        const ip = `test2-${Date.now()}`;
        const info = getRateInfo(ip);
        expect(info).toHaveProperty('count');
        expect(info).toHaveProperty('resetAt');
        expect(info.resetAt).toBeGreaterThan(Date.now());
    });
});
