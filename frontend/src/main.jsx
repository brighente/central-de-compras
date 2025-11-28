import React, { StrictMode } from 'react'
import './index.css'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx';
import App from './App.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
        <AuthProvider> {/* Todo children que estiver dentro do AuthProvider poderá se comunicar com o login */}
            <CartProvider>
                <App />
            </CartProvider> 
        </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
