// src/pages/cliente/PedidoOnline.jsx
import React, { useState, useEffect } from 'react';
import Menu from './Menu';
import { useGeolocation } from '../../hooks/useGeolocation';
import Loader from '../../components/Loader';

const PedidoOnline = ({ volver }) => {
  const [direccion, setDireccion] = useState('');
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const { position, error: geoError } = useGeolocation();

  // Función de validación básica para la dirección
  const validateAddress = (address) => {
    // Permite letras, números, espacios y algunos signos, exigiendo entre 10 y 100 caracteres.
    const addressRegex = /^[a-zA-Z0-9\s.,'-]{10,100}$/;
    return addressRegex.test(address);
  };

  // Validación en tiempo real con debounce de 500ms
  useEffect(() => {
    const validate = async () => {
      if (direccion.length > 0) {
        setLoading(true);
        const valid = validateAddress(direccion);
        setIsValid(valid);
        setError(valid ? '' : 'Formato de dirección inválido');
        setLoading(false);
      } else {
        setIsValid(false);
        setError('');
      }
    };

    const timeoutId = setTimeout(() => {
      validate();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [direccion]);

  // Función para usar geolocalización y llenar la dirección
  const handleUseCurrentLocation = () => {
    if (position) {
      const coordAddress = `${position.coords.latitude}, ${position.coords.longitude}`;
      setDireccion(coordAddress);
      setError('');
      setIsValid(true); // Se asume que las coordenadas son válidas para proceder
    } else if (geoError) {
      setError('Activa la geolocalización para usar esta función');
    }
  };

  return (
    <div className="pedido-online" style={styles.container}>
      <button onClick={volver} style={styles.btnVolver}>
        ← Volver
      </button>

      <h3 style={styles.title}>Datos de Entrega</h3>

      <div style={styles.inputContainer}>
        <input
          type="text"
          placeholder="Ej: Av. Corrientes 1234, CABA"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          style={{
            ...styles.input,
            borderColor: error ? '#ff4444' : isValid ? '#4CAF50' : '#ccc'
          }}
          required
        />
        <button
          onClick={handleUseCurrentLocation}
          style={styles.geoButton}
          title="Usar mi ubicación actual"
        >
          📍 Usar mi ubicación actual
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {geoError && <div style={styles.error}>{geoError}</div>}

      {loading ? (
        <Loader text="Verificando dirección..." />
      ) : (
        isValid && <Menu tipo="online" direccion={direccion} />
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '800px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center'
  },
  btnVolver: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '1.25rem',
    cursor: 'pointer',
    marginBottom: '1rem'
  },
  title: {
    fontSize: '1.75rem',
    marginBottom: '1rem',
    color: '#333'
  },
  inputContainer: {
    position: 'relative',
    maxWidth: '500px',
    margin: '0 auto 1rem'
  },
  input: {
    width: '100%',
    padding: '0.75rem 2.5rem 0.75rem 1rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '25px',
    transition: 'border-color 0.3s ease'
  },
  geoButton: {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    fontSize: '1rem',
    cursor: 'pointer'
  },
  error: {
    color: '#ff4444',
    fontSize: '0.9rem',
    margin: '0.5rem 0'
  }
};

export default PedidoOnline;
