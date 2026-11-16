import axios from 'axios';

// Conexión centralizada hacia el Backend en localhost:3000
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});
// 1. Limpiador de montos en Pesos Chilenos (ej: "$ 1.250.000" -> 1250000)
const limpiarMontoCLP = (valor) => {
  if (valor === undefined || valor === null || valor === '') return 0;
  if (typeof valor === 'number') return isNaN(valor) ? 0 : Math.round(valor);

  let str = String(valor).trim().replace(/\$/g, '').replace(/\s/g, '');
  if (str === '-' || str === '') return 0;

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

// 2. Normalizador de fechas de Google Sheets (Números de serie, DD-MM-YYYY o YYYY-MM-DD)
const normalizarFecha = (fechaRaw) => {
  if (fechaRaw === undefined || fechaRaw === null || fechaRaw === '') return null;
  const str = String(fechaRaw).trim();

  // Caso 1: Número de serie de Google Sheets / Excel (ej: 46336 -> 2026-11-10)
  const numSerial = Number(str);
  if (!isNaN(numSerial) && numSerial > 20000 && numSerial < 100000) {
    const utcMillis = Math.round((numSerial - 25569) * 86400 * 1000);
    const fechaObj = new Date(utcMillis);
    const anio = fechaObj.getUTCFullYear();
    const mes = String(fechaObj.getUTCMonth() + 1).padStart(2, '0');
    const dia = String(fechaObj.getUTCDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}T12:00:00`;
  }

  // Caso 2: Formato DD-MM-YYYY o DD/MM/YYYY (Chile)
  if (/^\d{1,2}[/-]\d{1,2}[/-]\d{4}/.test(str)) {
    const partes = str.split(/[/-]/);
    const dia = partes[0].padStart(2, '0');
    const mes = partes[1].padStart(2, '0');
    const anio = partes[2].substring(0, 4);
    return `${anio}-${mes}-${dia}T12:00:00`;
  }

  // Caso 3: Formato YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    return `${str.substring(0, 10)}T12:00:00`;
  }

  return str;
};

// 3. Transformar filas de Google Sheets (Array 2D) a Objetos compatibles con todas las vistas
const mapearFilasExcelAObjetos = (matriz) => {
  if (!Array.isArray(matriz) || matriz.length <= 1) return [];

  return matriz
    .slice(1)
    .filter((fila) => Array.isArray(fila) && fila.some((celda) => String(celda || '').trim() !== ''))
    .map((fila, idx) => ({
      id_movimiento: idx + 2,
      documento: fila[0] ? String(fila[0]).trim() : 'FACTURA',
      estado_conciliacion: fila[1] ? String(fila[1]).trim().toUpperCase() : 'PENDIENTE',
      nro_documento: fila[2] ? String(fila[2]).trim() : '',
      razon_social: fila[3] ? String(fila[3]).trim() : 'Sin detalle',
      fecha: normalizarFecha(fila[4]),
      banco: fila[5] ? String(fila[5]).trim() : '',
      tipo_pago: fila[6] ? String(fila[6]).trim() : '',
      neto_liquido: limpiarMontoCLP(fila[7]),
      iva: limpiarMontoCLP(fila[8]),
      imposiciones_retenciones: limpiarMontoCLP(fila[9]),
      total: limpiarMontoCLP(fila[10]),
      proyecto: fila[11] ? String(fila[11]).trim() : 'GENERAL',
      condicion: fila[12] ? String(fila[12]).trim().toUpperCase() : 'GASTO',
      tipo_flujo: fila[13] ? String(fila[13]).trim().toUpperCase() : 'VARIABLE',
      descripcion: fila[14] ? String(fila[14]).trim() : '',
      documento_1: fila[15] || '',
      documento_2: fila[16] || '',
      documento_3: fila[17] || '',
      documento_4: fila[18] || ''
    }));
};

// 4. Interceptor: Redirige GET /movimientos hacia /excel/datos automáticamente
api.interceptors.request.use((config) => {
  if (config.method === 'get' && config.url === '/movimientos') {
    config.url = '/excel/datos';
    config._esExcelSync = true;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (response.config?._esExcelSync && response.data?.data) {
      response.data = mapearFilasExcelAObjetos(response.data.data);
    }
    return response;
  },
  (error) => Promise.reject(error)
);

export default api;