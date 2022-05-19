import React from 'react'
import { SWRConfig } from 'swr'
import { dataFetcher } from "../../lib/utils"
import ArticlesPage from "../../pages/ArticlesPage"

function App() {

  return (
    <SWRConfig value={{ fetcher: dataFetcher }}>
      <ArticlesPage />
    </SWRConfig>
  )
}

export default App
