import { PrismaClient } from '@prisma/client'
import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'
import { Kafka, Producer } from 'kafkajs'
import { producer } from '../src/lib/kafka'

import { prisma } from '../src/prisma/client'

jest.mock('../src/prisma/client', () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
}))

jest.mock('../src/lib/kafka', () => ({
  __esModule: true,
  kafka: mockDeep<Kafka>(),
  producer: mockDeep<Producer>()
}))

beforeEach(() => {
  mockReset(prismaMock)
  mockReset(producerMock)
  mockReply.reply = getReply()
})

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>

export const producerMock = producer as unknown as DeepMockProxy<Producer>

export const getReply = () => {
  const send = jest.fn()
  const status = jest.fn()
  const reply = {
    send,
    status
  }
  send.mockReturnValue(reply)
  status.mockReturnValue(reply)

  return reply
}

export const mockReply = {
  reply: getReply()
}