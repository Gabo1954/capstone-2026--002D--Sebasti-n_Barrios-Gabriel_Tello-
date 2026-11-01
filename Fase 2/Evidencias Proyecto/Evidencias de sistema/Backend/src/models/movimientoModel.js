const pool = require('../config/db');

const obtenerMovimientos = async () => {
    const result = await pool.query('SELECT * FROM registro_movimientos ORDER BY id_movimiento DESC');
    return result.rows;
};

const crearMovimiento = async (movimiento) => {
    const {
        documento, estado_conciliacion, nro_documento, razon_social,
        fecha, banco, tipo_pago, neto_liquido, iva, imposiciones_retenciones,
        total, proyecto, condicion, tipo_flujo, descripcion, id_proyecto
    } = movimiento;

    const query = `
        INSERT INTO registro_movimientos (
            documento, estado_conciliacion, nro_documento, razon_social,
            fecha, banco, tipo_pago, neto_liquido, iva, imposiciones_retenciones,
            total, proyecto, condicion, tipo_flujo, descripcion,
            ingreso_manual, id_proyecto
        ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
        ) RETURNING *;
    `;

    const values = [
        documento, estado_conciliacion || 'PENDIENTE', nro_documento || null, razon_social,
        fecha, banco || null, tipo_pago || null, neto_liquido || 0, iva || 0, imposiciones_retenciones || 0,
        total, proyecto, condicion, tipo_flujo, descripcion || null, true, id_proyecto || null
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
};

const actualizarMovimiento = async (id, datosActualizados) => {
    const { estado_conciliacion, descripcion } = datosActualizados;
    const result = await pool.query(
        'UPDATE registro_movimientos SET estado_conciliacion = COALESCE($1, estado_conciliacion), descripcion = COALESCE($2, descripcion) WHERE id_movimiento = $3 RETURNING *',
        [estado_conciliacion, descripcion, id]
    );
    return result.rows[0];
};

// NUEVA FUNCIÓN: Eliminar movimiento
const eliminarMovimiento = async (id) => {
    const result = await pool.query(
        'DELETE FROM registro_movimientos WHERE id_movimiento = $1 RETURNING *',
        [id]
    );
    return result.rows[0];
};

module.exports = { obtenerMovimientos, crearMovimiento, actualizarMovimiento, eliminarMovimiento };