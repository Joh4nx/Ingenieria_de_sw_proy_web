// src/pages/admin/GestionReservas.jsx
import React, { useEffect, useState } from 'react';

function GestionReservas() {
  const [reservas, setReservas] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  // Cargar reservas al montar el componente
  useEffect(() => {
    cargarReservas();
  }, []);

  const cargarReservas = () => {
    fetch('http://localhost:3001/reservas')
      .then(res => res.json())
      .then(data => {
        // Si la respuesta es un objeto, conviértelo a array
        const reservasArray = data ? Object.entries(data).map(([id, reserva]) => ({
          id,
          ...reserva,
        })) : [];
        setReservas(reservasArray);
      })
      .catch(err => {
        console.error('Error al cargar reservas:', err);
        setError('Error al cargar reservas.');
      });
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Gestión de Reservas</h1>
      {error && <p style={styles.error}>{error}</p>}
      {mensaje && <p style={styles.mensaje}>{mensaje}</p>}
      {reservas.length === 0 ? (
        <p>No hay reservas registradas.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Nombre</th>
              <th style={styles.th}>Fecha</th>
              <th style={styles.th}>Hora</th>
              <th style={styles.th}>Personas</th>
              {reservas[0].correo && <th style={styles.th}>Correo</th>}
              {reservas[0].createdAt && <th style={styles.th}>Reserva Creada</th>}
            </tr>
          </thead>
          <tbody>
            {reservas.map(reserva => (
              <tr key={reserva.id}>
                <td style={styles.td}>{reserva.nombre}</td>
                <td style={styles.td}>{reserva.fecha}</td>
                <td style={styles.td}>{reserva.hora}</td>
                <td style={styles.td}>{reserva.personas}</td>
                {reserva.correo && <td style={styles.td}>{reserva.correo}</td>}
                {reserva.createdAt && (
                  <td style={styles.td}>
                    {new Date(reserva.createdAt).toLocaleString()}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: 'auto',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    textAlign: 'center',
    marginBottom: '1.5rem',
    fontSize: '2rem',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: '1rem',
  },
  mensaje: {
    color: 'green',
    textAlign: 'center',
    marginBottom: '1rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '1rem',
  },
  th: {
    border: '1px solid #ddd',
    padding: '0.75rem',
    background: '#f5f5f5',
    textAlign: 'left',
  },
  td: {
    border: '1px solid #ddd',
    padding: '0.75rem',
  },
};

export default GestionReservas;
