// src/components/NavbarAdmin.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const NavbarAdmin = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => setMenuOpen(prev => !prev);
  const closeMenu = () => {
    setMenuOpen(false);
    setDropdownOpen(false);
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setDropdownOpen(prev => !prev);
  };

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/');
  };

  return (
    <nav className="navbar-admin" role="navigation" aria-label="Navegación administrativa">
      <div className="navbarWrapper">
        {/* Columna izquierda para imagen SVG decorativa */}
        
        {/* Contenido de navegación */}
        <div className="navbarRight">
          <div className="navbarContainer">
            <Link to="/admin" className="navbarBrand" onClick={closeMenu}>
              <img src="/legolas.svg" alt="Logo de El Gusto de Don Justo" />
              <span className="brandText">Admin Panel</span>
            </Link>

            <ul className={`navMenu ${menuOpen ? 'active' : ''}`}
            style={{
    display: 'flex',
    
    justifyContent: 'center', // centra verticalmente
    alignItems: 'center',     // centra horizontalmente (opcional)
            // ocupar toda la altura de la ventana para centrar verticalmente
    padding: 0,
    margin: 0,
    listStyle: 'none',
    
  }}>
              <li className="navItem"><Link to="/admin" className="navLink" onClick={closeMenu}>Inicio</Link></li>
              <li className="navItem"><Link to="/admin/platos" className="navLink" onClick={closeMenu}>Platos</Link></li>
              <li className="navItem"><Link to="/admin/reservas" className="navLink" onClick={closeMenu}>Reservas</Link></li>
              <li className="navItem">
                {user ? (
                  <div className="user-profile" onClick={toggleDropdown}>
                    <img src={user.avatar || '/default-avatar.png'} alt={user.nombre} className="user-avatar" />
                    <span className="user-name">{user.nombre}</span>
                    {dropdownOpen && (
                      <div className="profile-dropdown">
                        <Link to="/perfil" onClick={closeMenu} className="dropdown-link">Ver Perfil</Link>
                        <Link to="/configuraciones" onClick={closeMenu} className="dropdown-link">Configuraciones</Link>
                        <button onClick={handleLogout} className="dropdown-link logout">Cerrar Sesión</button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link to="/login" className="navLink login" onClick={closeMenu}>
                    <FiUser size={20} />
                  </Link>
                )}
              </li>
            </ul>

            <button className={`menuToggle ${menuOpen ? 'active' : ''}`} onClick={toggleMenu} aria-label="Toggle navigation">
              <span className="bar"></span>
              <span className="bar"></span>
              <span className="bar"></span>
            </button>
          </div>
        </div>
      </div>

      {/* Estilos actualizados */}
      <style>{`
        :root {
          --navbar-bg: rgba(0, 0, 0, 0.95);
          --text-color: #f8f9fa;
          --accent-color: #dc3545;
          --transition-speed: 0.3s;
        }

        .navbar-admin {
          width: 100%;
          background: var(--navbar-bg);
          position: fixed;
          top: 0;
          z-index: 1000;
          backdrop-filter: blur(10px);
        }

        .navbarWrapper {
          display: flex;
          width: 100%;
        }

        .navbarLeft {
          flex: 0 0 80px;
          background: rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem;
        }

        .svg-decorativo {
          width: 48px;
          height: 48px;
        }

        .navbarRight {
          flex: 1;
        }

        .navbarContainer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .navbarBrand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
        }

        .navbarBrand img {
          height: 40px;
        }

        .brandText {
          color: var(--text-color);
          font-size: 1.2rem;
          font-weight: 600;
        }

        .navMenu {
          display: flex;
          gap: 2rem;
          
          list-style: none;
        }

        .navLink {
          color: var(--text-color);
          text-decoration: none;
          position: relative;
          font-weight: 500;
        }

        .navLink::after {
          content: '';
          position: absolute;
          bottom: -3px;
          left: 0;
          width: 0;
          height: 2px;
          background: var(--accent-color);
          transition: width var(--transition-speed);
        }

        .navLink:hover::after {
          width: 100%;
        }

        .navLink.login {
          padding: 0.5rem 1rem;
          background: var(--accent-color);
          border-radius: 999px;
          display: flex;
          align-items: center;
          color: white;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border: 1px solid var(--accent-color);
          border-radius: 999px;
          cursor: pointer;
          position: relative;
        }

        .user-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          object-fit: cover;
        }

        .user-name {
          color: var(--text-color);
        }

        .profile-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 0.25rem;
          background: var(--navbar-bg);
          border: 1px solid var(--accent-color);
          border-radius: 8px;
          min-width: 150px;
          overflow: hidden;
          z-index: 9999;
        }

        .profile-dropdown .dropdown-link {
          display: block;
          padding: 0.5rem 1rem;
          color: var(--text-color);
          text-decoration: none;
          font-size: 0.95rem;
        }

        .profile-dropdown .dropdown-link:hover {
          background: rgba(255,255,255,0.1);
        }

        .menuToggle {
          display: none;
          background: none;
          border: none;
        }

        .bar {
          width: 25px;
          height: 3px;
          background: var(--text-color);
          margin: 4px 0;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .menuToggle {
            display: block;
          }

          .navMenu {
            position: absolute;
            top: 100%;
            right: 0;
            background: var(--navbar-bg);
            flex-direction: column;
            width: 100%;
            text-align: center;
            display: none;
          }

          .navMenu.active {
            display: flex;
          }

          .navItem {
            margin: 0.5rem 0;
          }
        }
      `}</style>
    </nav>
  );
};

export default NavbarAdmin;
