import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast';

import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
       {/* ✅ Add toaster here so it works globally */}
    <Toaster
  position="top-right"
  toastOptions={{
    success: {
      style: {
        background: 'green',
        color: '#fff',
      },
    },
    error: {
      style: {
        background: 'red',
        color: '#fff',
      },
    },
  }}
/>

  </StrictMode>,
)
