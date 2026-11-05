import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function ProyectosPage() {
  const [proyectos, setProyectos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  const [movimientosDetalle, setMovimientosDetalle] = useState([]);

  useEffect(() => {
    cargarProyectos();
  }, []);

  const cargarProyectos = async () => {
    try {
      setCargando(true);
      const res = await api.get('/proyectos');
      setProyectos(res.data);
    } catch (err) {
      console.error('Error al cargar proyectos:', err);
      setError('No se pudieron cargar los proyectos.');
    } finally {
      setCargando(false);
    }
  };

  const verDetalle = async (nombreProyecto) => {
    try {
      setProyectoSeleccionado(nombreProyecto);
      const res = await api.get(`/proyectos/${encodeURIComponent(nombreProyecto)}`);
      setMovimientosDetalle(res.data);
    } catch (err) {
      console.error('Error al cargar detalle:', err);
    }
  };

  const proyectosFiltrados = proyectos.filter((p) =>
    (p.proyecto || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div style={{ padding: '20px', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, color: '#1E293B' }}>📁 Gestión de Proyectos</h2>
          <span style={{ fontSize: '13px', color: '#64748B' }}>
            Resumen financiero y control por centro de costo / proyecto
          </span>
        </div>
        <input
          type="text"
          placeholder="🔍 Buscar proyecto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{
            padding: '8px 14px',
            borderRadius: '6px',
            border: '1px solid #CBD5E1',
            fontSize: '13px',
            width: '240px'
          }}
        />
      </div>

      {error && (
        <div style={{ padding: '12px', backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: '6px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {cargando ? (
        <p style={{ textAlign: 'center', color: '#64748B' }}>Cargando proyectos...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {proyectosFiltrados.map((p, idx) => {
            const ingresos = Number(p.total_ingresos) || 0;
            const egresos = (Number(p.total_gastos) || 0) + (Number(p.total_costos) || 0);
            const margen = Number(p.margen_neto) || 0;

            return (
              <div
                key={idx}
                onClick={() => verDetalle(p.proyecto)}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  padding: '16px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  borderLeft: `5px solid ${margen >= 0 ? '#16A34A' : '#DC2626'}`,
                  cursor: 'pointer',
                  transition: 'transform 0.1s ease-in-out'
                }}
              >
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#0F172A' }}>{p.proyecto || 'GENERAL'}</h3>
                <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div>📥 Ingresos: <strong>${ingresos.toLocaleString('es-CL')}</strong></div>
                  <div>📤 Egresos: <strong>${egresos.toLocaleString('es-CL')}</strong></div>
                  <div>📊 Margen: <strong style={{ color: margen >= 0 ? '#16A34A' : '#DC2626' }}>${margen.toLocaleString('es-CL')}</strong></div>
                  <div style={{ marginTop: '6px', fontSize: '11px', color: '#94A3B8' }}>{p.total_movimientos} movimientos registrados</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL / SECCIÓN DETALLE DEL PROYECTO */}
      {proyectoSeleccionado && (
        <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, color: '#1E293B' }}>📋 Movimientos de: {proyectoSeleccionado}</h3>
            <button
              onClick={() => setProyectoSeleccionado(null)}
              style={{ padding: '4px 12px', backgroundColor: '#64748B', color: '#FFF', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Cerrar
            </button>
          </div>
          <div style={{ overflowX: 'auto', maxHeight: '350px' }}>
            <table border="1" cellPadding="6" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', borderColor: '#E2E8F0' }}>
              <thead style={{ backgroundColor: '#F8FAFC' }}>
                <tr>
                  <th>Fecha</th>
                  <th>Documento</th>
                  <th>N° Doc</th>
                  <th>Razón Social</th>
                  <th>Condición</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {movimientosDetalle.map((m) => (
                  <tr key={m.id_movimiento}>
                    <td>{new Date(m.fecha).toLocaleDateString('es-CL')}</td>
                    <td>{m.documento}</td>
                    <td>{m.nro_documento}</td>
                    <td>{m.razon_social}</td>
                    <td>{m.condicion}</td>
                    <td><strong>${Number(m.total).toLocaleString('es-CL')}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}