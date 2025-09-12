// /src/main.tsx
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { Provider as ReduxProvider } from 'react-redux'
import { RouterProvider } from '@tanstack/react-router'
import { router } from './router'
import * as TanStackQueryProvider from './integrations/tanstack-query/root-provider'
import { store } from './store'
import { initHttp } from './lib/api/client'
import './styles.css'
import reportWebVitals from './reportWebVitals'

// single global axios init (nonce from WP)
initHttp({
  getAuthToken: () =>
    (window as any)?.WPAM_BOOT?.nonce ??
    (window as any)?.wpApiSettings?.nonce ??
    null,
})

const ctx = TanStackQueryProvider.getContext()

const rootElement = document.getElementById('wpam-auctions-root')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <ReduxProvider store={store}>
        <TanStackQueryProvider.Provider {...ctx}>
          <RouterProvider router={router} />
        </TanStackQueryProvider.Provider>
      </ReduxProvider>
    </StrictMode>,
  )
}

reportWebVitals()
