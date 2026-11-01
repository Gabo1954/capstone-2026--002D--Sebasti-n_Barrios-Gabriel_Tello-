const express = require('express');
const router = express.Router();
const { getCargas, createCarga } = require('../controllers/cargaController');

/**
 * @swagger
 * /api/cargas:
 *   get:
 *     summary: Obtiene el historial de archivos Excel cargados
 *     tags: [Cargas Excel]
 *     responses:
 *       200:
 *         description: Historial de cargas obtenido con éxito
 */
router.get('/', getCargas);

/**
 * @swagger
 * /api/cargas:
 *   post:
 *     summary: Registra una nueva subida de archivo Excel (Requiere ID de Usuario)
 *     tags: [Cargas Excel]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_usuario
 *               - nombre_archivo
 *             properties:
 *               id_usuario:
 *                 type: integer
 *                 example: 1
 *               nombre_archivo:
 *                 type: string
 *                 example: "Registro_Movimientos_Octubre.xlsx"
 *               registros_procesados:
 *                 type: integer
 *                 example: 350
 *     responses:
 *       201:
 *         description: Registro de carga creado con éxito
 *       400:
 *         description: Faltan datos obligatorios
 *       404:
 *         description: Usuario no encontrado
 */
router.post('/', createCarga);

module.exports = router;