// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomeCliente from './pages/cliente/HomeCliente';
import MenuPage from './pages/cliente/MenuPage';
import ReservasPage from './pages/cliente/ReservasPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import GestionPlatos from './pages/admin/GestionPlatos';
import GestionReservas from './pages/admin/GestionReservas';
import TipoPedido from './pages/cliente/TipoPedido';
import GestionMesas from './pages/admin/GestionMesas';
import GestionPedidos from './pages/admin/GestionPedidos';
import GestionInventario from './pages/admin/GestionInventario';
import GestionUsuarios from './pages/admin/GestionUsuarios';
import CajeroDashboard from './pages/admin/CajeroDashboard';
import ReportesDashboard from './pages/admin/ReportesDashboard';
import GestionRoles from './pages/admin/GestionRoles';
import AboutUs from './pages/cliente/AboutUs';
import ForgotPasswordPage from './pages/cliente/ForgotPasswordPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas para clientes */}
        <Route path="/" element={<HomeCliente />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/reservas" element={<ReservasPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/pedidos" element={<TipoPedido />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Rutas para administración, anidadas en AdminLayout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="platos" element={<GestionPlatos />} />
          <Route path="reservas" element={<GestionReservas />} />
          <Route path="/admin/mesas" element={<GestionMesas />} />
          <Route path="/admin/pedidos" element={<GestionPedidos />} />
          <Route path="/admin/inventario" element={<GestionInventario />} />
          <Route path="/admin/usuarios" element={<GestionUsuarios />} />
          <Route path="/admin/cajero" element={<CajeroDashboard />} />
          <Route path="/admin/reportes" element={<ReportesDashboard />} />
          <Route path="/admin/roles" element={<GestionRoles />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
