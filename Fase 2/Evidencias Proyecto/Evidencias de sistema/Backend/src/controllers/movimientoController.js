const Movimiento = require('../models/movimientoModel');

const getMovimientos = async (req, res) => {
    try {
        const movimientos = await Movimiento.obtenerMovimientos();
        res.status(200).json(movimientos);
    } catch (error) {
        console.error('Error al obtener movimientos:', error);
        res.status(500).json({ error: 'Error interno al obtener los movimientos' });
    }
};

const createMovimiento = async (req, res) => {
    try {
        const { documento, razon_social, fecha, total, proyecto, condicion, tipo_flujo } = req.body;
        
        if (!razon_social || total === undefined) {
            return res.status(400).json({ error: 'Razón social y total son campos obligatorios.' });
        }

        const movimientoSanitizado = {
            ...req.body,
            documento: documento || 'FACTURA',
            fecha: fecha || new Date().toISOString().split('T')[0],
            proyecto: proyecto || 'GENERAL',
            condicion: condicion || 'GASTO',
            tipo_flujo: tipo_flujo || 'VARIABLE'
        };

        const nuevoMovimiento = await Movimiento.crearMovimiento(movimientoSanitizado);
        res.status(201).json(nuevoMovimiento);
    } catch (error) {
        console.error('Error al crear movimiento individual:', error);
        res.status(500).json({ 
            error: 'Error al registrar el movimiento en PostgreSQL', 
            detalle: error.message 
        });
    }
};

const createCargaMasiva = async (req, res) => {
    try {
        const { movimientos } = req.body;

        if (!movimientos || !Array.isArray(movimientos) || movimientos.length === 0) {
            return res.status(400).json({ error: 'Se requiere un arreglo "movimientos" válido.' });
        }

        const insertados = await Movimiento.crearMovimientosMasivos(movimientos);

        res.status(201).json({
            mensaje: 'Carga masiva completada con éxito',
            insertados: insertados.length
        });
    } catch (error) {
        console.error('Error en carga masiva:', error);
        res.status(500).json({ 
            error: 'Error al registrar la carga masiva en PostgreSQL', 
            detalle: error.message 
        });
    }
};

const updateMovimiento = async (req, res) => {
    try {
        const { id } = req.params;
        const movimientoActualizado = await Movimiento.actualizarMovimiento(id, req.body);
        
        if (!movimientoActualizado) {
            return res.status(404).json({ error: 'Movimiento no encontrado' });
        }
        res.status(200).json(movimientoActualizado);
    } catch (error) {
        console.error('Error al actualizar movimiento:', error);
        res.status(500).json({ error: 'Error al actualizar el registro' });
    }
};

const deleteMovimiento = async (req, res) => {
    try {
        const { id } = req.params;
        const movimientoEliminado = await Movimiento.eliminarMovimiento(id);
        
        if (!movimientoEliminado) {
            return res.status(404).json({ error: 'Movimiento no encontrado para eliminar' });
        }
        res.status(200).json({ mensaje: 'Movimiento eliminado con éxito', registro: movimientoEliminado });
    } catch (error) {
        console.error('Error al eliminar movimiento:', error);
        res.status(500).json({ error: 'Error al eliminar el registro' });
    }
};

module.exports = { 
    getMovimientos, 
    createMovimiento, 
    createCargaMasiva, 
    updateMovimiento, 
    deleteMovimiento 
};