import { randomUUID } from 'node:crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import {
  AuthenticatedRequest,
  ensureAuthenticated,
} from '../middlewares/ensureAuthenticated'

export async function mealsRoutes(app: FastifyInstance) {
  app.post(
    '/',
    {
      preHandler: ensureAuthenticated,
    },
    async (request: AuthenticatedRequest, reply) => {
      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        diet: z.boolean(),
        date: z.string().datetime(),
      })

      const getUserParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { name, description, diet, date } = createMealBodySchema.parse(
        request.body,
      )
      const { id } = getUserParamsSchema.parse(request.user)

      if (!name || !description || !date) {
        return reply.status(400).send({
          error: 'Bad request',
          statusCode: 400,
          message: 'Missing required fields',
        })
      }

      const user = await knex('users').where({ id }).first()

      if (!user) {
        return reply.status(404).send({
          error: 'Not found',
          statusCode: 404,
          message: 'User not found',
        })
      }

      const [meal] = await knex('meals')
        .insert({
          id: randomUUID(),
          name,
          description,
          diet,
          date,
          user_id: user.id,
        })
        .returning('*')

      return reply.status(201).send(meal)
    },
  )

  app.get(
    '/',
    {
      preHandler: ensureAuthenticated,
    },
    async (request: AuthenticatedRequest, reply) => {
      const getUserParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getUserParamsSchema.parse(request.user)

      const user = await knex('users').where({ id }).first()

      if (!user) {
        return reply.status(404).send({
          error: 'Not found',
          statusCode: 404,
          message: 'User not found',
        })
      }

      const meals = await knex('meals').where({ user_id: id })

      return reply.status(200).send(meals)
    },
  )

  app.put(
    '/:id',
    {
      preHandler: ensureAuthenticated,
    },
    async (request: AuthenticatedRequest, reply) => {
      const updateMealBodySchema = z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        diet: z.boolean().optional(),
        date: z.string().datetime().optional(),
      })

      const getParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { name, description, diet, date } = updateMealBodySchema.parse(
        request.body,
      )
      const { id: userId } = getParamsSchema.parse(request.user)

      const { id } = getParamsSchema.parse(request.params)

      const user = await knex('users').where({ id: userId }).first()

      if (!user) {
        return reply.status(404).send({
          error: 'Not found',
          statusCode: 404,
          message: 'User not found',
        })
      }

      const meal = await knex('meals').where({ id }).first()

      if (!meal) {
        return reply.status(404).send({
          error: 'Not found',
          statusCode: 404,
          message: 'Meal not found',
        })
      }

      if (meal.user_id !== userId) {
        return reply.status(403).send({
          error: 'Forbidden',
          statusCode: 403,
          message: 'You are not authorized to update this meal',
        })
      }

      meal.name = name ?? meal.name
      meal.description = description ?? meal.description
      meal.diet = diet ?? meal.diet
      meal.date = date ?? meal.date

      const [updatedMeal] = await knex('meals')
        .where({ id: meal.id })
        .update({
          name: meal.name,
          description: meal.description,
          diet: meal.diet,
          date: meal.date,
          updated_at: knex.fn.now(),
        })
        .returning('*')

      return reply.status(200).send(updatedMeal)
    },
  )

  app.delete(
    '/:id',
    {
      preHandler: ensureAuthenticated,
    },
    async (request: AuthenticatedRequest, reply) => {
      const getParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id: userId } = getParamsSchema.parse(request.user)
      const { id: mealId } = getParamsSchema.parse(request.params)

      const user = await knex('users').where({ id: userId }).first()

      if (!user) {
        return reply.status(404).send({
          error: 'Not found',
          statusCode: 404,
          message: 'User not found',
        })
      }

      const meal = await knex('meals').where({ id: mealId }).first()

      if (!meal) {
        return reply.status(404).send({
          error: 'Not found',
          statusCode: 404,
          message: 'Meal not found',
        })
      }

      if (meal.user_id !== userId) {
        return reply.status(403).send({
          error: 'Forbidden',
          statusCode: 403,
          message: 'You are not authorized to delete this meal',
        })
      }

      await knex('meals').where({ id: meal.id }).delete()

      return reply.status(204).send()
    },
  )

  app.get(
    '/metrics',
    {
      preHandler: ensureAuthenticated,
    },
    async (request: AuthenticatedRequest, reply) => {
      const getParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = getParamsSchema.parse(request.user)

      const user = await knex('users').where({ id }).first()

      if (!user) {
        return reply.status(404).send({
          error: 'Not found',
          statusCode: 404,
          message: 'User not found',
        })
      }

      const totalMealsResult = await knex('meals')
        .where({ user_id: id })
        .count('name', { as: 'count' })
        .first()
      const mealsOnDietCountResult = await knex('meals')
        .where({ user_id: id, diet: true })
        .count('diet', { as: 'count' })
        .first()
      const mealsOnNonDietCountResult = await knex('meals')
        .where({ user_id: id, diet: false })
        .count('diet', { as: 'count' })
        .first()

      if (!totalMealsResult) {
        return reply.status(200).send({
          totalMeals: 0,
          mealsOnDietCount: 0,
          mealsOnNonDietCount: 0,
          longestStreak: 0,
        })
      }

      const totalMeals = totalMealsResult.count

      if (!mealsOnDietCountResult) {
        return reply.status(200).send({
          totalMeals,
          mealsOnDietCount: 0,
          mealsOnNonDietCount: totalMeals,
          longestStreak: 0,
        })
      }

      const mealsOnDietCount = mealsOnDietCountResult.count

      if (!mealsOnNonDietCountResult) {
        return reply.status(200).send({
          totalMeals,
          mealsOnDietCount,
          mealsOnNonDietCount: 0,
          longestStreak: 0,
        })
      }

      const mealsOnNonDietCount = mealsOnNonDietCountResult.count

      const meals = await knex('meals')
        .where({ user_id: id })
        .orderBy('date', 'asc')

      let longestStreak = 0
      let currentStreak = 0

      meals.forEach((meal) => {
        if (meal.diet) {
          currentStreak += 1
          if (currentStreak > longestStreak) {
            longestStreak = currentStreak
          }
        } else {
          currentStreak = 0
        }
      })

      return reply.status(200).send({
        totalMeals,
        mealsOnDietCount,
        mealsOnNonDietCount,
        longestStreak,
      })
    },
  )
}
