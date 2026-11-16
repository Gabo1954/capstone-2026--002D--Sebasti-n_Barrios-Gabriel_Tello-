const request = require('supertest');
const app = require('../../src/index');
const db = require('../../src/config/db');
const authService = require('../../src/services/bluehostingAuthService');

jest.mock('../../src/config/db');
jest.mock('../../src/services/bluehostingAuthService');

describe('Pruebas de Integración — Endpoints Reales API ZORON', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('IT-01: GET / debe verificar salud de la API y conexión activa con PostgreSQL', async () => {
    db.query.mockResolvedValueOnce({
      rows: [{ now: '2026-11-16T19:00:00.000Z' }]
    });

    const res = await request(app).get('/');

    expect(res.statusCode).toBe(200);
    expect(res.body.estado).toBe('API Activa');
    expect(res.body.mensaje).toBe('Conexión a PostgreSQL exitosa');
    expect(res.body.fecha_servidor_bd).toBeDefined();
  });

  test('IT-02: GET / debe retornar HTTP 500 controlado si PostgreSQL no responde', async () => {
    db.query.mockRejectedValueOnce(new Error('Connection terminated unexpectedly'));

    const res = await request(app).get('/');

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Error al conectar con la base de datos');
  });

  test('IT-03: POST /api/auth/login debe autenticar usuario corporativo y omitir password en la respuesta', async () => {
    authService.autenticarYProvisionarUsuario.mockResolvedValueOnce({
      id_usuario: 1,
      nombre: 'Gabriel Tello',
      email: 'gabriel@zoron.cl',
      password: 'salt:hash_privado_no_exponer',
      rol: 'ADMIN',
      estado: 'ACTIVO'
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'gabriel@zoron.cl', password: 'PasswordSegura2026' });

    expect(res.statusCode).toBe(200);
    expect(res.body.mensaje).toBe('Inicio de sesión exitoso');
    expect(res.body.usuario.email).toBe('gabriel@zoron.cl');
    expect(res.body.usuario.password).toBeUndefined();
  });

  test('IT-04: POST /v1/api/auth/login debe responder igual en el prefijo de producción (/v1)', async () => {
    authService.autenticarYProvisionarUsuario.mockRejectedValueOnce(new Error('CUENTA_DESACTIVADA'));

    const res = await request(app)
      .post('/v1/api/auth/login')
      .send({ email: 'inactivo@teamzoron.cl', password: 'PasswordSegura2026' });

    expect(res.statusCode).toBe(403);
    expect(res.body.mensaje).toMatch(/desactivada/i);
  });

  test('IT-05: POST /api/auth/login debe rechazar peticiones sin credenciales con HTTP 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'gabriel@zoron.cl' });

    expect(res.statusCode).toBe(400);
    expect(authService.autenticarYProvisionarUsuario).not.toHaveBeenCalled();
  });
});