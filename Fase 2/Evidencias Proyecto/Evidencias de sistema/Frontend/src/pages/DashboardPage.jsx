import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';

// Registrar componentes de Chart.js
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title
);

export default function DashboardPage() {
  const [movimientos, setMovimientos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorBD, setErrorBD] = useState(null);

  // Selector de Año (Por defecto 2026)
  const [anioSeleccionado, setAnioSeleccionado] = useState(2026);

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const res = await api.get('/movimientos');
        const arreglo = Array.isArray(res.data) ? res.data : (res.data?.movimientos || []);
        setMovimientos(arreglo);
      } catch (error) {
        console.error('Error al cargar datos del Dashboard:', error);
        setErrorBD('No se pudo conectar con la base de datos.');
      } finally {
        setCargando(false);
      }
    };
    obtenerDatos();
  }, []);

  // Formateador CLP
  const formatMoney = (val) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val || 0);

  // Helper para semana ISO
  const getWeekNumber = (dateString) => {
    if (!dateString) return null;
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return null;
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  };

  // Procesamiento de datos y gráficos
  const {
    aniosDisponibles,
    movsDelAnio,
    totalIngresos,
    totalGastos,
    balanceNeto,
    dataConciliacion,
    dataEgresos,
    dataTopProveedores,
    dataRentabilidadProyectos,
    dataBurnRate
  } = useMemo(() => {
    if (!movimientos.length) {
      return {
        aniosDisponibles: [2026],
        movsDelAnio: [],
        totalIngresos: 0,
        totalGastos: 0,
        balanceNeto: 0,
        dataConciliacion: null,
        dataEgresos: null,
        dataTopProveedores: null,
        dataRentabilidadProyectos: null,
        dataBurnRate: null
      };
    }

    // 1. Obtener lista de años únicos
    const aniosSet = new Set();
    movimientos.forEach(m => {
      if (m.fecha) {
        const a = new Date(m.fecha).getFullYear();
        if (!isNaN(a)) aniosSet.add(a);
      }
    });
    const aniosDisponibles = Array.from(aniosSet).sort((a, b) => b - a);
    if (!aniosDisponibles.length) aniosDisponibles.push(2026);

    // 2. Filtrar movimientos por año seleccionado
    const movsDelAnio = movimientos.filter(m => {
      if (!m.fecha) return false;
      return new Date(m.fecha).getFullYear() === Number(anioSeleccionado);
    });

    let totIng = 0;
    let totGas = 0;
    let conc = 0, pend = 0, rech = 0;
    let cFijo = 0, cVar = 0, gFijo = 0, gVar = 0;

    const proveedoresMap = {};
    const proyectosMap = {};
    const burnRateMap = {};

    movsDelAnio.forEach(m => {
      const monto = Number(m.total || m.neto_liquido || m.monto || 0);
      const cond = String(m.condicion || m.tipo || '').toUpperCase().trim();
      const flujo = String(m.tipo_flujo || m.flujo || '').toUpperCase().trim();
      const estado = String(m.estado_conciliacion || '').toUpperCase().trim();
      const razonSocial = m.razon_social || m.descripcion || 'Sin Identificar';
      const nombreProyecto = m.proyecto || 'GENERAL';
      const numSemana = getWeekNumber(m.fecha);

      // A) Ingresos vs Gastos
      const esIngreso = cond.includes('INGRESO');
      if (esIngreso) {
        totIng += monto;
      } else {
        totGas += monto;

        // Top Proveedores
        proveedoresMap[razonSocial] = (proveedoresMap[razonSocial] || 0) + monto;

        // Desglose de Egresos
        if (cond.includes('COSTO')) {
          if (flujo.includes('FIJO')) cFijo += monto;
          else cVar += monto;
        } else {
          if (flujo.includes('FIJO')) gFijo += monto;
          else gVar += monto;
        }

        // Burn Rate Semanal
        if (numSemana) {
          burnRateMap[numSemana] = (burnRateMap[numSemana] || 0) + monto;
        }
      }

      // Rentabilidad por Proyecto
      if (!proyectosMap[nombreProyecto]) {
        proyectosMap[nombreProyecto] = { ingresos: 0, egresos: 0 };
      }
      if (esIngreso) {
        proyectosMap[nombreProyecto].ingresos += monto;
      } else {
        proyectosMap[nombreProyecto].egresos += monto;
      }

      // Conciliación
      if (estado === 'CONCILIADO') conc++;
      else if (estado === 'RECHAZADO') rech++;
      else pend++;
    });

    // --- CONFIGURACIÓN DE LOS GRÁFICOS ---

    // Gráfico de Estado de Conciliación
    const chartConciliacion = {
      labels: ['Conciliados', 'Pendientes', 'Rechazados'],
      datasets: [
        {
          data: [conc, pend, rech],
          backgroundColor: ['#22C55E', '#EAB308', '#EF4444'],
          borderWidth: 1
        }
      ]
    };

    // 1. Gráfico de Distribución de Gastos y Costos (Donut)
    const chartEgresos = {
      labels: ['Costo Fijo', 'Costo Variable', 'Gasto Fijo', 'Gasto Variable'],
      datasets: [
        {
          data: [cFijo, cVar, gFijo, gVar],
          backgroundColor: ['#EF4444', '#3B82F6', '#F59E0B', '#8B5CF6'],
          borderWidth: 1
        }
      ]
    };

    // 2. Gráfico de Top 5 Proveedores (Barras Horizontales)
    const top5Proveedores = Object.entries(proveedoresMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const chartTopProveedores = {
      labels: top5Proveedores.map(p => p[0].length > 20 ? p[0].substring(0, 18) + '...' : p[0]),
      datasets: [
        {
          label: 'Monto Total Pagado',
          data: top5Proveedores.map(p => p[1]),
          backgroundColor: '#0284C7',
          borderRadius: 4
        }
      ]
    };

    // 3. Gráfico de Rentabilidad por Proyecto (Barras Agrupadas)
    const listaProyectos = Object.keys(proyectosMap);
    const chartRentabilidadProyectos = {
      labels: listaProyectos,
      datasets: [
        {
          label: 'Ingresos',
          data: listaProyectos.map(p => proyectosMap[p].ingresos),
          backgroundColor: '#166534',
          borderRadius: 4
        },
        {
          label: 'Egresos',
          data: listaProyectos.map(p => proyectosMap[p].egresos),
          backgroundColor: '#991B1B',
          borderRadius: 4
        }
      ]
    };

    // 4. Gráfico de Burn Rate Semanal (Líneas)
    const semanasOrdenadas = Object.keys(burnRateMap).sort((a, b) => Number(a) - Number(b));
    const chartBurnRate = {
      labels: semanasOrdenadas.map(s => `Sem. ${s}`),
      datasets: [
        {
          label: 'Salidas de Caja',
          data: semanasOrdenadas.map(s => burnRateMap[s]),
          borderColor: '#DC2626',
          backgroundColor: 'rgba(220, 38, 38, 0.1)',
          fill: true,
          tension: 0.3
        }
      ]
    };

    return {
      aniosDisponibles,
      movsDelAnio,
      totalIngresos: totIng,
      totalGastos: totGas,
      balanceNeto: totIng - totGas,
      dataConciliacion: chartConciliacion,
      dataEgresos: chartEgresos,
      dataTopProveedores: chartTopProveedores,
      dataRentabilidadProyectos: chartRentabilidadProyectos,
      dataBurnRate: chartBurnRate
    };
  }, [movimientos, anioSeleccionado]);

  if (cargando) return <div style={{ padding: '20px', color: '#1E293B' }}>Cargando métricas del Dashboard...</div>;
  if (errorBD) return <div style={{ padding: '20px', color: '#DC2626', fontWeight: 'bold' }}>{errorBD}</div>;

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>
      
      {/* CABECERA Y FILTRO DE AÑO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#1E293B', fontSize: '20px' }}>Dashboard - Resumen Financiero</h2>
          <span style={{ fontSize: '13px', color: '#64748B' }}>
            Indicadores gerenciales y análisis visual del negocio
          </span>
        </div>

        {/* SELECTOR DE AÑO */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FFFFFF', padding: '6px 12px', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
          <label htmlFor="anioDash" style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155' }}>Año:</label>
          <select 
            id="anioDash"
            value={anioSeleccionado} 
            onChange={(e) => setAnioSeleccionado(Number(e.target.value))}
            style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #94A3B8', fontWeight: 'bold', color: '#0284C7', cursor: 'pointer' }}
          >
            {aniosDisponibles.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      {/* SECCIÓN 1: TARJETAS KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        
        <div style={cardStyle}>
          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 'bold' }}>TOTAL INGRESOS ({anioSeleccionado})</span>
          <h3 style={{ margin: '8px 0 0 0', color: '#166534', fontSize: '22px' }}>{formatMoney(totalIngresos)}</h3>
        </div>

        <div style={cardStyle}>
          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 'bold' }}>TOTAL GASTOS Y COSTOS ({anioSeleccionado})</span>
          <h3 style={{ margin: '8px 0 0 0', color: '#991B1B', fontSize: '22px' }}>{formatMoney(totalGastos)}</h3>
        </div>

        <div style={cardStyle}>
          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 'bold' }}>BALANCE NETO ({anioSeleccionado})</span>
          <h3 style={{ margin: '8px 0 0 0', color: balanceNeto >= 0 ? '#0284C7' : '#DC2626', fontSize: '22px' }}>
            {formatMoney(balanceNeto)}
          </h3>
        </div>

        <div style={cardStyle}>
          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 'bold' }}>MOVIMIENTOS REGISTRADOS</span>
          <h3 style={{ margin: '8px 0 0 0', color: '#1E293B', fontSize: '22px' }}>{movsDelAnio.length}</h3>
        </div>

      </div>

      {/* SECCIÓN 2: GRÁFICOS ESTRUCTURALES Y RESUMEN */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* Gráfico Original: Estado de Conciliación */}
        <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h4 style={{ margin: '0 0 16px 0', color: '#334155' }}>Estado de Conciliación</h4>
          {dataConciliacion && (
            <div style={{ width: '200px', height: '200px' }}>
              <Doughnut data={dataConciliacion} options={{ maintainAspectRatio: false }} />
            </div>
          )}
        </div>

        {/* 1. Gráfico de Distribución de Gastos y Costos */}
        <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h4 style={{ margin: '0 0 16px 0', color: '#334155' }}>Distribución de Egresos</h4>
          {dataEgresos && (
            <div style={{ width: '200px', height: '200px' }}>
              <Doughnut data={dataEgresos} options={{ maintainAspectRatio: false }} />
            </div>
          )}
        </div>

        {/* 2. Gráfico de Top 5 Proveedores */}
        <div style={cardStyle}>
          <h4 style={{ margin: '0 0 16px 0', color: '#334155' }}>Top 5 Proveedores con Mayor Gasto</h4>
          {dataTopProveedores && (
            <div style={{ height: '200px', width: '100%' }}>
              <Bar 
                data={dataTopProveedores} 
                options={{ 
                  indexAxis: 'y', 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } }
                }} 
              />
            </div>
          )}
        </div>

      </div>

      {/* SECCIÓN 3: ANÁLISIS DE RENTABILIDAD Y FLUIDEZ DE CAJA */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* 3. Comparativo de Rentabilidad por Proyecto */}
        <div style={cardStyle}>
          <h4 style={{ margin: '0 0 16px 0', color: '#334155' }}>Comparativo de Rentabilidad por Proyecto</h4>
          {dataRentabilidadProyectos && (
            <div style={{ height: '250px', width: '100%' }}>
              <Bar data={dataRentabilidadProyectos} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          )}
        </div>

        {/* 4. Burn Rate / Tasa de Salida Semanal */}
        <div style={cardStyle}>
          <h4 style={{ margin: '0 0 16px 0', color: '#334155' }}>Burn Rate Semanal (Salidas de Caja)</h4>
          {dataBurnRate && (
            <div style={{ height: '250px', width: '100%' }}>
              <Line data={dataBurnRate} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          )}
        </div>

      </div>

      {/* SECCIÓN 4: ÚLTIMOS MOVIMIENTOS REGISTRADOS */}
      <div style={cardStyle}>
        <h4 style={{ margin: '0 0 16px 0', color: '#334155' }}>Últimos Movimientos ({anioSeleccionado})</h4>
        {movsDelAnio.length === 0 ? (
          <p style={{ color: '#64748B', fontSize: '13px' }}>Sin movimientos registrados en este año.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                <th style={{ paddingBottom: '8px' }}>Razón Social / Descripción</th>
                <th style={{ paddingBottom: '8px' }}>Proyecto</th>
                <th style={{ paddingBottom: '8px' }}>Estado</th>
                <th style={{ paddingBottom: '8px', textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {movsDelAnio.slice(0, 5).map((m, idx) => (
                <tr key={m.id_movimiento || idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '8px 0' }}>{m.razon_social || m.descripcion || 'S/N'}</td>
                  <td style={{ padding: '8px 0', color: '#64748B' }}>{m.proyecto || 'GENERAL'}</td>
                  <td style={{ padding: '8px 0' }}>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 'bold',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: String(m.estado_conciliacion).toUpperCase() === 'CONCILIADO' ? '#DCFCE7' : '#FEF9C3',
                      color: String(m.estado_conciliacion).toUpperCase() === 'CONCILIADO' ? '#15803D' : '#A16207'
                    }}>
                      {m.estado_conciliacion || 'PENDIENTE'}
                    </span>
                  </td>
                  <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 'bold', color: String(m.condicion||'').toUpperCase().includes('INGRESO') ? '#166534' : '#DC2626' }}>
                    {formatMoney(m.total || m.neto_liquido || m.monto)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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