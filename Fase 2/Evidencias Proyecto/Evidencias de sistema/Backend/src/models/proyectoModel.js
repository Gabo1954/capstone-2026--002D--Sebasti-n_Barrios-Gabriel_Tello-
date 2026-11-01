const pool = require('../config/db'); 

const obtenerProyectos = async () => {
    const result = await pool.query('SELECT * FROM proyectos ORDER BY id_proyecto DESC');
    return result.rows;
};

const crearProyecto = async (proyecto) => {
    const { nombre_proyecto, estado, presupuesto_total } = proyecto;
    const result = await pool.query(
        'INSERT INTO proyectos (nombre_proyecto, estado, presupuesto_total) VALUES ($1, $2, $3) RETURNING *',
        [nombre_proyecto, estado || 'ACTIVO', presupuesto_total || 0]
    );
    return result.rows[0];
};

module.exports = { obtenerProyectos, crearProyecto };