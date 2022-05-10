import Fastify, { FastifyRequest } from 'fastify'
import { configureComments } from "./handlers/comments"

const app = Fastify({
  logger: true
})

// TODO: use more secure options for production
app.register(require('@fastify/cors'), {
  origin: true
})

configureComments({ app })

export default app
