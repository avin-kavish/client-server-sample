import { Server } from "socket.io"
import { kafka } from "./kafka"

async function initRealtime() {
  // TODO: use secure options for production
  const io = new Server({
    cors: {
      origin: true
    }
  })

  io.on("connection", (socket) => {

    socket.on("subscribe", (eventSpec, cb) => {
      const [ model, action ] = eventSpec.split(':')

      console.log(`Subscribing: ${socket.id} to ${model}:${action}`)
      socket.join(`${model}:${action}`)
    })
  })

  const consumer = kafka.consumer({
    groupId: 'realtime-api'
  })

  await consumer.connect()

  await consumer.subscribe({
    topics: [
      'comments.created',
      'comments.updated',
      'comments.deleted',
      'upvotes.created',
      'upvotes.updated',
      'upvotes.deleted',
    ]
  })

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      const [ model, action ] = topic.split('.')
      const data = JSON.parse(message.value!.toString())

      const wildcardEvent = `${model}:*`
      io.to(wildcardEvent).emit(wildcardEvent, { type: action, data })

      const actionEvent = `${model}:${action}`
      io.to(actionEvent).emit(actionEvent, { type: action, data })
    }
  })

  return io
}

export default initRealtime
