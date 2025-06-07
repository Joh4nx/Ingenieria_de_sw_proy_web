// src/pages/cliente/PerfilPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // o de donde expongas currentUser
import { FiUser, FiSettings } from 'react-icons/fi';

export default function PerfilPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  if (!currentUser) {
    return (
      <div style={styles.container}>
        <p>No has iniciado sesión.</p>
      </div>
    );
  }

  const fotoURL = currentUser.photoURL || '';

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.avatarContainer}>
          {fotoURL ? (
            <img src={fotoURL} alt="Foto perfil" style={styles.avatar} />
          ) : (
            <FiUser style={styles.avatarPlaceholder} />
          )}
        </div>
        <h2 style={styles.name}>{currentUser.displayName || '–'}</h2>
        <p style={styles.email}>{currentUser.email}</p>
        <button
          style={styles.settingsButton}
          onClick={() => navigate('/configuraciones')}
        >
          <FiSettings style={{ marginRight: '0.5rem' }} /> Configuraciones
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    display: 'flex',
    justifyContent: 'center',
    fontFamily: 'Arial, sans-serif',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    padding: '2rem',
    textAlign: 'center',
  },
  avatarContainer: {
    width: '120px',
    height: '120px',
    margin: '0 auto 1rem',
    borderRadius: '50%',
    overflow: 'hidden',
    background: '#f0f0f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  avatarPlaceholder: {
    fontSize: '3rem',
    color: '#aaa',
  },
  name: {
    fontSize: '1.5rem',
    margin: '0.5rem 0',
    color: '#333',
  },
  email: {
    fontSize: '1rem',
    color: '#666',
    marginBottom: '1.5rem',
  },
  settingsButton: {
    background: '#c62828',
    color: '#fff',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'background 0.3s ease',
  },
};
