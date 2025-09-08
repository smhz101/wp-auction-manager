import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { router } from './router'
import * as TanStackQueryProvider from './integrations/tanstack-query/root-provider'
import './styles.css'
import reportWebVitals from './reportWebVitals'

const ctx = TanStackQueryProvider.getContext()

const rootElement = document.getElementById('wpam-auctions-root')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <TanStackQueryProvider.Provider {...ctx}>
        <RouterProvider router={router} />
      </TanStackQueryProvider.Provider>
    </StrictMode>,
  )
}

reportWebVitals()
