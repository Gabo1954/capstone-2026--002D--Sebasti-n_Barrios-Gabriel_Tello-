const express = require('express');
const router = express.Router();
const { 
  getProyectos, 
  createProyecto, 
  getDetalleProyecto 
} = require('../controllers/proyectoController');

/**
 * @swagger
 * /api/proyectos:
 *   get:
 *     summary: Obtiene la lista de todos los proyectos con su resumen financiero
 *     tags: [Proyectos]
 *     responses:
 *       200:
 *         description: Lista de proyectos obtenida con éxito
 */
router.get('/', getProyectos);

/**
 * @swagger
 * /api/proyectos/{nombre}:
 *   get:
 *     summary: Obtiene el detalle de movimientos de un proyecto por su nombre
 *     tags: [Proyectos]
 *     parameters:
 *       - in: path
 *         name: nombre
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre o código del proyecto (ej. "GENERAL" o "0.3 Lican")
 *     responses:
 *       200:
 *         description: Detalle de movimientos del proyecto obtenido con éxito
 *       500:
 *         description: Error en el servidor
 */
router.get('/:nombre', getDetalleProyecto);

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