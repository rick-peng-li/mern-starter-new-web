import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { connectDatabase, closeDatabase } from '../db/mongo.js';

const app = createApp();

async function registerAndLogin() {
  const registrationResponse = await request(app).post('/api/auth/register').send({
    name: 'Test Editor',
    email: 'editor@example.com',
    password: 'Editor12345',
  });

  expect(registrationResponse.status).toBe(201);
  return registrationResponse.body.token;
}

describe('API integration', () => {
  beforeAll(async () => {
    await connectDatabase();
  });

  beforeEach(async () => {
    await mongoose.connection.db.dropDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  it('rejects protected post creation without authentication', async () => {
    const response = await request(app).post('/api/posts').send({
      title: 'Unauthorized post',
      summary: 'This request should fail because no authentication token is provided.',
      content: 'This content is long enough to pass validation, but it should still be rejected.',
      author: 'Anonymous',
      category: 'Testing',
      tags: ['unauthorized'],
      status: 'draft',
      contentFormat: 'markdown',
    });

    expect(response.status).toBe(401);
  });

  it('supports register, authenticated CRUD and taxonomy endpoints', async () => {
    const token = await registerAndLogin();

    const categoryResponse = await request(app)
      .post('/api/taxonomy/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Testing', description: 'Testing category' });

    expect(categoryResponse.status).toBe(201);

    const postResponse = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Authenticated post',
        summary: 'This post proves the authenticated content management flow works end to end.',
        content: '## Authenticated post\n\nThis post is created after registration and token acquisition.',
        author: 'Test Editor',
        category: 'Testing',
        tags: ['vitest', 'supertest'],
        status: 'published',
        contentFormat: 'markdown',
      });

    expect(postResponse.status).toBe(201);
    expect(postResponse.body.item.title).toBe('Authenticated post');

    const listResponse = await request(app).get('/api/posts').query({ search: 'Authenticated', sort: 'newest' });
    expect(listResponse.status).toBe(200);
    expect(listResponse.body.items).toHaveLength(1);

    const statsResponse = await request(app).get('/api/posts/stats/overview');
    expect(statsResponse.status).toBe(200);
    expect(statsResponse.body.totals.all).toBe(1);

    const categoriesResponse = await request(app).get('/api/taxonomy/categories');
    expect(categoriesResponse.status).toBe(200);
    expect(categoriesResponse.body.items[0].name).toBe('Testing');
  });
});
