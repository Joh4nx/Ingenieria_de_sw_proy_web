// src/pages/admin/GestionUsuarios.jsx
import React, { useState, useEffect } from 'react';
import { ref, onValue, push, update, remove } from 'firebase/database';
import { db } from '../../services/firebase';

// Función para generar el email: nombre.apellido@gusto.com
const generateEmail = (nombre, apellido) => {
  return `${nombre.trim().toLowerCase()}.${apellido.trim().toLowerCase()}@gusto.com`;
};

// Función para generar la contraseña: primer_letra_del_nombre.carnet
const generatePassword = (nombre, carnet) => {
  return `${nombre.trim().toLowerCase()[0]}.${carnet.trim()}`;
};

const GestionUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para el formulario de agregar nuevo usuario:
  const [newUserNombre, setNewUserNombre] = useState('');
  const [newUserApellido, setNewUserApellido] = useState('');
  const [newUserCarnet, setNewUserCarnet] = useState('');
  const [newUserRole, setNewUserRole] = useState('cliente'); // rol por defecto

  // Estados para la edición de usuarios:
  const [editingId, setEditingId] = useState(null);
  const [editingNombre, setEditingNombre] = useState('');
  const [editingApellido, setEditingApellido] = useState('');
  const [editingCarnet, setEditingCarnet] = useState('');
  const [editingRole, setEditingRole] = useState('');

  // Cargar usuarios de Firebase en tiempo real
  useEffect(() => {
    const usuariosRef = ref(db, 'usuarios');
    const unsubscribe = onValue(usuariosRef, (snapshot) => {
      const data = snapshot.val();
      const usuariosArray = data
        ? Object.entries(data).map(([id, user]) => ({ id, ...user }))
        : [];
      setUsuarios(usuariosArray);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Función para agregar un nuevo usuario
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUserNombre.trim() || !newUserApellido.trim() || !newUserCarnet.trim()) {
      alert('Por favor ingrese Nombre, Apellido y Carnet.');
      return;
    }
    try {
      const usuariosRef = ref(db, 'usuarios');
      const email = generateEmail(newUserNombre, newUserApellido);
      const password = generatePassword(newUserNombre, newUserCarnet);
      const newUser = { 
        nombre: newUserNombre.trim(),
        apellido: newUserApellido.trim(),
        carnet: newUserCarnet.trim(),
        email, 
        password, 
        role: newUserRole  // Rol seleccionado
      };
      await push(usuariosRef, newUser);
      // Limpiar formulario
      setNewUserNombre('');
      setNewUserApellido('');
      setNewUserCarnet('');
      setNewUserRole('cliente');
      alert(`Usuario agregado con éxito.
Email: ${email}
Contraseña: ${password}`);
    } catch (err) {
      console.error('Error al agregar usuario', err);
      alert('Error al agregar usuario');
    }
  };

  // Función para actualizar los datos básicos y rol de un usuario
  const handleUpdateUser = async (id) => {
    if (!editingNombre.trim() || !editingApellido.trim() || !editingCarnet.trim() || !editingRole.trim()) {
      alert('Por favor, ingrese todos los datos correctamente');
      return;
    }
    try {
      const email = generateEmail(editingNombre, editingApellido);
      const password = generatePassword(editingNombre, editingCarnet);
      await update(ref(db, `usuarios/${id}`), {
        nombre: editingNombre.trim(),
        apellido: editingApellido.trim(),
        carnet: editingCarnet.trim(),
        email,
        password,
        role: editingRole
      });
      setEditingId(null);
      setEditingNombre('');
      setEditingApellido('');
      setEditingCarnet('');
      setEditingRole('');
      alert(`Usuario actualizado con éxito.
Nuevo Email: ${email}
Nueva Contraseña: ${password}`);
    } catch (err) {
      console.error('Error al actualizar usuario', err);
      alert('Error al actualizar usuario');
    }
  };

  // Función para eliminar un usuario
  const handleDeleteUser = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este usuario?')) return;
    try {
      await remove(ref(db, `usuarios/${id}`));
      alert('Usuario eliminado correctamente');
    } catch (err) {
      console.error('Error al eliminar usuario', err);
      alert('Error al eliminar usuario');
    }
  };

  return (
    <div style={styles.container}>
      <h2>Gestión de Usuarios</h2>

      {/* Formulario para agregar nuevo usuario */}
      <form onSubmit={handleAddUser} style={styles.form}>
        <h3>Agregar Nuevo Usuario</h3>
        <div style={styles.formGroup}>
          <label>Nombre:</label>
          <input
            type="text"
            value={newUserNombre}
            onChange={(e) => setNewUserNombre(e.target.value)}
            style={styles.input}
            required
          />
        </div>
        <div style={styles.formGroup}>
          <label>Apellido:</label>
          <input
            type="text"
            value={newUserApellido}
            onChange={(e) => setNewUserApellido(e.target.value)}
            style={styles.input}
            required
          />
        </div>
        <div style={styles.formGroup}>
          <label>Carnet:</label>
          <input
            type="text"
            value={newUserCarnet}
            onChange={(e) => setNewUserCarnet(e.target.value)}
            style={styles.input}
            required
          />
        </div>
        <div style={styles.formGroup}>
          <label>Rol:</label>
          <select
            value={newUserRole}
            onChange={(e) => setNewUserRole(e.target.value)}
            style={styles.input}
          >
            <option value="cliente">Cliente</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        <button type="submit" style={styles.addButton}>
          Agregar Usuario
        </button>
      </form>

      {loading ? (
        <p>Cargando usuarios...</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Contraseña</th>
              <th style={styles.th}>Nombre</th>
              <th style={styles.th}>Apellido</th>
              <th style={styles.th}>Carnet</th>
              <th style={styles.th}>Rol</th>
              <th style={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id} style={styles.tableRow}>
                <td style={styles.td}>{usuario.email}</td>
                <td style={styles.td}>{usuario.password}</td>
                <td style={styles.td}>{usuario.nombre || '-'}</td>
                <td style={styles.td}>{usuario.apellido || '-'}</td>
                <td style={styles.td}>{usuario.carnet || '-'}</td>
                <td style={styles.td}>{usuario.role}</td>
                <td style={styles.td}>
                  {editingId === usuario.id ? (
                    <>
                      <input
                        type="text"
                        value={editingNombre}
                        onChange={(e) => setEditingNombre(e.target.value)}
                        placeholder="Nombre"
                        style={styles.input}
                      />
                      <input
                        type="text"
                        value={editingApellido}
                        onChange={(e) => setEditingApellido(e.target.value)}
                        placeholder="Apellido"
                        style={styles.input}
                      />
                      <input
                        type="text"
                        value={editingCarnet}
                        onChange={(e) => setEditingCarnet(e.target.value)}
                        placeholder="Carnet"
                        style={styles.input}
                      />
                      <select
                        value={editingRole}
                        onChange={(e) => setEditingRole(e.target.value)}
                        style={styles.input}
                      >
                        <option value="cliente">Cliente</option>
                        <option value="admin">Administrador</option>
                      </select>
                      <button
                        onClick={() => handleUpdateUser(usuario.id)}
                        style={styles.actionButton}
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditingNombre('');
                          setEditingApellido('');
                          setEditingCarnet('');
                          setEditingRole('');
                        }}
                        style={{ ...styles.actionButton, backgroundColor: '#999' }}
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(usuario.id);
                          setEditingNombre(usuario.nombre || '');
                          setEditingApellido(usuario.apellido || '');
                          setEditingCarnet(usuario.carnet || '');
                          setEditingRole(usuario.role || 'cliente');
                        }}
                        style={styles.actionButton}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteUser(usuario.id)}
                        style={{ ...styles.actionButton, ...styles.deleteButton }}
                      >
                        Eliminar
                      </button>
                    </>
                  )}
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
    maxWidth: '800px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif',
  },
  form: {
    backgroundColor: '#f8f9fa',
    padding: '1rem 2rem',
    marginBottom: '2rem',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  formGroup: {
    marginBottom: '1rem',
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    padding: '0.5rem',
    fontSize: '1rem',
    marginBottom: '0.5rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  addButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#2196F3',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'background 0.3s',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableRow: {
    borderBottom: '1px solid #ccc',
  },
  actionButton: {
    padding: '0.5rem 1rem',
    marginRight: '0.5rem',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  deleteButton: {
    backgroundColor: '#d32f2f',
  },
};

export default GestionUsuarios;
