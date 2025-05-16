// src/components/ListaProductos.jsx
import React, { useEffect, useState } from 'react';
import PlatoCard from './PlatoCard';

const ListaProductos = ({ categoria, onAddItem, hideAdd }) => {
  const [platos, setPlatos] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/menu')
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          const platosArray = Object.entries(data).map(([id, plato]) => ({
            id,
            ...plato,
          }));
          setPlatos(platosArray);
        }
      })
      .catch((error) =>
        console.error('Error al obtener el menú:', error)
      );
  }, []);

  // Filtrar platos por categoría (sin mayúsculas)
  const filteredPlatos = categoria
    ? platos.filter(
        (plato) =>
          plato.categoria &&
          plato.categoria.trim().toLowerCase() === categoria.trim().toLowerCase()
      )
    : platos;

  return (
    <div style={styles.container}>
      {filteredPlatos.length > 0 ? (
        filteredPlatos.map((plato) => (
          <div key={plato.id} style={styles.platoContainer}>
            <PlatoCard plato={plato} />
            {(!hideAdd && typeof onAddItem === 'function') && (
              <div style={styles.addSection}>
                <input
                  type="number"
                  min="1"
                  defaultValue="1"
                  style={styles.quantityInput}
                  id={`cantidad-${plato.id}`}
                />
                <button
                  style={styles.addButton}
                  onClick={() => {
                    const cantidad = parseInt(
                      document.getElementById(`cantidad-${plato.id}`).value,
                      10
                    );
                    onAddItem({ id: plato.id, nombre: plato.nombre, cantidad, precio: plato.precio });
                  }}
                >
                  Añadir
                </button>
              </div>
            )}
          </div>
        ))
      ) : (
        <p style={styles.noPlatos}>No hay platos disponibles en esta categoría.</p>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    padding: '1rem',
    maxWidth: '1400px',
    margin: 'auto'
  },
  platoContainer: {
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '1rem'
  },
  addSection: {
    marginTop: '1rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  quantityInput: {
    width: '60px',
    padding: '0.3rem',
    fontSize: '1rem'
  },
  addButton: {
    backgroundColor: '#2196F3',
    color: '#fff',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '0.5rem'
  },
  noPlatos: {
    textAlign: 'center',
    fontSize: '1.5rem',
    color: '#999',
    gridColumn: '1 / -1'
  }
};

export default ListaProductos;
