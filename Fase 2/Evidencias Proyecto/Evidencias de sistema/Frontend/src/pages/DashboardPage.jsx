import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

// Registrar componentes de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function DashboardPage() {
  const [movimientos, setMovimientos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const res = await api.get('/movimientos');
        setMovimientos(res.data);
      } catch (error) {
        console.error('Error al cargar datos del Dashboard:', error);
      } finally {
        setCargando(false);
      }
    };
    obtenerDatos();
  }, []);

  // 1. Cálculos de KPIs principales
  const totalIngresos = movimientos
    .filter(m => m.condicion === 'INGRESO OPERACIONAL' || m.condicion === 'INGRESO NO OPERACIONAL')
    .reduce((acc, m) => acc + Number(m.total || 0), 0);

  const totalGastos = movimientos
    .filter(m => m.condicion === 'GASTO' || m.condicion === 'COSTO')
    .reduce((acc, m) => acc + Number(m.total || 0), 0);

  const balanceNeto = totalIngresos - totalGastos;

  // 2. Conteo por Estado de Conciliación (para Gráfico de Torta)
  const conciliados = movimientos.filter(m => m.estado_conciliacion === 'CONCILIADO').length;
  const pendientes = movimientos.filter(m => m.estado_conciliacion === 'PENDIENTE').length;
  const rechazados = movimientos.filter(m => m.estado_conciliacion === 'RECHAZADO').length;

  const dataDoughnut = {
    labels: ['Conciliados', 'Pendientes', 'Rechazados'],
    datasets: [
      {
        data: [conciliados, pendientes, rechazados],
        backgroundColor: ['#22C55E', '#EAB308', '#EF4444'],
        borderWidth: 1,
      },
    ],
  };

  const formatMoney = (val) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(val || 0);

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>
      
      {/* CABECERA */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#1E293B', fontSize: '20px' }}>Dashboard - Resumen Financiero</h2>
        <span style={{ fontSize: '13px', color: '#64748B' }}>
          Indicadores clave del estado de la empresa
        </span>
      </div>

      {cargando ? (
        <p>Cargando métricas...</p>
      ) : (
        <>
          {/* SECCIÓN 1: TARJETAS KPI */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            
            <div style={cardStyle}>
              <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 'bold' }}>TOTAL INGRESOS</span>
              <h3 style={{ margin: '8px 0 0 0', color: '#166534', fontSize: '22px' }}>{formatMoney(totalIngresos)}</h3>
            </div>

            <div style={cardStyle}>
              <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 'bold' }}>TOTAL GASTOS Y COSTOS</span>
              <h3 style={{ margin: '8px 0 0 0', color: '#991B1B', fontSize: '22px' }}>{formatMoney(totalGastos)}</h3>
            </div>

            <div style={cardStyle}>
              <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 'bold' }}>BALANCE NETO</span>
              <h3 style={{ margin: '8px 0 0 0', color: balanceNeto >= 0 ? '#0284C7' : '#DC2626', fontSize: '22px' }}>
                {formatMoney(balanceNeto)}
              </h3>
            </div>

            <div style={cardStyle}>
              <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 'bold' }}>MOVIMIENTOS REGISTRADOS</span>
              <h3 style={{ margin: '8px 0 0 0', color: '#1E293B', fontSize: '22px' }}>{movimientos.length}</h3>
            </div>

          </div>

          {/* SECCIÓN 2: GRÁFICOS Y RESUMEN DE REGISTROS RECIENTES */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            
            {/* Gráfico por Estado de Conciliación */}
            <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h4 style={{ margin: '0 0 16px 0', color: '#334155' }}>Estado de Conciliación</h4>
              <div style={{ width: '220px', height: '220px' }}>
                <Doughnut data={dataDoughnut} options={{ maintainAspectRatio: false }} />
              </div>
            </div>

            {/* Últimos 5 Movimientos */}
            <div style={cardStyle}>
              <h4 style={{ margin: '0 0 16px 0', color: '#334155' }}>Últimos Movimientos Registrados</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                    <th style={{ paddingBottom: '8px' }}>Razón Social</th>
                    <th style={{ paddingBottom: '8px' }}>Estado</th>
                    <th style={{ paddingBottom: '8px', textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {movimientos.slice(0, 5).map((m) => (
                    <tr key={m.id_movimiento} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '8px 0' }}>{m.razon_social}</td>
                      <td style={{ padding: '8px 0' }}>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 'bold',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: m.estado_conciliacion === 'CONCILIADO' ? '#DCFCE7' : '#FEF9C3',
                          color: m.estado_conciliacion === 'CONCILIADO' ? '#15803D' : '#A16207'
                        }}>
                          {m.estado_conciliacion || 'PENDIENTE'}
                        </span>
                      </td>
                      <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 'bold' }}>
                        {formatMoney(m.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </>
      )}

    </div>
  );
}

const cardStyle = {
  backgroundColor: '#FFFFFF',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  boxSizing: 'border-box'
};