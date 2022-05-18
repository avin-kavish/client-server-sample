import React, { useMemo, useState } from "react"
import useSWR from "swr"
import CommentForm from "../../components/CommentForm/CommentForm"
import CommentItem from "../../components/CommentItem/CommentItem"
import { Comment, Upvote, User } from "../../lib/types"
import { fetchJson } from "../../lib/utils"
import styles from './CommentsPage.module.css'

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

  const [ showReply, setShowReply ] = useState<Comment | null>(null)

  const tree = useMemo(() => {
    if (!comments) return []

    return comments
      .filter(c => !c.parentId)
      .map(c => {
        return {
          ...c,
          replies: comments?.filter(x => x.parentId === c.id)
        }
      })
  }, [ comments ])

  const onUpvote = async (commentId: number) => {
    await mutateUpvotes(async upvotes => {
      if (!upvotes) return

      const upvoteIdx = upvotes.findIndex(u => u.commentId === commentId)

      let results
      if (upvoteIdx === -1) {
        const newUpvote = { userId: currentUser, commentId }
        await fetchJson(`/v1/comments/${commentId}/upvotes`, newUpvote, 'POST')

        results = [ ...upvotes!, newUpvote ]
      } else {
        await fetchJson(`/v1/comments/${commentId}/upvotes?userId=${currentUser}`, undefined, 'DELETE')

        results = upvotes.filter((u, idx) => idx !== upvoteIdx)
      }

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

      return results
    })
  }

  const onAdd = () => mutateComments()

  const onReplyAdd = async () => {
    setShowReply(null)
    await mutateComments()
  }

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.headerTitle}>Discussion</h1>
      <CommentForm onAdd={onAdd} />
      <div className={styles.container}>
        {tree?.map(c => {

          return (
            <CommentItem
              key={c.id}
              comment={c}
              upvotes={upvotes}
              users={users}
              onUpvote={onUpvote}
              replyable={true}
              showReply={c.id === showReply?.id}
              onReplyClick={setShowReply}
              onAdd={onReplyAdd}
            />
          )
        })}
      </div>
    </div>
  )
}
