// src/pages/admin/GestionMesas.jsx
import React, { useState, useEffect } from 'react';
import { ref, onValue, update, push } from 'firebase/database';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import { QRCodeSVG } from 'qrcode.react';

const GestionMesas = () => {
  const { user } = useAuth();
  const [mesas, setMesas] = useState([]);
  const [loading, setLoading] = useState(true);
  // Estados para el formulario de nueva mesa:
  const [newMesaNumber, setNewMesaNumber] = useState('');
  const [newMesaCapacity, setNewMesaCapacity] = useState('');

  useEffect(() => {
    if (user && user.role === 'admin') {
      const mesasRef = ref(db, 'mesas');
      const unsubscribe = onValue(mesasRef, (snapshot) => {
        const data = snapshot.val();
        const mesasArray = data
          ? Object.entries(data).map(([id, mesa]) => ({
              id,
              ...mesa
            }))
          : [];
        setMesas(mesasArray);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Efecto para renovar automáticamente el código QR de las mesas expiradas
  useEffect(() => {
    const interval = setInterval(() => {
      mesas.forEach((mesa) => {
        // Renovamos solo las mesas libres que han expirado
        if (mesa.estado === 'libre' && mesa.expiracion < Date.now()) {
          const newQrCode = uuidv4().split('-')[0];
          const newExpiration = Date.now() + 3600000; // 1 hora de validez desde ahora
          update(ref(db, `mesas/${mesa.id}`), {
            qr: newQrCode,
            expiracion: newExpiration
          })
            .then(() => {
              console.log(`Mesa ${mesa.numero} QR renovado automáticamente`);
            })
            .catch((err) => console.error('Error al renovar QR:', err));
        }
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [mesas]);

  // Nuevo useEffect para borrar la respuesta "enseguida" después de 5 segundos
  useEffect(() => {
    mesas.forEach((mesa) => {
      if (mesa.llamando === "enseguida") {
        const timer = setTimeout(() => {
          update(ref(db, `mesas/${mesa.id}`), { llamando: false })
            .then(() => console.log(`Respuesta "enseguida" borrada para mesa ${mesa.numero}`))
            .catch((err) => console.error("Error borrando respuesta enseguida:", err));
        }, 5000);
        // Limpieza del timer en caso de que el efecto se vuelva a ejecutar antes de que termine
        return () => clearTimeout(timer);
      }
    });
  }, [mesas]);

  // Función para alternar el estado de la mesa ("libre" y "ocupada")
  const handleToggleEstado = async (mesaId, estadoActual) => {
    const nuevaCondicion = estadoActual === 'libre' ? 'ocupada' : 'libre';
    const mesaRef = ref(db, `mesas/${mesaId}`);
    try {
      await update(mesaRef, { estado: nuevaCondicion });
      alert('Estado actualizado con éxito');
    } catch (error) {
      console.error('Error al actualizar mesa:', error);
      alert('Error al actualizar estado de la mesa');
    }
  };

  // Función para agregar una nueva mesa
  const handleAddMesa = async (e) => {
    e.preventDefault();
    if (!newMesaNumber || !newMesaCapacity) {
      alert('Por favor, ingrese número y capacidad de la mesa.');
      return;
    }
    try {
      const qrCode = uuidv4().split('-')[0];
      const mesasRef = ref(db, 'mesas');
      await push(mesasRef, {
        numero: newMesaNumber,
        capacidad: newMesaCapacity,
        estado: 'libre',
        qr: qrCode,
        expiracion: Date.now() + 3600000 // 1 hora de validez
      });
      alert('Mesa agregada con éxito');
      setNewMesaNumber('');
      setNewMesaCapacity('');
    } catch (error) {
      console.error('Error agregando mesa:', error);
      alert('Error al agregar la mesa');
    }
  };

  // Función para responder al llamado del mesero con "enseguida" o "atendido"
  const handleRespondCall = async (mesaId, respuesta) => {
    try {
      await update(ref(db, `mesas/${mesaId}`), { llamando: respuesta });
      console.log(`Mesa ${mesaId} respondida con: ${respuesta}`);
      alert(`La respuesta ha sido actualizada a: ${respuesta}`);
    } catch (error) {
      console.error('Error al responder llamado:', error);
      alert('Error al actualizar la respuesta del llamado');
    }
  };

  // Verificación de acceso para administradores
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
      <h2>Gestión de Mesas</h2>

      {/* Formulario para agregar una nueva mesa */}
      <form onSubmit={handleAddMesa} style={styles.form}>
        <h3>Agregar Nueva Mesa</h3>
        <div style={styles.formGroup}>
          <label>Número de Mesa:</label>
          <input
            type="text"
            value={newMesaNumber}
            onChange={(e) => setNewMesaNumber(e.target.value)}
            style={styles.input}
            required
          />
        </div>
        <div style={styles.formGroup}>
          <label>Capacidad:</label>
          <input
            type="number"
            value={newMesaCapacity}
            onChange={(e) => setNewMesaCapacity(e.target.value)}
            style={styles.input}
            min="1"
            required
          />
        </div>
        <button type="submit" style={styles.addButton}>Agregar Mesa</button>
      </form>

      {loading ? (
        <p>Cargando mesas...</p>
      ) : (
        <div style={styles.grid}>
          {mesas.map((mesa) => (
            <div key={mesa.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3>Mesa {mesa.numero}</h3>
                <p>Capacidad: {mesa.capacidad}</p>
              </div>
              <div style={styles.cardBody}>
                <div style={styles.qrContainer}>
                  {mesa.qr ? (
                    <>
                      <QRCodeSVG 
                        value={mesa.qr} 
                        size={100} 
                        level="H" 
                        includeMargin={true} 
                      />
                      <p style={styles.qrText}>Código: {mesa.qr}</p>
                    </>
                  ) : (
                    <p>No hay QR</p>
                  )}
                </div>
                <p style={styles.estado}>Estado: {mesa.estado}</p>
                
                {/* Si la mesa está llamando, mostramos la opción de respuesta */}
                {mesa.llamando && (
                  <div>
                    <p style={styles.llamando}>
                      Llamando al mesero { (mesa.llamando !== true && mesa.llamando !== 'llamando') ? `- Respuesta: ${mesa.llamando}` : '' }
                    </p>
                    {(mesa.llamando === true || mesa.llamando === 'llamando') && (
                      <div style={styles.responseButtonsContainer}>
                        <button
                          style={styles.responseButton}
                          onClick={() => handleRespondCall(mesa.id, "enseguida")}
                        >
                          Enseguida
                        </button>
                        <button
                          style={styles.responseButton}
                          onClick={() => handleRespondCall(mesa.id, "atendido")}
                        >
                          Atendido
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <p style={styles.expiracion}>
                  {mesa.expiracion ? new Date(mesa.expiracion).toLocaleString() : '-'}
                </p>
                <button
                  onClick={() => handleToggleEstado(mesa.id, mesa.estado)}
                  style={styles.btnAction}
                >
                  {mesa.estado === 'libre' ? 'Marcar Ocupada' : 'Marcar Libre'}
                </button>
              </div>
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
    fontFamily: 'Arial, sans-serif'
  },
  form: {
    backgroundColor: '#f8f9fa',
    padding: '1rem 2rem',
    borderRadius: '12px',               // más redondeado
    boxShadow: '0 4px 6px rgba(139, 0, 0, 0.15)',  // sombra roja suave
    marginBottom: '2rem'
  },
  formGroup: {
    marginBottom: '1rem',
    display: 'flex',
    flexDirection: 'column'
  },
  input: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '2px solid #8B0000',       // borde rojo fuerte
    borderRadius: '8px',                // bordes redondeados
    outline: 'none',
    transition: 'border-color 0.3s',
  },
  addButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#8B0000',         // rojo oscuro
    color: '#fff',
    border: 'none',
    borderRadius: '12px',               // más redondeado
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'background 0.3s',
    boxShadow: '0 4px 8px rgba(139, 0, 0, 0.4)',
  },
  addButtonHover: {
    backgroundColor: '#a80000',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2rem'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '16px',               // bordes más redondeados
    boxShadow: '0 6px 12px rgba(0,0,0,0.12)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  cardHeader: {
    backgroundColor: '#f5f5f5',
    padding: '1rem',
    textAlign: 'center',
    borderBottom: '2px solid #8B0000'  // borde rojo para separar
  },
  cardBody: {
    padding: '1rem',
    textAlign: 'center'
  },
  qrContainer: {
    marginBottom: '1rem',
    borderRadius: '12px',
    border: '2px solid #8B0000',       // marco rojo para QR
    padding: '0.5rem'
  },
  qrText: {
    fontFamily: 'monospace',
    fontSize: '0.9rem'
  },
  estado: {
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    color: '#8B0000'                   // texto rojo para estado
  },
  llamando: {
    color: '#8B0000',
    fontWeight: 'bold',
    marginBottom: '0.5rem'
  },
  responseButtonsContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '0.5rem'
  },
  responseButton: {
    padding: '0.5rem 1rem',
    margin: '0 0.5rem',
    backgroundColor: '#8B0000',         // rojo oscuro
    color: '#fff',
    border: 'none',
    borderRadius: '10px',               // más redondeado
    cursor: 'pointer',
    transition: 'background 0.3s',
    boxShadow: '0 3px 6px rgba(139, 0, 0, 0.5)'
  },
  responseButtonHover: {
    backgroundColor: '#a80000'
  },
  expiracion: {
    fontSize: '0.9rem',
    marginBottom: '1rem'
  },
  btnAction: {
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '12px',               // bordes redondeados
    cursor: 'pointer',
    transition: 'background 0.3s',
    boxShadow: '0 3px 6px rgba(0, 128, 0, 0.4)'
  },
  btnActionHover: {
    backgroundColor: '#388E3C'
  }
};


export default GestionMesas;
