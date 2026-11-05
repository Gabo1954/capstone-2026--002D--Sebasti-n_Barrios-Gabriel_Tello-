import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import api from '../services/api';

// Opciones permitidas por los tipos ENUM de PostgreSQL
const ENUMS_VALIS = {
  documentos: ['FACTURA', 'BOLETA DE HONORARIOS', 'BOLETA', 'COMPROBANTE DE PAGO', 'COMPROBANTE DE TRANSFERENCIA', 'NOTA DE CREDITO'],
  bancos: ['BCI', 'B Chile', 'B Falabella', 'B Falabella credito', 'Efectivo'],
  tiposPago: ['Debito', 'Credito', 'Efectivo'],
  condiciones: ['GASTO', 'COSTO', 'INGRESO OPERACIONAL', 'INGRESO NO OPERACIONAL'],
  tiposFlujo: ['FIJO', 'VARIABLE'],
  estadosConciliacion: ['PENDIENTE', 'CONCILIADO', 'RECHAZADO']
};

export default function CargaMasivaPage() {
  const [archivo, setArchivo] = useState(null);
  const [datosPrevisualizacion, setDatosPrevisualizacion] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const limpiarNumero = (valor) => {
    if (valor === undefined || valor === null || valor === '') return 0;
    if (typeof valor === 'number') return isNaN(valor) ? 0 : valor;
    
    const limpio = String(valor)
      .replace(/\$/g, '')
      .replace(/\./g, '')
      .replace(/\s/g, '')
      .replace(/,/g, '.');
      
    const num = parseFloat(limpio);
    return isNaN(num) ? 0 : num;
  };

  // Validar y ajustar valores contra los ENUMs reales de PostgreSQL
  const validarEnum = (valor, listaPermitida, valorPorDefecto) => {
    if (!valor) return valorPorDefecto;
    const str = String(valor).trim().toUpperCase();
    const encontrado = listaPermitida.find(opt => opt.toUpperCase() === str);
    return encontrado || valorPorDefecto;
  };

  const handleProcesarArchivo = (file) => {
    if (!file) return;

    setArchivo(file);
    setMensaje(null);
    setDatosPrevisualizacion([]);

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array', cellFormulas: true });
        
        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          setMensaje({ tipo: 'error', texto: 'El libro de Excel no contiene hojas válidas.' });
          return;
        }

        const nombreHoja = workbook.SheetNames.find(
          (name) => name.trim().toLowerCase() === 'registro'
        ) || workbook.SheetNames[0];

        const hoja = workbook.Sheets[nombreHoja];
        const JSONDatos = XLSX.utils.sheet_to_json(hoja, { raw: false, defval: '' });

        if (JSONDatos.length === 0) {
          setMensaje({ tipo: 'error', texto: `La hoja "${nombreHoja}" está vacía.` });
          return;
        }

        const mapeados = JSONDatos.map((fila, index) => {
          const getCampo = (nombres) => {
            for (let n of nombres) {
              if (fila[n] !== undefined && fila[n] !== '') return fila[n];
            }
            return '';
          };

          const neto = limpiarNumero(getCampo(['Neto / líquido', 'Neto/líquido', 'neto_liquido', 'NETO']));
          const iva = limpiarNumero(getCampo(['IVA', 'iva']));
          const ret = limpiarNumero(getCampo(['Imposiciones/retenciones', 'imposiciones_retenciones', 'RETENCIONES']));
          
          let total = limpiarNumero(getCampo(['Total', 'total', 'TOTAL']));
          if (total === 0 && (neto > 0 || iva > 0 || ret > 0)) {
            total = neto + iva + ret;
          }

          let fechaRaw = getCampo(['Fecha', 'fecha', 'FECHA']);
          let fechaFormateada = new Date().toISOString().split('T')[0];
          if (fechaRaw) {
            const parsedDate = new Date(fechaRaw);
            if (!isNaN(parsedDate.getTime())) {
              fechaFormateada = parsedDate.toISOString().split('T')[0];
            }
          }

          const razonSocial = String(getCampo(['Razón social', 'razon_social', 'RAZON_SOCIAL']) || 'SIN RAZON SOCIAL').trim();

          return {
            id_temp: index + 1,
            documento: validarEnum(getCampo(['Documento', 'documento']), ENUMS_VALIS.documentos, 'FACTURA'),
            estado_conciliacion: validarEnum(getCampo(['Estado de conciliación', 'estado_conciliacion']), ENUMS_VALIS.estadosConciliacion, 'PENDIENTE'),
            nro_documento: String(getCampo(['n° de documento', 'nro_documento', 'NRO_DOCUMENTO'])).trim() || 'S/N',
            razon_social: razonSocial || 'SIN RAZON SOCIAL',
            fecha: fechaFormateada,
            banco: validarEnum(getCampo(['Banco', 'banco']), ENUMS_VALIS.bancos, 'BCI'),
            tipo_pago: validarEnum(getCampo(['Tipo de pago', 'tipo_pago']), ENUMS_VALIS.tiposPago, 'Debito'),
            neto_liquido: neto,
            iva: iva,
            imposiciones_retenciones: ret,
            total: total,
            proyecto: String(getCampo(['Proyecto', 'proyecto']) || 'GENERAL').trim(),
            condicion: validarEnum(getCampo(['Condición', 'condicion']), ENUMS_VALIS.condiciones, 'GASTO'),
            tipo_flujo: validarEnum(getCampo(['Tipo de flujo', 'tipo_flujo']), ENUMS_VALIS.tiposFlujo, 'VARIABLE'),
            descripcion: String(getCampo(['Descripción', 'descripcion']) || '').trim(),
            documento_1: String(getCampo(['Documento 1']) || '').trim(),
            documento_2: String(getCampo(['Documento 2']) || '').trim(),
            documento_3: String(getCampo(['Documento 3']) || '').trim(),
            documento_4: String(getCampo(['Documento 4']) || '').trim()
          };
        });

        setDatosPrevisualizacion(mapeados);
        setMensaje({ tipo: 'exito', texto: `¡Archivo leído! ${mapeados.length} filas preparadas y validadas con PostgreSQL.` });
      } catch (err) {
        console.error('Error al procesar Excel:', err);
        setMensaje({ tipo: 'error', texto: 'No se pudo leer el archivo Excel.' });
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleGuardarEnBD = async () => {
    if (datosPrevisualizacion.length === 0) return;

    try {
      setCargando(true);
      setMensaje(null);

      const paquete = datosPrevisualizacion.map(({ id_temp, ...resto }) => resto);

      const res = await api.post('/movimientos/carga-masiva', { movimientos: paquete });

      setMensaje({ 
        tipo: 'exito', 
        texto: `¡Éxito! ${res.data.insertados || paquete.length} registros guardados en PostgreSQL.` 
      });
      setDatosPrevisualizacion([]);
      setArchivo(null);
    } catch (error) {
      console.error('Error en carga masiva:', error);
      setMensaje({ 
        tipo: 'error', 
        texto: error.response?.data?.error || 'Error de comunicación con la base de datos.' 
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ margin: 0, color: '#1E293B', fontSize: '20px' }}>📤 Carga Masiva de Planillas Excel</h2>
        <span style={{ fontSize: '13px', color: '#64748B' }}>
          Importa tu histórico desde la plantilla maestro directamente a PostgreSQL
        </span>
      </div>

      {mensaje && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '6px',
          marginBottom: '16px',
          backgroundColor: mensaje.tipo === 'exito' ? '#DCFCE7' : '#FEE2E2',
          color: mensaje.tipo === 'exito' ? '#15803D' : '#991B1B',
          fontWeight: 'bold',
          fontSize: '13px'
        }}>
          {mensaje.texto}
        </div>
      )}

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleProcesarArchivo(e.dataTransfer.files[0]);
          }
        }}
        style={{
          border: '2px dashed #0284C7',
          borderRadius: '8px',
          padding: '30px 20px',
          textAlign: 'center',
          backgroundColor: '#FFFFFF',
          marginBottom: '20px'
        }}
      >
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>📄</div>
        <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', color: '#334155' }}>
          Arrastra y suelta tu archivo Excel (.xlsx) aquí
        </p>
        <span style={{ fontSize: '12px', color: '#64748B' }}>o presiona el botón para examinar tu equipo</span>
        <br />
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleProcesarArchivo(e.target.files[0]);
            }
          }}
          style={{ display: 'none' }}
          id="fileInput"
        />
        <label htmlFor="fileInput" style={{
          display: 'inline-block',
          marginTop: '12px',
          padding: '8px 16px',
          backgroundColor: '#0284C7',
          color: 'white',
          borderRadius: '4px',
          fontWeight: 'bold',
          fontSize: '12px',
          cursor: 'pointer'
        }}>
          Seleccionar Archivo Excel
        </label>
        {archivo && (
          <div style={{ marginTop: '10px', fontSize: '12px', color: '#0369A1', fontWeight: 'bold' }}>
            📎 Archivo seleccionado: {archivo.name}
          </div>
        )}
      </div>

      {datosPrevisualizacion.length > 0 && (
        <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ margin: 0, color: '#1E293B' }}>
              Vista previa ({datosPrevisualizacion.length} registros listos)
            </h4>
            <button
              onClick={handleGuardarEnBD}
              disabled={cargando}
              style={{
                backgroundColor: '#166534',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                fontWeight: 'bold',
                cursor: cargando ? 'not-allowed' : 'pointer'
              }}
            >
              {cargando ? 'Guardando en BD...' : ' Confirmar y Guardar en BD'}
            </button>
          </div>

          <div style={{ overflowX: 'auto', maxHeight: '300px' }}>
            <table border="1" cellPadding="6" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', borderColor: '#E2E8F0', whiteSpace: 'nowrap' }}>
              <thead style={{ backgroundColor: '#F1F5F9' }}>
                <tr>
                  <th>#</th>
                  <th>Documento</th>
                  <th>N° Doc</th>
                  <th>Razón Social</th>
                  <th>Fecha</th>
                  <th>Neto</th>
                  <th>IVA</th>
                  <th>Total</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {datosPrevisualizacion.slice(0, 10).map((row) => (
                  <tr key={row.id_temp}>
                    <td>{row.id_temp}</td>
                    <td>{row.documento}</td>
                    <td>{row.nro_documento}</td>
                    <td>{row.razon_social}</td>
                    <td>{row.fecha}</td>
                    <td>${Number(row.neto_liquido).toLocaleString('es-CL')}</td>
                    <td>${Number(row.iva).toLocaleString('es-CL')}</td>
                    <td><strong>${Number(row.total).toLocaleString('es-CL')}</strong></td>
                    <td>{row.estado_conciliacion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {datosPrevisualizacion.length > 10 && (
              <p style={{ fontSize: '11px', color: '#64748B', textAlign: 'center', marginTop: '8px' }}>
                ... y {datosPrevisualizacion.length - 10} filas más.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}