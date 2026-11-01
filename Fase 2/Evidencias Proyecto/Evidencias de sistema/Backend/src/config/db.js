const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: process.env.DB_HOST === 'localhost' ? false : { rejectUnauthorized: false },
  connectionTimeoutMillis: 5000
});

pool.on('connect', () => {
  const entorno = process.env.DB_HOST === 'localhost' ? 'Local' : 'Nube (Render)';
  console.log(`¡Conexión exitosa a la Base de Datos en entorno ${entorno}! 🚀`);
});

module.exports = pool;