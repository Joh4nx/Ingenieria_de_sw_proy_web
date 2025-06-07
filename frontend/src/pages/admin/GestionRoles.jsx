import React, { useState, useEffect } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css'; // Importar Bootstrap

const defaultAccesos = {
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

const GestionRoles = () => {
  const { user, updateUser } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modificaciones, setModificaciones] = useState({});
  const [selectedRole, setSelectedRole] = useState('todos');

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

  useEffect(() => {
    if (user && user.role === 'admin') {
      const usuariosRef = ref(db, 'usuarios');
      const unsubscribe = onValue(usuariosRef, (snapshot) => {
        const data = snapshot.val();
        const usuariosArray = data
          ? Object.entries(data).map(([id, usuario]) => ({ id, ...usuario }))
          : [];
        setUsuarios(usuariosArray);
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

  const toggleAcceso = (userId, key) => {
    setModificaciones((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], [key]: !prev[userId][key] },
    }));
  };

  const handleSaveAccesos = async (userId) => {
    try {
      await update(ref(db, `usuarios/${userId}`), { accesos: modificaciones[userId] });
      showNotification('Accesos actualizados para el usuario', 'success');

      if (user && user.id === userId) {
        const updatedUser = { ...user, accesos: modificaciones[userId] };
        updateUser(updatedUser);
      }
    } catch (error) {
      console.error('Error al actualizar accesos', error);
      showNotification('Error al actualizar accesos', 'error');
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="container py-5 text-center">
        <h2>Acceso Restringido</h2>
        <p>Solo administradores pueden gestionar los accesos de usuarios.</p>
      </div>
    );
  }

  const usuariosFiltrados =
    selectedRole === 'todos'
      ? usuarios
      : usuarios.filter((u) => u.role === selectedRole);

  return (
    <div className="container py-4" style={{ color: 'black', fontFamily: 'Arial, sans-serif' }}>
      {/* Componente de Notificación */}
      <CustomNotification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: '', type: '' })}
      />

      <h2 className="mb-4">Gestión de Accesos de Usuarios</h2>
      <div className="mb-3 d-flex align-items-center gap-2">
        <label htmlFor="filterRole" className="fw-bold mb-0">
          Filtrar por rol:
        </label>
        <select
          id="filterRole"
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="form-select w-auto"
          style={{ borderColor: '#8B0000' }}
        >
          <option value="todos">Todos</option>
          <option value="admin">Administrador</option>
          <option value="cliente">Cliente</option>
        </select>
      </div>

      {loading ? (
        <p className="text-center">Cargando usuarios...</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered align-middle" style={{ borderColor: '#8B0000' }}>
            <thead className="table-light" style={{ backgroundColor: '#8B0000', color: 'black' }}>
              <tr>
                <th scope="col" className="text-center">Usuario (Email)</th>
                {Object.keys(defaultAccesos).map((key) => (
                  <th key={key} className="text-center text-capitalize">{key}</th>
                ))}
                <th scope="col" className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map((u) => (
                <tr key={u.id}>
                  <td>{u.email || 'Sin Email'}</td>
                  {Object.keys(defaultAccesos).map((key) => (
                    <td key={key} className="text-center">
                      <input
                        type="checkbox"
                        checked={modificaciones[u.id] ? modificaciones[u.id][key] : false}
                        onChange={() => toggleAcceso(u.id, key)}
                        style={{
                          width: '18px',
                          height: '18px',
                          cursor: 'pointer',
                          accentColor: '#8B0000', // Checkbox color rojo oscuro
                        }}
                      />
                    </td>
                  ))}
                  <td className="text-center">
                    <button
                      onClick={() => handleSaveAccesos(u.id)}
                      className="btn"
                      style={{
                        backgroundColor: '#8B0000',
                        color: 'white',
                        fontWeight: '600',
                        padding: '6px 12px',
                        border: '1px solid #8B0000',
                        transition: 'background-color 0.3s',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#A00000';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#8B0000';
                      }}
                    >
                      Guardar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GestionRoles;