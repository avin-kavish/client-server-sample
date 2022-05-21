import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './components/App'
import reportWebVitals from './reportWebVitals'

const render = () => {
  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
  )
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}

if (process.env.REACT_APP_USE_MSW === 'true') {
  console.log('use MSW')
  import('./mocks/data')
    .then(value => value.seed())
    .then(_ => import('./mocks/browser'))
    .then(value => value.worker.start())
    .then(_ => render())
    .catch(console.error)
} else {
  render()
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
