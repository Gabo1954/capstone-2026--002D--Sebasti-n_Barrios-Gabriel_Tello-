const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const { swaggerDocs } = require('./swagger/swagger');

// 1. Importar rutas
const proyectoRoutes = require('./routes/proyectoRoutes');
const movimientoRoutes = require('./routes/movimientoRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const proyeccionRoutes = require('./routes/proyeccionRoutes');
const cargaRoutes = require('./routes/cargaRoutes');
const authRoutes = require('./routes/authRoutes');
const excelRoutes = require('./routes/excelRoutes');

const app = express();
const router = express.Router();
const PORT = process.env.PORT || 3000;

// 2. Middlewares (Soporte CORS para zoron.cl, teamzoron.cl y desarrollo local + límite 50mb para Carga Masiva Excel)
app.use(cors({
  origin: [
    'https://teamzoron.cl',
    'https://www.teamzoron.cl',
    'https://zoron.cl',
    'https://www.zoron.cl',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 3. Usar rutas en el router
router.use('/api/auth', authRoutes);
router.use('/api/movimientos', movimientoRoutes);
router.use('/api/usuarios', usuarioRoutes);
router.use('/api/proyecciones', proyeccionRoutes);
router.use('/api/cargas', cargaRoutes);
router.use('/api/proyectos', proyectoRoutes);
router.use('/api/excel', excelRoutes);

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
router.get('/', async (req, res) => {
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

// Montar tanto en '/v1' (Passenger cPanel) como en '/' (desarrollo local y pruebas)
app.use('/v1', router);
app.use('/', router);

// 5. Iniciar servidor solo si se ejecuta directamente (permite importar app en Jest/Supertest sin abrir puerto)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
    console.log(`Ruta de Google Sheets disponible en: http://localhost:${PORT}/api/excel/datos`);
    swaggerDocs(app);

    // Ejecutar sincronización de correos cPanel solo si el módulo existe en el entorno
    try {
      const { sincronizarCorreosExistentesCpanel } = require('./services/bluehostingAuthService');
      if (typeof sincronizarCorreosExistentesCpanel === 'function') {
        sincronizarCorreosExistentesCpanel();
        setInterval(sincronizarCorreosExistentesCpanel, 2 * 60 * 1000);
      }
    } catch (_) {
      // En entorno local sin cPanel se omite silenciosamente
    }
  });
}

module.exports = app;