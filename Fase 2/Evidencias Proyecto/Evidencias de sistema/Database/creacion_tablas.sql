-- ==============================================================================
-- 1. CREACIÓN DE TIPOS ENUMERADOS (OPCIONES DE DESPLEGABLES)
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
	'B Estado'

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
	'N/'
);

CREATE TYPE enum_rol_usuario AS ENUM (
    'ADMINISTRADOR', 
    'LECTOR'
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
    password_hash VARCHAR(255) NOT NULL,
    rol enum_rol_usuario NOT NULL DEFAULT 'LECTOR',
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE proyectos (
    id_proyecto SERIAL PRIMARY KEY,
    nombre_proyecto VARCHAR(150) UNIQUE NOT NULL, -- Nombre del proyecto como en Excel (ej: "0.3 Licanten 3299-23-L126")
    estado enum_estado_proyecto DEFAULT 'ACTIVO',
    presupuesto_total NUMERIC(15,2) DEFAULT 0.00,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE historial_cargas (
    id_carga SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    nombre_archivo VARCHAR(255) NOT NULL,
    registros_procesados INTEGER DEFAULT 0,
    fecha_carga TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ==============================================================================
-- 3. TABLA PRINCIPAL: registro_movimientos (100% fiel a las 19 columnas de Excel)
-- ==============================================================================

CREATE TABLE registro_movimientos (
    id_movimiento BIGSERIAL PRIMARY KEY,
    id_carga INTEGER REFERENCES historial_cargas(id_carga) ON DELETE SET NULL,
    
    -- Columnas 1 a 19 de la planilla Excel:
    documento enum_tipo_documento NOT NULL,                             -- 1. Documento
    estado_conciliacion enum_estado_conciliacion DEFAULT 'PENDIENTE',   -- 2. Estado de conciliación
    nro_documento VARCHAR(50),                                          -- 3. n° de documento
    razon_social VARCHAR(200) NOT NULL,                                 -- 4. Razón social
    fecha DATE NOT NULL,                                                -- 5. Fecha
    banco enum_banco,                                                   -- 6. Banco
    tipo_pago enum_tipo_pago,                                           -- 7. Tipo de pago
    neto_liquido NUMERIC(15,2) DEFAULT 0.00,                            -- 8. Neto / liquido
    iva NUMERIC(15,2) DEFAULT 0.00,                                     -- 9. IVA
    imposiciones_retenciones NUMERIC(15,2) DEFAULT 0.00,                -- 10. Imposiciones/retenciones
    total NUMERIC(15,2) NOT NULL,                                       -- 11. Total
    proyecto VARCHAR(150) NOT NULL,                                     -- 12. Proyecto (ej: GENERAL, 0.3 Licanten...)
    condicion enum_condicion NOT NULL,                                  -- 13. Condición
    tipo_flujo enum_tipo_flujo NOT NULL,                                -- 14. Tipo de flujo
    descripcion TEXT,                                                   -- 15. Descripción
    documento_1 VARCHAR(255),                                           -- 16. Documento 1
    documento_2 VARCHAR(255),                                           -- 17. Documento 2
    documento_3 VARCHAR(255),                                           -- 18. Documento 3
    documento_4 VARCHAR(255),                                           -- 19. Documento 4
    
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
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    nombre_escenario VARCHAR(100) NOT NULL,
    monto_estimado NUMERIC(15,2) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    fecha_proyectada DATE NOT NULL,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ==============================================================================
-- 5. ÍNDICES DE RENDIMIENTO (Respuesta en < 3 segundos)
-- ==============================================================================

CREATE INDEX idx_reg_fecha ON registro_movimientos(fecha);
CREATE INDEX idx_reg_condicion ON registro_movimientos(condicion);
CREATE INDEX idx_reg_proyecto ON registro_movimientos(proyecto);
CREATE INDEX idx_reg_estado ON registro_movimientos(estado_conciliacion);