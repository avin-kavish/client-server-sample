
export interface Comment {
  id: number
  body: string
  upvoteCount: number
  userId: number
  createdAt: string
}

export interface Upvote {
  userId: number
  commentId: number
}

export interface User {
  id: number
  name: string
  avatar: string
}
