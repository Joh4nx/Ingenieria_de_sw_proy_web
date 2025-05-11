// src/pages/admin/CajeroDashboard.jsx
import React, { useState, useEffect } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';

const CajeroDashboard = () => {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pendientes");

  // Cargar en tiempo real todos los pedidos
  useEffect(() => {
    if (user && (user.role === 'cajero' || user.role === 'admin')) {
      const pedidosRef = ref(db, 'pedidos');
      const unsubscribe = onValue(pedidosRef, (snapshot) => {
        const data = snapshot.val();
        const ordersArray = data
          ? Object.entries(data).map(([id, pedido]) => ({ id, ...pedido }))
          : [];
        setPedidos(ordersArray);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Función para marcar un pedido pendiente como pagado
  const handleMarkPaid = async (pedidoId) => {
    const pedidoRef = ref(db, `pedidos/${pedidoId}`);
    try {
      await update(pedidoRef, { estado: 'pagado' });
      alert('Pedido marcado como pagado');
    } catch (error) {
      console.error('Error al actualizar pedido:', error);
      alert('Error al actualizar el estado del pedido');
    }
  };

  // Helper: Agrupar pedidos por fecha (utilizando toLocaleDateString)
  const groupOrdersByDate = (orders) => {
    const groups = {};
    orders.forEach((order) => {
      if (order.timestamp) {
        const dateStr = new Date(order.timestamp).toLocaleDateString();
        if (!groups[dateStr]) {
          groups[dateStr] = [];
        }
        groups[dateStr].push(order);
      }
    });
    return groups;
  };

  // Filtrar pedidos según estado
  const pendingOrders = pedidos.filter(order => order.estado === 'pendiente');
  const historicalOrders = pedidos.filter(order => order.estado !== 'pendiente');

  // Control de acceso: solo usuarios con rol "cajero" o "admin" tienen acceso
  if (!user || (user.role !== 'cajero' && user.role !== 'admin')) {
    return (
      <div style={styles.container}>
        <h2>Acceso Restringido</h2>
        <p>Solo los usuarios con rol "cajero" o "admin" tienen acceso a esta sección.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2>Caja - Gestión de Pagos</h2>
      
      {/* Pestañas para seleccionar la vista */}
      <div style={styles.tabContainer}>
        <button
          onClick={() => setActiveTab("pendientes")}
          style={ activeTab === "pendientes" ? { ...styles.tabButton, ...styles.activeTabButton } : styles.tabButton }
        >
          Pedidos Pendientes
        </button>
        <button
          onClick={() => setActiveTab("historial")}
          style={ activeTab === "historial" ? { ...styles.tabButton, ...styles.activeTabButton } : styles.tabButton }
        >
          Historial de Pedidos
        </button>
      </div>

      {loading ? (
        <p>Cargando pedidos...</p>
      ) : activeTab === "pendientes" ? (
        // Vista de Pedidos Pendientes
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Mesa / Dirección</th>
              <th style={styles.th}>Total</th>
              <th style={styles.th}>Estado</th>
              <th style={styles.th}>Fecha/Hora</th>
              <th style={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pendingOrders.map((pedido) => {
              const total = pedido.items
                ? pedido.items.reduce((acc, item) => {
                    const precio = Number(item.precio) || 0;
                    const cantidad = Number(item.cantidad) || 1;
                    return acc + precio * cantidad;
                  }, 0)
                : 0;
              return (
                <tr key={pedido.id}>
                  <td style={styles.td}>{pedido.id}</td>
                  <td style={styles.td}>
                    {pedido.mesa ? `Mesa ${pedido.mesa}` : pedido.direccion || '-'}
                  </td>
                  <td style={styles.td}>${total.toFixed(2)}</td>
                  <td style={styles.td}>{pedido.estado}</td>
                  <td style={styles.td}>
                    {pedido.timestamp ? new Date(pedido.timestamp).toLocaleString() : '-'}
                  </td>
                  <td style={styles.td}>
                    {pedido.estado === 'pendiente' && (
                      <button
                        onClick={() => handleMarkPaid(pedido.id)}
                        style={styles.actionButton}
                      >
                        Marcar como Pagado
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        // Vista de Historial de Pedidos, agrupados por día
        <div>
          {Object.entries(groupOrdersByDate(historicalOrders))
            .sort((a, b) => new Date(b[0]) - new Date(a[0])) // Ordenar de forma descendente
            .map(([date, orders]) => (
              <div key={date} style={styles.historyGroup}>
                <h3>{date}</h3>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>Mesa / Dirección</th>
                      <th style={styles.th}>Total</th>
                      <th style={styles.th}>Estado</th>
                      <th style={styles.th}>Fecha/Hora</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((pedido) => {
                      const total = pedido.items
                        ? pedido.items.reduce((acc, item) => {
                            const precio = Number(item.precio) || 0;
                            const cantidad = Number(item.cantidad) || 1;
                            return acc + precio * cantidad;
                          }, 0)
                        : 0;
                      return (
                        <tr key={pedido.id}>
                          <td style={styles.td}>{pedido.id}</td>
                          <td style={styles.td}>
                            {pedido.mesa ? `Mesa ${pedido.mesa}` : pedido.direccion || '-'}
                          </td>
                          <td style={styles.td}>${total.toFixed(2)}</td>
                          <td style={styles.td}>{pedido.estado}</td>
                          <td style={styles.td}>
                            {pedido.timestamp ? new Date(pedido.timestamp).toLocaleString() : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif',
  },
  tabContainer: {
    display: 'flex',
    marginBottom: '1.5rem',
    justifyContent: 'center',
    gap: '1rem',
  },
  tabButton: {
    padding: '0.75rem 1.5rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    backgroundColor: '#f5f5f5',
    cursor: 'pointer',
    transition: 'background-color 0.3s, color 0.3s',
  },
  activeTabButton: {
    backgroundColor: '#00796b',
    color: '#fff',
    borderColor: '#00796b',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '1.5rem',
  },
  th: {
    border: '1px solid #ccc',
    padding: '0.75rem',
    backgroundColor: '#f5f5f5',
    textAlign: 'left',
  },
  td: {
    border: '1px solid #ccc',
    padding: '0.75rem',
  },
  actionButton: {
    backgroundColor: '#00796b',
    color: '#fff',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background 0.3s',
  },
  historyGroup: {
    marginBottom: '2rem',
  },
};

export default CajeroDashboard;
