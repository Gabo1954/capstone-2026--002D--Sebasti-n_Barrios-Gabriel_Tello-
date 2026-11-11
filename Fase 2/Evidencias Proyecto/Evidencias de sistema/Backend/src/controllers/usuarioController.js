const bcrypt = require('bcryptjs');
const Usuario = require('../models/usuarioModel');

// 1. READ (Obtener todos los usuarios)
const getUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.obtenerUsuarios();
        res.status(200).json(usuarios);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ error: 'Error interno al obtener los usuarios' });
    }
};

// 2. READ (Obtener un usuario por su ID)
const getUsuarioById = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await Usuario.obtenerUsuarioPorId(id);
        
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        res.status(200).json(usuario);
    } catch (error) {
        console.error('Error al obtener el usuario:', error);
        res.status(500).json({ error: 'Error interno al obtener el usuario' });
    }
};

// 3. CREATE (Crear un nuevo usuario con contraseña encriptada)
const createUsuario = async (req, res) => {
    try {
        const { nombre, email, password, rol } = req.body;
        
        if (!nombre || !email || !password) {
            return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios' });
        }

        // Hashear la contraseña antes de guardarla
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // Pasamos el objeto con el password ya hasheado
        const nuevoUsuario = await Usuario.crearUsuario({
            nombre,
            email,
            password: password_hash,
            rol
        });

        res.status(201).json(nuevoUsuario);
    } catch (error) {
        console.error('Error al crear usuario:', error);
        if (error.code === '23505') {
            return res.status(409).json({ error: 'El email ya está registrado' });
        }
        res.status(500).json({ error: 'Error al registrar el usuario' });
    }
};

// 4. UPDATE (Actualizar un usuario existente con contraseña encriptada)
const updateUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, email, password, rol } = req.body;
        
        if (!nombre || !email || !password) {
            return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios' });
        }

        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        const usuarioActualizado = await Usuario.actualizarUsuario(id, {
            nombre,
            email,
            password: password_hash,
            rol
        });

        if (!usuarioActualizado) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.status(200).json(usuarioActualizado);
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        if (error.code === '23505') {
            return res.status(409).json({ error: 'El email ya está registrado' });
        }
        res.status(500).json({ error: 'Error al actualizar el usuario' });
    }
};

// 5. DELETE (Eliminar un usuario)
const deleteUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioEliminado = await Usuario.eliminarUsuario(id);

        if (!usuarioEliminado) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.status(200).json({ 
            message: 'Usuario eliminado correctamente', 
            usuario: usuarioEliminado 
        });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ error: 'Error al eliminar el usuario' });
    }
};

module.exports = {
    getUsuarios,
    getUsuarioById,
    createUsuario,
    updateUsuario,
    deleteUsuario
};