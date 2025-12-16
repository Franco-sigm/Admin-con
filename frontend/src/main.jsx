import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // <--- IMPORTANTE
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Envolvemos la App en el Router */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)