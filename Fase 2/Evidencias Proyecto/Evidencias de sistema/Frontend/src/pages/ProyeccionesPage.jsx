import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Proyecciones() {
  const [movimientosReales, setMovimientosReales] = useState([]);
  const [estimaciones, setEstimaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [form, setForm] = useState({
    concepto: '',
    tipo: 'INGRESO',
    monto: '',
    fecha: new Date().toISOString().substring(0, 7)
  });

  useEffect(() => {
    const obtenerMovimientos = async () => {
      try {
        const res = await api.get('/movimientos');
        const arreglo = Array.isArray(res.data) ? res.data : (res.data?.movimientos || []);
        setMovimientosReales(arreglo);
      } catch (error) {
        console.error('Error al obtener movimientos:', error);
      } finally {
        setCargando(false);
      }
    };
    obtenerMovimientos();
  }, []);

  const handleAgregarEstimacion = (e) => {
    e.preventDefault();
    if (!form.concepto || !form.monto || !form.fecha) return;

    const nuevaVal = {
      id: Date.now(),
      concepto: form.concepto,
      tipo: form.tipo,
      monto: Number(form.monto),
      fecha: form.fecha
    };

    setEstimaciones([...estimaciones, nuevaVal]);
    setForm({ concepto: '', tipo: 'INGRESO', monto: '', fecha: form.fecha });
  };

  const handleEliminarEstimacion = (id) => {
    setEstimaciones(estimaciones.filter(e => e.id !== id));
  };

  // Consolidar Histórico + Simulaciones
  const mapaMeses = {};

  movimientosReales.forEach(item => {
    const mes = item.fecha ? String(item.fecha).substring(0, 7) : 'Sin Fecha';
    if (!mapaMeses[mes]) mapaMeses[mes] = { mes, ingreso: 0, egreso: 0 };
    const monto = Number(item.total || 0);
    const cond = String(item.condicion || '').toUpperCase();
    if (cond.includes('INGRESO')) mapaMeses[mes].ingreso += monto;
    else mapaMeses[mes].egreso += monto;
  });

  estimaciones.forEach(est => {
    const mes = est.fecha;
    if (!mapaMeses[mes]) mapaMeses[mes] = { mes, ingreso: 0, egreso: 0 };
    if (est.tipo === 'INGRESO') mapaMeses[mes].ingreso += est.monto;
    else mapaMeses[mes].egreso += est.monto;
  });

  const lista = Object.values(mapaMeses).sort((a, b) => a.mes.localeCompare(b.mes));
  
  let acumulado = 0;
  const saldoProyectado = lista.map(d => {
    acumulado += (d.ingreso - d.egreso);
    return acumulado;
  });

  const formatCLP = (val) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(val || 0);

  const chartData = {
    labels: lista.map(d => d.mes),
    datasets: [
      {
        fill: true,
        label: 'Saldo Proyectado Acumulado',
        data: saldoProyectado,
        borderColor: '#0284C7',
        backgroundColor: 'rgba(2, 132, 199, 0.15)',
        tension: 0.3,
      },
      {
        fill: false,
        label: 'Ingresos Totales (Real + Simulación)',
        data: lista.map(d => d.ingreso),
        borderColor: '#166534',
        backgroundColor: '#166534',
      },
      {
        fill: false,
        label: 'Egresos Totales (Real + Simulación)',
        data: lista.map(d => d.egreso),
        borderColor: '#DC2626',
        backgroundColor: '#DC2626',
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
        ticks: { callback: (val) => `$${(val / 1000000).toFixed(1)}M` }
      }
    }
  };

  if (cargando) return <div style={{ padding: '20px' }}>Cargando módulo de proyecciones...</div>;

  return (
    <div style={{ width: '100%', padding: '20px', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#1E293B', fontSize: '20px' }}>📈 Proyección Financiera (Módulo Administrador)</h2>
        <span style={{ fontSize: '13px', color: '#64748B' }}>Ingresa variables simuladas en memoria sin alterar la Base de Datos.</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginBottom: '24px' }}>
        
        {/* FORMULARIO DE SIMULACIÓN */}
        <div style={cardStyle}>
          <h4 style={{ margin: '0 0 12px 0', color: '#0284C7' }}>+ Nueva Variable Simulada</h4>
          <form onSubmit={handleAgregarEstimacion} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={labelStyle}>Concepto Estimado</label>
              <input 
                type="text" 
                placeholder="Ej: Cobro Proyecto X" 
                value={form.concepto}
                onChange={e => setForm({ ...form, concepto: e.target.value })}
                style={inputStyle} 
                required 
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Tipo</label>
                <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} style={inputStyle}>
                  <option value="INGRESO">Ingreso (+)</option>
                  <option value="EGRESO">Egreso (-)</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Mes Futuro</label>
                <input type="month" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} style={inputStyle} required />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Monto ($ CLP)</label>
              <input type="number" placeholder="Ej: 3500000" value={form.monto} onChange={e => setForm({ ...form, monto: e.target.value })} style={inputStyle} required />
            </div>
            <button type="submit" style={btnStyle}>➕ Simular en Gráfico</button>
          </form>
        </div>

        {/* LISTADO DE VARIABLES */}
        <div style={cardStyle}>
          <h4 style={{ margin: '0 0 12px 0', color: '#334155' }}>Escenarios Simulados ({estimaciones.length})</h4>
          <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
            {estimaciones.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#94A3B8' }}>No hay variables simuladas aún.</p>
            ) : (
              <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid #E2E8F0' }}>
                    <th>Mes</th>
                    <th>Concepto</th>
                    <th>Tipo</th>
                    <th>Monto</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {estimaciones.map(est => (
                    <tr key={est.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '6px 0' }}>{est.fecha}</td>
                      <td>{est.concepto}</td>
                      <td style={{ fontWeight: 'bold', color: est.tipo === 'INGRESO' ? '#166534' : '#DC2626' }}>{est.tipo}</td>
                      <td>{formatCLP(est.monto)}</td>
                      <td>
                        <button onClick={() => handleEliminarEstimacion(est.id)} style={{ border: 'none', background: 'none', color: '#DC2626', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <div style={cardStyle}>
        <h4 style={{ margin: '0 0 16px 0', color: '#1E293B' }}>📊 Curva de Proyección Financiera</h4>
        <div style={{ height: '340px', width: '100%' }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}

const cardStyle = { backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const inputStyle = { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #CBD5E1', boxSizing: 'border-box' };
const labelStyle = { fontSize: '11px', fontWeight: 'bold', color: '#64748B', display: 'block', marginBottom: '4px' };
const btnStyle = { backgroundColor: '#0284C7', color: 'white', border: 'none', padding: '10px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '6px' };