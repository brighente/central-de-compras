// frontend/src/App.jsx

import React from 'react';
import LoginPage from './components/LoginPage'; // 1. Importa o novo componente

function App() {
  
  // 2. Por enquanto, vamos mostrar SÓ a página de login
  return (
    <div className="App">
      <LoginPage />
    </div>
  );
}

export default App;