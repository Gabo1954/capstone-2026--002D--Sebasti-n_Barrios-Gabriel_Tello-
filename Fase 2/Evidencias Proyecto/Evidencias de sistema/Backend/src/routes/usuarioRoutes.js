const express = require('express');
const router = express.Router();
const { 
    getUsuarios, 
    getUsuarioById, 
    createUsuario, 
    updateUsuario, 
    deleteUsuario 
} = require('../controllers/usuarioController');

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Obtiene la lista de todos los usuarios registrados
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida con éxito
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', getUsuarios);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   get:
 *     summary: Obtiene un usuario por su ID
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único del usuario
 *     responses:
 *       200:
 *         description: Usuario encontrado con éxito
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', getUsuarioById);

/**
 * @swagger
 * /api/usuarios:
 *   post:
 *     summary: Crea un nuevo usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - email
 *               - password
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Gabriel Tello"
 *               email:
 *                 type: string
 *                 example: "gabriel.tello.fernandez@gmail.com"
 *               password:
 *                 type: string
 *                 example: "Secreto123!"
 *               rol:
 *                 type: string
 *                 example: "ADMINISTRADOR"
 *     responses:
 *       201:
 *         description: Usuario creado con éxito
 *       400:
 *         description: Faltan datos obligatorios
 *       409:
 *         description: El email ya existe
 *       500:
 *         description: Error al registrar el usuario
 */
router.post('/', createUsuario);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   put:
 *     summary: Actualiza un usuario existente
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único del usuario a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - email
 *               - password
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Gabriel Tello Actualizado"
 *               email:
 *                 type: string
 *                 example: "gabriel.tello.fernandez@gmail.com"
 *               password:
 *                 type: string
 *                 example: "NuevoSecreto123!"
 *               rol:
 *                 type: string
 *                 example: "ADMINISTRADOR"
 *     responses:
 *       200:
 *         description: Usuario actualizado con éxito
 *       400:
 *         description: Faltan datos obligatorios
 *       404:
 *         description: Usuario no encontrado
 *       409:
 *         description: El email ya está registrado
 *       500:
 *         description: Error al actualizar el usuario
 */
router.put('/:id', updateUsuario);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   delete:
 *     summary: Elimina un usuario por su ID
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único del usuario a eliminar
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error al eliminar el usuario
 */
router.delete('/:id', deleteUsuario);

module.exports = router;