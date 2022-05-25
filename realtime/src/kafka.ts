import { Kafka } from 'kafkajs'

const envBrokers = process.env.KAFKA_BROKERS?.split(',').map(s => s.trim())

export const kafka = new Kafka({
  clientId: 'realtime-api',
  brokers: envBrokers?.length ? envBrokers : [ 'localhost:9092' ]
})
