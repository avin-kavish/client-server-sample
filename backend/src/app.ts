import 'dotenv/config'
import Fastify from 'fastify'
import { configureComments } from "./handlers/comments"
import { configureUpvotes } from "./handlers/upvotes"
import { configureUsers } from "./handlers/users"
import { producer } from "./lib/kafka"

const app = Fastify({
  logger: true
})

// TODO: use more secure options for production
app.register(require('@fastify/cors'), {
  origin: true
})

configureComments({ app })

configureUsers({ app })

configureUpvotes({ app })

producer.connect()
  .then(console.log)
  .catch(console.error)

export default app
