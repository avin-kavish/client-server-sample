import { FastifyInstance, FastifyRequest } from "fastify"
import { sampleComments, sampleUpvotes } from "../data"

export function configureUpvotes({ app }: { app: FastifyInstance }) {

  type GetRequest = FastifyRequest<{ Querystring: { userId: number } }>

  app.get('/api/v1/upvotes', async (request: GetRequest, reply) => {
    const { userId } = request.query

    reply.send({
      data: sampleUpvotes.filter(u => u.userId === Number(userId))
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

    const comment = sampleComments.find(c => c.id === upvote.commentId)
    if (!comment) {
      return reply.status(400).send({})
    }

    if (
      sampleUpvotes.some(u => upvote.commentId === u.commentId &&
        upvote.userId === u.userId)
    ) {
      return reply.status(200).send({ data: upvote })
    }

    sampleUpvotes.push(upvote)
    comment.upvotes++
    reply.status(201).send({ data: upvote })
  })

  type DeleteRequest = FastifyRequest<{
    Params: { id: string },
    Querystring: { userId: number }
  }>

  app.delete('/api/v1/comments/:id/upvotes', async (request: DeleteRequest, reply) => {
    const { id } = request.params
    const { userId } = request.query

    const comment = sampleComments.find(c => c.id === Number(id))
    if (!comment) {
      return reply.status(400).send({})
    }

    const idx = sampleUpvotes.findIndex(u =>
      u.userId === Number(userId) && u.commentId === Number(id)
    )
    sampleUpvotes.splice(idx, 1)
    comment.upvotes--

    return reply.status(204).send()
  })
}
