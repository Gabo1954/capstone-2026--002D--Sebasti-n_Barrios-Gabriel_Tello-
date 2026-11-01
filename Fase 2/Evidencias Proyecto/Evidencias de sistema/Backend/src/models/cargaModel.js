const pool = require('../config/db');

const obtenerCargas = async () => {
    const result = await pool.query('SELECT * FROM historial_cargas ORDER BY fecha_carga DESC');
    return result.rows;
};

const crearCarga = async (carga) => {
    const { id_usuario, nombre_archivo, registros_procesados } = carga;
    
    const result = await pool.query(
        'INSERT INTO historial_cargas (id_usuario, nombre_archivo, registros_procesados) VALUES ($1, $2, $3) RETURNING *',
        [id_usuario, nombre_archivo, registros_procesados || 0]
    );
    return result.rows[0];
};

module.exports = { obtenerCargas, crearCarga };