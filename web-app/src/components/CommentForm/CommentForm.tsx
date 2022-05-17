import React, { FormEventHandler } from "react"
import { fetchJson } from "../../lib/utils"
import styles from './CommentForm.module.css'

const currentUser = 1

export default function CommentForm({ onAdd }: { onAdd: () => void }) {

  const onSubmit: FormEventHandler = async (event) => {
    event.preventDefault()

    const commentInput = (event.target as HTMLFormElement).elements.namedItem('comment') as HTMLInputElement

    const { data } = await fetchJson(`/v1/comments`, {
      body: commentInput.value,
      userId: currentUser
    }, 'POST')

    onAdd()
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <div className={styles.avatar}>
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
  )
}
