import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import  Provider from './providers/Provider.jsx';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/authContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <AuthProvider>
    <Provider>
    <App />
    </Provider>
    </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
