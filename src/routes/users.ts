import { randomUUID } from 'node:crypto'
import { hash, compare } from 'bcryptjs'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import {
  AuthenticatedRequest,
  ensureAuthenticated,
} from '../middlewares/ensureAuthenticated'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string(),
    })

    const { name, email, password } = createUserBodySchema.parse(request.body)

    const encryptedPassword = await hash(password, 8)

    await knex('users').insert({
      id: randomUUID(),
      name,
      email,
      password: encryptedPassword,
    })

    return reply.status(201).send()
  })

  app.get(
    '/me',
    {
      preHandler: ensureAuthenticated,
    },
    async (request: AuthenticatedRequest, reply) => {
      const { id } = request.user

      const user = await knex('users').where({ id }).first()

      if (!user) {
        return reply.status(404).send({
          error: 'Bad request',
          statusCode: 404,
          message: 'User not found',
        })
      }

      return reply.status(200).send({
        id: user.id,
        name: user.name,
        email: user.email,
      })
    },
  )

  app.put(
    '/:id',
    {
      preHandler: ensureAuthenticated,
    },
    async (request, reply) => {
      const createUserBodySchema = z
        .object({
          name: z.string().optional(),
          email: z.string().email().optional(),
          newPassword: z.string().optional(),
          currentPassword: z.string().optional(),
        })
        .refine(
          (data) =>
            !data.newPassword || (data.newPassword && data.currentPassword),
          {
            message: 'Old password is required for setting a new password',
            path: ['currentPassword'],
          },
        )

      const getUserParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { name, email, newPassword, currentPassword } =
        createUserBodySchema.parse(request.body)
      const { id } = getUserParamsSchema.parse(request.params)

      const user = await knex('users').where({ id }).first()

      if (!user) {
        return reply.status(404).send({
          error: 'Bad request',
          statusCode: 404,
          message: 'User not found',
        })
      }

      user.name = name ?? user.name
      user.email = email ?? user.email

      if (newPassword && !currentPassword) {
        return reply.status(403).send({
          error: 'Forbidden',
          statusCode: 403,
          message: 'Current password id required',
        })
      }

      if (currentPassword && newPassword) {
        const passwordMatch = await compare(currentPassword, user.password)

        if (!passwordMatch) {
          return reply.status(400).send({
            error: 'Forbidden',
            statusCode: 403,
            message: 'Current password does not match',
          })
        }

        user.password = await hash(newPassword, 8)
      }

      await knex('users').where({ id }).update({
        name: user.name,
        email: user.email,
        password: user.password,
        updated_at: knex.fn.now(),
      })

      return reply.status(200).send()
    },
  )
}
