import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

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
    e.stopPropagation();
    setDropdownOpen(prev => !prev);
  };

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/');
  };

  return (
    <nav className="navbar custom-font" role="navigation" aria-label="Navegación principal">
      <div className="navbarContainer">
        {/* Logo a la izquierda */}
        <Link to="/" className="navbarBrand" onClick={closeMenu}>
          <img src="/logo.png" alt="Logo de El Gusto de Don Justo" />
          <span className="brandText">El Gusto de Don Justo</span>
        </Link>

        {/* Menú centrado */}
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
          <li className="navItem">
            <Link to="/about" className="navLink" onClick={closeMenu}>Acerca de Nosotros</Link>
          </li>
        </ul>

        {/* Perfil/Login a la derecha */}
        <div className="authSection">
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
              <span>Iniciar Sesión</span>
            </Link>
          )}
        </div>

        {/* Botón menú móvil */}
        <button className={`menuToggle ${menuOpen ? 'active' : ''}`} onClick={toggleMenu} aria-label="Toggle navigation">
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
      </div>

      {/* Estilos internos con fuente exclusiva */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=ROKKITT:wght@400;600&display=swap');

        .custom-font, .custom-font * {
          font-family: 'ROKKITT', sans-serif !important;
        }

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
          padding: 0.5rem 0;
        }

        .navbarContainer {
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.5rem;
          height: 70px;
        }

        .navbarBrand {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 0.8rem;
          text-decoration: none;
        }

        .navbarBrand img {
          height: 50px;
        }

        .brandText {
          color: var(--text-color);
          font-size: 1.25rem;
          font-weight: 600;
          white-space: nowrap;
        }

        .navMenu {
          flex: 2;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 2rem;
          list-style: none;
          padding: 0;
          margin: 0;
          height: 100%;
        }

        .navLink {
          color: var(--text-color);
          text-decoration: none;
          font-weight: 500;
          position: relative;
          padding: 0.5rem 0;
          transition: color var(--transition-speed);
        }

        .navLink::after {
          content: '';
          position: absolute;
          bottom: 0;
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
          display: flex;
          align-items: center;
          height: 40px;
          line-height: 40px;
        }

        .navLink.login:hover {
          background: #c82333;
          border-color: #c82333;
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(220, 53, 69, 0.4);
        }

        .authSection {
          flex: 1;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          height: 100%;
        }

        .user-profile {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          padding: 0.5rem 1rem;
          border: 2px solid var(--accent-color);
          border-radius: 25px;
          transition: transform var(--transition-speed), box-shadow var(--transition-speed);
          position: relative;
        }

        .user-profile:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(220, 53, 69, 0.4);
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
        }

        .bar {
          display: block;
          width: 25px;
          height: 3px;
          margin: 5px auto;
          background: var(--text-color);
          transition: all var(--transition-speed);
        }

        @media (max-width: 768px) {
          .navbarContainer {
            flex-direction: column;
            align-items: flex-start;
          }

          .navMenu {
            flex-direction: column;
            width: 100%;
            align-items: center;
            display: ${menuOpen ? 'flex' : 'none'};
          }

          .authSection {
            width: 100%;
            justify-content: center;
            margin-top: 0.5rem;
          }

          .menuToggle {
            display: block;
            align-self: flex-end;
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
        }
      `}</style>
    </nav>
  );
};

export default NavbarCliente;
