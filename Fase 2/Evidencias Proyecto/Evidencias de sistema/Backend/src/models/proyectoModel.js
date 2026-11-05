const pool = require('../config/db');

// Obtener todos los proyectos con agregados financieros
const obtenerProyectos = async () => {
  const query = `
    SELECT 
      proyecto,
      COUNT(*) AS total_movimientos,
      SUM(CASE WHEN condicion = 'GASTO' THEN total ELSE 0 END) AS total_gastos,
      SUM(CASE WHEN condicion = 'COSTO' THEN total ELSE 0 END) AS total_costos,
      SUM(CASE WHEN condicion::text LIKE 'INGRESO%' THEN total ELSE 0 END) AS total_ingresos,
      (SUM(CASE WHEN condicion::text LIKE 'INGRESO%' THEN total ELSE 0 END) - 
       SUM(CASE WHEN condicion IN ('GASTO', 'COSTO') THEN total ELSE 0 END)) AS margen_neto
    FROM registro_movimientos
    GROUP BY proyecto
    ORDER BY proyecto ASC;
  `;
  const res = await pool.query(query);
  return res.rows;
};

// Obtener detalle de movimientos de un proyecto específico
const obtenerDetalleProyecto = async (nombreProyecto) => {
  const query = `
    SELECT * FROM registro_movimientos 
    WHERE proyecto = $1 
    ORDER BY fecha DESC;
  `;
  const res = await pool.query(query, [nombreProyecto]);
  return res.rows;
};

module.exports = {
  obtenerProyectos,
  obtenerDetalleProyecto
};