import { it, beforeAll, afterAll, describe, beforeEach, expect } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../app'

describe('Users routes', () => {
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

  it('should be able to create a new user', async () => {
    await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: 'password',
      })
      .expect(201)
  })

  it('should be able to get logged user', async () => {
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

    const getMeResponse = await request(app.server)
      .get('/users/me')
      .set('Cookie', cookie)
      .expect(200)

    expect(getMeResponse.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: 'John Doe',
        email: 'johndoe@example.com',
      }),
    )
  })

  it('should be able to update logged user', async () => {
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

    const getMeResponse = await request(app.server)
      .get('/users/me')
      .set('Cookie', cookie)
      .expect(200)

    await request(app.server)
      .put(`/users/${getMeResponse.body.id}`)
      .send({
        name: 'John Doe UPDATED',
        email: 'johndoe@example.com',
        newPassword: 'newPassword',
        currentPassword: 'password',
      })
      .set('Cookie', cookie)
      .expect(200)
  })
})
