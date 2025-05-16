// src/components/NavbarCliente.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext'; // Ajusta la ruta según tu estructura

const NavbarCliente = () => {
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
    // Evita que se cierre el menú responsive al hacer click en el perfil
    e.stopPropagation();
    setDropdownOpen(prev => !prev);
  };

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/');
  };

  return (
    <nav className="navbar" role="navigation" aria-label="Navegación principal">
      <div className="navbarContainer">
        <Link to="/" className="navbarBrand" onClick={closeMenu}>
          <img src="/logo.png" alt="Logo de El Gusto de Don Justo" />
          <span className="brandText">El Gusto de Don Justo</span>
        </Link>
        <ul className={`navMenu ${menuOpen ? 'active' : ''}`}>
          <li className="navItem">
            <Link to="/" className="navLink" onClick={closeMenu}>Inicio</Link>
          </li>
          <li className="navItem">
            <Link to="/menu" className="navLink" onClick={closeMenu}>Menú</Link>
          </li>
          <li className="navItem">
            <Link to="/reservas" className="navLink" onClick={closeMenu}>Reservas</Link>
          </li>
          <li className="navItem">
            <Link to="/pedidos" className="navLink" onClick={closeMenu}>Pedidos</Link>
          </li>
          {/* Opción Acerca de Nosotros */}
          <li className="navItem">
            <Link to="/about" className="navLink" onClick={closeMenu}>Acerca de Nosotros</Link>
          </li>
          <li className="navItem">
            {user ? (
              <div className="user-profile" onClick={toggleDropdown}>
                <img 
                  src={user.avatar || '/default-avatar.png'} 
                  alt={user.nombre} 
                  className="user-avatar" 
                />
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
      <style>{`
        :root {
          --navbar-bg: #8B0000;
          --text-color: #f8f9fa;
          --accent-color: #dc3545;
          --transition-speed: 0.3s;
        }
        .navbar {
          background: var(--navbar-bg);
          position: fixed;
          width: 100%;
          top: 0;
          z-index: 1000;
          backdrop-filter: blur(8px);
          padding: 0.5rem 0;
        }
        .navbarContainer {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 1.5rem;
        }
        .navbarBrand {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          text-decoration: none;
          transition: opacity var(--transition-speed);
        }
        .navbarBrand:hover {
          opacity: 0.9;
        }
        .navbarBrand img {
          height: 50px;
          width: auto;
          max-width: 100%;
        }
        .brandText {
          color: var(--text-color);
          font-size: 1.25rem;
          font-weight: 600;
          white-space: nowrap;
        }
        .navMenu {
          display: flex;
          gap: 2rem;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .navLink {
          color: var(--text-color);
          text-decoration: none;
          font-weight: 500;
          position: relative;
          padding: 0.5rem 0;
          transition: color var(--transition-speed) ease;
        }
        .navLink::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: var(--accent-color);
          transition: width var(--transition-speed) ease;
        }
        .navLink:hover::after {
          width: 100%;
        }
        .navLink.login {
          background: var(--accent-color);
          border: 2px solid var(--accent-color);
          border-radius: 25px;
          padding: 0.5rem 1.5rem;
          transition: all var(--transition-speed) ease;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          position: relative;
          overflow: hidden;
        }
        .navLink.login::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left var(--transition-speed);
        }
        .navLink.login:hover {
          background: #c82333;
          border-color: #c82333;
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(220, 53, 69, 0.4);
        }
        .navLink.login:hover::before {
          left: 100%;
        }
        .user-profile {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          padding: 0.5rem 1rem;
          border: 2px solid var(--accent-color);
          border-radius: 25px;
          transition: transform var(--transition-speed) ease, box-shadow var(--transition-speed) ease;
          position: relative;
        }
        .user-profile:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(220,53,69,0.4);
        }
        .user-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          object-fit: cover;
        }
        .user-name {
          color: var(--text-color);
          font-weight: 500;
          font-size: 1rem;
        }
        .profile-dropdown {
          position: absolute;
          top: 110%;
          right: 0;
          background: var(--navbar-bg);
          border: 1px solid var(--accent-color);
          border-radius: 8px;
          padding: 0.5rem 0;
          min-width: 150px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          z-index: 1002;
        }
        .profile-dropdown .dropdown-link {
          display: block;
          padding: 0.5rem 1rem;
          color: var(--text-color);
          text-decoration: none;
          font-size: 0.9rem;
          transition: background var(--transition-speed);
        }
        .profile-dropdown .dropdown-link:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        .profile-dropdown .logout {
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
        }
        .menuToggle {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          z-index: 1001;
        }
        .bar {
          display: block;
          width: 25px;
          height: 3px;
          margin: 5px auto;
          background: var(--text-color);
          transition: all var(--transition-speed) ease;
        }
        @media (max-width: 768px) {
          .menuToggle {
            display: block;
          }
          .menuToggle.active .bar:nth-child(1) {
            transform: translateY(8px) rotate(45deg);
          }
          .menuToggle.active .bar:nth-child(2) {
            opacity: 0;
          }
          .menuToggle.active .bar:nth-child(3) {
            transform: translateY(-8px) rotate(-45deg);
          }
          .navMenu {
            position: fixed;
            top: 60px;
            right: -100%;
            flex-direction: column;
            background: var(--navbar-bg);
            width: 100%;
            text-align: center;
            padding: 1rem 0;
            transition: right var(--transition-speed) ease;
          }
          .navMenu.active {
            right: 0;
          }
          .navItem {
            margin: 0.75rem 0;
          }
        }
      `}</style>
    </nav>
  );
};

export default NavbarCliente;
