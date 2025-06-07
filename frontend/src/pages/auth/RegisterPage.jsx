// src/pages/auth/RegisterPage.jsx
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

  // Expresiones regulares para validar
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const nombreRegex = /^[A-Za-zÀ-ÿ\s]{3,}$/; // solo letras y espacios, mínimo 3 caracteres
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
  // └─ al menos 6 caracteres, incluye letra y número

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validar campo "Nombre"
    if (!nombreRegex.test(nombre.trim())) {
      setError('El nombre debe tener al menos 3 letras y contener solo caracteres alfabéticos.');
      return;
    }

    // Validar Email
    if (!emailRegex.test(email.trim())) {
      setError('Ingresa un correo electrónico válido.');
      return;
    }

    // Validar contraseña mínimo 6 caracteres, con letra y número
    if (!passwordRegex.test(password)) {
      setError(
        'La contraseña debe tener mínimo 6 caracteres y contener al menos una letra y un número.'
      );
      return;
    }

    // Validar coincidencia de contraseñas
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      await signup(nombre.trim(), email.trim(), password);
      navigate('/login');
    } catch (err) {
      // Capturar mensaje de Firebase y traducirlo si es posible
      let msg = 'Error al registrar la cuenta.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'El correo ya está registrado.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'El correo no es válido.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'La contraseña es demasiado débil.';
      }
      setError(msg);
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
          <label htmlFor="nombre-input" className="register-label">
            Nombre:
            <input
              id="nombre-input"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              placeholder="Tu nombre completo"
              className="register-input"
            />
          </label>

          <label htmlFor="email-input" className="register-label">
            Correo Electrónico:
            <input
              id="email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@correo.com"
              className="register-input"
            />
          </label>

          <label htmlFor="password-input" className="register-label">
            Contraseña:
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Mínimo 6 caracteres, 1 número"
              className="register-input"
            />
          </label>

          <label htmlFor="confirm-password-input" className="register-label">
            Confirmar Contraseña:
            <input
              id="confirm-password-input"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Repite la contraseña"
              className="register-input"
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
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="register-link">
            Inicia Sesión
          </Link>
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
          font-weight:600;
        }
        .register-form {
          display:flex;
          flex-direction:column;
          gap:1rem;
          text-align:left;
          margin-top:1rem;
        }
        .register-label {
          font-size:1rem;
          color:#555;
          display:flex;
          flex-direction:column;
          font-weight:500;
        }
        .register-input {
          margin-top:0.5rem;
          padding:0.75rem 1rem;
          font-size:1rem;
          border:1px solid #ccc;
          border-radius:4px;
          transition:border-color 0.3s ease;
        }
        .register-input:focus {
          outline:none;
          border-color:#8B0000;
          box-shadow:0 0 6px rgba(139,0,0,0.2);
        }
        .register-button {
          padding:0.75rem;
          background:#c62828;
          color:#fff;
          border:none;
          border-radius:4px;
          font-size:1.1rem;
          font-weight:600;
          cursor:pointer;
          margin-top:1rem;
          transition:background 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
          box-shadow:0 4px 12px rgba(0,0,0,0.1);
        }
        .register-button:hover:not(:disabled) {
          background:#b22222;
          transform:translateY(-2px);
          box-shadow:0 6px 16px rgba(0,0,0,0.15);
        }
        .register-button:disabled {
          background:#a44444;
          cursor:not-allowed;
          box-shadow:none;
        }
        .register-login {
          margin-top:1.5rem;
          font-size:0.9rem;
        }
        .register-link {
          color:#c62828;
          text-decoration:none;
          font-weight:600;
          transition:color 0.3s ease;
        }
        .register-link:hover {
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
