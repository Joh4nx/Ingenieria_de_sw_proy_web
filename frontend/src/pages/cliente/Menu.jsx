// src/pages/cliente/Menu.jsx
import React, { useState } from 'react';
import { ref, push } from 'firebase/database';
import { db } from '../../services/firebase';
import ListaProductos from '../../components/ListaProductos';

const Menu = ({ mesaId, tipo, direccion }) => {
  const [pedido, setPedido] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Entradas');
  const categories = ['Entradas', 'Platos Fuertes', 'Postres', 'Bebidas'];

  // Función para agregar un ítem al pedido. Si ya existe, incrementa la cantidad.
  const addItemToPedido = (item) => {
    const index = pedido.findIndex((p) => p.id === item.id);
    if (index !== -1) {
      const updatedPedido = [...pedido];
      updatedPedido[index].cantidad += item.cantidad;
      setPedido(updatedPedido);
    } else {
      setPedido([...pedido, item]);
    }
  };

  // Función para eliminar ítem del pedido
  const removeItemFromPedido = (itemId) => {
    setPedido(pedido.filter((item) => item.id !== itemId));
  };

  // Función para finalizar y enviar el pedido
  const finalizarPedido = async () => {
    if (pedido.length === 0) {
      alert('Debe agregar al menos un producto al pedido.');
      return;
    }

    try {
      const pedidoRef = ref(db, 'pedidos');
      await push(pedidoRef, {
        items: pedido,
        tipo: tipo || 'local',
        ...(mesaId && { mesa: mesaId }),
        ...(direccion && { direccion }),
        estado: 'pendiente',
        timestamp: Date.now()
      });
      alert('Pedido enviado con éxito');
      setPedido([]);
    } catch (error) {
      console.error('Error al finalizar el pedido:', error);
      alert('Hubo un error al finalizar el pedido.');
    }
  };

  return (
    <div className="menu-container" style={styles.container}>
      <div style={styles.categories}>
        {categories.map((cat) => (
          <button
            key={cat}
            style={{
              ...styles.categoryButton,
              backgroundColor:
                selectedCategory === cat ? '#2196F3' : '#f0f0f0',
              color: selectedCategory === cat ? '#fff' : '#333'
            }}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ListaProductos se encarga de filtrar los platos por categoría */}
      <ListaProductos
        categoria={selectedCategory}
        onAddItem={(item) => addItemToPedido(item)}
      />

      {/* Sección para mostrar el pedido actual */}
      <div style={styles.pedidoContainer}>
        <h3>Tu Pedido</h3>
        {pedido.length === 0 ? (
          <p>Aún no has seleccionado ningún plato.</p>
        ) : (
          <ul style={styles.pedidoList}>
            {pedido.map((item) => (
              <li key={item.id} style={styles.pedidoItem}>
                {item.nombre} - Cantidad: {item.cantidad}
                <button 
                  style={styles.removeButton}
                  onClick={() => removeItemFromPedido(item.id)}
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button 
        onClick={finalizarPedido} 
        style={styles.btnFinalizar} 
        disabled={pedido.length === 0}  // Deshabilitado si el pedido está vacío
      >
        {pedido.length === 0 ? 'Agrega productos para finalizar el pedido' : (tipo === 'online' ? 'Confirmar Pedido' : 'Enviar a Cocina')}
      </button>
    </div>
  );
};

const styles = {
  container: {
    padding: '1rem'
  },
  btnFinalizar: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#c62828',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
    marginTop: '1rem',
    disabled: {
      backgroundColor: '#999'
    }
  },
  categories: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    marginBottom: '1rem'
  },
  categoryButton: {
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    fontWeight: 'bold'
  },
  pedidoContainer: {
    marginTop: '2rem',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px'
  },
  pedidoList: {
    listStyle: 'none',
    padding: 0
  },
  pedidoItem: {
    marginBottom: '0.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  removeButton: {
    backgroundColor: '#d32f2f',
    color: '#fff',
    border: 'none',
    padding: '0.3rem 0.6rem',
    borderRadius: '4px',
    cursor: 'pointer'
  }
};

export default Menu;
