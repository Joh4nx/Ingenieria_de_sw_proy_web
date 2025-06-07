// src/pages/cliente/ConfiguracionesPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateEmail, updatePassword, updateProfile, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { auth, storage } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { FiCamera } from 'react-icons/fi';

export default function ConfiguracionesPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Estados para formulario
  const [nombre, setNombre] = useState(currentUser.displayName || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(currentUser.photoURL || '');
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);

  // 1) Manejo de cambio de archivo para la foto
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Vista previa
    const reader = new FileReader();
    reader.onload = () => {
      setFotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
    setFotoFile(file);
  };

  // 2) Al enviar el formulario, actualizamos paso a paso
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');
    setLoading(true);

    // 2.1) Validar contraseñas
    if (password && password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setLoading(false);
      return;
    }

    try {
      // 2.2) Si cambió el correo, reautenticar primero
      if (email !== currentUser.email) {
        const credenciales = EmailAuthProvider.credential(
          currentUser.email,
          prompt('Para cambiar el correo, ingresa tu contraseña actual:')
        );
        await reauthenticateWithCredential(currentUser, credenciales);
        await updateEmail(currentUser, email.trim());
      }

      // 2.3) Si cambió la contraseña:
      if (password) {
        const credenciales = EmailAuthProvider.credential(
          currentUser.email,
          prompt('Para cambiar la contraseña, ingresa tu contraseña actual:')
        );
        await reauthenticateWithCredential(currentUser, credenciales);
        await updatePassword(currentUser, password);
      }

      // 2.4) Si cambió el nombre:
      if (nombre.trim() !== currentUser.displayName) {
        await updateProfile(currentUser, { displayName: nombre.trim() });
      }

      // 2.5) Si subió una foto nueva, subimos a Firebase Storage
      if (fotoFile) {
        // Carpeta “profilePictures/{uid}.jpg”
        const storageRef = ref(storage, `profilePictures/${currentUser.uid}.jpg`);
        // Leemos el archivo como Base64
        const reader = new FileReader();
        reader.onloadend = async () => {
          // reader.result es un data URL
          await uploadString(storageRef, reader.result, 'data_url');
          const photoURL = await getDownloadURL(storageRef);
          await updateProfile(currentUser, { photoURL });
          setMensaje('Perfil actualizado con éxito');
          setLoading(false);
        };
        reader.readAsDataURL(fotoFile);
        return; // Salimos para esperar al FileReader
      }

      // Si no hay fotoFile o ya terminamos:
      setMensaje('Perfil actualizado con éxito');
    } catch (err) {
      console.error(err);
      setError('Hubo un error al actualizar tus datos: ' + err.message);
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <button onClick={() => navigate('/perfil')} style={styles.backButton}>
        ← Volver al Perfil
      </button>
      <div style={styles.card}>
        <h2 style={styles.title}>Configuraciones de cuenta</h2>
        {error && <p style={styles.errorText}>{error}</p>}
        {mensaje && <p style={styles.successText}>{mensaje}</p>}
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            Foto de Perfil
            <div style={styles.photoContainer}>
              {fotoPreview ? (
                <img src={fotoPreview} alt="Preview" style={styles.photo} />
              ) : (
                <FiCamera style={styles.photoPlaceholder} />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={styles.fileInput}
              />
            </div>
          </label>

          <label style={styles.label}>
            Nombre Completo
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              placeholder="Tu nombre"
              style={styles.input}
            />
          </label>

          <label style={styles.label}>
            Correo Electrónico
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@correo.com"
              style={styles.input}
            />
          </label>

          <label style={styles.label}>
            Nueva Contraseña
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="(Déjalo vacío para no cambiarla)"
              style={styles.input}
            />
          </label>

          <label style={styles.label}>
            Confirmar Contraseña
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite la contraseña"
              style={styles.input}
            />
          </label>

          <button type="submit" style={styles.submitButton} disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </form>
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
  backButton: {
    position: 'absolute',
    top: '1rem',
    left: '1rem',
    background: 'none',
    border: 'none',
    color: '#c62828',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  card: {
    width: '100%',
    maxWidth: '500px',
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    padding: '2rem',
  },
  title: {
    fontSize: '1.5rem',
    marginBottom: '1rem',
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '1rem',
  },
  successText: {
    color: 'green',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '1rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: '1rem',
    color: '#333',
  },
  photoContainer: {
    position: 'relative',
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    overflow: 'hidden',
    margin: '0.5rem 0',
    background: '#f0f0f0',
    alignSelf: 'center',
  },
  photo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  photoPlaceholder: {
    fontSize: '3rem',
    color: '#aaa',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
  fileInput: {
    opacity: 0,
    position: 'absolute',
    width: '100%',
    height: '100%',
    cursor: 'pointer',
    top: 0,
    left: 0,
  },
  input: {
    marginTop: '0.3rem',
    padding: '0.75rem',
    fontSize: '1rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  submitButton: {
    marginTop: '1rem',
    padding: '0.75rem',
    background: '#c62828',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'background 0.3s ease',
  },
};

