import { FastifyInstance } from 'fastify'
import { compare } from 'bcryptjs'
import { knex } from '../database'
import { z } from 'zod'
import authConfig from '../configs/auth'
import { sign } from 'jsonwebtoken'

export async function sessionsRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createSessionBodySchema = z.object({
      email: z.string().email(),
      password: z.string(),
    })

    const { email, password } = createSessionBodySchema.parse(request.body)

    const user = await knex('users').where({ email }).first()

    if (!user) {
      return reply.status(401).send({
        error: 'Unauthorized',
        statusCode: 401,
        message: 'E-mail or password wrong',
      })
    }

    const passwordMatch = await compare(password, user.password)

    if (!passwordMatch) {
      return reply.status(401).send({
        error: 'Unauthorized',
        statusCode: 401,
        message: 'E-mail or password wrong',
      })
    }

    const { secret, expiresIn } = authConfig.jwt
    const token = sign({ id: user.id }, secret, {
      subject: user.id,
      expiresIn,
    })

    reply.setCookie('token', token)
  })
}
