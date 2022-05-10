import Fastify, { FastifyRequest } from 'fastify'
import { configureComments } from "./handlers/comments"
import { configureUsers } from "./handlers/users"

const app = Fastify({
  logger: true
})

// TODO: use more secure options for production
app.register(require('@fastify/cors'), {
  origin: true
})

configureComments({ app })

configureUsers({ app })

export default app
