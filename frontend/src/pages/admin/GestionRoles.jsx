// src/pages/admin/GestionRoles.jsx
import React, { useState, useEffect } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';

// Objeto con los accesos disponibles por defecto (todos en false) — incluye 'roles'
const defaultAccesos = {
  platos: false,
  reservas: false,
  mesas: false,
  pedidos: false,
  inventario: false,
  usuarios: false,
  roles: false,  // Permiso para gestionar roles
  cajero: false,
  reportes: false,
};

const GestionRoles = () => {
  const { user, updateUser } = useAuth(); // updateUser para actualizar el usuario actual
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  // Estado para modificaciones locales: { userId: { accesos... }, ... }
  const [modificaciones, setModificaciones] = useState({});
  // Estado para filtrar usuarios según rol ("todos", "admin" o "cliente")
  const [selectedRole, setSelectedRole] = useState('todos');

  // Cargar todos los usuarios en tiempo real desde Firebase
  useEffect(() => {
    if (user && user.role === 'admin') {
      const usuariosRef = ref(db, 'usuarios');
      const unsubscribe = onValue(usuariosRef, (snapshot) => {
        const data = snapshot.val();
        const usuariosArray = data
          ? Object.entries(data).map(([id, usuario]) => ({ id, ...usuario }))
          : [];
        setUsuarios(usuariosArray);
        // Inicializar las modificaciones locales de accesos para cada usuario
        const mods = {};
        usuariosArray.forEach((u) => {
          mods[u.id] = u.accesos ? { ...u.accesos } : { ...defaultAccesos };
        });
        setModificaciones(mods);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Función para alternar un acceso para un usuario determinado
  const toggleAcceso = (userId, key) => {
    setModificaciones((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], [key]: !prev[userId][key] },
    }));
  };

  // Función para guardar los cambios de accesos para un usuario
  const handleSaveAccesos = async (userId) => {
    try {
      await update(ref(db, `usuarios/${userId}`), { accesos: modificaciones[userId] });
      alert('Accesos actualizados para el usuario');
  
      // Si el usuario actual es el modificado, actualiza el contexto
      if (user && user.id === userId) {
        const updatedUser = { ...user, accesos: modificaciones[userId] };
        updateUser(updatedUser);
      }
    } catch (error) {
      console.error('Error al actualizar accesos', error);
      alert('Error al actualizar accesos');
    }
  };

  // Control de acceso: solo administradores pueden ver esta sección
  if (!user || user.role !== 'admin') {
    return (
      <div style={styles.container}>
        <h2>Acceso Restringido</h2>
        <p>Solo administradores pueden gestionar los accesos de usuarios.</p>
      </div>
    );
  }

  // Filtrar usuarios según el rol seleccionado
  const usuariosFiltrados =
    selectedRole === 'todos'
      ? usuarios
      : usuarios.filter((u) => u.role === selectedRole);

  return (
    <div style={styles.container}>
      <h2>Gestión de Accesos de Usuarios</h2>
      <div style={styles.filterContainer}>
        <label style={styles.filterLabel}>Filtrar por rol:</label>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          style={styles.select}
        >
          <option value="todos">Todos</option>
          <option value="admin">Administrador</option>
          <option value="cliente">Cliente</option>
        </select>
      </div>
      {loading ? (
        <p>Cargando usuarios...</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Usuario (Email)</th>
              {Object.keys(defaultAccesos).map((key) => (
                <th key={key} style={styles.th}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </th>
              ))}
              <th style={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map((u) => (
              <tr key={u.id}>
                <td style={styles.td}>{u.email || 'Sin Email'}</td>
                {Object.keys(defaultAccesos).map((key) => (
                  <td key={key} style={styles.td}>
                    <input
                      type="checkbox"
                      checked={modificaciones[u.id] ? modificaciones[u.id][key] : false}
                      onChange={() => toggleAcceso(u.id, key)}
                    />
                  </td>
                ))}
                <td style={styles.td}>
                  <button onClick={() => handleSaveAccesos(u.id)} style={styles.actionButton}>
                    Guardar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif',
  },
  filterContainer: {
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  filterLabel: {
    fontWeight: 'bold',
  },
  select: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    border: '1px solid #ccc',
    padding: '0.75rem',
    backgroundColor: '#f5f5f5',
    textAlign: 'center',
  },
  td: {
    border: '1px solid #ccc',
    padding: '0.75rem',
    textAlign: 'center',
  },
  actionButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background 0.3s',
  },
};

export default GestionRoles;
