import { subDays, subMinutes, subWeeks } from "date-fns"
import { FastifyInstance, FastifyRequest } from "fastify"

export function configureComments({ app }: { app: FastifyInstance }) {
  let id = 4

  const nextId = () => id++

  const sampleComments = [
    {
      id: 1,
      body: `Jeepers now that's a huge release with some big community earnings to back it - it must be so rewarding seeing creators quit their day jobs after monetizing (with real MRR) on the new platform.`,
      upvotes: 0,
      userId: 1,
      createdAt: subMinutes(new Date, 45)
    },
    {
      id: 2,
      body: `Switched our blog from Hubspot to Ghost a year ago -- turned out to be a great decision. Looking forward to this update....the in-platform analytics look especially delicious. :)`,
      upvotes: 5,
      userId: 2,
      createdAt: subDays(new Date, 1)
    },
    {
      id: 3,
      body: `Love the native memberships and the zipless themes, I was just asked by a friend about options for a new site, and I think I know what I'll be recommending then...`,
      upvotes: 0,
      userId: 3,
      createdAt: subWeeks(new Date, 3)
    }
  ]

  app.get('/api/v1/comments', async (request, reply) => {

    return {
      data: sampleComments
    }
  })

  type Request = FastifyRequest<{ Body: { body: string, userId: number } }>

  app.post('/api/v1/comments', (request: Request, reply) => {
    const comment = { id: nextId(), ...request.body, upvotes: 0, createdAt: new Date() }

    sampleComments.push(comment)

    reply.status(201).send({ data: comment })
  })

  app.post('/api/v1/comments/:id/upvote', (request, reply) => {

  })
}
