import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { preserveAccessCodeInHistory } from '@/lib/access-code'
import { applyTemplateMeta } from '@/lib/apply-template-meta'
import './index.css'
import App from './App.tsx'

preserveAccessCodeInHistory()
applyTemplateMeta()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
