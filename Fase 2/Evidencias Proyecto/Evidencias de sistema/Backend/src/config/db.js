const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 5000
});

pool.on('connect', () => {
  console.log('¡Conexión exitosa a la Base de Datos en Bluehosting! 🚀');
});

module.exports = pool;