import { FastifyInstance, FastifyRequest } from "fastify"
import { sampleComments } from "../data"

export function configureComments({ app }: { app: FastifyInstance }) {
  let id = 4
  const nextId = () => id++

  app.get('/api/v1/comments', async (request, reply) => {

    return {
      data: sampleComments
    }
  })

  type Request = FastifyRequest<{ Body: { body: string, userId: number } }>

  app.post('/api/v1/comments', (request: Request, reply) => {
    const comment = { id: nextId(), ...request.body, upvotes: 0, createdAt: new Date() }

    sampleComments.push(comment)

    reply.status(201).send({ data: comment })
  })
}
