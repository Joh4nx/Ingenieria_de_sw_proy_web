// src/pages/cliente/ForgotPasswordPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NavbarCliente from '../../components/NavbarCliente';
import { useAuth } from '../../context/AuthContext';

function ForgotPasswordPage() {
  const { resetPassword } = useAuth();  // Asegúrate de exponer esta función en tu AuthContext
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    try {
      await resetPassword(email);
      setMessage('Revisa tu bandeja de entrada. Te hemos enviado un enlace para restablecer tu contraseña.');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error al enviar el correo de restablecimiento.');
    }
    setLoading(false);
  };

  return (
    <div className="forgot-page">
      <NavbarCliente />
      <div className="forgot-container">
        <h1 className="forgot-title">¿Olvidaste tu contraseña?</h1>
        {error && <p className="forgot-error" role="alert">{error}</p>}
        {message && <p className="forgot-message">{message}</p>}
        {!message && (
          <form className="forgot-form" onSubmit={handleSubmit}>
            <label htmlFor="email-reset">
              Ingresa tu correo:
              <input
                id="email-reset"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="tu@correo.com"
              />
            </label>
            <button
              type="submit"
              className="forgot-button"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar enlace'}
            </button>
          </form>
        )}
        <p className="forgot-login">
          <Link to="/login">Volver al inicio de sesión</Link>
        </p>
      </div>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        html, body, #root {
          width: 100%;
          height: 100%;
          font-family: 'Roboto', sans-serif;
        }
        .forgot-page {
          background-color: #f5f5f5;
          min-height: 100vh;
          padding-top: 80px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .forgot-container {
          max-width: 400px;
          background: #fff;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          text-align: center;
        }
        .forgot-title {
          font-size: 1.8rem;
          margin-bottom: 1.5rem;
          color: #333;
        }
        .forgot-error {
          color: #c62828;
          margin-bottom: 1rem;
        }
        .forgot-message {
          color: #2e7d32;
          margin-bottom: 1rem;
        }
        .forgot-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          text-align: left;
        }
        .forgot-form label {
          font-size: 1rem;
          color: #555;
          display: flex;
          flex-direction: column;
        }
        .forgot-form input {
          margin-top: 0.5rem;
          padding: 0.75rem;
          font-size: 1rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        .forgot-button {
          padding: 0.75rem;
          background: #c62828;
          color: #fff;
          border: none;
          border-radius: 4px;
          font-size: 1.1rem;
          cursor: pointer;
          margin-top: 1rem;
          transition: background 0.3s ease, transform 0.2s ease;
        }
        .forgot-button:disabled {
          opacity: 0.6;
          cursor: default;
        }
        .forgot-button:hover:not(:disabled) {
          background: #b22222;
          transform: translateY(-2px);
        }
        .forgot-login {
          margin-top: 1.5rem;
          font-size: 0.9rem;
        }
        .forgot-login a {
          color: #c62828;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.3s ease;
        }
        .forgot-login a:hover {
          color: #b22222;
        }
        @media (max-width: 480px) {
          .forgot-container {
            margin: 1rem;
            padding: 1.5rem;
          }
          .forgot-title {
            font-size: 1.6rem;
          }
        }
      `}</style>
    </div>
  );
}

export default ForgotPasswordPage;
