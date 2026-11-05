import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import App from './App.tsx'

async function enableMocking() {
  const mocksEnabled =
    import.meta.env.DEV || import.meta.env.VITE_ENABLE_MOCKS === 'true'

  if (!mocksEnabled) {
    return
  }

  const { worker } = await import('./mocks/browser')

  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
  })
}

function renderApp() {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

enableMocking()
  .catch((error: unknown) => {
    console.error('Não foi possível iniciar os mocks locais.', error)
  })
  .finally(renderApp)
