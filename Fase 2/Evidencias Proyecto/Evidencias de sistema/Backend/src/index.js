const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');
const { swaggerDocs } = require('./swagger/swagger'); 

// 1. Importar rutas
const proyectoRoutes = require('./routes/proyectoRoutes');
const movimientoRoutes = require('./routes/movimientoRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const proyeccionRoutes = require('./routes/proyeccionRoutes');
const cargaRoutes = require('./routes/cargaRoutes');
const authRoutes = require('./routes/authRoutes'); 

const app = express();
const PORT = process.env.PORT || 3000;

// 2. Middlewares (Con límite extendido a 50mb para soportar Carga Masiva Excel)
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 3. Usar rutas
app.use('/api/auth', authRoutes); 
app.use('/api/movimientos', movimientoRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/proyecciones', proyeccionRoutes);
app.use('/api/cargas', cargaRoutes);
app.use('/api/proyectos', proyectoRoutes);

// 4. Ruta principal
/**
 * @swagger
 * /:
 *   get:
 *     summary: Estado de la API y verificación de base de datos
 *     responses:
 *       200:
 *         description: Conexión exitosa a la base de datos.
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

// 5. Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
  swaggerDocs(app); 
});