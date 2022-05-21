import { getByPlaceholderText, render } from "@testing-library/react"
import React from "react"
import io from 'socket.io-client'
import { SWRConfig } from "swr"
import { dataFetcher } from "../../lib/utils"
import ArticlePage from "./ArticlePage"

jest.mock('socket.io-client')

const Wrapper = () => (
  <SWRConfig value={{ fetcher: dataFetcher }}>
    <ArticlePage />
  </SWRConfig>
)

describe('ArticlePage', () => {
  let mockSocket

  beforeEach(() => {
    mockSocket = {
      on: jest.fn(),
      emit: jest.fn(),
      disconnect: jest.fn()
    }
    // @ts-ignore
    io.mockReturnValue(mockSocket)
  })

  describe('Comments Section', () => {

    test('has correct heading', () => {
      const { getByRole } = render(<ArticlePage />, { wrapper: Wrapper })

      expect(getByRole('heading')).toHaveTextContent('Discussion')
    })

    test('shows create comment form', () => {
      const { getByPlaceholderText, getByRole } = render(<ArticlePage />, { wrapper: Wrapper })

      expect(getByPlaceholderText('What are your thoughts?')).toBeVisible()
      expect(getByRole('button')).toHaveTextContent('Comment')
    })
  })
})