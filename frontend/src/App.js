// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import HomeCliente from './pages/cliente/HomeCliente';
import MenuPage from './pages/cliente/MenuPage';
import ReservasPage from './pages/cliente/ReservasPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/cliente/ForgotPasswordPage';
import TipoPedido from './pages/cliente/TipoPedido';
import AboutUs from './pages/cliente/AboutUs';

// **Importa PedidoLocal**
import PedidoLocal from './pages/cliente/PedidoLocal';

import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import GestionPlatos from './pages/admin/GestionPlatos';
import GestionReservas from './pages/admin/GestionReservas';
import GestionMesas from './pages/admin/GestionMesas';
import GestionPedidos from './pages/admin/GestionPedidos';
import GestionInventario from './pages/admin/GestionInventario';
import GestionUsuarios from './pages/admin/GestionUsuarios';
import CajeroDashboard from './pages/admin/CajeroDashboard';
import ReportesDashboard from './pages/admin/ReportesDashboard';
import GestionRoles from './pages/admin/GestionRoles';

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
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/pedidos" element={<TipoPedido />} />
        <Route path="/about" element={<AboutUs />} />

        {/* Ruta nueva para PedidoLocal */}
        <Route path="/pedido-local" element={<PedidoLocal volver={() => window.history.back()} />} />

        {/* Rutas para administración (anidadas en AdminLayout) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="platos" element={<GestionPlatos />} />
          <Route path="reservas" element={<GestionReservas />} />
          <Route path="mesas" element={<GestionMesas />} />
          <Route path="pedidos" element={<GestionPedidos />} />
          <Route path="inventario" element={<GestionInventario />} />
          <Route path="usuarios" element={<GestionUsuarios />} />
          <Route path="cajero" element={<CajeroDashboard />} />
          <Route path="reportes" element={<ReportesDashboard />} />
          <Route path="roles" element={<GestionRoles />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
