import React, { useEffect, useMemo, useState } from "react"
import { io } from "socket.io-client"
import useSWR from "swr"
import { Comment, Upvote, User } from "../../../../lib/types"
import { fetchJson } from "../../../../lib/utils"
import styles from "../../ArticlesPage.module.css"
import CommentForm from "../CommentForm/CommentForm"
import CommentItem from "../CommentItem/CommentItem"

const currentUser = 1

export default function CommentsSection() {
  const {
    data: comments,
    mutate: mutateComments
  } = useSWR<Comment[]>('/v1/comments', { revalidateOnFocus: false })
  const {
    data: upvotes,
    mutate: mutateUpvotes
  } = useSWR<Upvote[]>(`/v1/upvotes?userId=${currentUser}`, { revalidateOnFocus: false })

  const params = useMemo(() => comments
    ? new URLSearchParams([
      ...Array.from(
        new Set([
          ...comments.map(c => c.userId),
          currentUser
        ])
      ).map(id => [ 'ids', String(id) ]),
    ])
    : null, [ comments ])

  const { data: users } = useSWR<User[]>(params ? `/v1/users?${params}` : null)

  const [ showReply, setShowReply ] = useState<Comment | null>(null)

  useEffect(() => {
    const socket = io('ws://localhost:3011')

    socket.on('connect', () => {
      socket.emit('subscribe', 'comments:*')
      socket.emit('subscribe', 'upvotes:*')
    })

    socket.on('comments:*', payload => {
      switch (payload.type) {
        case 'created':
          mutateComments(c => [ ...c!, payload.data ])
          break
        case 'updated':
          mutateComments(comments => {
            const idx = comments!.findIndex(c => c.id === payload.data.id)
            if (idx === -1) {
              return [ ...comments!, payload.data ]
            } else {
              comments![idx] = payload.data
              return [ ...comments! ]
            }
          })
          break
        case 'deleted':
          mutateComments(c => c!.filter(c => c.id !== payload.data.id))
          break
      }
    })
    socket.on('upvotes:*', payload => {
      const upvote: Upvote = payload.data
      switch (payload.type) {
        case 'created':
          mutateUpvotes(u => [ ...u!, upvote ])
          break
        case 'deleted':
          mutateUpvotes(u =>
            u!.filter(u => !(
              u.commentId === upvote.commentId &&
              u.userId === upvote.userId
            ))
          )
          break
      }
    })

    return () => void socket.disconnect()
  }, [])

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

      return results
    })
  }

  const onReplyAdd = async () => {
    setShowReply(null)
  }

  return (
    <>
      <h1 className={styles.headerTitle}>Discussion</h1>
      <CommentForm />
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
    </>
  )
}