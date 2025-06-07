// src/pages/cliente/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import NavbarCliente from '../../components/NavbarCliente';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { user, login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const toggleShowPassword = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <div className="login-page">
      <NavbarCliente />
      <div className="login-container">
        <h1 className="login-title">Iniciar Sesión</h1>
        {error && <p className="login-error">{error}</p>}
        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="login-email">
            Correo Electrónico:
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="tu@correo.com"
            />
          </label>
          <label htmlFor="login-password">
            Contraseña:
          </label>
          <div className="password-wrapper">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="Contraseña"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={toggleShowPassword}
              tabIndex={-1}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <div className="aux-links">
          <Link to="/forgot-password" className="forgot-password-link">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <div className="google-section">
          <button
            className="login-google-button"
            onClick={handleGoogle}
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Entrar con Google'}
          </button>
        </div>
        <p className="login-register">
          ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
        </p>
      </div>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body, #root { width:100%; height:100%; font-family:'Roboto',sans-serif; }
        .login-page {
          background-color:#f5f5f5;
          min-height:100vh;
          padding-top:80px;
          display:flex;
          justify-content:center;
          align-items:center;
        }
        .login-container {
          max-width:400px;
          background:#fff;
          padding:2rem;
          border-radius:8px;
          box-shadow:0 4px 12px rgba(0,0,0,0.1);
          text-align:center;
        }
        .login-title {
          font-size:2rem;
          margin-bottom:1.5rem;
          color:#333;
        }
        .login-error {
          color:#c62828;
          margin-bottom:1rem;
        }
        .login-form {
          display:flex;
          flex-direction:column;
          gap:1rem;
          text-align:left;
        }
        .login-form label {
          font-size:1rem;
          color:#555;
        }
        .login-form input {
          margin-top:0.5rem;
          padding:0.75rem;
          font-size:1rem;
          border:1px solid #ccc;
          border-radius:4px;
          width:100%;
        }
        .password-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .password-wrapper input {
          padding-right: 2.5rem;
        }
        .password-toggle {
          position: absolute;
          right: 0.75rem;
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          color: #555;
        }
        .login-button {
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
        .login-button:hover:not(:disabled) {
          background:#b22222;
          transform:translateY(-2px);
        }
        .aux-links {
          margin-top:0.75rem;
          text-align:right;
        }
        .forgot-password-link {
          font-size:0.9rem;
          color:#555;
          text-decoration:none;
          transition:color 0.3s ease;
        }
        .forgot-password-link:hover {
          color:#c62828;
        }
        .google-section {
          margin-top:1.5rem;
        }
        .login-google-button {
          padding:0.75rem;
          background:#4285F4;
          color:#fff;
          border:none;
          border-radius:4px;
          font-size:1.1rem;
          cursor:pointer;
          transition:background 0.3s ease, transform 0.2s ease;
        }
        .login-google-button:hover:not(:disabled) {
          background:#357AE8;
          transform:translateY(-2px);
        }
        .login-register {
          margin-top:1.5rem;
          font-size:0.9rem;
        }
        .login-register a {
          color:#c62828;
          text-decoration:none;
          font-weight:600;
          transition:color 0.3s ease;
        }
        .login-register a:hover {
          color:#b22222;
        }
        @media (max-width:480px) {
          .login-container { margin:1rem; padding:1.5rem; }
          .login-title { font-size:1.75rem; }
          .aux-links { text-align:center; }
        }
      `}</style>
    </div>
  );
}
