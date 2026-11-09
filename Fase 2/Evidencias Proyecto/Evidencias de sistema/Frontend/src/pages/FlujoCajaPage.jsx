import React, { useEffect, useState, useMemo } from 'react';
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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function FlujoCaja() {
  const [movimientos, setMovimientos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorBD, setErrorBD] = useState(null);
  
  // Selector de Año (Por defecto 2026)
  const [anioSeleccionado, setAnioSeleccionado] = useState(2026);

  // Estado para la ventana de detalle (Drill-down)
  const [modalDetalle, setModalDetalle] = useState({
    abierto: false,
    titulo: '',
    registros: []
  });

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

  // Formateador CLP
  const formatCLP = (val) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val || 0);

  // Helper para obtener número de semana ISO considerando el AÑO exacto
  const getWeekInfo = (dateString) => {
    if (!dateString) return null;
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return null;

    const anio = d.getFullYear();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const semana = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);

    return { anio, semana, fechaObj: new Date(dateString) };
  };

  // Clasificación directa usando las columnas oficiales de la BD ('condicion' y 'tipo_flujo')
  const clasificarMovimientoBD = (item) => {
    const cond = String(item.condicion || item.tipo || '').toUpperCase().trim();
    const flujo = String(item.tipo_flujo || item.flujo || '').toUpperCase().trim();

    // 1. INGRESOS
    if (cond.includes('INGRESO NO OPERACIONAL')) {
      return { esIngreso: true, tipoExacto: 'ING_NO_OP' };
    }
    if (cond.includes('INGRESO OPERACIONAL') || cond.includes('INGRESO')) {
      return { esIngreso: true, tipoExacto: 'ING_OP' };
    }

    // 2. COSTOS
    if (cond.includes('COSTO')) {
      if (flujo.includes('FIJO')) return { esIngreso: false, tipoExacto: 'COSTO_FIJO' };
      return { esIngreso: false, tipoExacto: 'COSTO_VAR' };
    }

    // 3. GASTOS
    if (cond.includes('GASTO')) {
      if (flujo.includes('FIJO')) return { esIngreso: false, tipoExacto: 'GASTO_FIJO' };
      return { esIngreso: false, tipoExacto: 'GASTO_VAR' };
    }

    // Fallback por defecto si no vienen especificados los ENUM
    if (flujo.includes('FIJO')) return { esIngreso: false, tipoExacto: 'GASTO_FIJO' };
    return { esIngreso: false, tipoExacto: 'GASTO_VAR' };
  };

  // Consolidación por semanas
  const { columnasSemanas, matrizFlujo, totalIngresos, totalEgresos, saldoNeto, chartData, aniosDisponibles } = useMemo(() => {
    if (!movimientos.length) {
      return { columnasSemanas: [], matrizFlujo: {}, totalIngresos: 0, totalEgresos: 0, saldoNeto: 0, chartData: null, aniosDisponibles: [2026] };
    }

    // 1. Obtener lista de años únicos de la BD
    const aniosSet = new Set();
    movimientos.forEach(m => {
      if (m.fecha) {
        const a = new Date(m.fecha).getFullYear();
        if (!isNaN(a)) aniosSet.add(a);
      }
    });
    const aniosDisponibles = Array.from(aniosSet).sort((a, b) => b - a);
    if (!aniosDisponibles.length) aniosDisponibles.push(2026);

    // 2. Filtrar movimientos del AÑO SELECCIONADO
    const movsDelAnio = movimientos.filter(item => {
      const info = getWeekInfo(item.fecha);
      return info && info.anio === Number(anioSeleccionado);
    });

    // 3. Organizar por Semanas
    const semanasMap = {};
    movsDelAnio.forEach(item => {
      const info = getWeekInfo(item.fecha);
      if (info) {
        const sem = info.semana;
        if (!semanasMap[sem]) {
          const mesNombre = info.fechaObj.toLocaleString('es-CL', { month: 'short' }).toUpperCase();
          semanasMap[sem] = { semana: sem, mes: mesNombre, items: [] };
        }
        semanasMap[sem].items.push(item);
      }
    });

    const columnasSemanas = Object.values(semanasMap).sort((a, b) => a.semana - b.semana);

    // 4. Matriz del Flujo de Caja
    const matriz = {
      ingresosOperacionales: {},
      ingresosNoOperacionales: {},
      ingresosTotales: {},
      costoFijo: {},
      costoVariable: {},
      gastoFijo: {},
      gastoVariable: {},
      egresosTotales: {},
      saldoSemanal: {},
      saldoAcumulado: {}
    };

    let totIng = 0;
    let totEg = 0;
    let acumulado = 0;

    columnasSemanas.forEach(col => {
      const sem = col.semana;
      let ingOp = 0, ingNoOp = 0, cFijo = 0, cVar = 0, gFijo = 0, gVar = 0;

      const itemsIngOp = [], itemsIngNoOp = [], itemsIngTot = [];
      const itemsCFijo = [], itemsCVar = [], itemsGFijo = [], itemsGVar = [], itemsEgTot = [];

      col.items.forEach(item => {
        const monto = Number(item.total || item.neto_liquido || item.monto || 0);
        const clasif = clasificarMovimientoBD(item);

        if (clasif.esIngreso) {
          itemsIngTot.push(item);
          if (clasif.tipoExacto === 'ING_NO_OP') {
            ingNoOp += monto;
            itemsIngNoOp.push(item);
          } else {
            ingOp += monto;
            itemsIngOp.push(item);
          }
        } else {
          itemsEgTot.push(item);
          if (clasif.tipoExacto === 'COSTO_FIJO') {
            cFijo += monto;
            itemsCFijo.push(item);
          } else if (clasif.tipoExacto === 'COSTO_VAR') {
            cVar += monto;
            itemsCVar.push(item);
          } else if (clasif.tipoExacto === 'GASTO_FIJO') {
            gFijo += monto;
            itemsGFijo.push(item);
          } else {
            gVar += monto;
            itemsGVar.push(item);
          }
        }
      });

      const totalIngSemana = ingOp + ingNoOp;
      const totalEgSemana = cFijo + cVar + gFijo + gVar;
      const saldoSem = totalIngSemana - totalEgSemana;
      acumulado += saldoSem;

      totIng += totalIngSemana;
      totEg += totalEgSemana;

      matriz.ingresosOperacionales[sem] = { total: ingOp, items: itemsIngOp };
      matriz.ingresosNoOperacionales[sem] = { total: ingNoOp, items: itemsIngNoOp };
      matriz.ingresosTotales[sem] = { total: totalIngSemana, items: itemsIngTot };

      matriz.costoFijo[sem] = { total: cFijo, items: itemsCFijo };
      matriz.costoVariable[sem] = { total: cVar, items: itemsCVar };
      matriz.gastoFijo[sem] = { total: gFijo, items: itemsGFijo };
      matriz.gastoVariable[sem] = { total: gVar, items: itemsGVar };
      matriz.egresosTotales[sem] = { total: totalEgSemana, items: itemsEgTot };

      matriz.saldoSemanal[sem] = saldoSem;
      matriz.saldoAcumulado[sem] = acumulado;
    });

    // Gráfica mensual por año seleccionado
    const datosGraficoMes = {};
    movsDelAnio.forEach(item => {
      const mes = item.fecha ? String(item.fecha).substring(0, 7) : 'Sin Fecha';
      if (!datosGraficoMes[mes]) datosGraficoMes[mes] = { mes, ingresos: 0, egresos: 0 };
      const monto = Number(item.total || item.neto_liquido || item.monto || 0);
      const clasif = clasificarMovimientoBD(item);
      if (clasif.esIngreso) datosGraficoMes[mes].ingresos += monto;
      else datosGraficoMes[mes].egresos += monto;
    });

    const listaMeses = Object.values(datosGraficoMes).sort((a, b) => a.mes.localeCompare(b.mes));

    const chartConfig = {
      labels: listaMeses.map(d => d.mes),
      datasets: [
        { label: 'Ingresos', data: listaMeses.map(d => d.ingresos), backgroundColor: '#166534', borderRadius: 4 },
        { label: 'Egresos', data: listaMeses.map(d => d.egresos), backgroundColor: '#DC2626', borderRadius: 4 }
      ]
    };

    return {
      columnasSemanas,
      matrizFlujo: matriz,
      totalIngresos: totIng,
      totalEgresos: totEg,
      saldoNeto: totIng - totEg,
      chartData: chartConfig,
      aniosDisponibles
    };
  }, [movimientos, anioSeleccionado]);

  // Abrir Modal Drill-down
  const abrirDetalle = (titulo, registros) => {
    if (!registros || registros.length === 0) return;
    setModalDetalle({
      abierto: true,
      titulo,
      registros
    });
  };

  const cerrarModal = () => {
    setModalDetalle({ abierto: false, titulo: '', registros: [] });
  };

  if (cargando) return <div style={{ padding: '20px', color: '#1E293B' }}>Cargando Flujo de Caja...</div>;
  if (errorBD) return <div style={{ padding: '20px', color: '#DC2626', fontWeight: 'bold' }}>{errorBD}</div>;

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>
      
      {/* CABECERA Y FILTRO DE AÑO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#1E293B', fontSize: '20px' }}>Flujo de Caja Real</h2>
          <span style={{ fontSize: '13px', color: '#64748B' }}>
            Matriz de Ingresos y Egresos por Semanas con Detalle (Drill-down)
          </span>
        </div>

        {/* SELECTOR DE AÑO */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FFFFFF', padding: '6px 12px', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
          <label htmlFor="anioSelect" style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155' }}>Año:</label>
          <select 
            id="anioSelect"
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

      {/* TARJETAS RESUMEN */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={cardStyle}>
          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 'bold' }}>TOTAL INGRESOS ({anioSeleccionado})</span>
          <h3 style={{ margin: '6px 0 0 0', color: '#166534' }}>{formatCLP(totalIngresos)}</h3>
        </div>
        <div style={cardStyle}>
          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 'bold' }}>TOTAL EGRESOS ({anioSeleccionado})</span>
          <h3 style={{ margin: '6px 0 0 0', color: '#991B1B' }}>{formatCLP(totalEgresos)}</h3>
        </div>
        <div style={cardStyle}>
          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 'bold' }}>SALDO EN CAJA ({anioSeleccionado})</span>
          <h3 style={{ margin: '6px 0 0 0', color: saldoNeto >= 0 ? '#0284C7' : '#DC2626' }}>{formatCLP(saldoNeto)}</h3>
        </div>
      </div>

      {/* TABLA ESTILO EXCEL CON DRILL-DOWN */}
      <div style={{ ...cardStyle, marginBottom: '24px', padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <h4 style={{ margin: 0, color: '#1E293B' }}>Matriz Semanal de Flujo de Caja ({anioSeleccionado})</h4>
          <span style={{ fontSize: '11px', color: '#64748B', backgroundColor: '#F1F5F9', padding: '4px 8px', borderRadius: '4px' }}>
            Haz clic en cualquier monto con subrayado para abrir la lista de transacciones exactas.
          </span>
        </div>

        {columnasSemanas.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#64748B' }}>
            No hay registros de movimientos para el año <strong>{anioSeleccionado}</strong>. Selecciona otro año en el menú superior.
          </div>
        ) : (
          <div style={{ overflowX: 'auto', maxHeight: '480px' }}>
            <table style={excelTableStyle}>
              <thead>
                {/* FILA DE MESES */}
                <tr style={{ backgroundColor: '#1E293B', color: '#FFFFFF', fontSize: '11px' }}>
                  <th style={{ ...cellStyle, position: 'sticky', left: 0, backgroundColor: '#1E293B', zIndex: 2 }}>Mes</th>
                  {columnasSemanas.map(col => (
                    <th key={col.semana} style={{ ...cellStyle, textAlign: 'center' }}>{col.mes}</th>
                  ))}
                </tr>
                {/* FILA DE SEMANAS */}
                <tr style={{ backgroundColor: '#F8FAFC', color: '#334155', fontSize: '11px', borderBottom: '2px solid #CBD5E1' }}>
                  <th style={{ ...cellStyle, position: 'sticky', left: 0, backgroundColor: '#F8FAFC', zIndex: 2 }}>Semana</th>
                  {columnasSemanas.map(col => (
                    <th key={col.semana} style={{ ...cellStyle, textAlign: 'center' }}>Semana {col.semana}</th>
                  ))}
                </tr>
              </thead>
              <tbody style={{ fontSize: '12px' }}>
                
                {/* SECCIÓN INGRESOS */}
                <tr style={{ backgroundColor: '#FEF08A', fontWeight: 'bold', color: '#854D0E' }}>
                  <td colSpan={columnasSemanas.length + 1} style={cellStyle}>Ingresos</td>
                </tr>
                <tr style={{ backgroundColor: '#FEF9C3', fontWeight: 'bold' }}>
                  <td style={{ ...cellStyle, position: 'sticky', left: 0, backgroundColor: '#FEF9C3' }}>Ingresos totales</td>
                  {columnasSemanas.map(col => {
                    const dataCell = matrizFlujo.ingresosTotales[col.semana];
                    return (
                      <td key={col.semana} style={{ ...cellStyle, textAlign: 'right' }}>
                        <button onClick={() => abrirDetalle(`Ingresos Totales - Sem. ${col.semana} (${anioSeleccionado})`, dataCell?.items)} style={clickableAmountStyle}>
                          {formatCLP(dataCell?.total)}
                        </button>
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td style={{ ...cellStyle, position: 'sticky', left: 0, backgroundColor: '#FFFFFF', paddingLeft: '16px' }}>Operacionales</td>
                  {columnasSemanas.map(col => {
                    const dataCell = matrizFlujo.ingresosOperacionales[col.semana];
                    return (
                      <td key={col.semana} style={{ ...cellStyle, textAlign: 'right' }}>
                        <button onClick={() => abrirDetalle(`Ingresos Operacionales - Sem. ${col.semana} (${anioSeleccionado})`, dataCell?.items)} style={clickableAmountStyle}>
                          {formatCLP(dataCell?.total)}
                        </button>
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td style={{ ...cellStyle, position: 'sticky', left: 0, backgroundColor: '#FFFFFF', paddingLeft: '16px' }}>NO operacionales</td>
                  {columnasSemanas.map(col => {
                    const dataCell = matrizFlujo.ingresosNoOperacionales[col.semana];
                    return (
                      <td key={col.semana} style={{ ...cellStyle, textAlign: 'right' }}>
                        <button onClick={() => abrirDetalle(`Ingresos No Operacionales - Sem. ${col.semana} (${anioSeleccionado})`, dataCell?.items)} style={clickableAmountStyle}>
                          {formatCLP(dataCell?.total)}
                        </button>
                      </td>
                    );
                  })}
                </tr>

                {/* SECCIÓN EGRESOS */}
                <tr style={{ backgroundColor: '#FED7AA', fontWeight: 'bold', color: '#9A3412' }}>
                  <td colSpan={columnasSemanas.length + 1} style={cellStyle}>Egresos</td>
                </tr>
                <tr style={{ backgroundColor: '#FFEDD5', fontWeight: 'bold' }}>
                  <td style={{ ...cellStyle, position: 'sticky', left: 0, backgroundColor: '#FFEDD5' }}>Egresos totales</td>
                  {columnasSemanas.map(col => {
                    const dataCell = matrizFlujo.egresosTotales[col.semana];
                    return (
                      <td key={col.semana} style={{ ...cellStyle, textAlign: 'right' }}>
                        <button onClick={() => abrirDetalle(`Egresos Totales - Sem. ${col.semana} (${anioSeleccionado})`, dataCell?.items)} style={clickableAmountStyle}>
                          {formatCLP(dataCell?.total)}
                        </button>
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td style={{ ...cellStyle, position: 'sticky', left: 0, backgroundColor: '#FFFFFF', paddingLeft: '16px' }}>Costo fijo</td>
                  {columnasSemanas.map(col => {
                    const dataCell = matrizFlujo.costoFijo[col.semana];
                    return (
                      <td key={col.semana} style={{ ...cellStyle, textAlign: 'right' }}>
                        <button onClick={() => abrirDetalle(`Costo Fijo - Sem. ${col.semana} (${anioSeleccionado})`, dataCell?.items)} style={clickableAmountStyle}>
                          {formatCLP(dataCell?.total)}
                        </button>
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td style={{ ...cellStyle, position: 'sticky', left: 0, backgroundColor: '#FFFFFF', paddingLeft: '16px' }}>Costo variable</td>
                  {columnasSemanas.map(col => {
                    const dataCell = matrizFlujo.costoVariable[col.semana];
                    return (
                      <td key={col.semana} style={{ ...cellStyle, textAlign: 'right' }}>
                        <button onClick={() => abrirDetalle(`Costo Variable - Sem. ${col.semana} (${anioSeleccionado})`, dataCell?.items)} style={clickableAmountStyle}>
                          {formatCLP(dataCell?.total)}
                        </button>
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td style={{ ...cellStyle, position: 'sticky', left: 0, backgroundColor: '#FFFFFF', paddingLeft: '16px' }}>Gasto fijo</td>
                  {columnasSemanas.map(col => {
                    const dataCell = matrizFlujo.gastoFijo[col.semana];
                    return (
                      <td key={col.semana} style={{ ...cellStyle, textAlign: 'right' }}>
                        <button onClick={() => abrirDetalle(`Gasto Fijo - Sem. ${col.semana} (${anioSeleccionado})`, dataCell?.items)} style={clickableAmountStyle}>
                          {formatCLP(dataCell?.total)}
                        </button>
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td style={{ ...cellStyle, position: 'sticky', left: 0, backgroundColor: '#FFFFFF', paddingLeft: '16px' }}>Gasto variable</td>
                  {columnasSemanas.map(col => {
                    const dataCell = matrizFlujo.gastoVariable[col.semana];
                    return (
                      <td key={col.semana} style={{ ...cellStyle, textAlign: 'right' }}>
                        <button onClick={() => abrirDetalle(`Gasto Variable - Sem. ${col.semana} (${anioSeleccionado})`, dataCell?.items)} style={clickableAmountStyle}>
                          {formatCLP(dataCell?.total)}
                        </button>
                      </td>
                    );
                  })}
                </tr>

                {/* SECCIÓN SALDOS */}
                <tr style={{ backgroundColor: '#FEF08A', fontWeight: 'bold', color: '#854D0E' }}>
                  <td colSpan={columnasSemanas.length + 1} style={cellStyle}>Saldo</td>
                </tr>
                <tr>
                  <td style={{ ...cellStyle, position: 'sticky', left: 0, backgroundColor: '#FFFFFF' }}>Saldo semanal</td>
                  {columnasSemanas.map(col => (
                    <td key={col.semana} style={{ ...cellStyle, textAlign: 'right', fontWeight: 'bold' }}>
                      {formatCLP(matrizFlujo.saldoSemanal[col.semana])}
                    </td>
                  ))}
                </tr>
                <tr style={{ backgroundColor: '#F1F5F9', fontWeight: 'bold' }}>
                  <td style={{ ...cellStyle, position: 'sticky', left: 0, backgroundColor: '#F1F5F9' }}>Saldo acumulado</td>
                  {columnasSemanas.map(col => (
                    <td key={col.semana} style={{ ...cellStyle, textAlign: 'right', color: matrizFlujo.saldoAcumulado[col.semana] >= 0 ? '#0284C7' : '#DC2626' }}>
                      {formatCLP(matrizFlujo.saldoAcumulado[col.semana])}
                    </td>
                  ))}
                </tr>

              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* GRÁFICO HISTÓRICO DE APOYO */}
      <div style={cardStyle}>
        <h4 style={{ margin: '0 0 16px 0', color: '#334155' }}>Evolución Mensual Consolidada ({anioSeleccionado})</h4>
        {chartData && (
          <div style={{ height: '300px', width: '100%' }}>
            <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        )}
      </div>

      {/* VENTANA MODAL DRILL-DOWN */}
      {modalDetalle.abierto && (
        <div style={overlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>
              <div>
                <h3 style={{ margin: 0, color: '#1E293B', fontSize: '18px' }}>Detalle de Transacciones</h3>
                <span style={{ fontSize: '12px', color: '#0284C7', fontWeight: 'bold' }}>{modalDetalle.titulo}</span>
              </div>
              <button onClick={cerrarModal} style={closeBtnStyle}>✕</button>
            </div>

            <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', textAlign: 'left', color: '#475569', borderBottom: '2px solid #E2E8F0' }}>
                    <th style={{ padding: '8px' }}>Fecha</th>
                    <th style={{ padding: '8px' }}>Descripción / Concepto</th>
                    <th style={{ padding: '8px' }}>Condición</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Monto Exacto</th>
                  </tr>
                </thead>
                <tbody>
                  {modalDetalle.registros.map((item, idx) => (
                    <tr key={item.id_movimiento || item.id || idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '8px', whiteSpace: 'nowrap' }}>
                        {item.fecha ? String(item.fecha).substring(0, 10) : 'S/I'}
                      </td>
                      <td style={{ padding: '8px' }}>{item.descripcion || item.razon_social || item.concepto || 'Sin detalle'}</td>
                      <td style={{ padding: '8px', fontSize: '11px', color: '#64748B' }}>{item.condicion || item.tipo_flujo || '-'}</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold', color: String(item.condicion||'').toUpperCase().includes('INGRESO') ? '#166534' : '#DC2626' }}>
                        {formatCLP(item.total || item.neto_liquido || item.monto)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '12px', color: '#64748B' }}>
                Total Transacciones: <strong>{modalDetalle.registros.length}</strong>
              </span>
              <button onClick={cerrarModal} style={{ backgroundColor: '#1E293B', color: '#FFFFFF', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
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

const excelTableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  fontFamily: 'sans-serif',
  whiteSpace: 'nowrap'
};

const cellStyle = {
  border: '1px solid #CBD5E1',
  padding: '6px 10px'
};

const clickableAmountStyle = {
  background: 'none',
  border: 'none',
  color: '#0284C7',
  textDecoration: 'underline',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontFamily: 'inherit',
  fontSize: 'inherit',
  padding: 0
};

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
  maxWidth: '750px',
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