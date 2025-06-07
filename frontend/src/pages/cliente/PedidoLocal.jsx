// src/pages/cliente/PedidoLocal.jsx
import React, { useState, useEffect } from 'react';
import { QrReader } from 'react-qr-reader';
import { ref, onValue, update, query, orderByChild, equalTo, get } from 'firebase/database';
import { db } from '../../services/firebase';
import Menu from './Menu';

const PedidoLocal = ({ volver }) => {
  const [qrData, setQrData] = useState('');
  const [mesaValidada, setMesaValidada] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(null);
  const [mensajeValidacion, setMensajeValidacion] = useState('');
  const [codigoManual, setCodigoManual] = useState('');
  const [orderTotal, setOrderTotal] = useState(0);
  const [meseroRespuesta, setMeseroRespuesta] = useState(''); // Nuevo estado para respuesta del mesero

  // Efecto para actualizar el tiempo restante y la respuesta del mesero
  useEffect(() => {
    if (!mesaValidada || !qrData) return;
    const mesaRef = ref(db, `mesas/${qrData}`);
    const unsubscribe = onValue(mesaRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Actualizar tiempo restante
        const tiempo = Math.max(0, data.expiracion - Date.now());
        setTiempoRestante(Math.floor(tiempo / 60000));

        // Si existe el campo 'llamando' y su valor ya no es el estado "pendiente" (true o 'llamando'),
        // se asume que el mesero ya respondió
        if (data.llamando && data.llamando !== true && data.llamando !== 'llamando') {
          setMeseroRespuesta(data.llamando);
        } else {
          setMeseroRespuesta('');
        }
      }
    });
    return () => unsubscribe();
  }, [mesaValidada, qrData]);

  // Efecto para calcular el total de la cuenta usando los pedidos
  useEffect(() => {
    if (!mesaValidada || !qrData) return;

    const pedidosRef = ref(db, 'pedidos');
    const unsubscribe = onValue(pedidosRef, (snapshot) => {
      let total = 0;
      const data = snapshot.val();
      console.log("Datos completos de pedidos:", data);
      if (data) {
        Object.values(data).forEach((pedido) => {
          if (pedido.mesa === qrData && pedido.estado === 'pendiente' && pedido.items) {
            if (Array.isArray(pedido.items)) {
              pedido.items.forEach((item) => {
                const precio = Number(item.precio) || 0;
                const cantidad = Number(item.cantidad) || 1;
                total += precio * cantidad;
              });
            } else {
              Object.values(pedido.items).forEach((item) => {
                const precio = Number(item.precio) || 0;
                const cantidad = Number(item.cantidad) || 1;
                total += precio * cantidad;
              });
            }
          }
        });
      }
      setOrderTotal(total);
    });
    return () => unsubscribe();
  }, [mesaValidada, qrData]);

  // Función para extender el tiempo restante de la mesa
  const extenderTiempo = async (minutos) => {
    try {
      await update(ref(db, `mesas/${qrData}`), {
        expiracion: Date.now() + (minutos * 60000)
      });
    } catch (error) {
      console.error("Error al extender tiempo:", error);
      alert("Error al extender el tiempo");
    }
  };

  // Función para validar el código QR (escaneado o ingresado manualmente)
  const validarQR = async (codigo) => {
    if (!codigo) return;
    try {
      const mesasRef = ref(db, 'mesas');
      const q = query(mesasRef, orderByChild('qr'), equalTo(codigo));
      const snapshot = await get(q);

      if (!snapshot.exists()) throw new Error('Código QR inválido');

      const [mesaId, mesaData] = Object.entries(snapshot.val())[0];
      if (mesaData.estado !== 'libre') throw new Error('Mesa ya ocupada');
      if (mesaData.expiracion < Date.now()) throw new Error('Código QR expirado');

      await update(ref(db, `mesas/${mesaId}`), {
        estado: 'ocupada',
        ultimoUso: Date.now()
      });
      setMesaValidada(true);
      setQrData(mesaId);
      setMensajeValidacion('Mesa validada. Ahora puede pedir su comida.');
    } catch (error) {
      alert(`Error: ${error.message}`);
      console.error('Error QR:', error);
    }
  };

  // Función para llamar al mesero
  const handleCallWaiter = async () => {
    try {
      await update(ref(db, `mesas/${qrData}`), { llamando: true });
      alert("El mesero ha sido llamado.");
    } catch (error) {
      console.error("Error al llamar al mesero:", error);
      alert("Error al llamar al mesero.");
    }
  };

  return (
    <div style={styles.container}>
      <button onClick={volver} style={styles.btnVolver}>← Volver</button>
      {!mesaValidada ? (
        <div style={styles.qrContainer}>
          <h3 style={styles.title}>Escanear código de mesa</h3>
          <div style={styles.qrReaderWrapper}>
            <QrReader
              constraints={{ facingMode: 'environment' }}
              onResult={(result) => result?.text && validarQR(result.text)}
              scanDelay={500}
              videoStyle={{ borderRadius: '15px' }}
            />
          </div>
          <div style={styles.manualEntry}>
            <input
              type="text"
              placeholder="Ingresar código manualmente"
              value={codigoManual}
              onChange={(e) => setCodigoManual(e.target.value)}
              style={styles.inputCodigo}
            />
            <button onClick={() => validarQR(codigoManual)} style={styles.btnValidarManual}>
              Validar Código
            </button>
          </div>
        </div>
      ) : (
        <div style={styles.menuContainer}>
          <div style={styles.tiempoHeader}>
            <span>Mesa {qrData} • Tiempo restante: {tiempoRestante} min</span>
            <button onClick={() => extenderTiempo(30)} style={styles.extenderButton}>+30 min</button>
          </div>
          
          {/* Mostrar la respuesta del mesero si existe */}
          {meseroRespuesta && (
            <p style={styles.meseroRespuesta}>Respuesta del mesero: {meseroRespuesta}</p>
          )}
          
          <Menu mesaId={qrData} />
          
          <div style={styles.orderSummary}>
            <p style={styles.orderTotal}>Total: ${orderTotal.toFixed(2)}</p>
            <button onClick={handleCallWaiter} style={styles.callWaiterButton}>
              📢 Llamar al Mesero
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '800px',
    margin: '0 auto'
  },
  btnVolver: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '1.25rem',
    cursor: 'pointer',
    marginBottom: '1rem'
  },
  qrContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: '20px',
    padding: '2rem',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  qrReaderWrapper: {
    width: '100%',
    maxWidth: '500px',
    margin: '2rem auto',
    position: 'relative'
  },
  manualEntry: {
    marginTop: '1rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  inputCodigo: {
    padding: '0.8rem',
    borderRadius: '8px',
    border: '2px solid #ddd',
    width: '100%',
    maxWidth: '300px',
    marginBottom: '1rem'
  },
  btnValidarManual: {
    padding: '0.5rem 1rem',
    backgroundColor: '#2196F3',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  title: {
    fontSize: '1.5rem',
    color: '#333',
    textAlign: 'center'
  },
  tiempoHeader: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '1rem',
    borderRadius: '10px',
    marginBottom: '2rem',
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  extenderButton: {
    backgroundColor: '#fff',
    color: '#4CAF50',
    border: '1px solid #4CAF50',
    borderRadius: '25px',
    padding: '0.5rem 1rem',
    cursor: 'pointer'
  },
  menuContainer: {
    marginTop: '2rem'
  },
  meseroRespuesta: {
    color: 'blue',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: '1rem'
  },
  orderSummary: {
    position: 'fixed',
    bottom: '0',
    left: '0',
    right: '0',
    backgroundColor: '#fff',
    padding: '1rem',
    boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  orderTotal: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    margin: '0'
  },
  callWaiterButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#d32f2f',
    color: '#fff',
    border: 'none',
    borderRadius: '25px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  }
};

export default PedidoLocal;
