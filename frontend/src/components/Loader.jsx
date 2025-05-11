// src/components/Loader.jsx
import React from 'react';

const Loader = () => {
  return (
    <div className="loader-container">
      <div className="loader">🍳</div>
      <p className="loader-text">Cargando...</p>
      <style>{`
        :root {
          --primary-color: #C44536; /* Rojo terroso */
          --secondary-color: #DAA588; /* Beige cálido */
          --accent-color: #FFD700; /* Dorado */
          --dark-bg: #2B2B2B;
          --light-bg: #F5EDE0;
          --text-dark: #3E3E3E;
          --text-light: #FFFFFF;
          --transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .loader-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background: var(--light-bg);
          padding: 2rem;
        }
        .loader {
          font-size: 5rem;
          animation: smoke 1.5s ease-out infinite;
          margin-bottom: 1rem;
        }
        .loader-text {
          font-family: 'Cinzel Decorative', cursive;
          font-size: 1.5rem;
          color: var(--primary-color);
          text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
        }
        @keyframes smoke {
          0% { transform: translateY(0) scale(1); opacity: 0.8; }
          50% { transform: translateY(-40px) scale(1.1); opacity: 0.5; }
          100% { transform: translateY(-80px) scale(1.2); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Loader;
