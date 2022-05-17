import { formatDistanceToNow } from "date-fns"
import React from "react"
import { Comment, Upvote, User } from "../../lib/types"

export interface CommentProps {
  comment: Comment
  user: User | undefined
  upvote: Upvote | undefined
  onUpvote: (commentId: number) => void
}

export default function CommentItem({ comment, upvote, user, onUpvote }: CommentProps) {

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
