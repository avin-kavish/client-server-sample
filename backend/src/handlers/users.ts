import { Static, Type as T } from '@sinclair/typebox'
import { FastifyInstance, FastifyRequest } from "fastify"

export function configureUsers({ app }: { app: FastifyInstance }) {
  const sampleUsers = [
    {
      id: 1,
      name: 'Rob Hope',
      avatar: 'images/avatar-bob.png'
    },
    {
      id: 2,
      name: 'Sophie Brecht',
      avatar: 'images/avatar-sophie.png'
    },
    {
      id: 3,
      name: 'Cameron Lawrence',
      avatar: 'images/avatar-cameron.png'
    },
  ]

  type GetUsersRequest = FastifyRequest<{ Querystring: { ids: number[] } }>

  app.get('/api/v1/users', {
    schema: {
      querystring: T.Object({
        ids: T.Optional(T.Array(T.Number()))
      })
    }
  }, async (request: GetUsersRequest, reply) => {
    const { ids = [] } = request.query

    return {
      data: ids.length > 0
        ? sampleUsers.filter(u => ids.includes(u.id))
        : sampleUsers
    }
  })
}