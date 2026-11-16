const { autenticarYProvisionarUsuario } = require('../services/bluehostingAuthService');

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ mensaje: 'Debe ingresar correo electrónico y contraseña.' });
  }

  try {
    const usuario = await autenticarYProvisionarUsuario(email, password);

    if (!usuario) {
      return res.status(401).json({
        mensaje: 'Credenciales inválidas o correo no registrado en zoron.cl / teamzoron.cl.'
      });
    }

    // Excluir el campo password antes de responder al Frontend
    const { password: _, ...usuarioSeguro } = usuario;

    return res.status(200).json({
      mensaje: 'Inicio de sesión exitoso',
      usuario: usuarioSeguro
    });
  } catch (error) {
    if (error.message === 'CUENTA_DESACTIVADA') {
      return res.status(403).json({
        mensaje: 'Su cuenta se encuentra desactivada. Contacte a un administrador de ZORON.'
      });
    }

    console.error('Error en login:', error);
    return res.status(500).json({
      mensaje: 'Error interno al conectar con el servidor de correo o base de datos.'
    });
  }
};

module.exports = { login };