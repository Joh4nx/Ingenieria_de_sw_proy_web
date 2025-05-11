// src/pages/admin/GestionPedidos.jsx
import React, { useEffect, useState } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';

const GestionPedidos = () => {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role === 'admin') {
      const pedidosRef = ref(db, 'pedidos');
      const unsubscribe = onValue(pedidosRef, (snapshot) => {
        const data = snapshot.val();
        const pedidosArray = data
          ? Object.entries(data).map(([id, pedido]) => ({
              id,
              ...pedido,
            }))
          : [];
        setPedidos(pedidosArray);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Función para actualizar el estado de un pedido
  const handleActualizarEstado = async (pedidoId, newState) => {
    const pedidoRef = ref(db, `pedidos/${pedidoId}`);
    try {
      await update(pedidoRef, { estado: newState });
      alert('Estado actualizado con éxito');
    } catch (error) {
      console.error('Error al actualizar pedido:', error);
      alert('Error al actualizar el estado del pedido');
    }
  };

  // Verificar acceso: solo los administradores pueden ver esta sección
  if (!user || user.role !== 'admin') {
    return (
      <div style={styles.container}>
        <h2>Acceso restringido</h2>
        <p>Solo los administradores pueden ver esta sección.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2>Gestión de Pedidos</h2>
      {loading ? (
        <p>Cargando pedidos...</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Tipo</th>
              <th style={styles.th}>Mesa / Dirección</th>
              <th style={styles.th}>Estado</th>
              <th style={styles.th}>Fecha/Hora</th>
              <th style={styles.th}>Items</th>
              <th style={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((pedido) => (
              <tr key={pedido.id}>
                <td style={styles.td}>{pedido.id}</td>
                <td style={styles.td}>{pedido.tipo}</td>
                <td style={styles.td}>
                  {pedido.mesa
                    ? `Mesa ${pedido.mesa}`
                    : pedido.direccion || '-'}
                </td>
                <td style={styles.td}>{pedido.estado}</td>
                <td style={styles.td}>
                  {pedido.timestamp ? new Date(pedido.timestamp).toLocaleString() : '-'}
                </td>
                <td style={styles.td}>
                  {pedido.items ? (
                    pedido.items.map((item, idx) => (
                      <div key={idx}>
                        {item.nombre} (x{item.cantidad})
                      </div>
                    ))
                  ) : (
                    '-'
                  )}
                </td>
                <td style={styles.td}>
                  {pedido.estado === 'pendiente' && (
                    <>
                      <button
                        onClick={() => handleActualizarEstado(pedido.id, 'preparado')}
                        style={styles.actionButton}
                      >
                        Marcar como Preparado
                      </button>
                      <button
                        onClick={() => handleActualizarEstado(pedido.id, 'finalizado')}
                        style={{ ...styles.actionButton, backgroundColor: '#4CAF50' }}
                      >
                        Marcar como Finalizado
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: 'auto',
    fontFamily: 'Arial, sans-serif'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    border: '1px solid #ccc',
    padding: '0.75rem',
    backgroundColor: '#f5f5f5',
    textAlign: 'left'
  },
  td: {
    border: '1px solid #ccc',
    padding: '0.75rem'
  },
  actionButton: {
    backgroundColor: '#d32f2f',
    color: '#fff',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '0.5rem',
    transition: 'background 0.3s'
  }
};

export default GestionPedidos;
