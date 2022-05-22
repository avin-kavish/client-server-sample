import { createComment, getComments } from "../../../src/handlers/comments"
import { mockReply, prismaMock, producerMock } from "../../singleton"

describe('Comments Handlers', () => {
  describe('get comments', () => {

    test('finds many records in the database', async () => {
      await getComments(
        { query: { articleId: 1 } } as any,
        {} as any
      )

      expect(prismaMock.comment.findMany)
        .toHaveBeenCalledWith({
          where: {
            articleId: { equals: 1 },
          },
          orderBy: { createdAt: 'asc' }
        })
    })

    test('returns correct value', async () => {
      prismaMock.comment.findMany.mockResolvedValueOnce([])

      const result = await getComments(
        { query: { articleId: 1 } } as any,
        {} as any
      )

      expect(result).toEqual({ data: [] })
    })
  })

  describe('create comment', () => {

    test('creates comment in the database', async () => {
      const body = { articleId: 1, body: 'xxx', parentId: 1, userId: 1 }

      await createComment(
        { body } as any,
        mockReply.reply as any
      )

      expect(prismaMock.comment.create).toHaveBeenCalledWith({
        data: {
          body: 'xxx',
          articleId: 1,
          upvoteCount: 0,
          user: {
            connect: { id: 1 }
          },
          parent: {
            connect: { id: 1 }
          },
        }
      })

    })

    test('dispatches correct event', async () => {
      const body = { articleId: 1, body: 'xxx', parentId: 1, userId: 1 }

      const comment = {
        id: 1,
        articleId: body.articleId,
        userId: body.userId,
        body: body.body,
        upvoteCount: 0,
        createdAt: new Date(),
        parentId: body.parentId
      }
      prismaMock.comment.create.mockResolvedValueOnce(comment)

      await createComment(
        { body } as any,
        mockReply.reply as any
      )

      expect(producerMock.send).toHaveBeenCalledWith({
        topic: 'comments.created',
        messages: [
          { key: 'default', value: JSON.stringify(comment) },
        ]
      })
    })
  })
})