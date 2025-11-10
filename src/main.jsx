import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import NovaPeca from './pages/NovaPeca.jsx'

const pathname = window.location.pathname.replace(/\/+$/, '') || '/'
const isNovaPeca = pathname === '/nova-peca'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isNovaPeca ? <NovaPeca /> : <App />}
  </StrictMode>,
)
