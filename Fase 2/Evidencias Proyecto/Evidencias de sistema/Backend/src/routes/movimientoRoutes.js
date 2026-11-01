const express = require('express');
const router = express.Router();
const { getMovimientos, createMovimiento } = require('../controllers/movimientoController');

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
 *             required:
 *               - documento
 *               - razon_social
 *               - fecha
 *               - total
 *               - proyecto
 *               - condicion
 *               - tipo_flujo
 *             properties:
 *               documento:
 *                 type: string
 *                 example: "FACTURA"
 *               estado_conciliacion:
 *                 type: string
 *                 example: "PENDIENTE"
 *               nro_documento:
 *                 type: string
 *                 example: "778899"
 *               razon_social:
 *                 type: string
 *                 example: "PROVEEDOR INDUSTRIAL SPA"
 *               fecha:
 *                 type: string
 *                 format: date
 *                 example: "2026-11-01"
 *               banco:
 *                 type: string
 *                 example: "BCI"
 *               tipo_pago:
 *                 type: string
 *                 example: "Efectivo"
 *               neto_liquido:
 *                 type: number
 *                 example: 100000
 *               iva:
 *                 type: number
 *                 example: 19000
 *               total:
 *                 type: number
 *                 example: 119000
 *               proyecto:
 *                 type: string
 *                 example: "0.3 Licanten 3299-23-L126"
 *               condicion:
 *                 type: string
 *                 example: "GASTO"
 *               tipo_flujo:
 *                 type: string
 *                 example: "FIJO"
 *               descripcion:
 *                 type: string
 *                 example: "Compra de insumos operacionales"
 *     responses:
 *       201:
 *         description: Movimiento registrado con éxito
 *       400:
 *         description: Faltan datos obligatorios
 */
router.post('/', createMovimiento);

module.exports = router;