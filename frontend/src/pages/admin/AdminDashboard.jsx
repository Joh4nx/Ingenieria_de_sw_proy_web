import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Panel Admin</h2>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li>
              <Link to="/admin/platos">Gestión de Platos</Link>
            </li>
            <li>
              <Link to="/admin/reservas">Gestión de Reservas</Link>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="dashboard-content">
        <header className="dashboard-header">
          <h1>Panel de Administración</h1>
          <p>
            Bienvenido a tu panel. Utiliza el menú lateral para gestionar platos y reservas.
          </p>
        </header>
        <section className="dashboard-info">
          <p>Aquí se mostrará el contenido correspondiente a la opción elegida.</p>
        </section>
      </main>
      <style>{`
        /* Reset básico */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Roboto', sans-serif;
        }
        .admin-dashboard {
          display: flex;
          background: #f5f5f5;
          min-height: 100vh;
          padding-top: 80px; /* Espacio para el navbar fijo (si aplica) */
        }
        /* Sidebar vertical */
        .sidebar {
          width: 250px;
          background: #333;
          color: #fff;
          padding: 1rem;
          position: fixed;
          top: 80px;
          bottom: 0;
          left: 0;
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
          color: #f8f9fa;
          font-size: 1.1rem;
          font-weight: 600;
          transition: color 0.3s ease;
        }
        .sidebar-nav a:hover {
          color: #dc3545;
        }
        /* Contenido principal */
        .dashboard-content {
          margin-left: 250px;
          flex: 1;
          padding: 2rem;
        }
        .dashboard-header {
          text-align: center;
          margin-bottom: 2rem;
          background: #fff;
          padding: 1rem;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          max-width: 1200px;
          margin: 0 auto 2rem auto;
        }
        .dashboard-header h1 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          color: #333;
        }
        .dashboard-header p {
          font-size: 1.2rem;
          color: #666;
        }
        .dashboard-info {
          text-align: center;
          font-size: 1rem;
          color: #333;
        }
        /* Responsive */
        @media (max-width: 768px) {
          .admin-dashboard {
            flex-direction: column;
            padding-top: 0;
          }
          .sidebar {
            position: relative;
            width: 100%;
            top: 0;
            padding: 1rem 0;
          }
          .dashboard-content {
            margin-left: 0;
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
