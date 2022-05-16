import { Type as T } from "@sinclair/typebox"
import { FastifyInstance, FastifyRequest } from "fastify"
import { prisma } from "../prisma/client"

export function configureComments({ app }: { app: FastifyInstance }) {

  app.get('/api/v1/comments', async (request, reply) => {

    return {
      data: await prisma.comment.findMany({})
    }
  })

  type Request = FastifyRequest<{ Body: { body: string, userId: number } }>

  app.post('/api/v1/comments', {
    schema: {
      body: T.Object({
        body: T.String(),
        userId: T.Number()
      })
    }
  }, async (request: Request, reply) => {
    const { userId, ...rest } = request.body

    const comment = await prisma.comment.create({
      data: {
        ...rest,
        upvoteCount: 0,
        user: {
          connect: {
            id: userId
          }
        }
      }
    })
    reply.status(201).send({ data: comment })
  })
}
