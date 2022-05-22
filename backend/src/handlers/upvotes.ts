import { Type as T } from "@sinclair/typebox"
import { FastifyInstance, FastifyRequest } from "fastify"
import { producer } from "../lib/kafka"
import { prisma } from "../prisma/client"

export function configureUpvotes({ app }: { app: FastifyInstance }) {

  app.get('/api/v1/upvotes', {
    schema: {
      querystring: T.Object({
        articleId: T.Number(),
        userId: T.Number()
      })
    }
  }, getUpvotes)

  app.post('/api/v1/comments/:id/upvotes', {
    schema: {
      params: T.Object({
        id: T.Number()
      }),
      body: T.Object({
        userId: T.Number()
      })
    }
  }, createUpvote)

  app.delete('/api/v1/comments/:id/upvotes', {
    schema: {
      params: T.Object({
        id: T.Number()
      }),
      querystring: T.Object({
        userId: T.Number()
      })
    }
  }, deleteRequest)
}


type GetRequest = FastifyRequest<{ Querystring: { userId: number, articleId: number } }>

export async function getUpvotes(request: GetRequest, reply) {
  const { userId, articleId } = request.query

  reply.send({
    data: await prisma.upvote.findMany({
      where: {
        userId: { equals: userId },
        articleId: { equals: articleId }
      }
    })
  })
}

type PostRequest = FastifyRequest<{ Params: { id: number }, Body: { userId: number } }>

export async function createUpvote(request: PostRequest, reply) {
  const { id } = request.params
  const { userId } = request.body

  const dbComment = await prisma.comment.findUnique({ where: { id } })
  if (!dbComment) {
    return reply.status(400).send({})
  }

  const upvote = {
    commentId: id,
    articleId: dbComment.articleId,
    userId
  }

  const comment = await prisma.comment.update({
    where: { id },
    data: {
      upvoteCount: {
        increment: 1,
      },
      upvotes: {
        create: { userId, articleId: dbComment.articleId }
      },
    }
  })

  await producer.sendBatch({
    topicMessages: [
      {
        topic: 'comments.updated',
        messages: [
          { key: 'default', value: JSON.stringify(comment) },
        ]
      },
      {
        topic: 'upvotes.created',
        messages: [
          { key: 'default', value: JSON.stringify(upvote) },
        ]
      }
    ]
  })

  reply.status(201).send({ data: upvote })
}


type  DeleteRequest = FastifyRequest<{
  Params: { id: number },
  Querystring: { userId: number }
}>

export async function deleteRequest(request: DeleteRequest, reply) {
  const { id } = request.params
  const { userId } = request.query

  const comment = await prisma.comment.update({
    where: { id },
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

  await producer.sendBatch({
    topicMessages: [
      {
        topic: 'comments.updated',
        messages: [
          { key: 'default', value: JSON.stringify(comment) },
        ]
      },
      {
        topic: 'upvotes.deleted',
        messages: [
          {
            key: 'default',
            value: JSON.stringify({
              commentId: comment.id,
              userId,
              articleId: comment.articleId
            })
          },
        ]
      }
    ]
  })

  return reply.status(204).send()
}
