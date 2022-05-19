import { Type as T } from "@sinclair/typebox"
import { FastifyInstance, FastifyRequest } from "fastify"
import { producer } from "../lib/kafka"
import { prisma } from "../prisma/client"

export function configureComments({ app }: { app: FastifyInstance }) {

  app.get('/api/v1/comments', async (request, reply) => {

    return {
      data: await prisma.comment.findMany({ orderBy: { createdAt: 'asc' } })
    }
  })

  type Request = FastifyRequest<{ Body: { body: string, parentId: number | undefined, userId: number } }>

  app.post('/api/v1/comments', {
    schema: {
      body: T.Object({
        body: T.String(),
        userId: T.Number(),
        parentId: T.Optional(T.Union([ T.Number(), T.Null() ]))
      })
    }
  }, async (request: Request, reply) => {
    const { userId, parentId, ...rest } = request.body

    const comment = await prisma.comment.create({
      data: {
        ...rest,
        upvoteCount: 0,
        user: {
          connect: {
            id: userId
          }
        },
        parent: parentId ? {
          connect: {
            id: parentId
          }
        } : undefined
      }
    })

    await producer.send({
      topic: 'comments.created',
      messages: [
        { key: 'default', value: JSON.stringify(comment) },
      ]
    })

    reply.status(201).send({ data: comment })
  })
}
