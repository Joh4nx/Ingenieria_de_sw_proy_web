// src/pages/cliente/PedidoLocal.jsx
import React, { useState, useEffect } from 'react';
import { QrReader } from 'react-qr-reader';
import {
  ref,
  onValue,
  update,
  query,
  orderByChild,
  equalTo,
  get
} from 'firebase/database';
import { db, auth } from '../../services/firebase';
import { signInAnonymously } from 'firebase/auth';
import Menu from './Menu';

const PedidoLocal = ({ volver }) => {
  const [qrData, setQrData] = useState('');
  const [mesaValidada, setMesaValidada] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(null);
  const [mensajeValidacion, setMensajeValidacion] = useState('');
  const [codigoManual, setCodigoManual] = useState('');
  const [orderTotal, setOrderTotal] = useState(0);
  const [meseroRespuesta, setMeseroRespuesta] = useState('');
  const [errorAnonimo, setErrorAnonimo] = useState('');

  // 1) Intentar autenticarse anónimamente
  useEffect(() => {
    // Si ya hay un usuario (quizá quedó de otra sesión), no necesitamos volver a firmar
    if (!auth.currentUser) {
      signInAnonymously(auth)
        .catch(err => {
          console.error('Error al autenticarse anónimamente:', err);
          // Si cae aquí, es porque la autenticación anónima está deshabilitada en Firebase.
          setErrorAnonimo(
            '😞 No se pudo conectar de forma anónima. ' +
            'Por favor, habilita “Anonymous” en Authentication → Sign-in method de tu Firebase Console.'
          );
        });
    }
  }, []);

  // 2) Efecto para actualizar tiempo restante y respuesta del mesero
  useEffect(() => {
    if (!mesaValidada || !qrData) return;
    // Solo seguimos si hay un usuario anónimo ya firmado (auth.currentUser)
    if (!auth.currentUser) return;

    const mesaRef = ref(db, `mesas/${qrData}`);
    const unsubscribe = onValue(mesaRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Actualizar tiempo restante en minutos
        const difMs = data.expiracion - Date.now();
        setTiempoRestante(Math.max(0, Math.floor(difMs / 60000)));

        // Mostrar respuesta del mesero si la hay (no sea 'true' o 'llamando')
        if (data.llamando && data.llamando !== true && data.llamando !== 'llamando') {
          setMeseroRespuesta(data.llamando);
        } else {
          setMeseroRespuesta('');
        }
      }
    });

    return () => unsubscribe();
  }, [mesaValidada, qrData]);

  // 3) Efecto para calcular el total de la cuenta (solo pedidos “pendiente” de esta mesa)
  useEffect(() => {
    if (!mesaValidada || !qrData) return;
    if (!auth.currentUser) return;

    const pedidosRef = ref(db, 'pedidos');
    const unsubscribe = onValue(pedidosRef, (snapshot) => {
      let total = 0;
      const data = snapshot.val();
      if (data) {
        Object.values(data).forEach((pedido) => {
          // Sumamos solo si pertenece a esta mesa, está pendiente y tiene items
          if (
            pedido.mesa === qrData &&
            pedido.estado === 'pendiente' &&
            pedido.items
          ) {
            // items puede ser array o un objeto; unificamos a array
            const itemsArr = Array.isArray(pedido.items)
              ? pedido.items
              : Object.values(pedido.items);

            itemsArr.forEach((item) => {
              const precio = Number(item.precio) || 0;
              const cantidad = Number(item.cantidad) || 1;
              total += precio * cantidad;
            });
          }
        });
      }
      setOrderTotal(total);
    });

    return () => unsubscribe();
  }, [mesaValidada, qrData]);

  // 4) Extender tiempo restante en “minutos”
  const extenderTiempo = async (minutos) => {
    if (!auth.currentUser) {
      alert('⚠️ Aún no estás autenticado. Intenta recargar la página.');
      return;
    }
    try {
      await update(ref(db, `mesas/${qrData}`), {
        expiracion: Date.now() + minutos * 60000
      });
    } catch (error) {
      console.error('Error al extender tiempo:', error);
      alert('Error al extender el tiempo de la mesa.');
    }
  };

  // 5) Validar el QR (escaneado o código manual)
  const validarQR = async (codigo) => {
    if (!codigo) return;
    if (!auth.currentUser) {
      alert('⚠️ Aún no estás autenticado. Por favor, recarga la página para intentar nuevamente.');
      return;
    }

    try {
      const mesasRef = ref(db, 'mesas');
      const q = query(mesasRef, orderByChild('qr'), equalTo(codigo));
      const snapshot = await get(q);

      if (!snapshot.exists()) throw new Error('Código QR inválido');

      // Tomamos el primer registro coincidente
      const [[mesaId, mesaData]] = Object.entries(snapshot.val());

      if (mesaData.estado !== 'libre') {
        throw new Error('Mesa ya ocupada');
      }
      if (mesaData.expiracion < Date.now()) {
        throw new Error('Código QR expirado');
      }

      // Si todo ok, marcamos la mesa como ocupada y guardamos último uso
      await update(ref(db, `mesas/${mesaId}`), {
        estado: 'ocupada',
        ultimoUso: Date.now()
      });

      setMesaValidada(true);
      setQrData(mesaId);
      setMensajeValidacion('✅ Mesa validada. Ahora puedes pedir tu comida.');
    } catch (err) {
      console.error('Error validando QR:', err);
      alert(`Error: ${err.message}`);
    }
  };

  // 6) Llamar al mesero
  const handleCallWaiter = async () => {
    if (!auth.currentUser) {
      alert('⚠️ Aún no estás autenticado. Por favor, recarga la página.');
      return;
    }
    try {
      await update(ref(db, `mesas/${qrData}`), { llamando: true });
      alert('El mesero ha sido llamado.');
    } catch (error) {
      console.error('Error al llamar al mesero:', error);
      alert('Error al llamar al mesero.');
    }
  };

  return (
    <div style={styles.container}>
      {/* Botón para volver a la pantalla anterior */}
      <button onClick={volver} style={styles.btnVolver}>
        ← Volver
      </button>

      {/*
        Si hubo un problema al intentar autenticarse de forma anónima,
        mostramos un mensaje claro en pantalla.
      */}
      {errorAnonimo && (
        <div style={styles.errorAuthContainer}>
          <p style={styles.errorAuthText}>
            {errorAnonimo}
          </p>
        </div>
      )}

      {!mesaValidada ? (
        // ── PANTALLA DE LECTURA DE QR (o código manual) ──
        <div style={styles.qrContainer}>
          <h3 style={styles.title}>Escanear código de mesa</h3>

          <div style={styles.qrReaderWrapper}>
            <QrReader
              constraints={{ facingMode: 'environment' }}
              onResult={(result) => {
                if (result?.text) {
                  validarQR(result.text);
                }
              }}
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
            <button
              onClick={() => validarQR(codigoManual.trim())}
              style={styles.btnValidarManual}
            >
              Validar Código
            </button>
          </div>

          {mensajeValidacion && (
            <p style={styles.mensajeValidacion}>
              {mensajeValidacion}
            </p>
          )}
        </div>
      ) : (
        // ── PANTALLA DE PEDIDO (ya con la mesa validada) ──
        <div style={styles.menuContainer}>
          <div style={styles.tiempoHeader}>
            <span>
              Mesa {qrData} • Tiempo restante: {tiempoRestante} min
            </span>
            <button
              onClick={() => extenderTiempo(30)}
              style={styles.extenderButton}
            >
              +30 min
            </button>
          </div>

          {meseroRespuesta && (
            <p style={styles.meseroRespuesta}>
              Respuesta del mesero: {meseroRespuesta}
            </p>
          )}

          <Menu mesaId={qrData} />

          <div style={styles.orderSummary}>
            <p style={styles.orderTotal}>
              Total: ${orderTotal.toFixed(2)}
            </p>
            <button
              onClick={handleCallWaiter}
              style={styles.callWaiterButton}
            >
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
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif'
  },
  btnVolver: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '1.25rem',
    cursor: 'pointer',
    marginBottom: '1rem'
  },
  // Contenedor si falla la autenticación anónima
  errorAuthContainer: {
    backgroundColor: '#fdd',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1rem'
  },
  errorAuthText: {
    color: '#900',
    fontWeight: 'bold',
    textAlign: 'center'
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
  mensajeValidacion: {
    marginTop: '1rem',
    color: '#4CAF50',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  menuContainer: {
    marginTop: '2rem'
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
