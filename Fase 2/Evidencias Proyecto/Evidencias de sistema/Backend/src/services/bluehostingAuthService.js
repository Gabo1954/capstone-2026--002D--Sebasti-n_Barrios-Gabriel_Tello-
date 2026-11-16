const { ImapFlow } = require('imapflow');
const pool = require('../config/db');

/**
 * Valida las credenciales contra mail.zoron.cl o mail.teamzoron.cl (IMAP SSL)
 */
const validarCredencialesCorreo = async (email, password) => {
  const emailLimpio = email.trim().toLowerCase();
  const dominio = emailLimpio.split('@')[1];

  if (dominio !== 'zoron.cl' && dominio !== 'teamzoron.cl') {
    return false;
  }

  const client = new ImapFlow({
    host: `mail.${dominio}`,
    port: 993,
    secure: true,
    tls: {
      rejectUnauthorized: false // Evita fallos si el certificado SSL apunta al hostname del servidor Bluehosting
    },
    auth: {
      user: emailLimpio,
      pass: password
    },
    logger: false
  });

  try {
    await client.connect();
    await client.logout();
    return true;
  } catch (err) {
    console.error(`[IMAP Error - ${emailLimpio}]:`, err.message);
    return false;
  }
};

/**
 * Busca o auto-provisiona al usuario en PostgreSQL tras validar su correo en Bluehosting
 * Alineado con la tabla `usuarios` del script SQL (id_usuario, nombre, email, password, rol, dominio_origen, acepta_privacidad, activo, ultimo_acceso)
 */
const autenticarYProvisionarUsuario = async (email, password) => {
  const emailLimpio = email.trim().toLowerCase();
  const dominio = emailLimpio.split('@')[1];

  // 1. Verificar si pertenece a los dominios corporativos (@zoron.cl o @teamzoron.cl)
  if (dominio === 'zoron.cl' || dominio === 'teamzoron.cl') {
    const esCorreoValido = await validarCredencialesCorreo(emailLimpio, password);
    if (!esCorreoValido) {
      return null; // Correo inexistente en Bluehosting o contraseña incorrecta
    }

    // @zoron.cl -> administrador | @teamzoron.cl -> usuario
    const rolAsignado = dominio === 'zoron.cl' ? 'administrador' : 'usuario';

    // 2. Buscar si ya existe en PostgreSQL
    const existe = await pool.query(
      'SELECT * FROM usuarios WHERE LOWER(email) = $1',
      [emailLimpio]
    );

    if (existe.rows.length > 0) {
      const usuarioActual = existe.rows[0];

      // Bloquear acceso si un administrador desactivó la cuenta en BD
      if (usuarioActual.activo === false) {
        throw new Error('CUENTA_DESACTIVADA');
      }

      // Actualizar rol (si cambió de dominio), dominio_origen y último acceso
      const actualizado = await pool.query(
        `UPDATE usuarios 
         SET rol = $1, 
             dominio_origen = $2, 
             acepta_privacidad = TRUE,
             ultimo_acceso = CURRENT_TIMESTAMP 
         WHERE id_usuario = $3 
         RETURNING *`,
        [rolAsignado, dominio, usuarioActual.id_usuario]
      );

      return actualizado.rows[0];
    }

    // 3. Si es nuevo (existía en cPanel o se acaba de crear), insertarlo automáticamente
    const nombreFormateado = emailLimpio
      .split('@')[0]
      .replace(/[._-]/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());

    const nuevoUsuario = await pool.query(
      `INSERT INTO usuarios (nombre, email, password, rol, dominio_origen, acepta_privacidad, activo, ultimo_acceso) 
       VALUES ($1, $2, $3, $4, $5, TRUE, TRUE, CURRENT_TIMESTAMP) 
       RETURNING *`,
      [nombreFormateado, emailLimpio, 'AUTH_IMAP_BLUEHOSTING', rolAsignado, dominio]
    );

    return nuevoUsuario.rows[0];
  }

  // Fallback para usuarios locales de prueba (si los tienes en PostgreSQL)
  const local = await pool.query(
    'SELECT * FROM usuarios WHERE LOWER(email) = $1 AND password = $2 AND activo = TRUE',
    [emailLimpio, password]
  );

  if (local.rows.length > 0) {
    const actualizadoLocal = await pool.query(
      'UPDATE usuarios SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id_usuario = $1 RETURNING *',
      [local.rows[0].id_usuario]
    );
    return actualizadoLocal.rows[0];
  }

  return null;
};

module.exports = {
  validarCredencialesCorreo,
  autenticarYProvisionarUsuario
};