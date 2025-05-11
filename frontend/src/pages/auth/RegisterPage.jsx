// src/pages/cliente/RegisterPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NavbarCliente from '../../components/NavbarCliente';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const { signup } = useAuth();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    try {
      await signup(nombre, email, password);
      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="register-page">
      <NavbarCliente />
      <div className="register-container">
        <h1 className="register-title">Regístrate</h1>
        {error && <p className="register-error">{error}</p>}
        <form className="register-form" onSubmit={handleSubmit}>
          <label htmlFor="nombre-input">
            Nombre:
            <input
              id="nombre-input"
              type="text"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              required
              placeholder="Tu nombre"
            />
          </label>
          <label htmlFor="email-input">
            Correo Electrónico:
            <input
              id="email-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="tu@correo.com"
            />
          </label>
          <label htmlFor="password-input">
            Contraseña:
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="Contraseña"
            />
          </label>
          <label htmlFor="confirm-password-input">
            Confirmar Contraseña:
            <input
              id="confirm-password-input"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              placeholder="Repite la contraseña"
            />
          </label>
          <button
            type="submit"
            className="register-button"
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Registrar'}
          </button>
        </form>
        <p className="register-login">
          ¿Ya tienes cuenta? <Link to="/login">Inicia Sesión</Link>
        </p>
      </div>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body, #root { width:100%; height:100%; font-family:'Roboto',sans-serif; }
        .register-page {
          background-color:#f5f5f5;
          min-height:100vh;
          padding-top:80px;
          display:flex;
          justify-content:center;
          align-items:center;
        }
        .register-container {
          max-width:400px;
          background:#fff;
          margin:2rem;
          padding:2rem;
          border-radius:8px;
          box-shadow:0 4px 12px rgba(0,0,0,0.1);
          text-align:center;
        }
        .register-title {
          font-size:2rem;
          margin-bottom:1.5rem;
          color:#333;
        }
        .register-error {
          color:#c62828;
          margin-bottom:1rem;
        }
        .register-form {
          display:flex;
          flex-direction:column;
          gap:1rem;
          text-align:left;
        }
        .register-form label {
          font-size:1rem;
          color:#555;
          display:flex;
          flex-direction:column;
        }
        .register-form input {
          margin-top:0.5rem;
          padding:0.75rem;
          font-size:1rem;
          border:1px solid #ccc;
          border-radius:4px;
        }
        .register-button {
          padding:0.75rem;
          background:#c62828;
          color:#fff;
          border:none;
          border-radius:4px;
          font-size:1.1rem;
          cursor:pointer;
          margin-top:1rem;
          transition:background 0.3s ease, transform 0.2s ease;
        }
        .register-button:hover:not(:disabled) {
          background:#b22222;
          transform:translateY(-2px);
        }
        .register-login {
          margin-top:1.5rem;
          font-size:0.9rem;
        }
        .register-login a {
          color:#c62828;
          text-decoration:none;
          font-weight:600;
          transition:color 0.3s ease;
        }
        .register-login a:hover {
          color:#b22222;
        }
        @media (max-width:480px) {
          .register-container { margin:1rem; padding:1.5rem; }
          .register-title { font-size:1.75rem; }
        }
      `}</style>
    </div>
  );
}
