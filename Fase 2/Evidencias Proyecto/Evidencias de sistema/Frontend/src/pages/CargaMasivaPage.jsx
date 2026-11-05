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

  // 1. Limpieza y normalización para CLP (Pesos Chilenos)
  const limpiarNumero = (valor) => {
    if (valor === undefined || valor === null || valor === '') return 0;
    
    // Si viene como número (ej: 67.334 porque Excel lo interpretó con decimales)
    if (typeof valor === 'number') {
      if (isNaN(valor)) return 0;
      
      // Si el número tiene decimales pero en CLP no usamos decimales (ej: 67.334),
      // verificamos si es un caso de punto de mil interpretado como decimal
      const strVal = String(valor);
      if (strVal.includes('.') && strVal.split('.')[1].length === 3) {
        return Math.round(valor * 1000);
      }
      return Math.round(valor);
    }
    
    let str = String(valor).trim().replace(/\$/g, '').replace(/\s/g, '');

    if (str.includes('.') && str.includes(',')) {
      str = str.replace(/\./g, '').replace(',', '.');
    } else if (str.includes(',')) {
      str = str.replace(',', '.');
    } else if (str.includes('.')) {
      const partes = str.split('.');
      if (partes.length > 2 || (partes.length === 2 && partes[1].length === 3)) {
        str = partes.join('');
      }
    }
      
    const num = parseFloat(str);
    return isNaN(num) ? 0 : Math.round(num);
  };

  // Parser ultra robusto para fechas de Excel
  const formatearFechaChile = (fechaRaw) => {
    if (!fechaRaw) return new Date().toISOString().split('T')[0];

    // Caso 1: Si Excel entrega un número de serie de fecha (ej: 45565)
    if (typeof fechaRaw === 'number') {
      const fechaObj = XLSX.SSF.parse_date_code(fechaRaw);
      if (fechaObj) {
        const dia = String(fechaObj.d).padStart(2, '0');
        const mes = String(fechaObj.m).padStart(2, '0');
        const anio = fechaObj.y;
        return `${anio}-${mes}-${dia}`;
      }
    }

    // Caso 2: Si viene como objeto Date de JS
    if (fechaRaw instanceof Date && !isNaN(fechaRaw)) {
      const dia = String(fechaRaw.getDate()).padStart(2, '0');
      const mes = String(fechaRaw.getMonth() + 1).padStart(2, '0');
      const anio = fechaRaw.getFullYear();
      return `${anio}-${mes}-${dia}`;
    }

    const str = String(fechaRaw).trim();

    // Caso 3: DD-MM-YYYY o DD/MM/YYYY (ej: 30-09-2026, 30/9/2026)
    if (/^\d{1,2}[\/-]\d{1,2}[\/-]\d{4}/.test(str)) {
      const partes = str.split(/[\/-]/);
      const dia = partes[0].padStart(2, '0');
      const mes = partes[1].padStart(2, '0');
      const anio = partes[2];
      return `${anio}-${mes}-${dia}`;
    }

    // Caso 4: YYYY-MM-DD (ej: 2026-09-30)
    if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
      return str.split('T')[0];
    }

    // Caso 5: Intento estándar de parseo
    const parsedDate = new Date(str);
    if (!isNaN(parsedDate.getTime())) {
      const dia = String(parsedDate.getUTCDate()).padStart(2, '0');
      const mes = String(parsedDate.getUTCMonth() + 1).padStart(2, '0');
      const anio = parsedDate.getUTCFullYear();
      return `${anio}-${mes}-${dia}`;
    }

    // Si todo falla, retorna la fecha de hoy
    return new Date().toISOString().split('T')[0];
  };

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
        // cellDates: true permite a XLSX parsear fechas reales
        const workbook = XLSX.read(data, { type: 'array', cellFormulas: true, cellDates: true });
        
        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          setMensaje({ tipo: 'error', texto: 'El libro de Excel no contiene hojas válidas.' });
          return;
        }

        const nombreHoja = workbook.SheetNames.find(
          (name) => name.trim().toLowerCase() === 'registro'
        ) || workbook.SheetNames[0];

        const hoja = workbook.Sheets[nombreHoja];

        // 1. Cambiamos 'raw: false' a 'raw: true'
        const JSONDatos = XLSX.utils.sheet_to_json(hoja, { raw: true, defval: '' });

        // 2. Agregamos el console.log justo después para inspeccionar en la consola de F12
        console.log('FILA ORIGINAL DESDE EXCEL:', JSONDatos[0]);

        if (JSONDatos.length === 0) {
          setMensaje({ tipo: 'error', texto: `La hoja "${nombreHoja}" está vacía.` });
          return;
        }

        const mapeados = JSONDatos.map((fila, index) => {
          // Buscador súper flexible: ignora tildes, mayúsculas, guiones y espacios
          const getCampoFlexible = (nombresPosibles) => {
            const llavesFila = Object.keys(fila);
            for (let buscado of nombresPosibles) {
              const buscadoNorm = buscado.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');
              const llaveEncontrada = llavesFila.find(k => 
                k.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '') === buscadoNorm
              );
              if (llaveEncontrada && fila[llaveEncontrada] !== undefined && fila[llaveEncontrada] !== '') {
                return fila[llaveEncontrada];
              }
            }
            return '';
          };

          const neto = limpiarNumero(getCampoFlexible(['Neto / líquido', 'Neto / liquido', 'Neto/líquido', 'neto_liquido', 'neto']));
          const iva = limpiarNumero(getCampoFlexible(['IVA', 'iva']));
          const ret = limpiarNumero(getCampoFlexible(['Imposiciones/retenciones', 'Imposiciones / retenciones', 'imposiciones_retenciones', 'retenciones']));
          
          let total = limpiarNumero(getCampoFlexible(['Total', 'total']));
          if (total === 0 && (neto > 0 || iva > 0 || ret > 0)) {
            total = neto + iva + ret;
          }

          const fechaRaw = getCampoFlexible(['Fecha', 'fecha']);
          const fechaFormateada = formatearFechaChile(fechaRaw);
          const razonSocial = String(getCampoFlexible(['Razón social', 'Razon social', 'razon_social']) || 'SIN RAZON SOCIAL').trim();

          return {
            id_temp: index + 1,
            documento: validarEnum(getCampoFlexible(['Documento', 'documento']), ENUMS_VALIS.documentos, 'FACTURA'),
            estado_conciliacion: validarEnum(getCampoFlexible(['Estado de conciliación', 'Estado de conciliacion', 'estado_conciliacion']), ENUMS_VALIS.estadosConciliacion, 'PENDIENTE'),
            nro_documento: String(getCampoFlexible(['n° de documento', 'n de documento', 'nro_documento', 'n° documento'])).trim() || 'S/N',
            razon_social: razonSocial || 'SIN RAZON SOCIAL',
            fecha: fechaFormateada,
            banco: validarEnum(getCampoFlexible(['Banco', 'banco']), ENUMS_VALIS.bancos, 'BCI'),
            tipo_pago: validarEnum(getCampoFlexible(['Tipo de pago', 'tipo_pago']), ENUMS_VALIS.tiposPago, 'Debito'),
            neto_liquido: neto,
            iva: iva,
            imposiciones_retenciones: ret,
            total: total,
            proyecto: String(getCampoFlexible(['Proyecto', 'proyecto']) || 'GENERAL').trim(),
            condicion: validarEnum(getCampoFlexible(['Condición', 'Condicion', 'condicion']), ENUMS_VALIS.condiciones, 'GASTO'),
            tipo_flujo: validarEnum(getCampoFlexible(['Tipo de flujo', 'tipo_flujo']), ENUMS_VALIS.tiposFlujo, 'VARIABLE'),
            descripcion: String(getCampoFlexible(['Descripción', 'Descripcion', 'descripcion']) || '').trim(),
            documento_1: String(getCampoFlexible(['Documento 1']) || '').trim(),
            documento_2: String(getCampoFlexible(['Documento 2']) || '').trim(),
            documento_3: String(getCampoFlexible(['Documento 3']) || '').trim(),
            documento_4: String(getCampoFlexible(['Documento 4']) || '').trim()
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
        <h2 style={{ margin: 0, color: '#1E293B', fontSize: '20px' }}>Carga Masiva de Planillas Excel</h2>
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
        <div style={{ fontSize: '32px', marginBottom: '8px' }}></div>
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