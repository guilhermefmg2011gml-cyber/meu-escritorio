import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import NovaPeca from './pages/NovaPeca.jsx'
import RefinarPeca from './pages/RefinarPeca.tsx'

const pathname = window.location.pathname.replace(/\/+$/, '') || '/'
const isNovaPeca = pathname === '/nova-peca'
const isRefinarPeca = pathname === '/refinar-peca'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isNovaPeca ? <NovaPeca /> : isRefinarPeca ? <RefinarPeca /> : <App />}
  </StrictMode>,
)
