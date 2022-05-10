import Fastify, { FastifyRequest } from 'fastify'

const app = Fastify({
  logger: true
})

// TODO: use more secure options for production
app.register(require('@fastify/cors'), {
  origin: true
})


let id = 4

const nextId = () => id++

const sampleComments = [
  {
    id: 1,
    body: `Jeepers now that's a huge release with some big community earnings to back it - it must be so rewarding seeing creators quit their day jobs after monetizing (with real MRR) on the new platform.`,
    upvotes: 0
  },
  {
    id: 2,
    body: `Switched our blog from Hubspot to Ghost a year ago -- turned out to be a great decision. Looking forward to this update....the in-platform analytics look especially delicious. :)`,
    upvotes: 5
  },
  {
    id: 3,
    body: `Love the native memberships and the zipless themes, I was just asked by a friend about options for a new site, and I think I know what I'll be recommending then...`,
    upvotes: 0
  }
]

app.get('/api/v1/comments', async (request, reply) => {

  return {
    data: sampleComments
  }
})

type Request = FastifyRequest<{ Body: { body: string } }>

app.post('/api/v1/comments', (request: Request, reply) => {
  const comment = { id: nextId(), ...request.body, upvotes: 0 }

  sampleComments.push(comment)

  reply.status(201).send({ data: comment })
})

app.post('/api/v1/comments/:id/upvote', (request, reply) => {

})

export default app
