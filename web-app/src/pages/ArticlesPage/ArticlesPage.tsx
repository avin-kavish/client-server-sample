import React from "react"
import styles from './ArticlesPage.module.css'
import { CommentsSection } from "./components"

export default function ArticlesPage() {


  return (
    <div className={styles.pageContainer}>
      <CommentsSection />
    </div>
  )
}
