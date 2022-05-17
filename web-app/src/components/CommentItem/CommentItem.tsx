import { formatDistanceToNow } from "date-fns"
import React from "react"
import { Comment, Upvote, User } from "../../lib/types"
import styles from './CommentItem.module.css'

export interface CommentProps {
  comment: Comment
  user: User | undefined
  upvote: Upvote | undefined
  onUpvote: (commentId: number) => void
}

export default function CommentItem({ comment, upvote, user, onUpvote }: CommentProps) {

  return (
    <div className={styles.container}>
      <div>
        <div className={styles.avatar}>
          <img className={styles.avatarImg} src={user?.avatar} />
        </div>
      </div>
      <div>
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
          {/*<button className="button button-text reply-button">*/}
          {/*  Reply*/}
          {/*</button>*/}
        </div>
      </div>
    </div>
  )
}
