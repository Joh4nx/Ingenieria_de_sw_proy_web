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
      const unsubscribe = onValue(
        pedidosRef,
        (snapshot) => {
          const data = snapshot.val();
          const pedidosArray = data
            ? Object.entries(data).map(([id, pedido]) => ({
                id,
                ...pedido,
              }))
            : [];
          setPedidos(pedidosArray);
          setLoading(false);
        },
        (error) => {
          console.error('Error leyendo pedidos:', error);
          setLoading(false);
        }
      );
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleActualizarEstado = async (pedidoId, newState) => {
    const pedidoRef = ref(db, `pedidos/${pedidoId}`);
    try {
      await update(pedidoRef, { estado: newState });
      setPedidos((prev) =>
        prev.map((p) =>
          p.id === pedidoId ? { ...p, estado: newState } : p
        )
      );
    } catch (error) {
      console.error('Error al actualizar pedido:', error);
      alert('Error al actualizar el estado del pedido');
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>Acceso Restringido</h2>
        <p>Solo los administradores pueden ver esta sección.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2 style={styles.headerTitle}>Gestión de Pedidos</h2>
        <p style={styles.headerSubtitle}>
          Administra y actualiza el estado de cada pedido.
        </p>
      </header>

      {loading ? (
        <p style={styles.loadingMessage}>Cargando pedidos...</p>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Nº</th>
                <th style={styles.th}>Tipo</th>
                <th style={styles.th}>Mesa / Dirección</th>
                <th style={styles.th}>Estado</th>
                <th style={styles.th}>Fecha / Hora</th>
                <th style={styles.th}>Items</th>
                <th style={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((pedido, index) => (
                <tr key={pedido.id} style={index % 2 === 0 ? styles.evenRow : {}}>
                  <td style={styles.td}>{index + 1}</td>
                  <td style={styles.td}>{pedido.tipo}</td>
                  <td style={styles.td}>
                    {pedido.mesa ? `Mesa ${pedido.mesa}` : pedido.direccion || '-'}
                  </td>
                  <td style={styles.td}>
                    <span style={{ ...styles.statusPill, ...styles[`status_${pedido.estado}`] }}>
                      {pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {pedido.timestamp
                      ? new Date(pedido.timestamp).toLocaleString()
                      : '-'}
                  </td>
                  <td style={styles.td}>
                    {pedido.items && pedido.items.length > 0 ? (
                      <ul style={styles.itemsList}>
                        {pedido.items.map((item, idx) => (
                          <li key={idx} style={styles.item}>
                            {item.nombre} <span style={styles.badge}>x{item.cantidad}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td style={styles.td}>
                    {pedido.estado === 'pendiente' && (
                      <div style={styles.actionsContainer}>
                        <button
                          onClick={() =>
                            handleActualizarEstado(pedido.id, 'preparado')
                          }
                          style={{ ...styles.button, ...styles.btnPreparado }}
                        >
                          Preparado
                        </button>
                        <button
                          onClick={() =>
                            handleActualizarEstado(pedido.id, 'finalizado')
                          }
                          style={{ ...styles.button, ...styles.btnFinalizado }}
                        >
                          Finalizado
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: 'auto',
    fontFamily: 'Arial, sans-serif',
    color: '#333',
  },
  title: {
    fontSize: '1.8rem',
    marginBottom: '1rem',
  },
  header: {
    backgroundColor: '#fff',
    padding: '1rem 2rem',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    marginBottom: '2rem',
    textAlign: 'center',
  },
  headerTitle: {
    fontSize: '2rem',
    marginBottom: '0.5rem',
  },
  headerSubtitle: {
    fontSize: '1rem',
    color: '#666',
  },
  loadingMessage: {
    textAlign: 'center',
    fontSize: '1.2rem',
    color: '#666',
  },
  tableWrapper: {
    overflowX: 'auto',
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '900px',
  },
  th: {
    borderBottom: '2px solid #ececec',
    padding: '0.75rem 1rem',
    backgroundColor: '#f9f9f9',
    textAlign: 'left',
    fontSize: '1rem',
    color: '#333',
  },
  td: {
    borderBottom: '1px solid #eee',
    padding: '0.75rem 1rem',
    fontSize: '0.95rem',
    verticalAlign: 'top',
  },
  evenRow: {
    backgroundColor: '#fcfcfc',
  },
  itemsList: {
    listStyleType: 'none',
    paddingLeft: 0,
    margin: 0,
  },
  item: {
    marginBottom: '0.25rem',
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.9rem',
  },
  badge: {
    backgroundColor: '#ddd',
    borderRadius: '12px',
    padding: '0 0.5rem',
    fontSize: '0.85rem',
    color: '#555',
  },
  actionsContainer: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  button: {
    border: 'none',
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    color: '#fff',
  },
  btnPreparado: {
    backgroundColor: '#0277bd',
  },
  btnFinalizado: {
    backgroundColor: '#388e3c',
  },
  statusPill: {
    display: 'inline-block',
    padding: '0.3rem 0.6rem',
    borderRadius: '12px',
    fontSize: '0.85rem',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  status_pendiente: {
    backgroundColor: '#fff3e0',
    color: '#e65100',
  },
  status_preparado: {
    backgroundColor: '#e1f5fe',
    color: '#0277bd',
  },
  status_finalizado: {
    backgroundColor: '#e8f5e9',
    color: '#388e3c',
  },
  status_pagado: {
    backgroundColor: '#f1f8e9',
    color: '#558b2f',
  },
};

export default GestionPedidos;
