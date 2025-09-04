import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast';
import { Provider } from "react-redux";
import  store   from "./store/index.js"; // adjust path as needed
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <Provider store={store}>

    <App />
       {/* ✅ Add toaster here so it works globally */}
      </Provider>
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
