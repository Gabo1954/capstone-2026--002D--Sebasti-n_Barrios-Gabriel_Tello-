const express = require('express');
const router = express.Router();
const { getProyecciones, createProyeccion } = require('../controllers/proyeccionController');

/**
 * @swagger
 * /api/proyecciones:
 *   get:
 *     summary: Obtiene todos los escenarios y proyecciones
 *     tags: [Proyecciones]
 *     responses:
 *       200:
 *         description: Lista de proyecciones obtenida con éxito
 */
router.get('/', getProyecciones);

/**
 * @swagger
 * /api/proyecciones:
 *   post:
 *     summary: Crea un nuevo escenario de proyección (Requiere ID de Usuario)
 *     tags: [Proyecciones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_usuario
 *               - nombre_escenario
 *               - monto_estimado
 *               - categoria
 *               - fecha_proyectada
 *             properties:
 *               id_usuario:
 *                 type: integer
 *                 example: 1
 *               nombre_escenario:
 *                 type: string
 *                 example: "Cierre de trimestre optimista"
 *               monto_estimado:
 *                 type: number
 *                 example: 2500000.50
 *               categoria:
 *                 type: string
 *                 example: "INGRESO ESPERADO"
 *               fecha_proyectada:
 *                 type: string
 *                 format: date
 *                 example: "2026-12-31"
 *     responses:
 *       201:
 *         description: Proyección creada con éxito
 *       400:
 *         description: Faltan datos obligatorios
 *       404:
 *         description: Usuario no encontrado
 */
router.post('/', createProyeccion);

module.exports = router;