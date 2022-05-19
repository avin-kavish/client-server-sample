import 'dotenv/config'
import Fastify from 'fastify'
import { configureComments } from "./handlers/comments"
import { configureUpvotes } from "./handlers/upvotes"
import { configureUsers } from "./handlers/users"
import { producer } from "./lib/kafka"
import { seed } from "./lib/seed"

const app = Fastify({
  logger: true
})

// TODO: use more secure options for production
app.register(require('@fastify/cors'), {
  origin: true
})

// Just a route for demo purposes. Resets the database to initial state.
app.get('/seed', async (req, res) => {
  await seed()
  res.send({ status: 'OK' })
})

configureComments({ app })

configureUsers({ app })

configureUpvotes({ app })

producer.connect()
  .then(console.log)
  .catch(console.error)

export default app
