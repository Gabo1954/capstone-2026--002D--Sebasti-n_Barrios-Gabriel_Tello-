const express = require('express');
const router = express.Router();
const { 
  getMovimientos, 
  createMovimiento, 
  createCargaMasiva, 
  updateMovimiento, 
  deleteMovimiento 
} = require('../controllers/movimientoController');

/**
 * @swagger
 * /api/movimientos:
 *   get:
 *     summary: Obtiene todos los movimientos financieros
 *     tags: [Movimientos]
 *     responses:
 *       200:
 *         description: Lista de movimientos obtenida con éxito
 */
router.get('/', getMovimientos);

/**
 * @swagger
 * /api/movimientos:
 *   post:
 *     summary: Registra un nuevo movimiento financiero manualmente
 *     tags: [Movimientos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [documento, razon_social, fecha, total, proyecto, condicion, tipo_flujo]
 *             properties:
 *               documento: { type: string, example: "FACTURA" }
 *               razon_social: { type: string, example: "PROVEEDOR INDUSTRIAL SPA" }
 *               fecha: { type: string, format: date, example: "2026-11-01" }
 *               total: { type: number, example: 119000 }
 *               proyecto: { type: string, example: "0.3 Licanten 3299-23-L126" }
 *               condicion: { type: string, example: "GASTO" }
 *               tipo_flujo: { type: string, example: "FIJO" }
 *     responses:
 *       201:
 *         description: Movimiento registrado con éxito
 */
router.post('/', createMovimiento);

/**
 * @swagger
 * /api/movimientos/carga-masiva:
 *   post:
 *     summary: Importa un lote de movimientos financieros desde una planilla Excel
 *     tags: [Movimientos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               movimientos:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Carga masiva completada con éxito
 *       400:
 *         description: Formato de datos no válido
 *       500:
 *         description: Error interno al registrar en la base de datos
 */
router.post('/carga-masiva', createCargaMasiva);

/**
 * @swagger
 * /api/movimientos/{id}:
 *   put:
 *     summary: Actualiza el estado de conciliación o descripción de un movimiento
 *     tags: [Movimientos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del movimiento a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estado_conciliacion: { type: string, example: "CONCILIADO" }
 *               descripcion: { type: string, example: "Aprobado por finanzas" }
 *     responses:
 *       200:
 *         description: Movimiento actualizado con éxito
 *       404:
 *         description: Movimiento no encontrado
 */
router.put('/:id', updateMovimiento);

/**
 * @swagger
 * /api/movimientos/{id}:
 *   delete:
 *     summary: Elimina un movimiento financiero
 *     tags: [Movimientos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del movimiento a eliminar
 *     responses:
 *       200:
 *         description: Movimiento eliminado con éxito
 *       404:
 *         description: Movimiento no encontrado
 */
router.delete('/:id', deleteMovimiento);

module.exports = router;