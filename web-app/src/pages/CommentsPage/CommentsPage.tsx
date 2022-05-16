import { formatDistanceToNow } from "date-fns"
import React, { useMemo } from "react"
import useSWR from "swr"
import { Comment, Upvote, User } from "../../lib/types"

const currentUser = 1

function renderComment(c: Comment, user: User | undefined, upvote: Upvote | undefined) {

  return (
    <div className="comments__comment-container">
      <div>
        <div className="comments__avatar">
          <img className="comments__avatar-img" src={user?.avatar} />
        </div>
      </div>
      <div className="comments__comment-content-container">
        <div className="comments__comment-header">
          <div className="comments__comment-author">
            {user?.name}
          </div>
          <div className="comments__comment-header-separator">
            ・
          </div>
          <div className="comments__comment-time">
            {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
          </div>
        </div>
        <div className="comments__comment-content-body">
          {c.body}
        </div>
        <div className="comments__comment-actions">
          <button className="button button-text upvote-button" data-comment-id={c.id}>
            {upvote ? `Upvoted` : `▲ Upvote`}
          </button>
          <div
            className="comments__comment-upvotes"
            data-comment-id={c.id}
            data-upvotes={c.upvoteCount}
          >
            {c.upvoteCount} upvotes
          </div>
          {/*<button className="button button-text reply-button">*/}
          {/*  Reply*/}
          {/*</button>*/}
        </div>
      </div>
    </div>
  )
}

export default function CommentsPage() {
  const { data: comments } = useSWR<Comment[]>('/v1/comments')
  const { data: upvotes } = useSWR<Upvote[]>(`/v1/upvotes?userId=${currentUser}`)

  const params = useMemo(() => comments
    ? new URLSearchParams([
      ...comments.map(c => [ 'ids', String(c.userId) ]),
      [ 'ids', String(currentUser) ]
    ])
    : null, [ comments ])

  const { data: users } = useSWR<User[]>(params ? `/v1/users?${params}` : null)

  return (
    <div className="page-container">
      <h1 className="comments__header-title">Discussion</h1>
      <form className="comments__form">
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

          return renderComment(c, user, upvote)
        })}
      </div>
    </div>
  )
}
