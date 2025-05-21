// src/components/AdminSidebar.jsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';

const AdminSidebar = () => {
  const { user, updateUser } = useAuth();

  useEffect(() => {
    let timer;
    if (user && user.id) {
      const userRef = ref(db, `usuarios/${user.id}`);
      const unsubscribe = onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data && JSON.stringify(data.accesos) !== JSON.stringify(user.accesos)) {
          clearTimeout(timer);
          timer = setTimeout(() => {
            const updatedUser = { ...data, id: user.id };
            updateUser(updatedUser);
          }, 500);
        }
      });
      return () => {
        clearTimeout(timer);
        unsubscribe();
      };
    }
  }, [user, updateUser]);

  const accesos = user?.accesos || {};
  const hasAccesos = Object.values(accesos).some(value => value === true);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Panel Admin</h2>
      </div>
      <nav className="sidebar-nav">
        {hasAccesos ? (
          <ul>
            {accesos.platos && (
              <li>
                <Link to="/admin/platos">Gestión de Platos</Link>
              </li>
            )}
            {accesos.reservas && (
              <li>
                <Link to="/admin/reservas">Gestión de Reservas</Link>
              </li>
            )}
            {accesos.mesas && (
              <li>
                <Link to="/admin/mesas">Gestión de Mesas</Link>
              </li>
            )}
            {accesos.pedidos && (
              <li>
                <Link to="/admin/pedidos">Gestión de Pedidos</Link>
              </li>
            )}
            {accesos.inventario && (
              <li>
                <Link to="/admin/inventario">Gestión de Inventario</Link>
              </li>
            )}
            {accesos.usuarios && (
              <li>
                <Link to="/admin/usuarios">Gestión de Usuarios</Link>
              </li>
            )}
            {accesos.roles && (
              <li>
                <Link to="/admin/roles">Gestión de Roles</Link>
              </li>
            )}
            {accesos.cajero && (
              <li>
                <Link to="/admin/cajero">Caja</Link>
              </li>
            )}
            {accesos.reportes && (
              <li>
                <Link to="/admin/reportes">Reportes</Link>
              </li>
            )}
          </ul>
        ) : (
          <p style={{ color: '#ccc', textAlign: 'center' }}>
            No se encontraron permisos asignados.
          </p>
        )}
      </nav>
      <style>{`
        .sidebar {
          width: 250px;
          background: #8B0000;
          color: #FFF8F0;
          padding: 1rem;
        }
        .sidebar-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .sidebar-header h2 {
          font-size: 1.5rem;
        }
        .sidebar-nav ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .sidebar-nav li {
          margin-bottom: 1.5rem;
        }
        .sidebar-nav a {
          text-decoration: none;
          color: #FFF8F0;
          font-size: 1.1rem;
          font-weight: 600;
          transition: color 0.3s ease;
        }
        .sidebar-nav a:hover {
          color: #D4AF37;
        }
      `}</style>
    </aside>
  );
};

export default AdminSidebar;
