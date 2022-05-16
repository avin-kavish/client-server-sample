import React from 'react'
import { SWRConfig } from 'swr'
import { dataFetcher } from "../../lib/utils"
import CommentsPage from "../../pages/CommentsPage"

function App() {

  return (
    <SWRConfig value={{ fetcher: dataFetcher }}>
      <CommentsPage />
    </SWRConfig>
  )
}

export default App
