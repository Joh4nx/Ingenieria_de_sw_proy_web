// src/pages/admin/GestionInventario.jsx
import React, { useState, useEffect } from 'react';
import { ref, onValue, push, update, remove } from 'firebase/database';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';

const GestionInventario = () => {
  const { user } = useAuth();
  const [inventario, setInventario] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nuevoItem, setNuevoItem] = useState({
    nombre: '',
    descripcion: '',
    cantidad: ''
  });
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  // Cargar inventario en tiempo real
  useEffect(() => {
    if (user && user.role === 'admin') {
      const inventarioRef = ref(db, 'inventario');
      const unsubscribe = onValue(inventarioRef, (snapshot) => {
        const data = snapshot.val();
        const inventarioArray = data
          ? Object.entries(data).map(([id, item]) => ({ id, ...item }))
          : [];
        setInventario(inventarioArray);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Validación básica del nuevo item
  const validarNuevoItem = () => {
    if (!nuevoItem.nombre.trim() || !nuevoItem.descripcion.trim()) {
      setError('El nombre y la descripción son obligatorios.');
      return false;
    }
    if (!nuevoItem.cantidad || Number(nuevoItem.cantidad) < 0) {
      setError('La cantidad debe ser un número positivo.');
      return false;
    }
    setError('');
    return true;
  };

  // Agregar nuevo ítem al inventario
  const handleAgregarItem = async (e) => {
    e.preventDefault();
    setMensaje('');
    if (!validarNuevoItem()) return;

    try {
      const inventarioRef = ref(db, 'inventario');
      await push(inventarioRef, {
        nombre: nuevoItem.nombre,
        descripcion: nuevoItem.descripcion,
        cantidad: Number(nuevoItem.cantidad)
      });
      setMensaje('Ítem agregado con éxito');
      setNuevoItem({ nombre: '', descripcion: '', cantidad: '' });
    } catch (error) {
      console.error('Error al agregar ítem:', error);
      setError('Error al agregar el ítem.');
    }
  };

  // Actualizar la cantidad de un ítem
  const handleActualizarCantidad = async (id, nuevaCantidad) => {
    try {
      const itemRef = ref(db, `inventario/${id}`);
      await update(itemRef, { cantidad: Number(nuevaCantidad) });
      setMensaje('Cantidad actualizada con éxito');
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
      setError('Error al actualizar la cantidad del ítem.');
    }
  };

  // Eliminar un ítem del inventario
  const handleEliminarItem = async (id) => {
    if (!window.confirm('¿Está seguro que desea eliminar este ítem?')) return;
    try {
      const itemRef = ref(db, `inventario/${id}`);
      await remove(itemRef);
      setMensaje('Ítem eliminado con éxito');
    } catch (error) {
      console.error('Error al eliminar ítem:', error);
      setError('Error al eliminar el ítem.');
    }
  };

  // Verificar acceso: solo administradores
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
      <h2 style={styles.title}>Gestión de Inventario</h2>

      {error && <p style={styles.error}>{error}</p>}
      {mensaje && <p style={styles.success}>{mensaje}</p>}

      {/* Formulario para agregar un nuevo ítem */}
      <form onSubmit={handleAgregarItem} style={styles.form}>
        <h3>Agregar Nuevo Ítem</h3>
        <div style={styles.formGroup}>
          <label style={styles.label}>Nombre:</label>
          <input
            type="text"
            value={nuevoItem.nombre}
            onChange={(e) =>
              setNuevoItem((prev) => ({ ...prev, nombre: e.target.value }))
            }
            style={styles.input}
            required
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Descripción:</label>
          <input
            type="text"
            value={nuevoItem.descripcion}
            onChange={(e) =>
              setNuevoItem((prev) => ({ ...prev, descripcion: e.target.value }))
            }
            style={styles.input}
            required
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Cantidad:</label>
          <input
            type="number"
            min="0"
            value={nuevoItem.cantidad}
            onChange={(e) =>
              setNuevoItem((prev) => ({ ...prev, cantidad: e.target.value }))
            }
            style={styles.input}
            required
          />
        </div>
        <button type="submit" style={styles.addButton}>
          Agregar Ítem
        </button>
      </form>

      {loading ? (
        <p>Cargando inventario...</p>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Nombre</th>
                <th style={styles.th}>Descripción</th>
                <th style={styles.th}>Cantidad</th>
                <th style={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {inventario.map((item) => (
                <tr key={item.id}>
                  <td style={styles.td}>{item.nombre}</td>
                  <td style={styles.td}>{item.descripcion}</td>
                  <td style={styles.td}>
                    <input
                      type="number"
                      min="0"
                      defaultValue={item.cantidad}
                      style={styles.quantityInput}
                      onBlur={(e) =>
                        handleActualizarCantidad(item.id, e.target.value)
                      }
                    />
                  </td>
                  <td style={styles.td}>
                    <button
                      onClick={() => handleEliminarItem(item.id)}
                      style={styles.actionButton}
                    >
                      Eliminar
                    </button>
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
    maxWidth: '900px',
    margin: 'auto',
    fontFamily: 'Arial, sans-serif'
  },
  title: {
    textAlign: 'center',
    marginBottom: '1rem',
    fontSize: '2rem'
  },
  form: {
    marginBottom: '2rem',
    padding: '1rem 2rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  formGroup: {
    marginBottom: '1rem'
  },
  label: {
    fontWeight: 'bold',
    display: 'block',
    marginBottom: '0.5rem'
  },
  input: {
    width: '100%',
    padding: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '1rem'
  },
  addButton: {
    backgroundColor: '#2196F3',
    color: '#fff',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer'
  },
  tableContainer: {
    overflowX: 'auto'
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
  quantityInput: {
    width: '80px',
    padding: '0.3rem',
    fontSize: '1rem'
  },
  actionButton: {
    backgroundColor: '#d32f2f',
    color: '#fff',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer'
  }
};

export default GestionInventario;
