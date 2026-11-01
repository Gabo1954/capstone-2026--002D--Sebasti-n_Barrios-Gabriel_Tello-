const Carga = require('../models/cargaModel');

const getCargas = async (req, res) => {
    try {
        const cargas = await Carga.obtenerCargas();
        res.status(200).json(cargas);
    } catch (error) {
        console.error('Error al obtener historial de cargas:', error);
        res.status(500).json({ error: 'Error interno al obtener el historial' });
    }
};

const createCarga = async (req, res) => {
    try {
        const { id_usuario, nombre_archivo } = req.body;
        
        if (!id_usuario || !nombre_archivo) {
            return res.status(400).json({ error: 'El ID de usuario y el nombre del archivo son obligatorios' });
        }

        const nuevaCarga = await Carga.crearCarga(req.body);
        res.status(201).json(nuevaCarga);
    } catch (error) {
        console.error('Error al registrar carga:', error);
        if (error.code === '23503') {
            return res.status(404).json({ error: 'El id_usuario proporcionado no existe' });
        }
        res.status(500).json({ error: 'Error al registrar el historial de carga' });
    }
};

module.exports = { getCargas, createCarga };