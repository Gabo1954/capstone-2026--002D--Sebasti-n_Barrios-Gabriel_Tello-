const Proyeccion = require('../models/proyeccionModel');

const getProyecciones = async (req, res) => {
    try {
        const proyecciones = await Proyeccion.obtenerProyecciones();
        res.status(200).json(proyecciones);
    } catch (error) {
        console.error('Error al obtener proyecciones:', error);
        res.status(500).json({ error: 'Error interno al obtener las proyecciones' });
    }
};

const createProyeccion = async (req, res) => {
    try {
        const { id_usuario, nombre_escenario, monto_estimado, categoria, fecha_proyectada } = req.body;
        
        if (!id_usuario || !nombre_escenario || monto_estimado === undefined || !categoria || !fecha_proyectada) {
            return res.status(400).json({ error: 'Faltan campos obligatorios para registrar la proyección' });
        }

        const nuevaProyeccion = await Proyeccion.crearProyeccion(req.body);
        res.status(201).json(nuevaProyeccion);
    } catch (error) {
        console.error('Error al crear proyección:', error);
        if (error.code === '23503') {
            return res.status(404).json({ error: 'El id_usuario proporcionado no existe' });
        }
        res.status(500).json({ error: 'Error al registrar la proyección' });
    }
};

module.exports = { getProyecciones, createProyeccion };