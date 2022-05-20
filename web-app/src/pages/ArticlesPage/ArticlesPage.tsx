import React from "react"
import styles from './ArticlesPage.module.css'
import { CommentsSection } from "./components"

const articleId = 1

export default function ArticlesPage() {


  return (
    <div className={styles.pageContainer}>
      <CommentsSection articleId={articleId} />
    </div>
  )
}
