import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { usersRoutes } from './routes/users'
import { sessionsRoutes } from './routes/sessions'

export const app = fastify()

app.register(cookie)

app.register(sessionsRoutes, {
  prefix: '/sessions',
})

app.register(usersRoutes, {
  prefix: '/users',
})
