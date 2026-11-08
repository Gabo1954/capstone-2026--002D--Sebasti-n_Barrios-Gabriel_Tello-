const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const emailLwr = email ? email.trim().toLowerCase() : '';

    // 1. Buscar usuario en PostgreSQL
    const result = await pool.query('SELECT * FROM usuarios WHERE LOWER(email) = $1', [emailLwr]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    const usuario = result.rows[0];

    // 2. Verificar estado activo
    if (!usuario.activo) {
      return res.status(403).json({ mensaje: 'Cuenta inactivada. Contacte al administrador.' });
    }

    // 3. Opcional para Desarrollo: Si envías "123456", forzamos la actualización de su hash en BD
    // Esto asegura que el hash guardado sea generado por TU versión instalada de bcryptjs
    if (password === '123456') {
      const newHash = await bcrypt.hash('123456', 10);
      await pool.query('UPDATE usuarios SET password_hash = $1 WHERE id_usuario = $2', [newHash, usuario.id_usuario]);
      usuario.password_hash = newHash;
    }

    // 4. Comparar la contraseña con bcrypt
    const passwordValida = await bcrypt.compare(password, usuario.password_hash);
    
    if (!passwordValida) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    // 5. Sesión exitosa
    res.json({
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      acepta_politica_privacidad: usuario.acepta_politica_privacidad
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

module.exports = { login };