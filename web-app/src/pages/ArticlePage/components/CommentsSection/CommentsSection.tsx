import { REALTIME_URL } from "lib/constants"
import { Comment, Upvote, User } from "lib/types"
import { fetchJson } from "lib/utils"
import React, { useEffect, useMemo, useState } from "react"
import io from "socket.io-client"
import useSWR from "swr"
import CommentForm from "../CommentForm/CommentForm"
import CommentItem from "../CommentItem/CommentItem"
import styles from "./CommentsSection.module.css"

const currentUserId = 1

interface CommentsSectionProps {
  articleId: number
}

export default function CommentsSection({ articleId }: CommentsSectionProps) {
  const {
    data: comments,
    mutate: mutateComments
  } = useSWR<Comment[]>(`/v1/comments?articleId=${articleId}`, { revalidateOnFocus: false })
  const {
    data: upvotes,
    mutate: mutateUpvotes
  } = useSWR<Upvote[]>(
    `/v1/upvotes?userId=${currentUserId}&articleId=${articleId}`,
    { revalidateOnFocus: false }
  )

  const params = useMemo(() => comments
    ? new URLSearchParams([
      ...Array.from(
        new Set([
          ...comments.map(c => c.userId),
          currentUserId
        ])
      ).map(id => [ 'ids', String(id) ]),
    ])
    : null, [ comments ])

  const { data: users } = useSWR<User[]>(params ? `/v1/users?${params}` : null)

  const [ showReply, setShowReply ] = useState<Comment | null>(null)

  useEffect(() => {
    const socket = io(REALTIME_URL)

    socket.on('connect', () => {
      socket.emit('subscribe', { event: 'comments:*', filter: { articleId } })
      socket.emit('subscribe', { event: 'upvotes:*', filter: { articleId } })
    })

    socket.on('comments:*', payload => {
      switch (payload.type) {
        case 'created':
          mutateComments(c => [ ...c!, payload.data ], { revalidate: false })
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
          }, { revalidate: false })
          break
        case 'deleted':
          mutateComments(c => c!.filter(c => c.id !== payload.data.id), { revalidate: false })
          break
      }
    })
    // console.debug('registered comments:* event handler')

    socket.on('upvotes:*', payload => {
      const upvote: Upvote = payload.data
      switch (payload.type) {
        case 'created':
          mutateUpvotes(u => [ ...u!, upvote ], { revalidate: false })
          break
        case 'deleted':
          mutateUpvotes(u =>
              u!.filter(u => !(
                u.commentId === upvote.commentId &&
                u.userId === upvote.userId
              )),
            { revalidate: false }
          )
          break
      }
    })
    // console.debug('registered upvotes:* event handler')

    return () => {
      socket.removeAllListeners()
      socket.disconnect()
      // console.debug('removed all event handlers')
    }
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

  const currentUser = users?.find(u => u.id === currentUserId)

  const onUpvote = async (commentId: number) => {
    await mutateUpvotes(async upvotes => {
      if (!upvotes) return

      const upvoteIdx = upvotes.findIndex(u => u.commentId === commentId)

      if (upvoteIdx === -1) {
        const newUpvote = { userId: currentUserId, commentId, articleId }
        await fetchJson(`/v1/comments/${commentId}/upvotes`, newUpvote, 'POST')

        return [ ...upvotes!, newUpvote ]
      } else {
        await fetchJson(`/v1/comments/${commentId}/upvotes?userId=${currentUserId}`, undefined, 'DELETE')

        return upvotes.filter((u, idx) => idx !== upvoteIdx)
      }
    }, { revalidate: false })
  }

  const onReplyAdd = async () => {
    setShowReply(null)
  }

  return (
    <>
      <h1 className={styles.headerTitle}>Discussion</h1>
      <CommentForm currentUser={currentUser} articleId={articleId} />
      <div data-testid="comment-list-container" className={styles.container}>
        {tree?.map(c => {

          return (
            <CommentItem
              key={c.id}
              currentUser={currentUser}
              articleId={articleId}
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
