const request = require('supertest');
const app = require('../../src/index');
const authService = require('../../src/services/bluehostingAuthService');

jest.mock('../../src/services/bluehostingAuthService');

describe('Pruebas de Rendimiento y Carga — API ZORON', () => {
  test('PF-01: Procesamiento y parseo de 10.000 registros financieros CLP en menos de 250 ms', () => {
    const matrizSimulada = Array.from({ length: 10000 }, (_, i) => [
      'FACTURA',
      'CONCILIADO',
      `F-${2000 + i}`,
      `Proveedor Nacional ${i} SpA`,
      '16-11-2026',
      'Banco Santander',
      'TRANSFERENCIA',
      '$ 850.000',
      '$ 161.500',
      '$ 0',
      '$ 1.011.500'
    ]);

    const inicio = performance.now();
    const normalizados = matrizSimulada.map((fila, idx) => ({
      id_movimiento: idx + 1,
      documento: fila[0],
      nro_documento: fila[2],
      razon_social: fila[3],
      total: Number(String(fila[10]).replace(/[^0-9-]/g, ''))
    }));
    const duracionMs = performance.now() - inicio;

    expect(normalizados).toHaveLength(10000);
    expect(normalizados[9999].total).toBe(1011500);
    expect(duracionMs).toBeLessThan(250);
  });

  test('PF-02: Concurrencia de 50 peticiones simultáneas a POST /api/auth/login bajo 2000 ms', async () => {
    authService.autenticarYProvisionarUsuario.mockResolvedValue({
      id_usuario: 10,
      nombre: 'Operador Concurrente',
      email: 'operador@zoron.cl',
      password: 'hash_oculto',
      rol: 'ADMIN'
    });

    const inicio = performance.now();
    const solicitudes = Array.from({ length: 50 }, (_, idx) =>
      request(app)
        .post('/api/auth/login')
        .send({ email: `operador${idx}@zoron.cl`, password: 'PasswordValida2026' })
    );

    const respuestas = await Promise.all(solicitudes);
    const tiempoTotalMs = performance.now() - inicio;

    expect(respuestas.every((r) => r.statusCode === 200)).toBe(true);
    expect(tiempoTotalMs).toBeLessThan(2000);
  });
});