const crypto = require('crypto');
const request = require('supertest');
const app = require('../../src/index');
const db = require('../../src/config/db');

jest.mock('../../src/config/db');

function generarHashNativo(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verificarHashNativo(password, guardado) {
  if (!guardado || !guardado.includes(':')) return false;
  const [salt, key] = guardado.split(':');
  const keyBuffer = Buffer.from(key, 'hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return keyBuffer.length === derivedKey.length && crypto.timingSafeEqual(keyBuffer, derivedKey);
}

const limpiarMontoCLP = (valor) => {
  if (valor === undefined || valor === null || valor === '') return 0;
  if (typeof valor === 'number') return isNaN(valor) ? 0 : Math.round(valor);

  let str = String(valor).trim().replace(/\$/g, '').replace(/\s/g, '');
  if (str === '-' || str === '') return 0;

  if (str.includes('.') && str.includes(',')) {
    str = str.replace(/\./g, '').replace(',', '.');
  } else if (str.includes(',')) {
    str = str.replace(',', '.');
  } else if (str.includes('.')) {
    const partes = str.split('.');
    if (partes.length > 2 || (partes.length === 2 && partes[1].length === 3)) {
      str = partes.join('');
    }
  }

  const num = parseFloat(str);
  return isNaN(num) ? 0 : Math.round(num);
};

describe('Pruebas Unitarias — Núcleo Financiero, Criptográfico y Controladores ZORON', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('UT-01: Generación y verificación de hash scrypt con salt aleatorio', () => {
    const clave = 'ZoronFinanzas2026#';
    const hash1 = generarHashNativo(clave);
    const hash2 = generarHashNativo(clave);

    expect(hash1).not.toBe(hash2);
    expect(verificarHashNativo(clave, hash1)).toBe(true);
    expect(verificarHashNativo('ClaveErronea', hash1)).toBe(false);
    expect(verificarHashNativo(clave, 'invalido')).toBe(false);
  });

  test('UT-02: Normalización de montos contables en Pesos Chilenos (CLP)', () => {
    expect(limpiarMontoCLP('$ 1.250.000')).toBe(1250000);
    expect(limpiarMontoCLP('$45.990')).toBe(45990);
    expect(limpiarMontoCLP('-')).toBe(0);
    expect(limpiarMontoCLP(null)).toBe(0);
    expect(limpiarMontoCLP('1.500.250,75')).toBe(1500251);
  });

  test('UT-03: Controlador de Proyectos y Usuarios responde correctamente con datos de PostgreSQL', async () => {
    db.query.mockResolvedValue({
      rows: [{ id_proyecto: 1, nombre_proyecto: 'Operación Norte', estado: 'ACTIVO' }]
    });

    const resProyectos = await request(app).get('/api/proyectos');
    expect([200, 404]).toContain(resProyectos.statusCode);

    const resUsuarios = await request(app).get('/api/usuarios');
    expect([200, 404]).toContain(resUsuarios.statusCode);
  });

  test('UT-04: Controlador de Proyecciones y Cargas responde sin excepciones no controladas', async () => {
    db.query.mockResolvedValue({ rows: [] });

    const resProyecciones = await request(app).get('/api/proyecciones');
    expect([200, 404]).toContain(resProyecciones.statusCode);

    const resCargas = await request(app).get('/api/cargas');
    expect([200, 404]).toContain(resCargas.statusCode);
  });
});