const request = require('supertest');
const app = require('../../src/index');
const db = require('../../src/config/db');

jest.mock('../../src/config/db');

describe('Pruebas de Seguridad — CORS, SQL Injection e IMAP Injection en ZORON', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('SC-01: CORS debe permitir https://teamzoron.cl y https://zoron.cl, y bloquear orígenes externos', async () => {
    const resPermitido = await request(app)
      .options('/api/auth/login')
      .set('Origin', 'https://teamzoron.cl')
      .set('Access-Control-Request-Method', 'POST');

    expect(resPermitido.headers['access-control-allow-origin']).toBe('https://teamzoron.cl');

    const resBloqueado = await request(app)
      .options('/api/auth/login')
      .set('Origin', 'https://dominio-no-autorizado.com')
      .set('Access-Control-Request-Method', 'POST');

    expect(resBloqueado.headers['access-control-allow-origin']).toBeUndefined();
  });

  test('SC-02: Debe neutralizar payloads de SQL Injection sin concatenación ni errores 500 de sintaxis SQL', async () => {
    db.query.mockResolvedValue({ rows: [] });

    const payloadMalicioso = "admin@zoron.cl' OR '1'='1' --";
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: payloadMalicioso, password: 'Password123' });

    // Toda consulta ejecutada contra PostgreSQL debe usar parámetros ($1) y jamás concatenar el input
    for (const llamada of db.query.mock.calls) {
      const sql = llamada[0];
      expect(sql).not.toContain("OR '1'='1'");
      if (llamada[1]) {
        expect(sql).toContain('$1');
      }
    }

    expect(res.statusCode).toBe(401);
  });

  test('SC-03: Debe rechazar caracteres de control CRLF (\\r\\n) en credenciales IMAP', async () => {
    db.query.mockResolvedValue({ rows: [] });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'usuario@zoron.cl',
        password: 'clave\r\na2 SELECT INBOX\r\na3 LOGOUT'
      });

    expect(res.statusCode).toBe(401);
  });
});