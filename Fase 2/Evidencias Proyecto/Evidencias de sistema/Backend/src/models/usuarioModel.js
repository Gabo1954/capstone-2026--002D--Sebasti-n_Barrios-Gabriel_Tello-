const pool = require('../config/db');

// 1. Obtener todos los usuarios
const obtenerUsuarios = async () => {
    const result = await pool.query(
        'SELECT id_usuario, nombre, email, rol, activo, fecha_creacion FROM usuarios ORDER BY id_usuario ASC'
    );
    return result.rows;
};

// 2. Obtener un usuario por su ID
const obtenerUsuarioPorId = async (id) => {
    const result = await pool.query(
        'SELECT id_usuario, nombre, email, rol, activo, fecha_creacion FROM usuarios WHERE id_usuario = $1',
        [id]
    );
    return result.rows[0]; // Retorna el usuario o undefined si no existe
};

// 3. Crear un nuevo usuario
const crearUsuario = async (usuario) => {
    const { nombre, email, password, rol } = usuario;
    
    const result = await pool.query(
        'INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES ($1, $2, $3, $4) RETURNING id_usuario, nombre, email, rol, activo',
        [nombre, email, password, rol || 'LECTOR']
    );
    return result.rows[0];
};

// 4. Actualizar un usuario
const actualizarUsuario = async (id, usuario) => {
    const { nombre, email, password, rol } = usuario;

    const result = await pool.query(
        `UPDATE usuarios 
         SET nombre = $1, email = $2, password_hash = $3, rol = COALESCE($4, rol) 
         WHERE id_usuario = $5 
         RETURNING id_usuario, nombre, email, rol, activo`,
        [nombre, email, password, rol, id]
    );
    return result.rows[0]; // Retorna el usuario actualizado o undefined si no existe
};

// 5. Eliminar un usuario
const eliminarUsuario = async (id) => {
    const result = await pool.query(
        'DELETE FROM usuarios WHERE id_usuario = $1 RETURNING id_usuario, nombre, email',
        [id]
    );
    return result.rows[0]; // Retorna el usuario eliminado o undefined si no existe
};

module.exports = { 
    obtenerUsuarios, 
    obtenerUsuarioPorId, 
    crearUsuario, 
    actualizarUsuario, 
    eliminarUsuario 
};