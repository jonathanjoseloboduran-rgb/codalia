import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { ContentProvider } from './lib/content-provider.tsx'
import { ProgressProvider } from './lib/progress.tsx'
import { AuthProvider } from './lib/auth.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <ContentProvider>
        <ProgressProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ProgressProvider>
      </ContentProvider>
    </HashRouter>
  </StrictMode>,
)
