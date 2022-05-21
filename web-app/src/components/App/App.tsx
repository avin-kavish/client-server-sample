import React from 'react'
import { SWRConfig } from 'swr'
import { dataFetcher } from "../../lib/utils"
import ArticlePage from "../../pages/ArticlePage"

function App() {

  return (
    <SWRConfig value={{ fetcher: dataFetcher }}>
      <ArticlePage />
    </SWRConfig>
  )
}

export default App
