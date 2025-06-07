// src/index.js (o el archivo principal donde se renderiza tu app)
import React from 'react';
import ReactDOM from 'react-dom/client'; // O 'react-dom' si estás en React 17 o anterior
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // Asegúrate de que esta importación exista y la ruta sea correcta

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}> {/* <-- ¡Añade las future flags aquí! */}
      <AuthProvider> {/* Asegúrate de que AuthProvider envuelva toda tu aplicación */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);