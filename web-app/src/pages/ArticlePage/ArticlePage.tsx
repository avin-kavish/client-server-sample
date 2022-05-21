import React from "react"
import styles from './ArticlePage.module.css'
import { CommentsSection } from "./components"

const articleId = 1

export default function ArticlePage() {


  return (
    <div className={styles.pageContainer}>
      <CommentsSection articleId={articleId} />
    </div>
  )
}
