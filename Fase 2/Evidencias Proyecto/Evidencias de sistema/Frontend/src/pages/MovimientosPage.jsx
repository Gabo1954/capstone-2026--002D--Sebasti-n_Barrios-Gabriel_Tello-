import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';

const ENUMS = {
  documentos: ['FACTURA', 'BOLETA DE HONORARIOS', 'BOLETA', 'COMPROBANTE DE PAGO', 'COMPROBANTE DE TRANSFERENCIA', 'NOTA DE CREDITO'],
  bancos: ['BCI', 'B Chile', 'B Falabella', 'B Falabella credito', 'Efectivo'],
  tiposPago: ['Debito', 'Credito', 'Efectivo'],
  condiciones: ['GASTO', 'COSTO', 'INGRESO OPERACIONAL', 'INGRESO NO OPERACIONAL'],
  tiposFlujo: ['FIJO', 'VARIABLE'],
  estadosConciliacion: ['PENDIENTE', 'CONCILIADO', 'RECHAZADO']
};

export default function MovimientosPage() {
  const [movimientos, setMovimientos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
  const [movimientoEditar, setMovimientoEditar] = useState(null);

  const [formCrear, setFormCrear] = useState({
    fecha: new Date().toISOString().split('T')[0],
    documento: 'FACTURA',
    nro_documento: '',
    razon_social: '',
    proyecto: 'GENERAL',
    neto_liquido: 0,
    iva: 0,
    imposiciones_retenciones: 0,
    total: 0,
    condicion: 'GASTO',
    tipo_flujo: 'VARIABLE',
    banco: 'BCI',
    tipo_pago: 'Debito',
    estado_conciliacion: 'PENDIENTE',
    descripcion: '',
    documento_1: '',
    documento_2: '',
    documento_3: '',
    documento_4: ''
  });

  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [filtroBanco, setFiltroBanco] = useState('TODOS');
  const [filtroCondicion, setFiltroCondicion] = useState('TODOS');
  
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 10;

  const cargarMovimientos = async () => {
    try {
      setCargando(true);
      const res = await api.get('/movimientos');
      setMovimientos(res.data);
    } catch (error) {
      console.error('Error al obtener movimientos:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarMovimientos();
  }, []);

  const movimientosFiltrados = useMemo(() => {
    return movimientos.filter((m) => {
      const termino = busqueda.toLowerCase();
      const coincideBusqueda =
        (m.razon_social && m.razon_social.toLowerCase().includes(termino)) ||
        (m.nro_documento && String(m.nro_documento).toLowerCase().includes(termino)) ||
        (m.descripcion && m.descripcion.toLowerCase().includes(termino));

      const coincideEstado = filtroEstado === 'TODOS' || m.estado_conciliacion === filtroEstado;
      const coincideBanco = filtroBanco === 'TODOS' || m.banco === filtroBanco;
      const coincideCondicion = filtroCondicion === 'TODOS' || m.condicion === filtroCondicion;

      return coincideBusqueda && coincideEstado && coincideBanco && coincideCondicion;
    });
  }, [movimientos, busqueda, filtroEstado, filtroBanco, filtroCondicion]);

  const totalPaginas = Math.ceil(movimientosFiltrados.length / registrosPorPagina) || 1;
  const movimientosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * registrosPorPagina;
    return movimientosFiltrados.slice(inicio, inicio + registrosPorPagina);
  }, [movimientosFiltrados, paginaActual]);

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filtroEstado, filtroBanco, filtroCondicion]);

  const handleCrearSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/movimientos', formCrear);
      alert('¡Movimiento registrado con éxito!');
      setMostrarModalCrear(false);
      cargarMovimientos();
    } catch (error) {
      console.error('Error al registrar:', error.response?.data || error);
      alert('Error al guardar movimiento');
    }
  };

  const handleAbrirEditar = (mov) => {
    setMovimientoEditar({
      ...mov,
      fecha: mov.fecha ? mov.fecha.split('T')[0] : new Date().toISOString().split('T')[0]
    });
  };

  const handleEditarSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/movimientos/${movimientoEditar.id_movimiento}`, movimientoEditar);
      alert('¡Movimiento actualizado!');
      setMovimientoEditar(null);
      cargarMovimientos();
    } catch (error) {
      console.error('Error al editar:', error);
      alert('Error al actualizar movimiento');
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm(`¿Estás seguro de eliminar el movimiento ID ${id}?`)) {
      try {
        await api.delete(`/movimientos/${id}`);
        cargarMovimientos();
      } catch (error) {
        console.error('Error al eliminar:', error);
      }
    }
  };

  const handleChangeCrear = (e) => {
    const { name, value } = e.target;
    let updated = { ...formCrear, [name]: value };
    if (name === 'neto_liquido' || name === 'iva' || name === 'imposiciones_retenciones') {
      const neto = name === 'neto_liquido' ? Number(value) : Number(formCrear.neto_liquido);
      const iva = name === 'iva' ? Number(value) : Number(formCrear.iva);
      const ret = name === 'imposiciones_retenciones' ? Number(value) : Number(formCrear.imposiciones_retenciones);
      updated.total = neto + iva + ret;
    }
    setFormCrear(updated);
  };

  const handleChangeEditar = (e) => {
    const { name, value } = e.target;
    let updated = { ...movimientoEditar, [name]: value };
    if (name === 'neto_liquido' || name === 'iva' || name === 'imposiciones_retenciones') {
      const neto = name === 'neto_liquido' ? Number(value) : Number(movimientoEditar.neto_liquido);
      const iva = name === 'iva' ? Number(value) : Number(movimientoEditar.iva);
      const ret = name === 'imposiciones_retenciones' ? Number(value) : Number(movimientoEditar.imposiciones_retenciones);
      updated.total = neto + iva + ret;
    }
    setMovimientoEditar(updated);
  };

  const formatMoney = (val) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(val || 0);
  const formatDate = (dateStr) => (!dateStr ? '-' : dateStr.split('T')[0]);

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'CONCILIADO': return { bg: '#22C55E', text: '#FFFFFF' };
      case 'RECHAZADO': return { bg: '#EF4444', text: '#FFFFFF' };
      default: return { bg: '#EAB308', text: '#000000' };
    }
  };

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>
      
      {/* CABECERA CON BOTÓN SIEMPRE VISIBLE */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', gap: '10px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#1E293B', fontSize: '18px' }}>API ZORON - Registro de Movimientos</h2>
          <span style={{ fontSize: '12px', color: '#64748B' }}>Mostrando {movimientosFiltrados.length} registros</span>
        </div>
        <button onClick={() => setMostrarModalCrear(true)} style={btnPrimaryStyle}>
          + Agregar Movimiento (POST)
        </button>
      </div>

      {/* PANEL DE FILTROS EN CSS GRID (COMPACTO Y AJUSTABLE AL 100% DEL ANCHO) */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
        gap: '10px', 
        padding: '12px', 
        backgroundColor: '#FFFFFF', 
        borderRadius: '8px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
        marginBottom: '14px',
        boxSizing: 'border-box'
      }}>
        
        <div>
          <label style={labelFilterStyle}>🔍 Buscar:</label>
          <input
            type="text"
            placeholder="Razón social, N° doc..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelFilterStyle}>Estado Conciliación:</label>
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} style={inputStyle}>
            <option value="TODOS">-- Todos --</option>
            {ENUMS.estadosConciliacion.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>

        <div>
          <label style={labelFilterStyle}>Banco:</label>
          <select value={filtroBanco} onChange={(e) => setFiltroBanco(e.target.value)} style={inputStyle}>
            <option value="TODOS">-- Todos --</option>
            {ENUMS.bancos.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        <div>
          <label style={labelFilterStyle}>Condición:</label>
          <select value={filtroCondicion} onChange={(e) => setFiltroCondicion(e.target.value)} style={inputStyle}>
            <option value="TODOS">-- Todas --</option>
            {ENUMS.condiciones.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {(busqueda || filtroEstado !== 'TODOS' || filtroBanco !== 'TODOS' || filtroCondicion !== 'TODOS') && (
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              onClick={() => { setBusqueda(''); setFiltroEstado('TODOS'); setFiltroBanco('TODOS'); setFiltroCondicion('TODOS'); }}
              style={{ ...btnSecondaryStyle, padding: '5px 8px', fontSize: '11px', width: '100%' }}
            >
               Limpiar
            </button>
          </div>
        )}
      </div>

      {/* TABLA PRINCIPAL CON DESPLAZAMIENTO HORIZONTAL AISLADO */}
      {cargando ? (
        <p>Cargando datos desde PostgreSQL...</p>
      ) : (
        <>
          <div style={{ overflowX: 'auto', backgroundColor: '#FFFFFF', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', width: '100%' }}>
            <table border="1" cellPadding="6" style={{ width: '100%', borderCollapse: 'collapse', whiteSpace: 'nowrap', fontSize: '12px', borderColor: '#E2E8F0' }}>
              <thead style={{ backgroundColor: '#FFD100', color: '#000', fontWeight: 'bold' }}>
                <tr>
                  <th>Documento</th>
                  <th>Estado de conciliación</th>
                  <th>n° de documento</th>
                  <th>Razón social</th>
                  <th>Fecha</th>
                  <th>Banco</th>
                  <th>Tipo de pago</th>
                  <th>Neto / líquido</th>
                  <th>IVA</th>
                  <th>Imposiciones/retenciones</th>
                  <th>Total</th>
                  <th>Proyecto</th>
                  <th>Condición</th>
                  <th>Tipo de flujo</th>
                  <th>Descripción</th>
                  <th>Documento 1</th>
                  <th>Documento 2</th>
                  <th>Documento 3</th>
                  <th>Documento 4</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {movimientosPaginados.length === 0 ? (
                  <tr>
                    <td colSpan="20" style={{ textAlign: 'center', padding: '20px', color: '#64748B' }}>
                      No se encontraron movimientos con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  movimientosPaginados.map((m) => {
                    const estadoStyle = getEstadoColor(m.estado_conciliacion);
                    return (
                      <tr key={m.id_movimiento} style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <td><strong>{m.documento}</strong></td>
                        <td>
                          <span style={{
                            backgroundColor: estadoStyle.bg,
                            color: estadoStyle.text,
                            padding: '3px 6px',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            fontSize: '11px'
                          }}>
                            {m.estado_conciliacion || 'PENDIENTE'}
                          </span>
                        </td>
                        <td>{m.nro_documento || '-'}</td>
                        <td>{m.razon_social}</td>
                        <td>{formatDate(m.fecha)}</td>
                        <td>{m.banco || '-'}</td>
                        <td>{m.tipo_pago || '-'}</td>
                        <td>{formatMoney(m.neto_liquido)}</td>
                        <td>{formatMoney(m.iva)}</td>
                        <td>{formatMoney(m.imposiciones_retenciones)}</td>
                        <td><strong>{formatMoney(m.total)}</strong></td>
                        <td>{m.proyecto || 'GENERAL'}</td>
                        <td>{m.condicion || '-'}</td>
                        <td>{m.tipo_flujo || '-'}</td>
                        <td>{m.descripcion || '-'}</td>
                        <td>{m.documento_1 || '-'}</td>
                        <td>{m.documento_2 || '-'}</td>
                        <td>{m.documento_3 || '-'}</td>
                        <td>{m.documento_4 || '-'}</td>
                        <td style={{ display: 'flex', gap: '4px' }}>
                          <button onClick={() => handleAbrirEditar(m)} style={btnEditStyle} title="Editar todos los campos">
                             Editar
                          </button>
                          <button onClick={() => handleEliminar(m.id_movimiento)} style={btnDeleteStyle} title="Eliminar de BD">
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* CONTROLES DE PAGINACIÓN */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', padding: '0 4px' }}>
            <span style={{ fontSize: '13px', color: '#64748B' }}>
              Página <strong>{paginaActual}</strong> de <strong>{totalPaginas}</strong>
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                disabled={paginaActual === 1}
                onClick={() => setPaginaActual((prev) => prev - 1)}
                style={{ ...btnSecondaryStyle, opacity: paginaActual === 1 ? 0.5 : 1, cursor: paginaActual === 1 ? 'not-allowed' : 'pointer' }}
              >
                ◀ Anterior
              </button>
              <button
                disabled={paginaActual >= totalPaginas}
                onClick={() => setPaginaActual((prev) => prev + 1)}
                style={{ ...btnSecondaryStyle, opacity: paginaActual >= totalPaginas ? 0.5 : 1, cursor: paginaActual >= totalPaginas ? 'not-allowed' : 'pointer' }}
              >
                Siguiente 
              </button>
            </div>
          </div>
        </>
      )}

      {/* MODALES */}
      {mostrarModalCrear && (
        <ModalForm
          titulo="Nuevo Movimiento (POST)"
          formData={formCrear}
          onChange={handleChangeCrear}
          onSubmit={handleCrearSubmit}
          onClose={() => setMostrarModalCrear(false)}
        />
      )}

      {movimientoEditar && (
        <ModalForm
          titulo={`Editar Movimiento ID: ${movimientoEditar.id_movimiento} (PUT)`}
          formData={movimientoEditar}
          onChange={handleChangeEditar}
          onSubmit={handleEditarSubmit}
          onClose={() => setMovimientoEditar(null)}
        />
      )}
    </div>
  );
}

function ModalForm({ titulo, formData, onChange, onSubmit, onClose }) {
  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h3 style={{ marginTop: 0, color: '#1E3A8A', fontSize: '18px' }}>{titulo}</h3>
        <form onSubmit={onSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div>
            <label style={labelStyle}>Documento:</label>
            <select name="documento" value={formData.documento} onChange={onChange} style={inputStyle}>
              {ENUMS.documentos.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label style={labelStyle}>n° de documento:</label>
            <input name="nro_documento" value={formData.nro_documento || ''} onChange={onChange} style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Razón social:</label>
            <input name="razon_social" required value={formData.razon_social || ''} onChange={onChange} style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Fecha:</label>
            <input type="date" name="fecha" value={formData.fecha || ''} onChange={onChange} style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Banco:</label>
            <select name="banco" value={formData.banco || 'BCI'} onChange={onChange} style={inputStyle}>
              {ENUMS.bancos.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Tipo de pago:</label>
            <select name="tipo_pago" value={formData.tipo_pago || 'Debito'} onChange={onChange} style={inputStyle}>
              {ENUMS.tiposPago.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Neto / líquido:</label>
            <input type="number" name="neto_liquido" value={formData.neto_liquido || 0} onChange={onChange} style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>IVA:</label>
            <input type="number" name="iva" value={formData.iva || 0} onChange={onChange} style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Imposiciones/retenciones:</label>
            <input type="number" name="imposiciones_retenciones" value={formData.imposiciones_retenciones || 0} onChange={onChange} style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Total:</label>
            <input type="number" name="total" value={formData.total || 0} readOnly style={{ ...inputStyle, backgroundColor: '#E2E8F0' }} />
          </div>

          <div>
            <label style={labelStyle}>Proyecto:</label>
            <input name="proyecto" value={formData.proyecto || ''} onChange={onChange} style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Condición:</label>
            <select name="condicion" value={formData.condicion || 'GASTO'} onChange={onChange} style={inputStyle}>
              {ENUMS.condiciones.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Tipo de flujo:</label>
            <select name="tipo_flujo" value={formData.tipo_flujo || 'VARIABLE'} onChange={onChange} style={inputStyle}>
              {ENUMS.tiposFlujo.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Estado de conciliación:</label>
            <select name="estado_conciliacion" value={formData.estado_conciliacion || 'PENDIENTE'} onChange={onChange} style={inputStyle}>
              {ENUMS.estadosConciliacion.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Descripción:</label>
            <input name="descripcion" value={formData.descripcion || ''} onChange={onChange} style={inputStyle} />
          </div>

          <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} style={btnSecondaryStyle}>Cancelar</button>
            <button type="submit" style={btnPrimaryStyle}>Guardar Cambios</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const btnPrimaryStyle = { backgroundColor: '#1E3A8A', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' };
const btnSecondaryStyle = { backgroundColor: '#E2E8F0', color: '#1E293B', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' };
const btnEditStyle = { backgroundColor: '#3B82F6', color: 'white', border: 'none', padding: '3px 6px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' };
const btnDeleteStyle = { backgroundColor: '#EF4444', color: 'white', border: 'none', padding: '3px 6px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' };
const inputStyle = { width: '100%', padding: '5px', boxSizing: 'border-box', marginTop: '2px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '12px' };
const labelFilterStyle = { fontSize: '11px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '2px' };
const labelStyle = { fontSize: '11px', color: '#475569', display: 'block' };
const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalStyle = { backgroundColor: 'white', padding: '16px', borderRadius: '8px', width: '550px', maxHeight: '90vh', overflowY: 'auto' };