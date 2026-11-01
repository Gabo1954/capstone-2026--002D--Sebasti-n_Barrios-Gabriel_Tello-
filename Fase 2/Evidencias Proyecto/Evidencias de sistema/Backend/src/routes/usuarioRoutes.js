const express = require('express');
const router = express.Router();
const { getUsuarios, createUsuario } = require('../controllers/usuarioController');

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Obtiene la lista de todos los usuarios registrados
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida con éxito
 */
router.get('/', getUsuarios);

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
 */
router.post('/', createUsuario);

module.exports = router;