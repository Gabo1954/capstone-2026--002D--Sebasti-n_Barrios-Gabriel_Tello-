const express = require('express');
const router = express.Router();
const { getProyectos, createProyecto } = require('../controllers/proyectoController');

/**
 * @swagger
 * /api/proyectos:
 *   get:
 *     summary: Obtiene la lista de todos los proyectos
 *     tags: [Proyectos]
 *     responses:
 *       200:
 *         description: Lista de proyectos obtenida con éxito
 */
router.get('/', getProyectos);

/**
 * @swagger
 * /api/proyectos:
 *   post:
 *     summary: Crea un nuevo proyecto
 *     tags: [Proyectos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre_proyecto
 *             properties:
 *               nombre_proyecto:
 *                 type: string
 *                 example: "0.3 Licanten 3299-23-L126"
 *               estado:
 *                 type: string
 *                 example: "ACTIVO"
 *               presupuesto_total:
 *                 type: number
 *                 example: 15000000.00
 *     responses:
 *       201:
 *         description: Proyecto creado con éxito
 *       400:
 *         description: Faltan datos obligatorios
 *       409:
 *         description: El proyecto ya existe
 */
router.post('/', createProyecto);

module.exports = router;