const ProyectoModel = require('../models/proyectoModel');

// 1. Obtener todos los proyectos
const getProyectos = async (req, res) => {
  try {
    const proyectos = await ProyectoModel.obtenerProyectos();
    res.json(proyectos);
  } catch (error) {
    console.error('Error al obtener proyectos:', error.message);
    res.status(500).json({ error: 'Error al obtener proyectos' });
  }
};

// 2. Obtener detalle de un proyecto
const getDetalleProyecto = async (req, res) => {
  try {
    const { nombre } = req.params;
    const detalles = await ProyectoModel.obtenerDetalleProyecto(nombre);
    res.json(detalles);
  } catch (error) {
    console.error('Error al obtener detalle del proyecto:', error.message);
    res.status(500).json({ error: 'Error al obtener detalle del proyecto' });
  }
};

// 3. Crear proyecto manualmente 
const createProyecto = async (req, res) => {
  try {
    const { nombre_proyecto, estado, presupuesto_total } = req.body;

    if (!nombre_proyecto) {
      return res.status(400).json({ error: 'El nombre del proyecto es obligatorio.' });
    }

    

    res.status(201).json({ mensaje: 'Proyecto creado correctamente', datos: { nombre_proyecto, estado, presupuesto_total } });
  } catch (error) {
    console.error('Error al crear proyecto:', error.message);
    res.status(500).json({ error: 'Error al crear proyecto' });
  }
};

//  EXPORTACIÓN COMPLETA (Deben incluirse las 3 funciones)
module.exports = {
  getProyectos,
  getDetalleProyecto,
  createProyecto
};