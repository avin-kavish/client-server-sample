import { Kafka } from 'kafkajs'

const brokers = process.env.KAFKA_BROKERS?.split(',').map(s => s.trim())

export const kafka = new Kafka({
  clientId: 'realtime-api',
  brokers: brokers?.length ? brokers : ['localhost:9092']
})
