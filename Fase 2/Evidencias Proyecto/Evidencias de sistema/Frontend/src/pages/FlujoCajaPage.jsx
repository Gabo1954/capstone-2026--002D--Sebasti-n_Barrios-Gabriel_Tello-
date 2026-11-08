import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function FlujoCaja() {
  const [movimientos, setMovimientos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorBD, setErrorBD] = useState(null);

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const res = await api.get('/movimientos');
        const arreglo = Array.isArray(res.data) ? res.data : (res.data?.movimientos || []);
        setMovimientos(arreglo);
      } catch (error) {
        console.error('Error al cargar movimientos:', error);
        setErrorBD('No se pudo conectar con la base de datos.');
      } finally {
        setCargando(false);
      }
    };
    obtenerDatos();
  }, []);

  if (cargando) return <div style={{ padding: '20px', color: '#1E293B' }}>Cargando Flujo de Caja...</div>;
  if (errorBD) return <div style={{ padding: '20px', color: '#DC2626', fontWeight: 'bold' }}>⚠️ {errorBD}</div>;

  // Agrupar movimientos por Mes (YYYY-MM)
  const datosAgrupados = movimientos.reduce((acc, item) => {
    const mes = item.fecha ? String(item.fecha).substring(0, 7) : 'Sin Fecha';
    if (!acc[mes]) {
      acc[mes] = { mes, ingresos: 0, egresos: 0 };
    }
    const monto = Number(item.total || 0);
    const cond = String(item.condicion || '').toUpperCase();
    if (cond.includes('INGRESO')) {
      acc[mes].ingresos += monto;
    } else {
      acc[mes].egresos += monto;
    }
    return acc;
  }, {});

  const listaOrdenada = Object.values(datosAgrupados).sort((a, b) => a.mes.localeCompare(b.mes));
  const totalIngresos = listaOrdenada.reduce((sum, d) => sum + d.ingresos, 0);
  const totalEgresos = listaOrdenada.reduce((sum, d) => sum + d.egresos, 0);
  const saldoNeto = totalIngresos - totalEgresos;

  const formatCLP = (val) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(val || 0);

  // Configuración de datos para Chart.js
  const chartData = {
    labels: listaOrdenada.map(d => d.mes),
    datasets: [
      {
        label: 'Ingresos',
        data: listaOrdenada.map(d => d.ingresos),
        backgroundColor: '#166534',
        borderRadius: 4,
      },
      {
        label: 'Egresos',
        data: listaOrdenada.map(d => d.egresos),
        backgroundColor: '#DC2626',
        borderRadius: 4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${formatCLP(context.raw)}`
        }
      }
    },
    scales: {
      y: {
        ticks: {
          callback: (value) => `$${(value / 1000000).toFixed(1)}M`
        }
      }
    }
  };

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#1E293B', fontSize: '20px' }}>💵 Flujo de Caja Real</h2>
        <span style={{ fontSize: '13px', color: '#64748B' }}>Histórico consolidado de Ingresos y Egresos en PostgreSQL</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={cardStyle}>
          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 'bold' }}>TOTAL INGRESOS REALES</span>
          <h3 style={{ margin: '6px 0 0 0', color: '#166534' }}>{formatCLP(totalIngresos)}</h3>
        </div>
        <div style={cardStyle}>
          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 'bold' }}>TOTAL EGRESOS REALES</span>
          <h3 style={{ margin: '6px 0 0 0', color: '#991B1B' }}>{formatCLP(totalEgresos)}</h3>
        </div>
        <div style={cardStyle}>
          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 'bold' }}>SALDO EN CAJA</span>
          <h3 style={{ margin: '6px 0 0 0', color: saldoNeto >= 0 ? '#0284C7' : '#DC2626' }}>{formatCLP(saldoNeto)}</h3>
        </div>
      </div>

      <div style={cardStyle}>
        <h4 style={{ margin: '0 0 16px 0', color: '#334155' }}>Evolución Mensual de Caja</h4>
        {listaOrdenada.length === 0 ? (
          <p style={{ color: '#64748B', fontSize: '13px' }}>No hay movimientos registrados. Sube un archivo en "Carga Masiva".</p>
        ) : (
          <div style={{ height: '320px', width: '100%' }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        )}
      </div>
    </div>
  );
}

const cardStyle = { backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };