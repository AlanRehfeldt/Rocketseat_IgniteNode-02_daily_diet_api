import { it, beforeAll, afterAll, describe, beforeEach, expect } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../app'

describe('Meals routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new meal', async () => {
    await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: 'password',
      })
      .expect(201)

    const loginResponse = await request(app.server)
      .post('/sessions')
      .send({
        email: 'johndoe@example.com',
        password: 'password',
      })
      .expect(200)

    const cookie = loginResponse.headers['set-cookie']

    const createMealResponse = await request(app.server)
      .post('/meals')
      .set('Cookie', cookie)
      .send({
        name: 'Meal 1',
        description: 'Meal 1 description',
        diet: true,
        date: '2024-06-17T12:15:05.123Z',
      })
      .expect(201)

    expect(createMealResponse.body).toEqual(
      expect.objectContaining({
        name: 'Meal 1',
        description: 'Meal 1 description',
        diet: 1,
        date: '2024-06-17T12:15:05.123Z',
      }),
    )
  })

  it('should be able retrive all meals', async () => {
    await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: 'password',
      })
      .expect(201)

    const loginResponse = await request(app.server)
      .post('/sessions')
      .send({
        email: 'johndoe@example.com',
        password: 'password',
      })
      .expect(200)

    const cookie = loginResponse.headers['set-cookie']

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookie)
      .send({
        name: 'Meal 1',
        description: 'Meal 1 description',
        diet: true,
        date: '2024-06-17T12:15:05.123Z',
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookie)
      .send({
        name: 'Meal 2',
        description: 'Meal 2 description',
        diet: true,
        date: '2024-06-17T12:25:05.123Z',
      })
      .expect(201)

    const getMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookie)
      .expect(200)

    expect(getMealsResponse.body).toEqual([
      expect.objectContaining({
        name: 'Meal 1',
        description: 'Meal 1 description',
        diet: 1,
        date: '2024-06-17T12:15:05.123Z',
      }),
      expect.objectContaining({
        name: 'Meal 2',
        description: 'Meal 2 description',
        diet: 1,
        date: '2024-06-17T12:25:05.123Z',
      }),
    ])
  })

  it('should be able update a meal', async () => {
    await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: 'password',
      })
      .expect(201)

    const loginResponse = await request(app.server)
      .post('/sessions')
      .send({
        email: 'johndoe@example.com',
        password: 'password',
      })
      .expect(200)

    const cookie = loginResponse.headers['set-cookie']

    const createMealResponse = await request(app.server)
      .post('/meals')
      .set('Cookie', cookie)
      .send({
        name: 'Meal 1',
        description: 'Meal 1 description',
        diet: true,
        date: '2024-06-17T12:15:05.123Z',
      })
      .expect(201)

    const getMealsResponse = await request(app.server)
      .put(`/meals/${createMealResponse.body.id}`)
      .set('Cookie', cookie)
      .send({
        name: 'Meal 1 UPDATED',
        description: 'Meal 1 description',
        diet: false,
        date: '2024-06-17T12:15:05.123Z',
      })
      .expect(200)

    expect(getMealsResponse.body).toEqual(
      expect.objectContaining({
        name: 'Meal 1 UPDATED',
        description: 'Meal 1 description',
        diet: 0,
        date: '2024-06-17T12:15:05.123Z',
      }),
    )
  })

  it('should be able delete a meal', async () => {
    await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: 'password',
      })
      .expect(201)

    const loginResponse = await request(app.server)
      .post('/sessions')
      .send({
        email: 'johndoe@example.com',
        password: 'password',
      })
      .expect(200)

    const cookie = loginResponse.headers['set-cookie']

    const createMealResponse = await request(app.server)
      .post('/meals')
      .set('Cookie', cookie)
      .send({
        name: 'Meal 1',
        description: 'Meal 1 description',
        diet: true,
        date: '2024-06-17T12:15:05.123Z',
      })
      .expect(201)

    await request(app.server)
      .delete(`/meals/${createMealResponse.body.id}`)
      .set('Cookie', cookie)
      .expect(204)
  })

  it('should be able retrive users metrics', async () => {
    await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: 'password',
      })
      .expect(201)

    const loginResponse = await request(app.server)
      .post('/sessions')
      .send({
        email: 'johndoe@example.com',
        password: 'password',
      })
      .expect(200)

    const cookie = loginResponse.headers['set-cookie']

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookie)
      .send({
        name: 'Meal 1',
        description: 'Meal 1 description',
        diet: true,
        date: '2024-06-17T12:15:05.123Z',
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookie)
      .send({
        name: 'Meal 2',
        description: 'Meal 2 description',
        diet: true,
        date: '2024-06-17T12:15:05.123Z',
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookie)
      .send({
        name: 'Meal 3',
        description: 'Meal 3 description',
        diet: false,
        date: '2024-06-17T12:15:05.123Z',
      })
      .expect(201)

    const metricsResponse = await request(app.server)
      .get('/meals/metrics')
      .set('Cookie', cookie)
      .expect(200)

    expect(metricsResponse.body).toEqual({
      totalMeals: 3,
      mealsOnDietCount: 2,
      mealsOnNonDietCount: 1,
      longestStreak: 2,
    })
  })
})
