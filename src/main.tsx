import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { DIProvider } from './contexts/DIContext'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DIProvider>
      <App />
    </DIProvider>
  </StrictMode>,
)
