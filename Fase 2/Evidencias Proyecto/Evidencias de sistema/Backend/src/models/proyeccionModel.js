const pool = require('../config/db');

const obtenerProyecciones = async () => {
    const result = await pool.query('SELECT * FROM proyecciones ORDER BY fecha_proyectada ASC');
    return result.rows;
};

const crearProyeccion = async (proyeccion) => {
    const { id_usuario, nombre_escenario, monto_estimado, categoria, fecha_proyectada } = proyeccion;
    
    const result = await pool.query(
        'INSERT INTO proyecciones (id_usuario, nombre_escenario, monto_estimado, categoria, fecha_proyectada) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [id_usuario, nombre_escenario, monto_estimado, categoria, fecha_proyectada]
    );
    return result.rows[0];
};

module.exports = { obtenerProyecciones, crearProyeccion };