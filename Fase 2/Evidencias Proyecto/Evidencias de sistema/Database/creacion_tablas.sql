-- ==============================================================================
-- 0. LIMPIEZA PREVIA (Permite re-ejecutar el script limpio desde cero)
-- ==============================================================================
DROP TRIGGER IF EXISTS trg_auto_proyecto_movimiento ON registro_movimientos CASCADE;
DROP FUNCTION IF EXISTS fn_sincronizar_proyecto_movimiento() CASCADE;

DROP TABLE IF EXISTS proyecciones CASCADE;
DROP TABLE IF EXISTS registro_movimientos CASCADE;
DROP TABLE IF EXISTS historial_cargas CASCADE;
DROP TABLE IF EXISTS proyectos CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

DROP TYPE IF EXISTS enum_tipo_documento CASCADE;
DROP TYPE IF EXISTS enum_estado_conciliacion CASCADE;
DROP TYPE IF EXISTS enum_banco CASCADE;
DROP TYPE IF EXISTS enum_tipo_pago CASCADE;
DROP TYPE IF EXISTS enum_condicion CASCADE;
DROP TYPE IF EXISTS enum_tipo_flujo CASCADE;
DROP TYPE IF EXISTS enum_rol_usuario CASCADE;
DROP TYPE IF EXISTS enum_estado_proyecto CASCADE;


-- ==============================================================================
-- 1. CREACIÓN DE TIPOS ENUMERADOS (ALINEADOS 100% CON FRONTEND Y EXCEL)
-- ==============================================================================

CREATE TYPE enum_tipo_documento AS ENUM (
    'FACTURA', 
    'BOLETA DE HONORARIOS', 
    'BOLETA', 
    'COMPROBANTE DE PAGO', 
    'COMPROBANTE DE TRANSFERENCIA', 
    'NOTA DE CREDITO'
);

CREATE TYPE enum_estado_conciliacion AS ENUM (
    'PENDIENTE', 
    'CONCILIADO', 
    'RECHAZADO'
);

CREATE TYPE enum_banco AS ENUM (
    'BCI', 
    'B Chile', 
    'B Falabella', 
    'B Falabella credito',
    'B Estado',
    'Efectivo'
);

CREATE TYPE enum_tipo_pago AS ENUM (
    'Debito', 
    'Credito', 
    'Efectivo'
);

CREATE TYPE enum_condicion AS ENUM (
    'GASTO', 
    'COSTO', 
    'INGRESO OPERACIONAL', 
    'INGRESO NO OPERACIONAL'
);

CREATE TYPE enum_tipo_flujo AS ENUM (
    'FIJO', 
    'VARIABLE',
    'N/A'
);

CREATE TYPE enum_rol_usuario AS ENUM (
    'administrador', 
    'usuario',
    'lector'
);

CREATE TYPE enum_estado_proyecto AS ENUM (
    'ACTIVO', 
    'ATRASADO', 
    'FINALIZADO'
);


-- ==============================================================================
-- 2. TABLAS DE SOPORTE (USUARIOS, PROYECTOS, HISTORIAL DE CARGAS)
-- ==============================================================================

CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL DEFAULT 'AUTH_IMAP_BLUEHOSTING',
    rol enum_rol_usuario NOT NULL DEFAULT 'usuario',
    dominio_origen VARCHAR(100) DEFAULT 'teamzoron.cl',
    acepta_privacidad BOOLEAN DEFAULT TRUE,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE proyectos (
    id_proyecto SERIAL PRIMARY KEY,
    nombre_proyecto VARCHAR(150) UNIQUE NOT NULL,
    estado enum_estado_proyecto DEFAULT 'ACTIVO',
    presupuesto_total NUMERIC(15,2) DEFAULT 0.00,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE historial_cargas (
    id_carga SERIAL PRIMARY KEY,
    id_usuario INTEGER REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    registros_procesados INTEGER DEFAULT 0,
    fecha_carga TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ==============================================================================
-- 3. TABLA PRINCIPAL: registro_movimientos (19 COLUMNAS + CONTROL WEB)
-- ==============================================================================

CREATE TABLE registro_movimientos (
    id_movimiento BIGSERIAL PRIMARY KEY,
    id_carga INTEGER REFERENCES historial_cargas(id_carga) ON DELETE SET NULL,
    
    -- Columnas 1 a 19 de la planilla maestra (Google Sheets / Excel):
    documento enum_tipo_documento NOT NULL DEFAULT 'FACTURA',
    estado_conciliacion enum_estado_conciliacion NOT NULL DEFAULT 'PENDIENTE',
    nro_documento VARCHAR(50) DEFAULT 'S/N',
    razon_social VARCHAR(200) NOT NULL DEFAULT 'SIN RAZON SOCIAL',
    fecha DATE NOT NULL,
    banco enum_banco DEFAULT 'BCI',
    tipo_pago enum_tipo_pago DEFAULT 'Debito',
    neto_liquido NUMERIC(15,2) DEFAULT 0.00,
    iva NUMERIC(15,2) DEFAULT 0.00,
    imposiciones_retenciones NUMERIC(15,2) DEFAULT 0.00,
    total NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    proyecto VARCHAR(150) NOT NULL DEFAULT 'GENERAL',
    condicion enum_condicion NOT NULL DEFAULT 'GASTO',
    tipo_flujo enum_tipo_flujo NOT NULL DEFAULT 'VARIABLE',
    descripcion TEXT DEFAULT '',
    documento_1 VARCHAR(255) DEFAULT '',
    documento_2 VARCHAR(255) DEFAULT '',
    documento_3 VARCHAR(255) DEFAULT '',
    documento_4 VARCHAR(255) DEFAULT '',
    
    -- Control interno del sistema web:
    id_proyecto INTEGER REFERENCES proyectos(id_proyecto) ON DELETE SET NULL,
    ingreso_manual BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ==============================================================================
-- 4. TABLA DE PROYECCIONES Y ESCENARIOS (Exclusiva Administradores)
-- ==============================================================================

CREATE TABLE proyecciones (
    id_proyeccion SERIAL PRIMARY KEY,
    id_usuario INTEGER REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    concepto VARCHAR(150) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('INGRESO', 'EGRESO')),
    monto NUMERIC(15,2) NOT NULL,
    mes_proyectado VARCHAR(7) NOT NULL, -- Formato YYYY-MM (ej: '2026-12')
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ==============================================================================
-- 5. AUTOMATIZACIÓN: AUTO-REGISTRO DE PROYECTOS DESDE MOVIMIENTOS
-- ==============================================================================

CREATE OR REPLACE FUNCTION fn_sincronizar_proyecto_movimiento()
RETURNS TRIGGER AS $$
DECLARE
    v_id_proyecto INTEGER;
    v_nombre_limpio VARCHAR(150);
BEGIN
    v_nombre_limpio := COALESCE(NULLIF(TRIM(NEW.proyecto), ''), 'GENERAL');
    NEW.proyecto := v_nombre_limpio;

    -- Insertar el proyecto si no existe aún en la tabla proyectos
    INSERT INTO proyectos (nombre_proyecto)
    VALUES (v_nombre_limpio)
    ON CONFLICT (nombre_proyecto) DO NOTHING;

    -- Obtener su ID y enlazar la llave foránea automáticamente
    SELECT id_proyecto INTO v_id_proyecto
    FROM proyectos
    WHERE nombre_proyecto = v_nombre_limpio;

    NEW.id_proyecto := v_id_proyecto;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Sintaxis EXECUTE PROCEDURE compatible con PostgreSQL 9.x / 10.x de cPanel
CREATE TRIGGER trg_auto_proyecto_movimiento
BEFORE INSERT OR UPDATE OF proyecto ON registro_movimientos
FOR EACH ROW
EXECUTE PROCEDURE fn_sincronizar_proyecto_movimiento();


-- ==============================================================================
-- 6. ÍNDICES DE RENDIMIENTO
-- ==============================================================================

CREATE INDEX idx_usuarios_email ON usuarios(LOWER(email));
CREATE INDEX idx_reg_fecha ON registro_movimientos(fecha);
CREATE INDEX idx_reg_condicion ON registro_movimientos(condicion);
CREATE INDEX idx_reg_proyecto ON registro_movimientos(proyecto);
CREATE INDEX idx_reg_estado ON registro_movimientos(estado_conciliacion);
CREATE INDEX idx_reg_banco ON registro_movimientos(banco);


-- ==============================================================================
-- 7. DATOS INICIALES BASE
-- ==============================================================================

INSERT INTO proyectos (nombre_proyecto, estado) 
VALUES ('GENERAL', 'ACTIVO') 
ON CONFLICT (nombre_proyecto) DO NOTHING;