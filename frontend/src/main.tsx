import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// Ponto de entrada da aplicação React
// Monta o componente raiz no elemento HTML com id="root"

// createRoot do React 18: API moderna para renderização
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  // StrictMode: ativa verificações extras em desenvolvimento
  <React.StrictMode>
    {/* BrowserRouter: habilita roteamento baseado em URL */}
    <BrowserRouter>
      {/* Componente App: contém todas as rotas e lógica principal */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
