import React, { useState, useEffect } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css'; // Importar Bootstrap
import { Modal, Button, Form } from 'react-bootstrap'; // Importar componentes de Modal, Button y Form de react-bootstrap

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

// Definición de accesos por rol
const accesosPorRol = {
  mesero: {
    platos: true,
    reservas: false,
    mesas: true,
    pedidos: true,
    inventario: true,
    usuarios: false,
    roles: false,
    cajero: false,
    reportes: false,
  },
  recepcionista: {
    platos: false,
    reservas: true,
    mesas: true,
    pedidos: false,
    inventario: false,
    usuarios: false,
    roles: false,
    cajero: true,
    reportes: false,
  },
  cocinero: {
    platos: true,
    reservas: false,
    mesas: false,
    pedidos: true,
    inventario: true,
    usuarios: false,
    roles: false,
    cajero: false,
    reportes: false,
  },
  administrador: {
    platos: true,
    reservas: true,
    mesas: true,
    pedidos: true,
    inventario: true,
    usuarios: true,
    roles: true,
    cajero: true,
    reportes: true,
  },
  gerente: {
    platos: false, // Gerente: todo menos platos
    reservas: false, // Gerente: todo menos reservas
    mesas: true,
    pedidos: false, // Gerente: todo menos pedidos
    inventario: true,
    usuarios: true,
    roles: true,
    cajero: false, // Gerente: todo menos cajero
    reportes: true,
  },
  // Cliente se mantiene como estaba, o puedes definirle accesos específicos si es necesario
  cliente: { ...defaultAccesos }, // Por defecto, el cliente no tiene accesos administrativos
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

// Componente del Modal de Detalles de Roles
const RoleDetailsModal = ({ show, handleClose }) => {
  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton style={{ backgroundColor: '#8B0000', color: 'white' }}>
        <Modal.Title>Detalles de Permisos por Rol</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ color: 'black' }}>
        <p>Aquí puedes ver qué módulos se habilitan automáticamente para cada rol:</p>
        <ul>
          <li>
            <strong>Mesero:</strong> Mesas, Inventario, Pedidos, Platos
          </li>
          <li>
            <strong>Recepcionista:</strong> Cajero, Mesas, Reservas
          </li>
          <li>
            <strong>Cocinero:</strong> Pedidos, Inventario, Platos
          </li>
          <li>
            <strong>Administrador:</strong> Todos los módulos
          </li>
          <li>
            <strong>Gerente:</strong> Todos los módulos excepto Reservas, Pedidos, Cajero, Platos
          </li>
        </ul>
        <p className="small text-muted">Recuerda que los permisos pueden ser ajustados manualmente después de seleccionar un rol.</p>
      </Modal.Body>
      <Modal.Footer>
        <Button
          onClick={handleClose}
          style={{
            backgroundColor: '#8B0000',
            color: 'white',
            border: 'none',
          }}
        >
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const GestionRoles = () => {
  const { user, updateUser } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modificaciones, setModificaciones] = useState({});
  const [selectedFilterRole, setSelectedFilterRole] = useState('todos');
  const [filterEmail, setFilterEmail] = useState('');
  const [showRoleDetailsModal, setShowRoleDetailsModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false); // Estado para el modal de email
  const [selectedEmail, setSelectedEmail] = useState(''); // Estado para el email a mostrar en el modal

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
          if (!u.role) {
            u.role = 'cliente';
          }
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

  const handleRoleChange = (userId, newRole) => {
    setUsuarios((prevUsuarios) =>
      prevUsuarios.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );

    const newAccesos = accesosPorRol[newRole] || { ...defaultAccesos };
    setModificaciones((prev) => ({
      ...prev,
      [userId]: { ...newAccesos },
    }));
  };

  const handleSaveAccesos = async (userId) => {
    try {
      const usuarioAActualizar = usuarios.find(u => u.id === userId);
      const dataToUpdate = {
        accesos: modificaciones[userId],
        role: usuarioAActualizar.role
      };
      await update(ref(db, `usuarios/${userId}`), dataToUpdate);
      showNotification('Accesos y rol actualizados para el usuario', 'success');

      if (user && user.id === userId) {
        const updatedUser = { ...user, accesos: modificaciones[userId], role: usuarioAActualizar.role };
        updateUser(updatedUser);
      }
    } catch (error) {
      console.error('Error al actualizar accesos y rol', error);
      showNotification('Error al actualizar accesos y rol', 'error');
    }
  };

  // Función para mostrar el modal de email al hacer doble clic
  const handleDoubleClickEmail = (email) => {
    setSelectedEmail(email);
    setShowEmailModal(true);
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="container py-5 text-center">
        <h2>Acceso Restringido</h2>
        <p>Solo administradores pueden gestionar los accesos de usuarios.</p>
      </div>
    );
  }

  const usuariosFiltrados = usuarios.filter((u) => {
    const matchesRole = selectedFilterRole === 'todos' || u.role === selectedFilterRole;
    const matchesEmail = u.email && u.email.toLowerCase().includes(filterEmail.toLowerCase());
    return matchesRole && matchesEmail;
  });

  return (
    <div className="container py-4" style={{ color: 'black', fontFamily: 'Arial, sans-serif' }}>
      {/* Componente de Notificación */}
      <CustomNotification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: '', type: '' })}
      />

      {/* Modal de Detalles de Roles */}
      <RoleDetailsModal
        show={showRoleDetailsModal}
        handleClose={() => setShowRoleDetailsModal(false)}
      />

      {/* Modal para mostrar el email completo */}
      <Modal show={showEmailModal} onHide={() => setShowEmailModal(false)} centered>
        <Modal.Header closeButton style={{ backgroundColor: '#8B0000', color: 'white' }}>
          <Modal.Title>Email del Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ color: 'black', wordBreak: 'break-all' }}>
          {selectedEmail}
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => setShowEmailModal(false)}
            style={{
              backgroundColor: '#8B0000',
              color: 'white',
              border: 'none',
            }}
          >
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      <h2 className="mb-4">Gestión de Accesos de Usuarios</h2>

      {/* Controles de Filtro */}
      <div className="mb-3 d-flex flex-wrap align-items-center gap-3">
        <div className="d-flex align-items-center gap-2">
          <label htmlFor="filterRole" className="fw-bold mb-0">
            Filtrar por rol:
          </label>
          <select
            id="filterRole"
            value={selectedFilterRole}
            onChange={(e) => setSelectedFilterRole(e.target.value)}
            className="form-select w-auto"
            style={{ borderColor: '#8B0000' }}
          >
            <option value="todos">Todos</option>
            <option value="admin">Administrador</option>
            <option value="mesero">Mesero</option>
            <option value="recepcionista">Recepcionista</option>
            <option value="cocinero">Cocinero</option>
            <option value="gerente">Gerente</option>
            <option value="cliente">Cliente</option>
          </select>
        </div>

        <div className="d-flex align-items-center gap-2 flex-grow-1 flex-md-grow-0">
          <label htmlFor="filterEmail" className="fw-bold mb-0">
            Filtrar por Email:
          </label>
          <Form.Control
            type="text"
            id="filterEmail"
            placeholder="Buscar por email..."
            value={filterEmail}
            onChange={(e) => setFilterEmail(e.target.value)}
            className="w-auto"
            style={{ borderColor: '#8B0000' }}
          />
        </div>
        
        {/* Botón de Detalles para el modal */}
        <Button
          onClick={() => setShowRoleDetailsModal(true)}
          className="btn-info rounded-circle d-flex align-items-center justify-content-center"
          style={{
            width: '30px',
            height: '30px',
            padding: '0',
            fontSize: '1rem',
            backgroundColor: '#8B0000',
            borderColor: '#8B0000',
          }}
          title="Ver detalles de permisos por rol"
        >
          ?
        </Button>
      </div>

      {loading ? (
        <p className="text-center">Cargando usuarios...</p>
      ) : (
        // Contenedor para el scroll de la tabla
        <div className="table-responsive" style={{ maxHeight: 'calc(100vh - 250px)', overflowY: 'auto' }}>
          <table className="table table-bordered align-middle" style={{ borderColor: '#8B0000' }}>
            <thead className="table-light" style={{ backgroundColor: '#8B0000', color: 'white', position: 'sticky', top: '0', zIndex: '1' }}>
              <tr>
                <th scope="col" className="text-center" style={{ width: '200px', minWidth: '150px' }}>Usuario (Email)</th> {/* Ancho fijo */}
                <th scope="col" className="text-center" style={{ width: '120px', minWidth: '100px' }}>Rol</th>
                {Object.keys(defaultAccesos).map((key) => (
                  <th key={key} className="text-center text-capitalize">{key}</th>
                ))}
                <th scope="col" className="text-center" style={{ width: '100px', minWidth: '80px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map((u) => (
                <tr key={u.id}>
                  <td
                    style={{
                      whiteSpace: 'nowrap', // Evita el salto de línea
                      overflow: 'hidden',   // Oculta el texto que desborda
                      textOverflow: 'ellipsis', // Muestra puntos suspensivos
                      maxWidth: '200px',      // Limita el ancho de la celda
                      cursor: 'pointer'       // Indica que es clickeable
                    }}
                    onDoubleClick={() => handleDoubleClickEmail(u.email || 'Sin Email')}
                    title={u.email || 'Sin Email'} // Muestra el email completo al pasar el mouse
                  >
                    {u.email || 'Sin Email'}
                  </td>
                  <td className="text-center">
                    <select
                      value={u.role || 'cliente'}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="form-select form-select-sm"
                      style={{ borderColor: '#8B0000' }}
                    >
                      <option value="cliente">Cliente</option>
                      <option value="mesero">Mesero</option>
                      <option value="recepcionista">Recepcionista</option>
                      <option value="cocinero">Cocinero</option>
                      <option value="administrador">Administrador</option>
                      <option value="gerente">Gerente</option>
                    </select>
                  </td>
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
                          accentColor: '#8B0000',
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