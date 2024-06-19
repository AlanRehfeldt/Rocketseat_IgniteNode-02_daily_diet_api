/* eslint-disable @typescript-eslint/no-explicit-any */
import { FastifyRequest } from 'fastify/types/request'
import authConfig from '../configs/auth'
import { JwtPayload, verify } from 'jsonwebtoken'
import { FastifyReply } from 'fastify/types/reply'

export interface AuthenticatedRequest extends FastifyRequest {
  user?: JwtPayload | any
}

export function ensureAuthenticated(
  request: AuthenticatedRequest,
  reply: FastifyReply,
  next: () => void,
) {
  const { token } = request.cookies

  if (!token) {
    return reply.status(401).send({
      error: 'Unauthorized',
      statusCode: 401,
      message: 'Token is missing',
    })
  }

  try {
    const user = verify(token, authConfig.jwt.secret)
    request.user = user
    next()
  } catch (err) {
    reply.clearCookie('token')
    return reply.status(400).send({
      message: 'JWT token is invalid',
    })
  }
}
