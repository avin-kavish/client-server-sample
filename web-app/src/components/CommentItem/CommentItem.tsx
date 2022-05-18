import { formatDistanceToNow } from "date-fns"
import React from "react"
import { Comment, Upvote, User } from "../../lib/types"
import CommentForm from "../CommentForm/CommentForm"
import styles from './CommentItem.module.css'

export interface CommentProps {
  comment: Comment & { replies?: Comment[] }
  users: User[] | undefined
  upvotes: Upvote[] | undefined
  onUpvote: (commentId: number) => void
  showReply: boolean
  onReplyClick: (comment: Comment | null) => void
  onAdd: () => void
  replyable?: boolean
}

export default function CommentItem({
                                      comment,
                                      upvotes,
                                      users,
                                      onUpvote,
                                      showReply,
                                      onReplyClick,
                                      onAdd,
                                      replyable
                                    }: CommentProps) {
  const user = users?.find(u => u.id === comment.userId)
  const upvote = upvotes?.find(u => u.commentId === comment.id)

  return (
    <div className={styles.container}>
      <div>
        <div className={styles.avatar}>
          <img className={styles.avatarImg} src={user?.avatar} />
        </div>
      </div>
      <div className="flex-1">
        <div className="d-flex ai-center">
          <div className={styles.author}>
            {user?.name}
          </div>
          <div className={styles.headerSeparator}> ・</div>
          <div className={styles.time}>
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </div>
        </div>
        <div className={styles.contentBody}>
          {comment.body}
        </div>
        <div className={styles.actions}>
          <button
            className={"button button-text " + styles.upvoteButton}
            onClick={() => onUpvote(comment.id)}
          >
            {upvote ? `Upvoted` : `▲ Upvote`}
          </button>
          <div className={styles.upvotes}>
            {comment.upvoteCount} upvotes
          </div>
          {replyable && (
            <button
              className="button button-text"
              onClick={() => onReplyClick(showReply ? null : comment)}
            >
              Reply
            </button>
          )}
        </div>
        <div className={styles.replies}>
          {comment.replies?.map(c => (
            <CommentItem
              comment={c}
              users={users}
              upvotes={upvotes}
              onUpvote={onUpvote}
              showReply={false}
              onReplyClick={onReplyClick}
              onAdd={onAdd}
            />
          ))}
        </div>
        {showReply && <CommentForm inline parentComment={comment} onAdd={onAdd} />}
      </div>
    </div>
  )
}
