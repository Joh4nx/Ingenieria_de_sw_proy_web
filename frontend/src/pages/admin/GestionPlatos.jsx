// src/pages/admin/GestionPlatos.jsx
import React, { useEffect, useState } from 'react';

function GestionPlatos() {
  const [platos, setPlatos] = useState([]);
  const [nuevoPlato, setNuevoPlato] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    imagenUrl: '',
    categoria: ''
  });
  const [imagenFile, setImagenFile] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [modoEdicion, setModoEdicion] = useState(false);
  const [platoEdicion, setPlatoEdicion] = useState(null);

  useEffect(() => {
    cargarPlatos();
  }, []);

  const cargarPlatos = () => {
    fetch('http://localhost:3001/menu')
      .then(res => res.json())
      .then(data => {
        const platosArray = Object.entries(data || {}).map(([id, plato]) => ({
          id,
          ...plato,
        }));
        setPlatos(platosArray);
      })
      .catch(err => console.error('Error al cargar platos:', err));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (modoEdicion) {
      setPlatoEdicion(prev => ({ ...prev, [name]: value }));
    } else {
      setNuevoPlato(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      if (modoEdicion) {
        setPlatoEdicion(prev => ({ ...prev, imagenFile: e.target.files[0] }));
      } else {
        setImagenFile(e.target.files[0]);
      }
    }
  };

  const handleAgregarPlato = (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    // Validaciones básicas
    if (!nuevoPlato.nombre.trim() || !nuevoPlato.descripcion.trim()) {
      setError('El nombre y la descripción son obligatorios.');
      return;
    }
    if (!nuevoPlato.precio || Number(nuevoPlato.precio) <= 0) {
      setError('El precio debe ser un número positivo.');
      return;
    }

    if (imagenFile) {
      const formData = new FormData();
      formData.append('nombre', nuevoPlato.nombre);
      formData.append('descripcion', nuevoPlato.descripcion);
      formData.append('precio', nuevoPlato.precio);
      formData.append('categoria', nuevoPlato.categoria);
      formData.append('imagen', imagenFile);

      fetch('http://localhost:3001/menu', {
        method: 'POST',
        body: formData,
      })
        .then(response => {
          if (!response.ok) {
            return response.json().then(data => {
              throw new Error(data.error || 'Error al agregar plato');
            });
          }
          return response.json();
        })
        .then(data => {
          setMensaje(data.mensaje || 'Plato agregado con éxito');
          setNuevoPlato({ nombre: '', descripcion: '', precio: '', imagenUrl: '', categoria: '' });
          setImagenFile(null);
          cargarPlatos();
        })
        .catch(error => {
          console.error('Error al agregar plato:', error);
          setError('Hubo un error al guardar el plato.');
        });
    } else {
      fetch('http://localhost:3001/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoPlato),
      })
        .then(response => {
          if (!response.ok) {
            return response.json().then(data => {
              throw new Error(data.error || 'Error al agregar plato');
            });
          }
          return response.json();
        })
        .then(data => {
          setMensaje(data.mensaje || 'Plato agregado con éxito');
          setNuevoPlato({ nombre: '', descripcion: '', precio: '', imagenUrl: '', categoria: '' });
          cargarPlatos();
        })
        .catch(error => {
          console.error('Error al agregar plato:', error);
          setError('Hubo un error al guardar el plato.');
        });
    }
  };

  const handleEliminarPlato = (id) => {
    if (!window.confirm('¿Estás seguro que deseas eliminar este plato?')) return;

    fetch(`http://localhost:3001/menu/${id}`, {
      method: 'DELETE',
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(data => {
            throw new Error(data.error || 'Error al eliminar plato');
          });
        }
        return response.json();
      })
      .then(data => {
        setMensaje(data.mensaje || 'Plato eliminado con éxito');
        cargarPlatos();
      })
      .catch(error => {
        console.error('Error al eliminar plato:', error);
        setError('Hubo un error al eliminar el plato.');
      });
  };

  const activarEdicion = (plato) => {
    setModoEdicion(true);
    setPlatoEdicion({ ...plato });
  };

  const cancelarEdicion = () => {
    setModoEdicion(false);
    setPlatoEdicion(null);
  };

  const handleActualizarPlato = (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    if (!platoEdicion.nombre.trim() || !platoEdicion.descripcion.trim()) {
      setError('El nombre y la descripción son obligatorios.');
      return;
    }
    if (!platoEdicion.precio || Number(platoEdicion.precio) <= 0) {
      setError('El precio debe ser un número positivo.');
      return;
    }

    if (platoEdicion.imagenFile) {
      const formData = new FormData();
      formData.append('nombre', platoEdicion.nombre);
      formData.append('descripcion', platoEdicion.descripcion);
      formData.append('precio', platoEdicion.precio);
      formData.append('categoria', platoEdicion.categoria);
      formData.append('imagen', platoEdicion.imagenFile);

      fetch(`http://localhost:3001/menu/${platoEdicion.id}`, {
        method: 'PUT',
        body: formData,
      })
        .then(response => {
          if (!response.ok) {
            return response.json().then(data => {
              throw new Error(data.error || 'Error al actualizar plato');
            });
          }
          return response.json();
        })
        .then(data => {
          setMensaje(data.mensaje || 'Plato actualizado con éxito');
          setModoEdicion(false);
          setPlatoEdicion(null);
          cargarPlatos();
        })
        .catch(error => {
          console.error('Error al actualizar plato:', error);
          setError('Hubo un error al actualizar el plato.');
        });
    } else {
      fetch(`http://localhost:3001/menu/${platoEdicion.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(platoEdicion),
      })
        .then(response => {
          if (!response.ok) {
            return response.json().then(data => {
              throw new Error(data.error || 'Error al actualizar plato');
            });
          }
          return response.json();
        })
        .then(data => {
          setMensaje(data.mensaje || 'Plato actualizado con éxito');
          setModoEdicion(false);
          setPlatoEdicion(null);
          cargarPlatos();
        })
        .catch(error => {
          console.error('Error al actualizar plato:', error);
          setError('Hubo un error al actualizar el plato.');
        });
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Gestión de Platos</h1>

      {/* Formulario para agregar/editar */}
      <form onSubmit={modoEdicion ? handleActualizarPlato : handleAgregarPlato} style={styles.form}>
        <label style={styles.label}>
          Nombre del Plato
          <input
            type="text"
            name="nombre"
            placeholder="Ej: Lomo saltado"
            value={modoEdicion ? platoEdicion?.nombre : nuevoPlato.nombre}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </label>
        <label style={styles.label}>
          Descripción
          <input
            type="text"
            name="descripcion"
            placeholder="Descripción breve"
            value={modoEdicion ? platoEdicion?.descripcion : nuevoPlato.descripcion}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </label>
        <label style={styles.label}>
          Precio (Bs)
          <input
            type="number"
            name="precio"
            placeholder="Ej: 30"
            value={modoEdicion ? platoEdicion?.precio : nuevoPlato.precio}
            onChange={handleChange}
            required
            style={styles.input}
            min="1"
          />
        </label>
        {/* Opciones para imagen */}
        <label style={styles.label}>
          Imagen (Subir archivo)
          <input
            type="file"
            name="imagenFile"
            onChange={handleFileChange}
            accept="image/*"
            style={styles.input}
          />
        </label>
        <label style={styles.label}>
          O imagen (URL)
          <input
            type="text"
            name="imagenUrl"
            placeholder="http://..."
            value={modoEdicion ? platoEdicion?.imagenUrl : nuevoPlato.imagenUrl}
            onChange={handleChange}
            style={styles.input}
          />
        </label>
        <label style={styles.label}>
          Categoría
          <select
            name="categoria"
            value={modoEdicion ? platoEdicion?.categoria : nuevoPlato.categoria}
            onChange={handleChange}
            style={styles.input}
            required
          >
            <option value="">-- Seleccione una categoría --</option>
            <option value="Entradas">Entradas</option>
            <option value="Platos Fuertes">Platos Fuertes</option>
            <option value="Postres">Postres</option>
            <option value="Bebidas">Bebidas</option>
          </select>
        </label>

        <button type="submit" style={styles.button}>
          {modoEdicion ? 'Actualizar Plato' : 'Agregar Plato'}
        </button>
        {modoEdicion && (
          <button type="button" onClick={cancelarEdicion} style={{ ...styles.button, background: '#555', marginTop: '0.5rem' }}>
            Cancelar Edición
          </button>
        )}
      </form>

      {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}
      {mensaje && <p style={{ color: 'green', fontWeight: 'bold' }}>{mensaje}</p>}

      <h2 style={styles.subTitle}>Platos registrados</h2>
      <div style={styles.cardGrid}>
        {platos.length === 0 ? (
          <p>No hay platos registrados.</p>
        ) : (
          platos.map(plato => (
            <div key={plato.id} style={styles.card}>
              <div style={styles.cardImageContainer}>
                {plato.imagen ? (
                  <img src={plato.imagen} alt={plato.nombre} style={styles.cardImage} />
                ) : (
                  <div style={styles.noImage}>Sin imagen</div>
                )}
                <div style={styles.cardPrice}>${plato.precio}</div>
              </div>
              <div style={styles.cardBody}>
                <h3 style={styles.cardTitle}>{plato.nombre}</h3>
                <p style={styles.cardText}>{plato.descripcion}</p>
                <p style={styles.cardCategory}>{plato.categoria || 'N/A'}</p>
                <div style={styles.cardActions}>
                  <button onClick={() => activarEdicion(plato)} style={styles.actionButton}>Editar</button>
                  <button onClick={() => handleEliminarPlato(plato.id)} style={{ ...styles.actionButton, background: '#d32f2f' }}>Eliminar</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '900px',
    margin: 'auto',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    textAlign: 'center',
    marginBottom: '1rem',
    fontSize: '2rem',
  },
  subTitle: {
    marginTop: '2rem',
    marginBottom: '1rem',
    fontSize: '1.75rem',
    textAlign: 'center',
  },
  form: {
    marginBottom: '2rem',
    display: 'grid',
    gap: '1rem',
    gridTemplateColumns: '1fr 1fr',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    fontWeight: 'bold',
  },
  input: {
    marginTop: '0.5rem',
    padding: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '1rem',
  },
  button: {
    gridColumn: 'span 2',
    background: '#c62828',
    color: '#fff',
    padding: '0.75rem',
    fontSize: '1rem',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '1rem',
  },
  // En lugar de una tabla, usamos una cuadrícula de tarjetas
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
    marginTop: '2rem'
  },
  card: {
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s ease',
  },
  cardImageContainer: {
    position: 'relative',
    height: '200px',
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  noImage: {
    width: '100%',
    height: '100%',
    background: '#eee',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#777',
    fontSize: '0.9rem',
  },
  cardPrice: {
    position: 'absolute',
    bottom: '10px',
    right: '10px',
    background: '#c62828',
    color: '#fff',
    padding: '0.3rem 0.8rem',
    borderRadius: '20px',
    fontWeight: 'bold',
  },
  cardBody: {
    padding: '1rem',
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
  },
  cardTitle: {
    fontSize: '1.25rem',
    marginBottom: '0.5rem',
    color: '#333',
  },
  cardText: {
    flex: '1',
    fontSize: '0.95rem',
    color: '#555',
    marginBottom: '0.5rem',
  },
  cardCategory: {
    fontSize: '0.85rem',
    fontStyle: 'italic',
    color: '#888',
    marginBottom: '1rem',
  },
  cardActions: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '1rem',
  },
  actionButton: {
    background: '#1976d2',
    color: '#fff',
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background 0.3s ease',
  }
};

export default GestionPlatos;
