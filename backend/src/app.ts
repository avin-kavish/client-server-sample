import Fastify from 'fastify'

const app = Fastify({
  logger: true
})

app.get('/api/v1/comments', (request, reply) => {

})

app.post('/api/v1/comments', (request, reply) => {

})

app.post('/api/v1/comments/upvote', (request, reply) => {

})


export default app