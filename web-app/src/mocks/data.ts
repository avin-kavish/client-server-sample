import { drop, factory, nullable, primaryKey } from '@mswjs/data'
import { subDays, subMinutes, subWeeks } from "date-fns"

let commentId = 4

let upvoteId = 2

const db = factory({
  user: {
    id: primaryKey(Number),
    name: String,
    avatar: String,
  },
  comment: {
    id: primaryKey(() => commentId++),
    createdAt: () => new Date(),
    body: String,
    upvoteCount: Number,
    userId: Number,
    parentId: nullable(Number),
    articleId: Number
  },
  upvote: {
    id: primaryKey(() => upvoteId++),
    userId: Number,
    commentId: Number,
    articleId: Number
  }
})


const sampleUsers = [
  {
    id: 1,
    name: 'Rob Hope',
    avatar: '/images/avatar-bob.png'
  },
  {
    id: 2,
    name: 'Sophie Brecht',
    avatar: '/images/avatar-sophie.png'
  },
  {
    id: 3,
    name: 'Cameron Lawrence',
    avatar: '/images/avatar-cameron.png'
  },
]

const sampleComments = [
  {
    id: 1,
    articleId: 1,
    body: `Comment 1`,
    upvoteCount: 0,
    userId: 1,
    createdAt: subMinutes(new Date, 45)
  },
  {
    id: 2,
    articleId: 1,
    body: `Comment 2`,
    upvoteCount: 5,
    userId: 2,
    createdAt: subDays(new Date, 1)
  },
  {
    id: 3,
    articleId: 1,
    body: `Comment 3`,
    upvoteCount: 0,
    userId: 3,
    createdAt: subWeeks(new Date, 3)
  }
]

const sampleUpvotes = [
  {
    id: 1,
    articleId: 1,
    commentId: 2,
    userId: 1,
  }
]

export async function seed() {
  drop(db)
  sampleUsers.forEach(u => db.user.create(u))
  sampleComments.forEach(c => db.comment.create(c))
  sampleUpvotes.forEach(u => db.upvote.create(u))
}

export { db as mockDb }