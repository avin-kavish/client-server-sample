import { matches } from 'lodash'
import { Server } from "socket.io"
import { kafka } from "./kafka"

async function initRealtime() {
  // TODO: use secure options for production
  const io = new Server({
    cors: {
      origin: true
    }
  })

  const filterMap = new Map<string, (obj: any) => boolean>()

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

  io.on("connection", (socket) => {

    socket.on("subscribe", (eventSpec, cb) => {
      const [ model, action ] = eventSpec.event.split(':')

      if (eventSpec.filter) {
        filterMap.set(`${model}.${action}.${socket.id}`, matches(eventSpec.filter))
      }

      console.log(`Subscribing: ${socket.id} to ${model}:${action}`)
      socket.join(`${model}:${action}`)
    })
  })

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      const [ model, action ] = topic.split('.')
      const data = JSON.parse(message.value!.toString())

      const wildcardEvent = `${model}:*`
      const actionEvent = `${model}:${action}`

      const wSockets = await io.to(wildcardEvent).allSockets()
      wSockets.forEach(socket => {
        const matcher = filterMap.get(`${model}.*.${socket}`)
        if (!matcher) {
          io.to(socket).emit(wildcardEvent, { type: action, data })
        } else if (matcher(data)) {
          io.to(socket).emit(wildcardEvent, { type: action, data })
        }
      })

      const sockets = await io.to(actionEvent).allSockets()
      sockets.forEach(socket => {
        const matcher = filterMap.get(`${model}.${action}.${socket}`)
        if (!matcher) {
          io.to(socket).emit(actionEvent, { type: action, data })
        } else if (matcher(data)) {
          io.to(socket).emit(actionEvent, { type: action, data })
        }
      })
    }
  })

  return io
}

export default initRealtime
