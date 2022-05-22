import { Type as T } from "@sinclair/typebox"
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"
import { producer } from "../lib/kafka"
import { prisma } from "../prisma/client"

export function configureComments({ app }: { app: FastifyInstance }) {

  app.get('/api/v1/comments', {
    schema: {
      body: T.Object({ articleId: T.Number() })
    }
  }, getComments)

  app.post('/api/v1/comments', {
    schema: {
      body: T.Object({
        articleId: T.Number(),
        body: T.String(),
        userId: T.Number(),
        parentId: T.Optional(T.Union([ T.Number(), T.Null() ]))
      })
    }
  }, createComment)
}

type GetRequest = FastifyRequest<{ Querystring: { articleId: number } }>

export async function getComments(request: GetRequest, reply: FastifyReply) {
  const { articleId } = request.query

  return {
    data: await prisma.comment.findMany({
      where: {
        articleId: { equals: articleId },
      },
      orderBy: { createdAt: 'asc' }
    })
  }
}

type CreateRequest = FastifyRequest<{
  Body: {
    articleId: number
    body: string,
    parentId: number | undefined,
    userId: number
  }
}>

export async function createComment(request: CreateRequest, reply: FastifyReply) {
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
}