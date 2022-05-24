import { Comment, User } from 'lib/types'
import { cx, fetchJson } from "lib/utils"
import React, { FormEventHandler } from "react"
import styles from './CommentForm.module.css'

interface CommentFormProps {
  articleId: number
  inline?: boolean
  parentComment?: Comment
  onAdd?: () => void
  currentUser: User | undefined
}

export default function CommentForm({
                                      onAdd,
                                      parentComment,
                                      currentUser,
                                      articleId,
                                      inline
                                    }: CommentFormProps) {

  const onSubmit: FormEventHandler = async (event) => {
    event.preventDefault()

    const commentInput = (event.target as HTMLFormElement).elements.namedItem('comment') as HTMLInputElement

    await fetchJson(`/v1/comments`, {
      body: commentInput.value,
      userId: currentUser?.id,
      parentId: parentComment?.id,
      articleId
    }, 'POST')

    commentInput.value = ''
    onAdd?.()
  }

  return (
    <form
      data-testid="comment-form"
      className={cx(styles.form, inline && styles.formInline)}
      onSubmit={onSubmit}
    >
      <div className={styles.avatar}>
        <img alt="Avatar of user" src={currentUser?.avatar} />
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
