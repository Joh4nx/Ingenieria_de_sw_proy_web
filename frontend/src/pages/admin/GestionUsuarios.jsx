// src/pages/admin/GestionUsuarios.jsx
import React, { useState, useEffect } from 'react';
import { ref, onValue, set, remove } from 'firebase/database';
import { db, firebaseConfig } from '../../services/firebase';

import {
  initializeApp as initializeSecondaryApp,
  deleteApp as deleteSecondaryApp
} from 'firebase/app';

import {
  getAuth as getAuthSecondary,
  createUserWithEmailAndPassword,
  signOut as signOutSecondary
} from 'firebase/auth';

import { FiEye, FiEyeOff, FiSearch } from 'react-icons/fi';

// — Genera la contraseña: primera letra del nombre + "." + carnet —
const generatePassword = (nombre, carnet) => {
  if (!nombre || !carnet) return '';
  return `${nombre.trim().toLowerCase()[0]}.${carnet.trim()}`;
};

// — Accesos iniciales para un admin (todos false) —
const adminAccesosInicial = {
  platos: false,
  reservas: false,
  mesas: false,
  pedidos: false,
  inventario: false,
  usuarios: false,
  roles: false,
  cajero: false,
  reportes: false,
};

const GestionUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  // — Estados para “Agregar usuario” —
  const [newUserNombre, setNewUserNombre] = useState('');
  const [newUserApellido, setNewUserApellido] = useState('');
  const [newUserCarnet, setNewUserCarnet] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('cliente');

  // — Estados para edición —
  const [editingId, setEditingId] = useState(null);
  const [editingNombre, setEditingNombre] = useState('');
  const [editingApellido, setEditingApellido] = useState('');
  const [editingCarnet, setEditingCarnet] = useState('');
  const [editingEmail, setEditingEmail] = useState('');
  const [editingRole, setEditingRole] = useState('');
  const [showPasswords, setShowPasswords] = useState({});

  // — Búsqueda —
  const [searchTerm, setSearchTerm] = useState('');

  // — Banner emergente (modal) —
  const [banner, setBanner] = useState({ message: '', type: '' });

  // — Confirmar eliminación via modal —
  const [confirmDeleteUser, setConfirmDeleteUser] = useState(null);

  // — Muestra el banner en el centro como modal —
  const showBanner = (message, type = 'success', duration = 5000) => {
    setBanner({ message, type });
    setTimeout(() => {
      setBanner({ message: '', type: '' });
    }, duration);
  };

  // — Escucha lista de usuarios en RTDB —
  useEffect(() => {
    const usuariosRef = ref(db, 'usuarios');
    const unsubscribe = onValue(usuariosRef, (snapshot) => {
      const data = snapshot.val();
      const usuariosArray = data
        ? Object.entries(data).map(([id, perfil]) => ({ id, ...perfil }))
        : [];
      setUsuarios(usuariosArray);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // — Agregar nuevo usuario (Auth + RTDB) —
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (
      !newUserNombre.trim() ||
      !newUserApellido.trim() ||
      !newUserCarnet.trim() ||
      !newUserEmail.trim()
    ) {
      showBanner('Por favor ingrese Nombre, Apellido, Carnet y Email.', 'error');
      return;
    }

    const password = generatePassword(newUserNombre, newUserCarnet);

    try {
      // 1) Crear un app secundario para no cerrar la sesión actual
      const secondaryApp = initializeSecondaryApp(firebaseConfig, 'secondary');
      const secondaryAuth = getAuthSecondary(secondaryApp);

      // 2) Crear la cuenta en Firebase Auth
      const cred = await createUserWithEmailAndPassword(
        secondaryAuth,
        newUserEmail.trim(),
        password
      );
      const uid = cred.user.uid;

      // 3) Preparar perfil para RTDB
      const perfil = {
        nombre: newUserNombre.trim(),
        apellido: newUserApellido.trim(),
        carnet: newUserCarnet.trim(),
        email: newUserEmail.trim(),
        password, // solo para mostrar
        role: newUserRole,
        accesos: newUserRole === 'admin' ? { ...adminAccesosInicial } : {},
      };

      // 4) Guardar en RTDB
      await set(ref(db, `usuarios/${uid}`), perfil);

      // 5) Cerrar la sesión del app secundario y eliminarlo
      await signOutSecondary(secondaryAuth);
      await deleteSecondaryApp(secondaryApp);

      // 6) Limpiar formulario
      setNewUserNombre('');
      setNewUserApellido('');
      setNewUserCarnet('');
      setNewUserEmail('');
      setNewUserRole('cliente');

      showBanner(
        `Usuario creado con éxito.\nEmail: ${newUserEmail.trim()}\nContraseña: ${password}`,
        'success'
      );
    } catch (err) {
      console.error('Error al agregar usuario:', err);
      let msg = 'Error al crear usuario.';
      if (err.code === 'auth/email-already-in-use') {
        msg =
          'El email ya está en uso. Para volver a crearlo, elimínalo primero desde Firebase Auth.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'El email no es válido.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'La contraseña generada es demasiado débil.';
      }
      showBanner(msg, 'error');
    }
  };

  // — Actualizar usuario (solo en RTDB) —
  const handleUpdateUser = async (id) => {
    if (
      !editingNombre.trim() ||
      !editingApellido.trim() ||
      !editingCarnet.trim() ||
      !editingEmail.trim() ||
      !editingRole.trim()
    ) {
      showBanner('Por favor, ingrese todos los datos correctamente.', 'error');
      return;
    }

    try {
      const password = generatePassword(editingNombre, editingCarnet);

      // Solo actualizamos en RTDB
      await set(ref(db, `usuarios/${id}`), {
        nombre: editingNombre.trim(),
        apellido: editingApellido.trim(),
        carnet: editingCarnet.trim(),
        email: editingEmail.trim(),
        password,
        role: editingRole,
        accesos:
          editingRole === 'admin'
            ? usuarios.find((u) => u.id === id)?.accesos || { ...adminAccesosInicial }
            : {},
      });

      // Reset campos de edición
      setEditingId(null);
      setEditingNombre('');
      setEditingApellido('');
      setEditingCarnet('');
      setEditingEmail('');
      setEditingRole('');

      showBanner(
        `Usuario actualizado.\nEmail: ${editingEmail.trim()}\nContraseña: ${password}`,
        'success'
      );
    } catch (err) {
      console.error('Error al actualizar usuario:', err);
      showBanner('Error al actualizar usuario.', 'error');
    }
  };

  // — Mostrar ventana de confirmación centrada —
  const promptDeleteUser = (id, email) => {
    setConfirmDeleteUser({ id, email });
    setBanner({ message: '', type: '' }); // ocultar banner previo
  };

  // — Cancelar eliminación —
  const cancelDelete = () => {
    setConfirmDeleteUser(null);
  };

  // — Eliminar usuario (solo RTDB) —
  const confirmDelete = async () => {
    try {
      await remove(ref(db, `usuarios/${confirmDeleteUser.id}`));
      setConfirmDeleteUser(null);
      showBanner('Usuario eliminado correctamente.', 'success');
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
      showBanner('Error al eliminar usuario.', 'error');
    }
  };

  // — Alternar visibilidad de contraseña —
  const toggleShowPassword = (id) => {
    setShowPasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // — Filtrar usuarios según búsqueda —
  const filteredUsuarios = usuarios.filter((usuario) => {
    const term = searchTerm.toLowerCase();
    const nombre = usuario.nombre || '';
    const apellido = usuario.apellido || '';
    const email = usuario.email || '';
    const carnet = usuario.carnet || '';
    const role = usuario.role || '';
    return (
      nombre.toLowerCase().includes(term) ||
      apellido.toLowerCase().includes(term) ||
      email.toLowerCase().includes(term) ||
      carnet.toLowerCase().includes(term) ||
      role.toLowerCase().includes(term)
    );
  });

  return (
    <div style={styles.container}>
      {/* ——— Banner modal (centrado) ——— */}
      {banner.message && (
        <div style={styles.modalOverlay}>
          <div
            style={{
              ...styles.modalBox,
              ...(banner.type === 'success'
                ? styles.modalSuccess
                : styles.modalError),
            }}
          >
            <p style={styles.modalText}>{banner.message}</p>
          </div>
        </div>
      )}

      {/* ——— Confirmación de eliminación (modal) ——— */}
      {confirmDeleteUser && (
        <div style={styles.modalOverlay}>
          <div style={styles.confirmModalBox}>
            <p style={styles.confirmModalText}>
              ¿Eliminar al usuario <strong>{confirmDeleteUser.email}</strong>?
            </p>
            <div style={styles.confirmModalButtons}>
              <button onClick={confirmDelete} style={styles.confirmBtnYes}>
                Sí, eliminar
              </button>
              <button onClick={cancelDelete} style={styles.confirmBtnNo}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <h2>Gestión de Usuarios</h2>

      {/* ——— Formulario para agregar usuario ——— */}
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
          <label>Email:</label>
          <input
            type="email"
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
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

      <hr style={styles.separator} />

      {/* ——— Barra de búsqueda ——— */}
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

      {/* ——— Tabla de usuarios ——— */}
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
                        {showPasswords[usuario.id]
                          ? usuario.password || '-'
                          : '••••••••'}
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
                        <input
                          type="email"
                          value={editingEmail}
                          onChange={(e) => setEditingEmail(e.target.value)}
                          placeholder="Email"
                          style={styles.inlineInput}
                        />
                      ) : (
                        usuario.email || '-'
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
                              setEditingEmail('');
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
                              setEditingEmail(usuario.email || '');
                              setEditingRole(usuario.role || 'cliente');
                            }}
                            style={styles.editButton}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() =>
                              promptDeleteUser(usuario.id, usuario.email)
                            }
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
                  <td
                    colSpan="7"
                    style={{ textAlign: 'center', padding: '1rem', color: '#555' }}
                  >
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
    position: 'relative',
  },
  // — Overlay fondo semi-transparente —
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  },
  // — Caja central del banner —
  modalBox: {
    maxWidth: '350px',
    padding: '1.5rem',
    borderRadius: '8px',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  },
  modalSuccess: {
    backgroundColor: '#4CAF50',
    color: 'white',
  },
  modalError: {
    backgroundColor: '#f44336',
    color: 'white',
  },
  modalText: {
    margin: 0,
    whiteSpace: 'pre-line',
    fontSize: '1rem',
    lineHeight: '1.4',
  },

  // — Confirmación de eliminación (modal) —
  confirmModalBox: {
    maxWidth: '350px',
    padding: '1.5rem',
    borderRadius: '8px',
    backgroundColor: '#fff',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  },
  confirmModalText: {
    margin: 0,
    fontSize: '1rem',
    lineHeight: '1.4',
    color: '#333',
  },
  confirmModalButtons: {
    marginTop: '1rem',
    display: 'flex',
    justifyContent: 'space-around',
  },
  confirmBtnYes: {
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  confirmBtnNo: {
    backgroundColor: '#6c757d',
    color: '#fff',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
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
  separator: {
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
  tableRow: {
    verticalAlign: 'middle',
  },
  passwordCell: {
    position: 'relative',
  },
  passwordText: {
    display: 'block',
    paddingRight: '2rem',
  },
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
  loadingMessage: {
    textAlign: 'center',
    padding: '2rem',
    fontSize: '1.2rem',
    color: '#666',
  },
};

export default GestionUsuarios;
