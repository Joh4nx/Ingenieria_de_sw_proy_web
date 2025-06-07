// src/pages/cliente/ReservasPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NavbarCliente from '../../components/NavbarCliente';
import { useAuth } from '../../context/AuthContext';

function ReservasPage() {
  const { user } = useAuth(); // Obtiene el usuario autenticado
  const navigate = useNavigate();

  // Redirige al login si no hay usuario autenticado
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Estados para el formulario de reservas
  const [nombre, setNombre] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [personas, setPersonas] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación: Comprobar que el año de la fecha sea 2025
    const selectedYear = new Date(fecha).getFullYear();
    if (selectedYear !== 2025) {
      setMensaje('La fecha debe ser en el año 2025.');
      return;
    }

    // Validación: Comprobar que la hora esté entre 12:00 y 21:00
    if (hora < "12:00" || hora > "21:00") {
      setMensaje('La hora debe estar entre las 12:00 y las 21:00.');
      return;
    }

    // Agregamos el correo y la fecha de creación de la reserva
    const reservaData = { 
      nombre, 
      fecha, 
      hora, 
      personas,
      correo: user.email, // Correo del usuario autenticado
      createdAt: new Date().toISOString() // Fecha y hora en que se hizo la reserva
    };

    try {
      const response = await fetch('http://localhost:3001/reservas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reservaData)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setMensaje(result.mensaje || `¡Reserva realizada para ${nombre} el ${fecha} a las ${hora} para ${personas} persona(s)!`);
        // Reinicia los campos del formulario
        setNombre('');
        setFecha('');
        setHora('');
        setPersonas('');
      } else {
        setMensaje(result.error || 'Error al realizar la reserva.');
      }
    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
      setMensaje('Error al conectar con el servidor.');
    }
  };

  return (
    <div className="reservas-page">
      <NavbarCliente />
      <div className="reservas-container">
        <h1 className="reservas-title">Reserva tu Mesa</h1>
        <p className="reservas-description">
          Completa el siguiente formulario para reservar tu mesa y vivir una experiencia gastronómica única.
        </p>
        <form className="reservas-form" onSubmit={handleSubmit}>
          <label>
            Nombre:
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              placeholder="Tu nombre"
            />
          </label>
          <label>
            Fecha:
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
              min="2025-01-01"
              max="2025-12-31"
            />
          </label>
          <label>
            Hora:
            <input
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              required
              min="12:00"
              max="21:00"
            />
          </label>
          <label>
            Número de Personas:
            <input
              type="number"
              value={personas}
              onChange={(e) => setPersonas(e.target.value)}
              min="1"
              required
              placeholder="Cantidad"
            />
          </label>
          <button type="submit" className="submit-button">Reservar Ahora</button>
        </form>
        {mensaje && <p className="reservas-mensaje">{mensaje}</p>}
        <div className="volver">
          <Link to="/" className="volver-link">Volver al Inicio</Link>
        </div>
      </div>
      <style>{`
        /* Reset básico */
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
        .reservas-page {
          background-color: #f5f5f5;
          min-height: 100vh;
          padding-top: 80px; /* Espacio para el Navbar */
        }
        .reservas-container {
          max-width: 600px;
          background: #fff;
          margin: 2rem auto;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .reservas-title {
          text-align: center;
          font-size: 2.5rem;
          margin-bottom: 1rem;
          color: #333;
        }
        .reservas-description {
          text-align: center;
          font-size: 1.1rem;
          margin-bottom: 2rem;
          color: #666;
        }
        .reservas-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .reservas-form label {
          font-size: 1rem;
          color: #555;
          display: flex;
          flex-direction: column;
        }
        .reservas-form input {
          margin-top: 0.5rem;
          padding: 0.5rem;
          font-size: 1rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        .submit-button {
          padding: 0.75rem;
          background: #c62828;
          color: #fff;
          border: none;
          border-radius: 4px;
          font-size: 1.1rem;
          cursor: pointer;
          transition: background 0.3s ease, transform 0.2s ease;
          margin-top: 1rem;
        }
        .submit-button:hover {
          background: #b22222;
          transform: translateY(-3px);
        }
        .reservas-mensaje {
          margin-top: 2rem;
          text-align: center;
          font-size: 1.2rem;
          color: #2e7d32;
        }
        .volver {
          margin-top: 2rem;
          text-align: center;
        }
        .volver-link {
          color: #c62828;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.3s ease;
        }
        .volver-link:hover {
          color: #b22222;
        }
        @media (max-width: 480px) {
          .reservas-container {
            margin: 1rem;
            padding: 1.5rem;
          }
          .reservas-title {
            font-size: 2rem;
          }
          .reservas-description {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}

export default ReservasPage;
