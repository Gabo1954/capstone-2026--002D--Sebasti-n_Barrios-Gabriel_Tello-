const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');
const { swaggerDocs } = require('./swagger/swagger'); // Importar Swagger

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta principal de salud / prueba de la API
/**
 * @swagger
 * /:
 *   get:
 *     summary: Estado de la API y verificación de base de datos
 *     responses:
 *       200:
 *         description: Conexión exitosa a la base de datos.
 *       500:
 *         description: Error al conectar con la base de datos.
 */
app.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json({
      estado: 'API Activa',
      mensaje: 'Conexión a PostgreSQL exitosa',
      fecha_servidor_bd: result.rows[0].now
    });
  } catch (error) {
    console.error('Error probando la BD:', error);
    res.status(500).json({ error: 'Error al conectar con la base de datos' });
  }
});

// Iniciar servidor HTTP
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
  swaggerDocs(app); // Inicializar la documentación interactiva en /api-docs
});