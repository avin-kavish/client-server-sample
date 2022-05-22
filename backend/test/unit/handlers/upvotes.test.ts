import { createUpvote, deleteUpvote, getUpvotes } from "../../../src/handlers/upvotes"
import { mockReply, prismaMock, producerMock } from "../../singleton"

const sampleComment = {
  id: 1,
  userId: 1,
  articleId: 1,
  body: 'some text',
  upvoteCount: 0,
  createdAt: new Date(),
  parentId: null
}

describe('Upvotes Handlers', () => {
  describe('get upvotes', () => {
    test('finds many upvotes in the database, filtered by user and article', async () => {
      await getUpvotes(
        { query: { userId: 1, articleId: 1 } } as any,
        mockReply.reply as any
      )

      expect(prismaMock.upvote.findMany).toHaveBeenCalledWith({
        where: {
          userId: { equals: 1 },
          articleId: { equals: 1 }
        }
      })
    })

    test('returns correct value', async () => {
      prismaMock.upvote.findMany.mockResolvedValueOnce([])

      const result = await getUpvotes(
        { query: {} } as any,
        mockReply.reply as any
      )

      expect(result).toEqual({ data: [] })
    })
  })

  describe('create upvote', () => {
    test('checks validity of comment id', async () => {
      await createUpvote(
        { params: { id: 1 }, body: { userId: 1 } } as any,
        mockReply.reply as any
      )

      expect(prismaMock.comment.findUnique).toHaveBeenCalledWith({ where: { id: 1 } })
    })

    test('creates upvote record and updates vote count of comment', async () => {
      prismaMock.comment.findUnique.mockResolvedValueOnce(sampleComment)

      await createUpvote(
        { params: { id: 1 }, body: { userId: 1 } } as any,
        mockReply.reply as any
      )

      expect(prismaMock.comment.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          upvoteCount: {
            increment: 1,
          },
          upvotes: {
            create: { userId: 1, articleId: 1 }
          },
        }
      })
    })

    test('dispatches relevant events', async () => {
      prismaMock.comment.findUnique.mockResolvedValueOnce(sampleComment)
      prismaMock.comment.update.mockResolvedValueOnce(sampleComment)

      await createUpvote(
        { params: { id: 2 }, body: { userId: 3 } } as any,
        mockReply.reply as any
      )

      expect(producerMock.sendBatch).toHaveBeenCalledWith({
        topicMessages: [
          {
            topic: 'comments.updated',
            messages: [
              { key: 'default', value: JSON.stringify(sampleComment) },
            ]
          },
          {
            topic: 'upvotes.created',
            messages: [
              {
                key: 'default',
                value: JSON.stringify({
                  commentId: 2,
                  articleId: 1,
                  userId: 3
                })
              },
            ]
          }
        ]
      })
    })

    test('sends correct reply', async () => {
      prismaMock.comment.findUnique.mockResolvedValueOnce(sampleComment)
      prismaMock.comment.update.mockResolvedValueOnce(sampleComment)

      await createUpvote(
        { params: { id: 2 }, body: { userId: 3 } } as any,
        mockReply.reply as any
      )

      expect(mockReply.reply.status).toHaveBeenCalledWith(201)
      expect(mockReply.reply.send).toHaveBeenCalledWith({
        data: {
          commentId: 2,
          articleId: 1,
          userId: 3
        }
      })
    })
  })

  describe('delete upvote', () => {
    test('deletes upvote record and updates vote count of comment', async () => {
      prismaMock.comment.update.mockResolvedValueOnce(sampleComment)

      await deleteUpvote(
        { params: { id: 2 }, query: { userId: 3 } } as any,
        mockReply.reply as any
      )

      expect(prismaMock.comment.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: {
          upvoteCount: {
            decrement: 1
          },
          upvotes: {
            deleteMany: {
              userId: 3
            }
          },
        }
      })
    })

    test('dispatches relevant events', async () => {
      prismaMock.comment.update.mockResolvedValueOnce(sampleComment)

      await deleteUpvote(
        { params: { id: 2 }, query: { userId: 3 } } as any,
        mockReply.reply as any
      )

      expect(producerMock.sendBatch).toHaveBeenCalledWith({
        topicMessages: [
          {
            topic: 'comments.updated',
            messages: [
              { key: 'default', value: JSON.stringify(sampleComment) },
            ]
          },
          {
            topic: 'upvotes.deleted',
            messages: [
              {
                key: 'default',
                value: JSON.stringify({
                  commentId: 1,
                  userId: 3,
                  articleId: 1
                })
              },
            ]
          }
        ]
      })
    })

    test('sends correct reply', async () => {
      prismaMock.comment.update.mockResolvedValueOnce(sampleComment)

      await deleteUpvote(
        { params: { id: 2 }, query: { userId: 3 } } as any,
        mockReply.reply as any
      )

      expect(mockReply.reply.status).toHaveBeenCalledWith(204)
      expect(mockReply.reply.send).toHaveBeenCalledWith()
    })
  })
})
