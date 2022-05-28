// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
import { cleanup } from "@testing-library/react"
import { seed } from "./mocks/data"

import { server } from './mocks/server'

beforeAll(async () => {
  await seed()
  server.listen()
})

beforeEach(async () => {
  cleanup()
  await seed()
})

afterEach(async () => {
  server.resetHandlers()
})

afterAll(() => server.close())