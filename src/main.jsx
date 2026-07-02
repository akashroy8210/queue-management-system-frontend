import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { SocketProvider } from './context/PatientContext.jsx'

createRoot(document.getElementById('root')).render(
  <SocketProvider>
    <BrowserRouter>
      <StrictMode>
        <App />
      </StrictMode>,
    </BrowserRouter>
  </SocketProvider>
)
