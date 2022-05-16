import { FastifyInstance, FastifyRequest } from "fastify"
import { prisma } from "../prisma/client"

export function configureUpvotes({ app }: { app: FastifyInstance }) {

  type GetRequest = FastifyRequest<{ Querystring: { userId: number } }>

  app.get('/api/v1/upvotes', async (request: GetRequest, reply) => {
    const { userId } = request.query

    reply.send({
      data: await prisma.upvote.findMany({ where: { userId: { equals: Number(userId) } } })
    })
  })

  type PostRequest = FastifyRequest<{ Params: { id: string }, Body: { userId: number } }>

  app.post('/api/v1/comments/:id/upvotes', async (request: PostRequest, reply) => {
    const { id } = request.params
    const { userId } = request.body

    const upvote = {
      commentId: Number(id),
      userId
    }

    await prisma.comment.update({
      where: {
        id: upvote.commentId
      },
      data: {
        upvoteCount: {
          increment: 1,
        },
        upvotes: {
          create: { userId }
        },
      }
    })
    reply.status(201).send({ data: upvote })
  })

  type DeleteRequest = FastifyRequest<{
    Params: { id: string },
    Querystring: { userId: number }
  }>

  app.delete('/api/v1/comments/:id/upvotes', async (request: DeleteRequest, reply) => {
    const { id } = request.params
    const { userId } = request.query

    await prisma.comment.update({
      where: {
        id: Number(id)
      },
      data: {
        upvoteCount: {
          decrement: 1
        },
        upvotes: {
          deleteMany: {
            userId
          }
        },
      }
    })

    return reply.status(204).send()
  })
}
