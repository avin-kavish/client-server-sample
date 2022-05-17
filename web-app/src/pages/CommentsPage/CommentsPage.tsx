import React, { FormEventHandler, useMemo } from "react"
import useSWR from "swr"
import CommentItem from "../../components/CommentItem/CommentItem"
import { Comment, Upvote, User } from "../../lib/types"
import { fetchJson } from "../../lib/utils"

const currentUser = 1

export default function CommentsPage() {
  const { data: comments, mutate: mutateComments } = useSWR<Comment[]>('/v1/comments')
  const {
    data: upvotes,
    mutate: mutateUpvotes
  } = useSWR<Upvote[]>(`/v1/upvotes?userId=${currentUser}`)

  const params = useMemo(() => comments
    ? new URLSearchParams([
      ...comments.map(c => [ 'ids', String(c.userId) ]),
      [ 'ids', String(currentUser) ]
    ])
    : null, [ comments ])

  const { data: users } = useSWR<User[]>(params ? `/v1/users?${params}` : null)

  const onUpvote = async (commentId: number) => {
    await mutateUpvotes(async upvotes => {
      if (!upvotes) return

      const upvoteIdx = upvotes.findIndex(u => u.commentId === commentId)

      await mutateComments(comments => {
        if (!comments) throw new Error('Logic Error')

        const comment = comments!.find(c => c.id === commentId)
        if (!comment) throw new Error('Logic Error')

        if (upvoteIdx === -1)
          comment.upvoteCount++
        else
          comment.upvoteCount--

        return [ ...comments ]
      })

      if (upvoteIdx === -1) {
        const newUpvote = { userId: currentUser, commentId }
        await fetchJson(`/v1/comments/${commentId}/upvotes`, newUpvote, 'POST')

        return [ ...upvotes!, newUpvote ]
      } else {
        await fetchJson(`/v1/comments/${commentId}/upvotes?userId=${currentUser}`, undefined, 'DELETE')

        return upvotes.filter((u, idx) => idx !== upvoteIdx)
      }
    })
  }

  const onSubmit: FormEventHandler = async (event) => {
    event.preventDefault()

    const commentInput = (event.target as HTMLFormElement).elements.namedItem('comment') as HTMLInputElement

    const { data } = await fetchJson(`/v1/comments`, {
      body: commentInput.value,
      userId: currentUser
    }, 'POST')

    await mutateComments()
  }

  return (
    <div className="page-container">
      <h1 className="comments__header-title">Discussion</h1>
      <form className="comments__form" onSubmit={onSubmit}>
        <div className="comments__avatar">
          <img src="/images/avatar-bob.png" />
        </div>
        <input
          name="comment"
          className="input-outlined flex-1"
          placeholder="What are your thoughts?"
        />
        <button className="button button-primary">
          Comment
        </button>
      </form>
      <div className="comments__container">
        {comments?.map(c => {
          const user = users?.find(u => u.id === c.userId)
          const upvote = upvotes?.find(u => u.commentId === c.id)

          return (
            <CommentItem
              key={c.id}
              comment={c}
              upvote={upvote}
              user={user}
              onUpvote={onUpvote}
            />
          )
        })}
      </div>
    </div>
  )
}
