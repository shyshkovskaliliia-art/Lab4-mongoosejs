const request = require('supertest');
const app = require('../app');

jest.mock('../models/teacher.model', () => ({
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
}));

const Teacher = require('../models/teacher.model');

const sampleTeachers = [
    {
        teacher_id: 1,
        full_name: 'Іваненко Іван Іванович',
        phone: '+380501234567',
        address: 'вул. Шевченка, 1',
        birth_date: '1980-05-15',
        start_date: '2005-09-01',
    },
    {
        teacher_id: 2,
        full_name: 'Петренко Петро Петрович',
        phone: '+380671234567',
        address: 'вул. Франка, 2',
        birth_date: '1975-03-20',
        start_date: '2000-09-01',
    },
];

describe('GET /teachers', () => {
    beforeEach(() => Teacher.getAll.mockResolvedValue(sampleTeachers));

    it('повертає масив викладачів зі статусом 200', async () => {
        const res = await request(app).get('/teachers');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(2);
    });

    it('відповідь містить заголовок X-Response-Time', async () => {
        const res = await request(app).get('/teachers');
        expect(res.headers['x-response-time']).toBeDefined();
    });

    it('повертає 500 якщо модель кидає помилку', async () => {
        Teacher.getAll.mockRejectedValue(new Error('DB Error'));
        const res = await request(app).get('/teachers');
        expect(res.statusCode).toBe(500);
        expect(res.body).toHaveProperty('error');
    });
});

describe('GET /teachers/:id', () => {
    it('повертає викладача за ID зі статусом 200', async () => {
        Teacher.getById.mockResolvedValue(sampleTeachers[0]);
        const res = await request(app).get('/teachers/1');
        expect(res.statusCode).toBe(200);
        expect(res.body.teacher_id).toBe(1);
        expect(res.body.full_name).toBe('Іваненко Іван Іванович');
    });

    it('повертає 404 якщо викладача не знайдено', async () => {
        Teacher.getById.mockResolvedValue(null);
        const res = await request(app).get('/teachers/999');
        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('error');
    });

    it('повертає 500 якщо модель кидає помилку', async () => {
        Teacher.getById.mockRejectedValue(new Error('DB Error'));
        const res = await request(app).get('/teachers/1');
        expect(res.statusCode).toBe(500);
    });
});

describe('POST /teachers', () => {
    const newTeacher = {
        full_name: 'Коваленко Олена Василівна',
        phone: '+380631234567',
        address: 'вул. Лесі Українки, 5',
        birth_date: '1990-07-10',
        start_date: '2015-09-01',
    };

    it('створює викладача і повертає 201', async () => {
        Teacher.create.mockResolvedValue({ teacher_id: 3, ...newTeacher });
        const res = await request(app).post('/teachers').send(newTeacher);
        expect(res.statusCode).toBe(201);
        expect(res.body.teacher_id).toBe(3);
        expect(res.body.full_name).toBe(newTeacher.full_name);
    });

    it('повертає 400 якщо відсутнє поле full_name', async () => {
        const res = await request(app).post('/teachers').send({ start_date: '2020-01-01' });
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    it('повертає 400 якщо відсутнє поле start_date', async () => {
        const res = await request(app).post('/teachers').send({ full_name: 'Тест Тестович' });
        expect(res.statusCode).toBe(400);
    });

    it('повертає 500 якщо модель кидає помилку', async () => {
        Teacher.create.mockRejectedValue(new Error('DB Error'));
        const res = await request(app).post('/teachers').send(newTeacher);
        expect(res.statusCode).toBe(500);
    });
});

describe('DELETE /teachers/:id', () => {
    it('видаляє викладача і повертає 200', async () => {
        Teacher.remove.mockResolvedValue(true);
        const res = await request(app).delete('/teachers/1');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message');
    });

    it('повертає 404 якщо викладача не знайдено', async () => {
        Teacher.remove.mockResolvedValue(false);
        const res = await request(app).delete('/teachers/999');
        expect(res.statusCode).toBe(404);
    });

    it('повертає 500 якщо модель кидає помилку', async () => {
        Teacher.remove.mockRejectedValue(new Error('DB Error'));
        const res = await request(app).delete('/teachers/1');
        expect(res.statusCode).toBe(500);
    });
});
