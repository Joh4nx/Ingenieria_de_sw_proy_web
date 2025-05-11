// src/pages/admin/AdminLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import NavbarAdmin from '../../components/NavbarAdmin';
import AdminSidebar from '../../components/AdminSidebar'; // Asegúrate de que el componente exista y la ruta sea correcta

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      <NavbarAdmin />  {/* Navbar superior */}
      <div className="admin-body">
        <AdminSidebar /> {/* Sidebar lateral */}
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
      <style>{`
        /* Container general */
        .admin-layout {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background: #f5f5f5;
        }
        /* Contenedor que agrupa sidebar y contenido */
        .admin-body {
          display: flex;
          flex: 1;
          margin-top: 80px; /* Espacio para el navbar fijo */
        }
        /* Sidebar: puedes ajustar el ancho según necesites */
        .admin-body > .sidebar,
        .admin-body > aside {
          width: 250px;
          background: #333;
          color: #fff;
        }
        /* Contenido principal */
        .admin-content {
          flex: 1;
          padding: 2rem;
        }
        /* Responsive: para pantallas pequeñas */
        @media (max-width: 768px) {
          .admin-body {
            flex-direction: column;
          }
          .admin-body > .sidebar,
          .admin-body > aside {
            width: 100%;
          }
          .admin-content {
            margin-top: 0;
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
