// src/pages/admin/GestionUsuarios.jsx
import React, { useState, useEffect } from 'react';
import { ref, onValue, push, update, remove } from 'firebase/database';
import { db } from '../../services/firebase';
import { FiEye, FiEyeOff, FiSearch } from 'react-icons/fi';

// Función para generar el email: nombre.apellido@gusto.com
const generateEmail = (nombre, apellido) => {
  return `${nombre.trim().toLowerCase()}.${apellido.trim().toLowerCase()}@gusto.com`;
};

// Función para generar la contraseña: primer_letra_del_nombre.carnet
const generatePassword = (nombre, carnet) => {
  return `${nombre.trim().toLowerCase()[0]}.${carnet.trim()}`;
};

// Componente de Notificación Personalizada
const CustomNotification = ({ message, type, onClose }) => {
  if (!message) return null;

  const notificationStyle = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: type === 'success' ? '#4CAF50' : '#f44336', // Verde para éxito, rojo para error
    color: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    zIndex: 1000,
    textAlign: 'center',
    maxWidth: '400px',
    width: '90%',
    fontSize: '1.1rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const closeButtonStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    border: 'none',
    color: 'white',
    padding: '8px 15px',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '15px',
    fontSize: '1rem',
    fontWeight: 'bold',
  };

  return (
    <div style={notificationStyle}>
      <p>{message}</p>
      <button onClick={onClose} style={closeButtonStyle}>
        Entendido
      </button>
    </div>
  );
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
  const [showPasswords, setShowPasswords] = useState({}); // Estado para controlar la visibilidad de contraseñas

  // Nuevo estado para el término de búsqueda
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para la notificación personalizada
  const [notification, setNotification] = useState({ message: '', type: '' });

  // Función para mostrar notificación
  const showNotification = (message, type = 'success', duration = 5000) => {
    setNotification({ message, type });
    // Oculta la notificación después de 'duration' ms
    setTimeout(() => {
      setNotification({ message: '', type: '' });
    }, duration);
  };

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
      showNotification('Por favor ingrese Nombre, Apellido y Carnet.', 'error');
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
        role: newUserRole // Rol seleccionado
      };
      await push(usuariosRef, newUser);
      // Limpiar formulario
      setNewUserNombre('');
      setNewUserApellido('');
      setNewUserCarnet('');
      setNewUserRole('cliente');
      showNotification(`Usuario agregado con éxito.\nEmail: ${email}\nContraseña: ${password}`, 'success');
    } catch (err) {
      console.error('Error al agregar usuario', err);
      showNotification('Error al agregar usuario', 'error');
    }
  };

  // Función para actualizar los datos básicos y rol de un usuario
  const handleUpdateUser = async (id) => {
    if (!editingNombre.trim() || !editingApellido.trim() || !editingCarnet.trim() || !editingRole.trim()) {
      showNotification('Por favor, ingrese todos los datos correctamente', 'error');
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
      showNotification(`Usuario actualizado con éxito.\nNuevo Email: ${email}\nNueva Contraseña: ${password}`, 'success');
    } catch (err) {
      console.error('Error al actualizar usuario', err);
      showNotification('Error al actualizar usuario', 'error');
    }
  };

  // Función para eliminar un usuario
  const handleDeleteUser = async (id) => {
    // Usamos el confirm nativo, ya que es una acción destructiva
    if (!window.confirm('¿Está seguro de eliminar este usuario?')) return;
    try {
      await remove(ref(db, `usuarios/${id}`));
      showNotification('Usuario eliminado correctamente', 'success');
    } catch (err) {
      console.error('Error al eliminar usuario', err);
      showNotification('Error al eliminar usuario', 'error');
    }
  };

  // Función para alternar la visibilidad de la contraseña
  const toggleShowPassword = (id) => {
    setShowPasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Lógica de filtrado con manejo de propiedades undefined
  const filteredUsuarios = usuarios.filter((usuario) => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    // Usamos el operador OR (|| '') para asegurar que la propiedad nunca sea undefined/null
    // antes de llamar a .toLowerCase().
    const nombre = usuario.nombre || '';
    const apellido = usuario.apellido || '';
    const email = usuario.email || '';
    const carnet = usuario.carnet || '';
    const role = usuario.role || '';

    return (
      nombre.toLowerCase().includes(lowerCaseSearchTerm) ||
      apellido.toLowerCase().includes(lowerCaseSearchTerm) ||
      email.toLowerCase().includes(lowerCaseSearchTerm) ||
      carnet.toLowerCase().includes(lowerCaseSearchTerm) ||
      role.toLowerCase().includes(lowerCaseSearchTerm)
    );
  });

  return (
    <div style={styles.container}>
      {/* Componente de Notificación */}
      <CustomNotification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: '', type: '' })}
      />

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

      {/* Separador visual */}
      <hr style={styles.separator} />

      {/* Barra de Búsqueda */}
      <div style={styles.searchContainer}>
        <FiSearch style={styles.searchIcon} />
        <input
          type="text"
          placeholder="Buscar por nombre, apellido, email, carnet o rol..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {loading ? (
        <p style={styles.loadingMessage}>Cargando usuarios...</p>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Email</th>
                <th style={styles.passwordCol}>Contraseña</th>
                <th style={styles.th}>Nombre</th>
                <th style={styles.th}>Apellido</th>
                <th style={styles.th}>Carnet</th>
                <th style={styles.th}>Rol</th>
                <th style={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsuarios.length > 0 ? (
                filteredUsuarios.map((usuario) => (
                  <tr key={usuario.id} style={styles.tableRow}>
                    <td style={styles.td}>{usuario.email || '-'}</td>
                    <td style={{ ...styles.td, ...styles.passwordCell }}>
                      <span style={styles.passwordText}>
                        {showPasswords[usuario.id] ? (usuario.password || '-') : '••••••••'}
                      </span>
                      <div
                        onClick={() => toggleShowPassword(usuario.id)}
                        style={styles.eyeIcon}
                      >
                        {showPasswords[usuario.id] ? <FiEyeOff /> : <FiEye />}
                      </div>
                    </td>
                    <td style={styles.td}>
                      {editingId === usuario.id ? (
                        <input
                          type="text"
                          value={editingNombre}
                          onChange={(e) => setEditingNombre(e.target.value)}
                          placeholder="Nombre"
                          style={styles.inlineInput}
                        />
                      ) : (
                        usuario.nombre || '-'
                      )}
                    </td>
                    <td style={styles.td}>
                      {editingId === usuario.id ? (
                        <input
                          type="text"
                          value={editingApellido}
                          onChange={(e) => setEditingApellido(e.target.value)}
                          placeholder="Apellido"
                          style={styles.inlineInput}
                        />
                      ) : (
                        usuario.apellido || '-'
                      )}
                    </td>
                    <td style={styles.td}>
                      {editingId === usuario.id ? (
                        <input
                          type="text"
                          value={editingCarnet}
                          onChange={(e) => setEditingCarnet(e.target.value)}
                          placeholder="Carnet"
                          style={styles.inlineInput}
                        />
                      ) : (
                        usuario.carnet || '-'
                      )}
                    </td>
                    <td style={styles.td}>
                      {editingId === usuario.id ? (
                        <select
                          value={editingRole}
                          onChange={(e) => setEditingRole(e.target.value)}
                          style={styles.inlineInput}
                        >
                          <option value="cliente">Cliente</option>
                          <option value="admin">Administrador</option>
                        </select>
                      ) : (
                        usuario.role || '-'
                      )}
                    </td>
                    <td style={styles.tdActions}>
                      {editingId === usuario.id ? (
                        <>
                          <button
                            onClick={() => handleUpdateUser(usuario.id)}
                            style={styles.saveButton}
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
                            style={styles.cancelButton}
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
                            style={styles.editButton}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteUser(usuario.id)}
                            style={styles.deleteButton}
                          >
                            Eliminar
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '1rem', color: '#555' }}>
                    No se encontraron usuarios que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: 'auto',
    fontFamily: 'Arial, sans-serif',
  },
  form: {
    background: '#f8f9fa',
    padding: '1.5rem',
    marginBottom: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  formGroup: {
    marginBottom: '1rem',
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #ccc',
    boxSizing: 'border-box',
  },
  addButton: {
    background: '#8B0000',
    color: '#fff',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '1rem',
    fontSize: '1rem',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease',
  },
  separator: { // Estilo para la línea divisoria
    border: '0',
    height: '1px',
    background: '#ccc',
    margin: '3rem 0',
  },
  searchContainer: {
    position: 'relative',
    marginBottom: '1.5rem',
    marginTop: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '0.5rem',
    background: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  searchIcon: {
    fontSize: '1.2rem',
    color: '#555',
    marginRight: '0.5rem',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    width: '100%',
    padding: '0.2rem 0',
    fontSize: '1rem',
  },
  tableWrapper: {
    overflowX: 'auto',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    borderRadius: '8px',
  },
  table: {
    width: '100%',
    tableLayout: 'fixed',
    borderCollapse: 'collapse',
    minWidth: '1000px',
  },
  th: {
    borderBottom: '2px solid #ddd',
    padding: '0.8rem',
    background: '#f1f1f1',
    whiteSpace: 'nowrap',
    textAlign: 'left',
  },
  passwordCol: {
    borderBottom: '2px solid #ddd',
    padding: '0.8rem',
    background: '#f1f1f1',
    width: '150px',
    position: 'relative',
    textAlign: 'left',
  },
  td: {
    borderBottom: '1px solid #ddd',
    padding: '0.6rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textAlign: 'left',
  },
  tdActions: {
    borderBottom: '1px solid #ddd',
    padding: '0.6rem',
    whiteSpace: 'nowrap',
    textAlign: 'left',
    width: '180px',
  },
  tableRow: { verticalAlign: 'middle' },
  passwordCell: { position: 'relative' },
  passwordText: { display: 'block', paddingRight: '2rem' },
  eyeIcon: {
    position: 'absolute',
    top: '50%',
    right: '0.5rem',
    transform: 'translateY(-50%)',
    cursor: 'pointer',
    fontSize: '1.1rem',
    color: '#555',
  },
  editButton: {
    background: '#28a745',
    color: '#fff',
    border: 'none',
    padding: '0.4rem 0.8rem',
    marginRight: '0.5rem',
    borderRadius: '6px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  saveButton: {
    background: '#007bff',
    color: '#fff',
    border: 'none',
    padding: '0.4rem 0.8rem',
    marginRight: '0.5rem',
    borderRadius: '6px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  cancelButton: {
    background: '#6c757d',
    color: '#fff',
    border: 'none',
    padding: '0.4rem 0.8rem',
    borderRadius: '6px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  deleteButton: {
    background: '#dc3545',
    color: '#fff',
    border: 'none',
    padding: '0.4rem 0.8rem',
    borderRadius: '6px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  inlineInput: {
    width: 'calc(100% - 10px)',
    padding: '0.3rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
    boxSizing: 'border-box',
  },
  loadingMessage: { // Estilo para el mensaje de carga
    textAlign: 'center',
    padding: '2rem',
    fontSize: '1.2rem',
    color: '#666',
  }
};

export default GestionUsuarios;