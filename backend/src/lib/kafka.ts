import { Kafka } from 'kafkajs'

export const kafka = new Kafka({
  clientId: 'comments-api',
  brokers: [ process.env.KAFKA || 'localhost:9092']
})

export const producer = kafka.producer()
