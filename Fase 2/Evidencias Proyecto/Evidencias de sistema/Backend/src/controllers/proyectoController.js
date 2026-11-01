const Proyecto = require('../models/proyectoModel');

const getProyectos = async (req, res) => {
    try {
        const proyectos = await Proyecto.obtenerProyectos();
        res.status(200).json(proyectos);
    } catch (error) {
        console.error('Error al obtener proyectos:', error);
        res.status(500).json({ error: 'Error interno del servidor al obtener proyectos' });
    }
};

const createProyecto = async (req, res) => {
    try {
        // Validación básica
        if (!req.body.nombre_proyecto) {
            return res.status(400).json({ error: 'El nombre del proyecto es obligatorio' });
        }
        
        const nuevoProyecto = await Proyecto.crearProyecto(req.body);
        res.status(201).json(nuevoProyecto);
    } catch (error) {
        console.error('Error al crear proyecto:', error);
        if (error.code === '23505') {
            return res.status(409).json({ error: 'Ya existe un proyecto con ese nombre' });
        }
        res.status(500).json({ error: 'Error al crear el proyecto' });
    }
};

module.exports = { getProyectos, createProyecto };