// src/pages/cliente/TipoPedido.jsx
import React, { useState } from 'react';
import NavbarCliente from '../../components/NavbarCliente';
import PedidoLocal from './PedidoLocal';
import PedidoOnline from './PedidoOnline';
import { FaQrcode, FaTruck } from 'react-icons/fa';

const TipoPedido = () => {
  const [tipoPedido, setTipoPedido] = useState(null);

  return (
    <>
      <NavbarCliente />
      <div style={styles.container}>
        {!tipoPedido ? (
          <>
            <h2 style={styles.title}>Seleccione Tipo de Pedido</h2>
            <div style={styles.opciones}>
              <button style={styles.btnLocal} onClick={() => setTipoPedido('local')}>
                <FaQrcode size={40} />
                <span>Pedir en el Local</span>
              </button>
              <button style={styles.btnOnline} onClick={() => setTipoPedido('online')}>
                <FaTruck size={40} />
                <span>Pedido a Domicilio</span>
              </button>
            </div>
          </>
        ) : (
          <>
            {tipoPedido === 'local' ? (
              <PedidoLocal volver={() => setTipoPedido(null)} />
            ) : (
              <PedidoOnline volver={() => setTipoPedido(null)} />
            )}
          </>
        )}
      </div>
    </>
  );
};

const styles = {
  container: {
    padding: '2rem',
    textAlign: 'center'
  },
  title: {
    marginBottom: '2rem',
    fontSize: '2rem'
  },
  opciones: {
    display: 'flex',
    justifyContent: 'center',
    gap: '2rem'
  },
  btnLocal: {
    padding: '2rem',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '15px',
    cursor: 'pointer',
    flexDirection: 'column',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  btnOnline: {
    padding: '2rem',
    backgroundColor: '#2196F3',
    color: '#fff',
    border: 'none',
    borderRadius: '15px',
    cursor: 'pointer',
    flexDirection: 'column',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  }
};

export default TipoPedido;
