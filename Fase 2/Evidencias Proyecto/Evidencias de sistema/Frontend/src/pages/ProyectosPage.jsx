import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';

export default function ProyectosPage() {
  const [proyectos, setProyectos] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [errorBD, setErrorBD] = useState(null);

  // Selector de Año (Por defecto 2026)
  const [anioSeleccionado, setAnioSeleccionado] = useState(2026);

  // Estado para el Modal de detalle de un proyecto
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const resMov = await api.get('/movimientos');
        const arregloMov = Array.isArray(resMov.data) ? resMov.data : (resMov.data?.movimientos || []);
        setMovimientos(arregloMov);

        try {
          const resProy = await api.get('/proyectos');
          setProyectos(Array.isArray(resProy.data) ? resProy.data : []);
        } catch (e) {
          console.log('Obteniendo agregación de proyectos localmente desde movimientos.');
        }
      } catch (error) {
        console.error('Error al cargar proyectos:', error);
        setErrorBD('No se pudo conectar con la base de datos.');
      } finally {
        setCargando(false);
      }
    };
    obtenerDatos();
  }, []);

  // Formateador CLP
  const formatCLP = (val) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val || 0);

  // Consolidación de Proyectos por Año Seleccionado
  const { aniosDisponibles, proyectosCalculados } = useMemo(() => {
    if (!movimientos.length) {
      return { aniosDisponibles: [2026], proyectosCalculados: [] };
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

    // 3. Agrupar dinámicamente por Proyecto/Centro de Costo
    const mapProyectos = {};

    movsDelAnio.forEach(m => {
      const nombreProy = m.proyecto || 'GENERAL';
      if (!mapProyectos[nombreProy]) {
        mapProyectos[nombreProy] = {
          nombre: nombreProy,
          totalIngresos: 0,
          totalEgresos: 0,
          movimientos: []
        };
      }

      const monto = Number(m.total || m.neto_liquido || m.monto || 0);
      const cond = String(m.condicion || m.tipo || '').toUpperCase().trim();

      if (cond.includes('INGRESO')) {
        mapProyectos[nombreProy].totalIngresos += monto;
      } else {
        mapProyectos[nombreProy].totalEgresos += monto;
      }

      mapProyectos[nombreProy].movimientos.push(m);
    });

    const listaCalculada = Object.values(mapProyectos).map(p => ({
      ...p,
      margenNeto: p.totalIngresos - p.totalEgresos
    }));

    return { aniosDisponibles, proyectosCalculados: listaCalculada };
  }, [movimientos, anioSeleccionado]);

  // Filtro de búsqueda por texto
  const proyectosFiltrados = proyectosCalculados.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Obtener movimientos del proyecto seleccionado para el Modal
  const movimientosDetalleModal = useMemo(() => {
    if (!proyectoSeleccionado) return [];
    const proy = proyectosCalculados.find(p => p.nombre === proyectoSeleccionado);
    return proy ? proy.movimientos : [];
  }, [proyectoSeleccionado, proyectosCalculados]);

  if (cargando) return <div style={{ padding: '20px', color: '#1E293B' }}>Cargando módulo de proyectos...</div>;
  if (errorBD) return <div style={{ padding: '20px', color: '#DC2626', fontWeight: 'bold' }}>{errorBD}</div>;

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>
      
      {/* CABECERA, BÚSQUEDA Y FILTRO DE AÑO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#1E293B', fontSize: '20px' }}>Gestión de Proyectos</h2>
          <span style={{ fontSize: '13px', color: '#64748B' }}>
            Resumen financiero y control por centro de costo
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* SELECTOR DE AÑO */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FFFFFF', padding: '6px 12px', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
            <label htmlFor="anioProySelect" style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155' }}>Año:</label>
            <select 
              id="anioProySelect"
              value={anioSeleccionado} 
              onChange={(e) => setAnioSeleccionado(Number(e.target.value))}
              style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #94A3B8', fontWeight: 'bold', color: '#0284C7', cursor: 'pointer' }}
            >
              {aniosDisponibles.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* CAMPO DE BÚSQUEDA */}
          <input
            type="text"
            placeholder="Buscar proyecto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              fontSize: '13px',
              width: '220px'
            }}
          />
        </div>
      </div>

      {/* REJILLA DE TARJETAS DE PROYECTO */}
      {proyectosFiltrados.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', color: '#64748B', padding: '40px' }}>
          No se encontraron proyectos para el año <strong>{anioSeleccionado}</strong>.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {proyectosFiltrados.map((p, idx) => (
            <div
              key={idx}
              onClick={() => setProyectoSeleccionado(p.nombre)}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                padding: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                borderLeft: `5px solid ${p.margenNeto >= 0 ? '#16A34A' : '#DC2626'}`,
                cursor: 'pointer',
                transition: 'transform 0.1s ease-in-out'
              }}
            >
              <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#0F172A' }}>{p.nombre}</h3>
              <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Ingresos:</span>
                  <strong style={{ color: '#166534' }}>{formatCLP(p.totalIngresos)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Egresos:</span>
                  <strong style={{ color: '#991B1B' }}>{formatCLP(p.totalEgresos)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: '6px' }}>
                  <span>Margen:</span>
                  <strong style={{ color: p.margenNeto >= 0 ? '#16A34A' : '#DC2626' }}>{formatCLP(p.margenNeto)}</strong>
                </div>
                <div style={{ marginTop: '4px', fontSize: '11px', color: '#94A3B8', textAlign: 'right' }}>
                  {p.movimientos.length} transacciones
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VENTANA MODAL DRILL-DOWN DETALLE DE PROYECTO */}
      {proyectoSeleccionado && (
        <div style={overlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>
              <div>
                <h3 style={{ margin: 0, color: '#1E293B', fontSize: '18px' }}>Movimientos Registrados</h3>
                <span style={{ fontSize: '12px', color: '#0284C7', fontWeight: 'bold' }}>Proyecto: {proyectoSeleccionado} ({anioSeleccionado})</span>
              </div>
              <button onClick={() => setProyectoSeleccionado(null)} style={closeBtnStyle}>✕</button>
            </div>

            <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', textAlign: 'left', color: '#475569', borderBottom: '2px solid #E2E8F0' }}>
                    <th style={{ padding: '8px' }}>Fecha</th>
                    <th style={{ padding: '8px' }}>Documento</th>
                    <th style={{ padding: '8px' }}>N° Doc</th>
                    <th style={{ padding: '8px' }}>Razón Social / Detalle</th>
                    <th style={{ padding: '8px' }}>Condición</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {movimientosDetalleModal.map((m, idx) => (
                    <tr key={m.id_movimiento || idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '8px', whiteSpace: 'nowrap' }}>
                        {m.fecha ? String(m.fecha).substring(0, 10) : 'S/I'}
                      </td>
                      <td style={{ padding: '8px' }}>{m.documento || 'FACTURA'}</td>
                      <td style={{ padding: '8px' }}>{m.nro_documento || 'S/N'}</td>
                      <td style={{ padding: '8px' }}>{m.razon_social || m.descripcion || 'Sin detalle'}</td>
                      <td style={{ padding: '8px', fontSize: '11px', color: '#64748B' }}>{m.condicion || '-'}</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold', color: String(m.condicion||'').toUpperCase().includes('INGRESO') ? '#166534' : '#DC2626' }}>
                        {formatCLP(m.total || m.neto_liquido || m.monto)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '12px', color: '#64748B' }}>
                Total Transacciones: <strong>{movimientosDetalleModal.length}</strong>
              </span>
              <button onClick={() => setProyectoSeleccionado(null)} style={{ backgroundColor: '#1E293B', color: '#FFFFFF', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ESTILOS EN OBJETO
const cardStyle = { backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000
};

const modalContentStyle = {
  backgroundColor: '#FFFFFF',
  borderRadius: '8px',
  padding: '20px',
  width: '90%',
  maxWidth: '800px',
  boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
};

const closeBtnStyle = {
  background: 'none',
  border: 'none',
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#64748B',
  cursor: 'pointer'
};