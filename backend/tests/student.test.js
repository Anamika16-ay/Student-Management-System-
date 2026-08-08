/**
 * student.test.js
 * ----------------
 * Integration tests for the /api/students endpoints using an
 * in-memory MongoDB instance (mongodb-memory-server), so tests run
 * without needing a real database connection.
 *
 * Run with: npm test
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;
let app;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();
  process.env.CORS_ALLOW_ORIGIN = '*';

  const connectDB = require('../config/db');
  await connectDB();
  app = require('../app');
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
});

afterEach(async () => {
  await mongoose.connection.collection('students').deleteMany({});
});

const validStudent = {
  name: 'Priya Verma',
  email: 'priya.verma@example.com',
  phone: '+919812345670',
  course: 'B.Tech ECE',
  semester: 3,
  department: 'Electronics',
};

describe('POST /api/students', () => {
  it('creates a student with valid data', async () => {
    const res = await request(app).post('/api/students').send(validStudent);
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.email).toBe(validStudent.email);
  });

  it('rejects missing required fields with 422', async () => {
    const res = await request(app).post('/api/students').send({ name: 'X' });
    expect(res.statusCode).toBe(422);
    expect(res.body.status).toBe('error');
  });

  it('rejects duplicate email with 409', async () => {
    await request(app).post('/api/students').send(validStudent);
    const res = await request(app).post('/api/students').send(validStudent);
    expect(res.statusCode).toBe(409);
  });
});

describe('GET /api/students', () => {
  it('lists students with pagination metadata', async () => {
    await request(app).post('/api/students').send(validStudent);
    const res = await request(app).get('/api/students');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.items.length).toBe(1);
    expect(res.body.data).toHaveProperty('total');
    expect(res.body.data).toHaveProperty('page');
  });

  it('filters by course', async () => {
    await request(app).post('/api/students').send(validStudent);
    const res = await request(app).get('/api/students?course=B.Tech ECE');
    expect(res.body.data.items.length).toBe(1);
  });
});

describe('GET /api/students/:studentId', () => {
  it('returns 404 for a non-existent id', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).get(`/api/students/${fakeId}`);
    expect(res.statusCode).toBe(404);
  });

  it('returns the student for a valid id', async () => {
    const created = await request(app).post('/api/students').send(validStudent);
    const studentId = created.body.data.studentId;
    const res = await request(app).get(`/api/students/${studentId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.name).toBe(validStudent.name);
  });
});

describe('PUT /api/students/:studentId', () => {
  it('updates allowed fields', async () => {
    const created = await request(app).post('/api/students').send(validStudent);
    const studentId = created.body.data.studentId;
    const res = await request(app).put(`/api/students/${studentId}`).send({ semester: 6 });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.semester).toBe(6);
  });
});

describe('DELETE /api/students/:studentId', () => {
  it('deletes an existing student', async () => {
    const created = await request(app).post('/api/students').send(validStudent);
    const studentId = created.body.data.studentId;
    const res = await request(app).delete(`/api/students/${studentId}`);
    expect(res.statusCode).toBe(200);

    const getRes = await request(app).get(`/api/students/${studentId}`);
    expect(getRes.statusCode).toBe(404);
  });
});
