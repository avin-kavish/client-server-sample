import { createEvent, fireEvent, render, waitFor, within } from "@testing-library/react"
import React from "react"
import io from 'socket.io-client'
import MockedSocket from "socket.io-mock"
import { SWRConfig } from "swr"
import { dataFetcher } from "../../lib/utils"
import { mockDb } from "../../mocks/data"
import { mockSocket } from "../../mocks/socket"
import ArticlePage from "./ArticlePage"

jest.mock('socket.io-client')

const Wrapper = () => (
  <SWRConfig value={{ fetcher: dataFetcher }}>
    <ArticlePage />
  </SWRConfig>
)

describe('ArticlePage', () => {

  beforeEach(() => {
    // @ts-ignore
    mockSocket.server = new MockedSocket()
    io.mockReturnValue(mockSocket.server.socketClient)
  })

  afterEach(() => {
    mockSocket.server.removeAllListeners()
    mockSocket.server.socketClient.removeAllListeners()
  })

  describe('Comments Section', () => {

    test('has correct heading', () => {
      const { getByRole } = render(<ArticlePage />, { wrapper: Wrapper })

      expect(getByRole('heading')).toHaveTextContent('Discussion')
    })

    test('shows create comment form', async () => {
      const { getByTestId } = render(<ArticlePage />, { wrapper: Wrapper })

      const form = getByTestId('comment-form')
      expect(form).toBeVisible()

      const { getByRole, getByPlaceholderText } = within(form)

      await waitFor(() => {
        expect(getByRole('img'))
          .toHaveAttribute('src', '/images/avatar-bob.png')
      })

      expect(getByPlaceholderText('What are your thoughts?')).toBeVisible()
      expect(getByRole('button')).toHaveTextContent('Comment')
    })

    test('shows list of comments', async () => {
      const { getByTestId } = render(<ArticlePage />, { wrapper: Wrapper })

      await waitFor(() => {
        const { getByText, getAllByRole } = within(getByTestId('comment-list-container'))
        getByText('Comment 1')
        getByText('Comment 2')
        getByText('Comment 3')

        const buttons = getAllByRole('button')
        expect(buttons).toHaveLength(6)
        ;[ 0, 4 ].forEach((idx) => {
          expect(buttons[idx]).toHaveTextContent('Upvote')
        })
        expect(buttons[2]).toHaveTextContent('Upvoted')

        ;[ 1, 3, 5 ].forEach((idx) => {
          expect(buttons[idx]).toHaveTextContent('Reply')
        })

        const [ avatar1, avatar2, avatar3 ] = getAllByRole('img')
        expect(avatar1).toHaveAttribute('src', '/images/avatar-bob.png')
        expect(avatar2).toHaveAttribute('src', '/images/avatar-sophie.png')
        expect(avatar3).toHaveAttribute('src', '/images/avatar-cameron.png')
      })
    })

    test('top level comments can be created', async () => {
      const { getByTestId } = render(<ArticlePage />, { wrapper: Wrapper })

      const form = getByTestId('comment-form')
      const { getByRole, getByPlaceholderText } = within(form)

      getByPlaceholderText('What are your thoughts?').value = 'Test Comment'

      fireEvent(
        form,
        createEvent.submit(form)
      )

      const { getByText, getAllByRole } = within(getByTestId('comment-list-container'))
      await waitFor(() => {
        getByText('Test Comment')
      })
    })

    test('comments can be upvoted', async () => {
      const { findByText, findAllByText, getByText } = render(
        <ArticlePage />, { wrapper: Wrapper })

      const [ upvoteButton ] = await findAllByText(/Upvote/)

      fireEvent.click(upvoteButton)

      await findByText('1 upvotes')
    })

    test('comment upvotes can be removed', async () => {
      const { findByText, findAllByText, getByText } = render(
        <ArticlePage />, { wrapper: Wrapper })

      console.log(mockDb.comment.findMany({}))

      await findByText('4 upvotes')

      const upvotedButtons = await findAllByText(/Upvoted/)
      console.log(upvotedButtons)
      const [ upvoteButton ] = upvotedButtons

      fireEvent.click(upvoteButton)


    })
  })
})
