import { rest, RestRequest } from 'msw'
import { BASE_URL } from "../lib/constants"
import { mockDb } from "./data"

type CreateCommentDTO = {
  articleId: number
  body: string,
  parentId: number | undefined,
  userId: number
}

type CreateUpvoteDTO = { userId: number }

export const handlers = [
  rest.get(`${BASE_URL}/v1/users`, (req, res, ctx) => {
    return res(
      ctx.json({ data: mockDb.user.findMany({}) })
    )
  }),
  rest.get(`${BASE_URL}/v1/comments`, (req, res, ctx) => {
    return res(
      ctx.json({ data: mockDb.comment.findMany({}) })
    )
  }),
  rest.post(`${BASE_URL}/v1/comments`, (req: RestRequest<CreateCommentDTO>, res, ctx) => {
    const data = req.body
    const comment = mockDb.comment.create(data)

    return res(
      ctx.json({
        data: comment
      })
    )
  }),
  rest.get(`${BASE_URL}/v1/upvotes`, (req, res, ctx) => {
    return res(
      ctx.json({ data: mockDb.upvote.findMany({}) })
    )
  }),
  rest.post(`${BASE_URL}/api/v1/comments/:id/upvotes`, (req: RestRequest<CreateUpvoteDTO>, res, ctx) => {
    const id = Number(req.params.id)
    const userId = req.body.userId

    const dbComment = mockDb.comment.findFirst({ where: { id: { equals: id } } })
    if (!dbComment) {
      return res(
        ctx.status(400),
      )
    }

    mockDb.comment.update({
      where: {
        id: { equals: id }
      },
      data: {
        upvoteCount: (prevValue, entity) => prevValue + 1
      }
    })

    const upvote = mockDb.upvote.create({
      commentId: id,
      articleId: dbComment.articleId,
      userId
    })

    return res(
      ctx.json({
        data: upvote
      })
    )
  }),
  rest.delete(`${BASE_URL}/api/v1/comments/:id/upvotes`, (req, res, ctx) => {
    const id = Number(req.params.id)
    const userId = Number(req.url.searchParams.get('userId'))

    const dbComment = mockDb.comment.findFirst({ where: { id: { equals: id } } })
    if (!dbComment) {
      return res(
        ctx.status(404),
      )
    }

    const upvote = mockDb.upvote.delete({
      where: {
        commentId: { equals: id },
        userId: { equals: userId }
      }
    })
    if (upvote) {
      mockDb.comment.update({
        where: {
          id: { equals: id }
        },
        data: {
          upvoteCount: (prevValue, entity) => prevValue - 1
        }
      })
    }
    return res(
      ctx.status(204),
    )
  }),
]
