const pool = require('../config/db');

// Listas exactas de ENUMs aceptados por PostgreSQL
const BANCOS_VALIDOS = ['BCI', 'B Chile', 'B Falabella', 'B Falabella crédito', 'B Falabella credito', 'Efectivo'];
const DOCS_VALIDOS = ['FACTURA', 'BOLETA DE HONORARIOS', 'BOLETA', 'COMPROBANTE DE PAGO', 'COMPROBANTE DE TRANSFERENCIA', 'NOTA DE CREDITO'];
const CONDICIONES_VALIDAS = ['GASTO', 'COSTO', 'INGRESO OPERACIONAL', 'INGRESO NO OPERACIONAL'];
const FLUJOS_VALIDOS = ['FIJO', 'VARIABLE'];
const ESTADOS_VALIDOS = ['PENDIENTE', 'CONCILIADO', 'RECHAZADO'];

// Helper para ignorar tildes y mayúsculas
const normalizarTexto = (str) => {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
};

const validarEnum = (valor, listaPermitida, valorPorDefecto) => {
  if (!valor) return valorPorDefecto;
  const buscando = normalizarTexto(valor);
  
  if (buscando.includes('falabella') && buscando.includes('credito')) {
    return 'B Falabella credito';
  }
  
  const encontrado = listaPermitida.find(opt => normalizarTexto(opt) === buscando);
  return encontrado || valorPorDefecto;
};

const limpiarNumero = (val) => {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : Math.round(val);

  let str = String(val).trim().replace(/\$/g, '').replace(/\s/g, '');

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

const parsearFechaExcel = (fechaRaw) => {
  if (!fechaRaw) return new Date().toISOString().split('T')[0];

  if (typeof fechaRaw === 'number') {
    const fechaEpoch = new Date(Math.round((fechaRaw - 25569) * 86400 * 1000));
    return fechaEpoch.toISOString().split('T')[0];
  }

  if (fechaRaw instanceof Date && !isNaN(fechaRaw)) {
    const dia = String(fechaRaw.getDate()).padStart(2, '0');
    const mes = String(fechaRaw.getMonth() + 1).padStart(2, '0');
    const anio = fechaRaw.getFullYear();
    return `${anio}-${mes}-${dia}`;
  }

  const strFecha = String(fechaRaw).trim();
  if (/^\d{1,2}[\/-]\d{1,2}[\/-]\d{4}/.test(strFecha)) {
    const partes = strFecha.split(/[\/-]/);
    const dia = partes[0].padStart(2, '0');
    const mes = partes[1].padStart(2, '0');
    const anio = partes[2];
    return `${anio}-${mes}-${dia}`;
  }

  if (/^\d{4}-\d{2}-\d{2}/.test(strFecha)) {
    return strFecha.split('T')[0];
  }

  return new Date().toISOString().split('T')[0];
};

// 1. Obtener todos los movimientos
const obtenerMovimientos = async () => {
  const res = await pool.query('SELECT * FROM registro_movimientos ORDER BY id_movimiento DESC');
  return res.rows;
};

// 2. Crear movimiento individual
const crearMovimiento = async (datos) => {
  const query = `
    INSERT INTO registro_movimientos (
      documento, estado_conciliacion, nro_documento, razon_social, fecha,
      banco, tipo_pago, neto_liquido, iva, imposiciones_retenciones,
      total, proyecto, condicion, tipo_flujo, descripcion
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    RETURNING *;
  `;
  const values = [
    validarEnum(datos.documento, DOCS_VALIDOS, 'FACTURA'),
    validarEnum(datos.estado_conciliacion, ESTADOS_VALIDOS, 'PENDIENTE'),
    String(datos.nro_documento || 'S/N').trim().slice(0, 50),
    String(datos.razon_social || 'SIN RAZON SOCIAL').trim().slice(0, 200),
    parsearFechaExcel(datos.fecha),
    validarEnum(datos.banco, BANCOS_VALIDOS, 'BCI'),
    String(datos.tipo_pago || 'Debito').trim().slice(0, 30),
    limpiarNumero(datos.neto_liquido),
    limpiarNumero(datos.iva),
    limpiarNumero(datos.imposiciones_retenciones),
    limpiarNumero(datos.total),
    String(datos.proyecto || 'GENERAL').trim().slice(0, 150),
    validarEnum(datos.condicion, CONDICIONES_VALIDAS, 'GASTO'),
    validarEnum(datos.tipo_flujo, FLUJOS_VALIDOS, 'VARIABLE'),
    String(datos.descripcion || '').trim()
  ];
  const res = await pool.query(query, values);
  return res.rows[0];
};

// 3. Actualizar movimiento
const actualizarMovimiento = async (id, datos) => {
  const query = `
    UPDATE registro_movimientos 
    SET estado_conciliacion = COALESCE($1, estado_conciliacion),
        descripcion = COALESCE($2, descripcion)
    WHERE id_movimiento = $3
    RETURNING *;
  `;
  const res = await pool.query(query, [datos.estado_conciliacion, datos.descripcion, id]);
  return res.rows[0];
};

// 4. Eliminar movimiento
const eliminarMovimiento = async (id) => {
  const res = await pool.query('DELETE FROM registro_movimientos WHERE id_movimiento = $1 RETURNING *', [id]);
  return res.rows[0];
};

// 5. Crear Carga Masiva
const crearMovimientosMasivos = async (movimientos) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const query = `
      INSERT INTO registro_movimientos (
        documento, estado_conciliacion, nro_documento, razon_social, fecha,
        banco, tipo_pago, neto_liquido, iva, imposiciones_retenciones,
        total, proyecto, condicion, tipo_flujo, descripcion,
        documento_1, documento_2, documento_3, documento_4
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING id_movimiento;
    `;

    const resultados = [];

    for (const m of movimientos) {
      const values = [
        validarEnum(m.documento, DOCS_VALIDOS, 'FACTURA'),
        validarEnum(m.estado_conciliacion, ESTADOS_VALIDOS, 'PENDIENTE'),
        String(m.nro_documento || 'S/N').trim().slice(0, 50),
        String(m.razon_social || 'SIN RAZON SOCIAL').trim().slice(0, 200),
        parsearFechaExcel(m.fecha),
        validarEnum(m.banco, BANCOS_VALIDOS, 'BCI'),
        String(m.tipo_pago || 'Debito').trim().slice(0, 30),
        limpiarNumero(m.neto_liquido),
        limpiarNumero(m.iva),
        limpiarNumero(m.imposiciones_retenciones),
        limpiarNumero(m.total),
        String(m.proyecto || 'GENERAL').trim().slice(0, 150),
        validarEnum(m.condicion, CONDICIONES_VALIDAS, 'GASTO'),
        validarEnum(m.tipo_flujo, FLUJOS_VALIDOS, 'VARIABLE'),
        String(m.descripcion || '').trim(),
        String(m.documento_1 || '').trim().slice(0, 255),
        String(m.documento_2 || '').trim().slice(0, 255),
        String(m.documento_3 || '').trim().slice(0, 255),
        String(m.documento_4 || '').trim().slice(0, 255)
      ];

      const res = await client.query(query, values);
      resultados.push(res.rows[0]);
    }

    await client.query('COMMIT');
    return resultados;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('⚠️ Error en PostgreSQL durante carga masiva:', error.message);
    throw error;
  } finally {
    client.release();
  }
};

// EXPORTACIÓN COMPLETA DE MÉTODOS
module.exports = {
  obtenerMovimientos,
  crearMovimiento,
  actualizarMovimiento,
  eliminarMovimiento,
  crearMovimientosMasivos
};