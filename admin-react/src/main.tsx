import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { router } from './router'
import * as TanStackQueryProvider from './integrations/tanstack-query/root-provider'
import './styles.css'
import reportWebVitals from './reportWebVitals'
import { initWpClient } from '@/lib/api/client'

const ctx = TanStackQueryProvider.getContext()

initWpClient({
  // If you expose a refresh endpoint, plug it here:
  refreshNonce: async () => {
    // Example: GET /wp-json/wpam/v1/nonce
    const res = await fetch('/wp-json/wpam/v1/nonce', {
      credentials: 'include',
    })
    const { nonce } = await res.json()
    return nonce as string
  },
})

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
