import React, { FormEventHandler } from "react"
import { Comment, User } from 'lib/types'
import { cx, fetchJson } from "lib/utils"
import styles from './CommentForm.module.css'

interface CommentForm {
  articleId: number
  inline?: boolean
  parentComment?: Comment
  onAdd?: () => void
  currentUser: User | undefined
}

export default function CommentForm({ onAdd, parentComment, currentUser, articleId, inline }: CommentForm) {

  const onSubmit: FormEventHandler = async (event) => {
    event.preventDefault()

    const commentInput = (event.target as HTMLFormElement).elements.namedItem('comment') as HTMLInputElement

    const { data } = await fetchJson(`/v1/comments`, {
      body: commentInput.value,
      userId: currentUser?.id,
      parentId: parentComment?.id,
      articleId
    }, 'POST')

    commentInput.value = ''
    onAdd?.()
  }

  return (
    <form className={cx(styles.form, inline && styles.formInline)} onSubmit={onSubmit}>
      <div className={styles.avatar}>
        <img src={currentUser?.avatar} />
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
  )
}