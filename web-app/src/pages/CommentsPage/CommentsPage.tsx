import { formatDistanceToNow } from "date-fns"
import React, { useMemo } from "react"
import useSWR from "swr"
import { Comment, Upvote, User } from "../../lib/types"
import { fetchJson } from "../../lib/utils"

const currentUser = 1

interface CommentProps {
  comment: Comment
  user: User | undefined
  upvote: Upvote | undefined
  onUpvote: (commentId: number) => void
}

function CommentItem({ comment, upvote, user, onUpvote }: CommentProps) {

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
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </div>
        </div>
        <div className="comments__comment-content-body">
          {comment.body}
        </div>
        <div className="comments__comment-actions">
          <button
            className="button button-text upvote-button"
            onClick={() => onUpvote(comment.id)}
          >
            {upvote ? `Upvoted` : `▲ Upvote`}
          </button>
          <div className="comments__comment-upvotes">
            {comment.upvoteCount} upvotes
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

        console.log(comment)

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
