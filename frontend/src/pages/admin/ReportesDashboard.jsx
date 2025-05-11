// src/pages/admin/ReportesDashboard.jsx
import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';

const ReportesDashboard = () => {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dailyReport, setDailyReport] = useState({ total: 0, count: 0 });
  const [weeklyReport, setWeeklyReport] = useState({ total: 0, count: 0 });
  const [monthlyReport, setMonthlyReport] = useState({ total: 0, count: 0 });

  // Cargar en tiempo real pedidos pagados para generar reportes
  useEffect(() => {
    if (user && user.role === 'admin') {
      const pedidosRef = ref(db, 'pedidos');
      const unsubscribe = onValue(pedidosRef, (snapshot) => {
        const data = snapshot.val();
        let pedidosArray = data
          ? Object.entries(data).map(([id, pedido]) => ({ id, ...pedido }))
          : [];
        // Consideramos solo los pedidos pagados para reportar ventas
        pedidosArray = pedidosArray.filter(p => p.estado === 'pagado');
        setPedidos(pedidosArray);
        setLoading(false);

        // Inicializar acumuladores
        let dailyTotal = 0, dailyCount = 0;
        let weeklyTotal = 0, weeklyCount = 0;
        let monthlyTotal = 0, monthlyCount = 0;
        const now = new Date();

        pedidosArray.forEach(pedido => {
          let orderTotal = 0;
          if (pedido.items && Array.isArray(pedido.items)) {
            orderTotal = pedido.items.reduce((acc, item) => {
              const precio = Number(item.precio) || 0;
              const cantidad = Number(item.cantidad) || 1;
              return acc + precio * cantidad;
            }, 0);
          }
          const pedidoDate = new Date(pedido.timestamp);

          // Reporte diario: mismo año, mes y día
          if (
            pedidoDate.getFullYear() === now.getFullYear() &&
            pedidoDate.getMonth() === now.getMonth() &&
            pedidoDate.getDate() === now.getDate()
          ) {
            dailyTotal += orderTotal;
            dailyCount++;
          }
          // Reporte semanal: en los últimos 7 días (simplificado)
          const diffTime = now - pedidoDate;
          const diffDays = diffTime / (1000 * 60 * 60 * 24);
          if (diffDays < 7) {
            weeklyTotal += orderTotal;
            weeklyCount++;
          }
          // Reporte mensual: mismo año y mes
          if (
            pedidoDate.getFullYear() === now.getFullYear() &&
            pedidoDate.getMonth() === now.getMonth()
          ) {
            monthlyTotal += orderTotal;
            monthlyCount++;
          }
        });
        setDailyReport({ total: dailyTotal, count: dailyCount });
        setWeeklyReport({ total: weeklyTotal, count: weeklyCount });
        setMonthlyReport({ total: monthlyTotal, count: monthlyCount });
      });
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Control de acceso: solo administradores pueden ver esta sección
  if (!user || user.role !== 'admin') {
    return (
      <div style={styles.container}>
        <h2>Acceso Restringido</h2>
        <p>Solo administradores pueden ver esta sección.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2>Reportes de Ventas</h2>
      {loading ? (
        <p>Cargando reportes...</p>
      ) : (
        <div style={styles.dashboard}>
          <div style={styles.card}>
            <h3>Ventas Diarias</h3>
            <p>Cantidad de pedidos: {dailyReport.count}</p>
            <p>Total ventas: ${dailyReport.total.toFixed(2)}</p>
          </div>
          <div style={styles.card}>
            <h3>Ventas Semanales</h3>
            <p>Cantidad de pedidos: {weeklyReport.count}</p>
            <p>Total ventas: ${weeklyReport.total.toFixed(2)}</p>
          </div>
          <div style={styles.card}>
            <h3>Ventas Mensuales</h3>
            <p>Cantidad de pedidos: {monthlyReport.count}</p>
            <p>Total ventas: ${monthlyReport.total.toFixed(2)}</p>
          </div>
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
    fontFamily: 'Arial, sans-serif',
  },
  dashboard: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    justifyContent: 'space-around',
    marginTop: '2rem',
  },
  card: {
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    padding: '1.5rem',
    flex: '1 1 300px',
    textAlign: 'center',
  },
};

export default ReportesDashboard;
