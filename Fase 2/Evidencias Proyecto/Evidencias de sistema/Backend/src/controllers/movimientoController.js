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
        
        if (!documento || !razon_social || !fecha || total === undefined || !proyecto || !condicion || !tipo_flujo) {
            return res.status(400).json({ error: 'Faltan campos obligatorios para registrar el movimiento' });
        }

        const nuevoMovimiento = await Movimiento.crearMovimiento(req.body);
        res.status(201).json(nuevoMovimiento);
    } catch (error) {
        console.error('Error al crear movimiento:', error);
        res.status(500).json({ error: 'Error al registrar el movimiento' });
    }
};

// NUEVO CONTROLADOR: Actualizar
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

// NUEVO CONTROLADOR: Eliminar
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

module.exports = { getMovimientos, createMovimiento, updateMovimiento, deleteMovimiento };