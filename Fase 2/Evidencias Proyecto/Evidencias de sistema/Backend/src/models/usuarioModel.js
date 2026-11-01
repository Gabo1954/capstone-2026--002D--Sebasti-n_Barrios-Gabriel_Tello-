const pool = require('../config/db');

const obtenerUsuarios = async () => {
    const result = await pool.query('SELECT id_usuario, nombre, email, rol, activo, fecha_creacion FROM usuarios ORDER BY id_usuario ASC');
    return result.rows;
};

const crearUsuario = async (usuario) => {
    const { nombre, email, password, rol } = usuario;
    

    const result = await pool.query(
        'INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES ($1, $2, $3, $4) RETURNING id_usuario, nombre, email, rol, activo',
        [nombre, email, password, rol || 'LECTOR']
    );
    return result.rows[0];
};

module.exports = { obtenerUsuarios, crearUsuario };