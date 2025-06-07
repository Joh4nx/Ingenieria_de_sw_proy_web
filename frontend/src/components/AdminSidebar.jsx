// src/components/AdminSidebar.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';

const AdminSidebar = () => {
  const { user, updateUser } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // Función para cerrar menú mobile al hacer click en link
  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <button 
        className="mobile-menu-toggle"
        aria-label="Toggle sidebar menu"
        onClick={() => setIsMobileMenuOpen(prev => !prev)}
      >
        ☰
      </button>

      <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Panel Admin</h2>
        </div>
        <nav className="sidebar-nav">
          {hasAccesos ? (
            <ul>
              {accesos.platos && (
                <li>
                  <Link to="/admin/platos" onClick={handleLinkClick}>Gestión de Platos</Link>
                </li>
              )}
              {accesos.reservas && (
                <li>
                  <Link to="/admin/reservas" onClick={handleLinkClick}>Gestión de Reservas</Link>
                </li>
              )}
              {accesos.mesas && (
                <li>
                  <Link to="/admin/mesas" onClick={handleLinkClick}>Gestión de Mesas</Link>
                </li>
              )}
              {accesos.pedidos && (
                <li>
                  <Link to="/admin/pedidos" onClick={handleLinkClick}>Gestión de Pedidos</Link>
                </li>
              )}
              {accesos.inventario && (
                <li>
                  <Link to="/admin/inventario" onClick={handleLinkClick}>Gestión de Inventario</Link>
                </li>
              )}
              {accesos.usuarios && (
                <li>
                  <Link to="/admin/usuarios" onClick={handleLinkClick}>Gestión de Usuarios</Link>
                </li>
              )}
              {accesos.roles && (
                <li>
                  <Link to="/admin/roles" onClick={handleLinkClick}>Gestión de Roles</Link>
                </li>
              )}
              {accesos.cajero && (
                <li>
                  <Link to="/admin/cajero" onClick={handleLinkClick}>Caja</Link>
                </li>
              )}
              {accesos.reportes && (
                <li>
                  <Link to="/admin/reportes" onClick={handleLinkClick}>Reportes</Link>
                </li>
              )}
            </ul>
          ) : (
            <p style={{ color: '#ccc', textAlign: 'center' }}>
              No se encontraron permisos asignados.
            </p>
          )}
        </nav>
      </aside>

      <style>{`
        /* Botón para togglear menú en mobile */
        .mobile-menu-toggle {
          display: none;
          position: fixed;
          top: 10px;
          left: 10px;
          background: #8B0000;
          color: #FFF8F0;
          border: none;
          padding: 0.5rem 1rem;
          font-size: 1.5rem;
          z-index: 1100;
          cursor: pointer;
          border-radius: 4px;
        }

        /* Sidebar base */
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          width: 250px;
          background: #8B0000;
          color: #FFF8F0;
          padding: 1rem;
          overflow-y: auto;
          box-sizing: border-box;
          z-index: 1000;
          transition: transform 0.3s ease;
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

        /* --- Responsive --- */

        @media (max-width: 1450px) {
          .mobile-menu-toggle {
            display: block;
          }

          .sidebar {
            transform: translateX(-100%);
            box-shadow: 2px 0 5px rgba(0,0,0,0.3);
          }
          .sidebar.open {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
};

export default AdminSidebar;
