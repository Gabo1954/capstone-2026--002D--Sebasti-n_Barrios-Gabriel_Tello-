Capstone 2026 – 002D

Repositorio GitHub de Proyecto ATP Capstone 2026

Integrantes: Sebastián Barrios y Gabriel Tello.

Zoron – Plataforma de Gestión Financiera

1. Descripción del proyecto

El proyecto consiste en el diseño y desarrollo de una plataforma interna para ZORON E.I.R.L., empresa dedicada a la consultoría en sostenibilidad y cambio climático. Su propósito es mejorar la gestión y organización de la información empresarial mediante herramientas tecnológicas que permitan sistematizar procesos internos, facilitar el registro y consulta de información y disponer de dashboards interactivos y simuladores para apoyar la toma de decisiones.

La solución está dirigida a los colaboradores y administración de la empresa, incorporando funcionalidades de acceso restringido, módulo de registro de movimientos financieros, vista de proyectos con drill-down, carga masiva de planillas Excel, visualización de indicadores contables en tiempo real y un módulo de simulación de proyecciones en memoria.

2. Tecnologías utilizadas

Las tecnologías seleccionadas e implementadas para el desarrollo de la plataforma se organizan de la siguiente manera:

Frontend

React (Vite): Desarrollo de la interfaz de usuario, gestión del estado reactivo y dashboards interactivos.

React Router DOM: Enrutamiento cliente-side para la navegación entre páginas (Movimientos, Proyectos, Proyecciones, Carga Masiva, Dashboard).

Chart.js y react-chartjs-2: Renderizado de gráficos interactivos (Gráficos de Torta/Doughnut, Barras horizontales y agrupadas, Líneas de Burn Rate y Curvas de Proyección acumulada).

SheetJS (xlsx): Procesamiento cliente-side de archivos binarios .xlsx y parseo masivo de celdas mediante FileReader.

Axios: Cliente HTTP para la integración con la API RESTful del backend.

Backend

Node.js (v24.x): Entorno de ejecución asíncrono para el servidor.

Express: Framework web para la arquitectura de la API REST, enrutamiento, controladores y middlewares con soporte de payloads de hasta 50 MB.

pg (node-postgres): Conector nativo a PostgreSQL con soporte para pool de conexiones y transacciones atómicas (BEGIN / COMMIT / ROLLBACK).

CORS y Dotenv: Gestión de seguridad entre dominios y variables de entorno.

Swagger UI (swagger-ui-express): Documentación interactiva de la API REST en /api-docs.

Base de datos

PostgreSQL: Almacenamiento y organización de la información del sistema (tablas con restricciones de integridad, claves primarias y tipos ENUM).

pgAdmin 4: Administración, diseño DDL y gestión de la base de datos.

Herramientas de desarrollo

npm (v11.x): Administración de dependencias.

npx: Ejecución de paquetes del entorno Node.js.

Infraestructura y hosting

BlueHosting / cPanel: Alojamiento de los componentes de la solución y dominio corporativo.

Control de versiones

Git / GitHub: Control de versiones, trabajo en ramas tipo feature/fix y reglas de protección en rama main (Pull Requests).

Gestión del proyecto

Trello (Metodología Kanban): Organización y seguimiento continuo de sprints y tareas.

Modelamiento de procesos

Bizagi Modeler / BPMN: Representación y análisis de los procesos organizacionales.

3. Ejecución local

Sigue estos pasos para clonar y ejecutar el proyecto en tu máquina local.

Requisitos previos

Node.js (v20+ recomendado) y npm instalados.

Instancia de PostgreSQL en ejecución o acceso a la base de datos remota.

Paso 1: Clonar el repositorio

git clone https://github.com/Sebastianignaciobarriosvaras/capstone-2026--002D--Sebasti-n_Barrios-Gabriel_Tello-.git

cd capstone-2026--002D--Sebasti-n_Barrios-Gabriel_Tello-

Paso 2: Configurar e instalar el Backend

cd Backend
npm install

Crea un archivo .env en la carpeta Backend con las siguientes credenciales de conexión:

PORT=3000
DB_USER=tu_usuario
DB_HOST=localhost
DB_NAME=zoron_db
DB_PASSWORD=tu_contrasena
DB_PORT=5432

Paso 3: Configurar e instalar el Frontend

cd ../Frontend
npm install

Paso 4: Encender los servidores

Nota para Windows PowerShell: Si se presentan restricciones al ejecutar scripts (npm run dev), otorga permisos temporales en la consola ejecutando:

Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process

Terminal 1 (Backend):

cd Backend
npm run dev

Confirma el mensaje: "Servidor corriendo en puerto 3000 y conexión exitosa a PostgreSQL".

Terminal 2 (Frontend):

cd Frontend
npm run dev

Accede a la aplicación en http://localhost:5173 o a la URL mostrada por Vite.

4. Desafíos técnicos y resoluciones (Hitos de desarrollo)

Durante el ciclo de desarrollo se diagnosticaron y solucionaron diversos desafíos críticos de software:

Módulo ETL y carga masiva de Excel (Pesos Chilenos - CLP)

Problema: El formateador por defecto interpretaba los puntos de miles chilenos ($67.334) como decimales internacionales, guardando los montos como $67.00 en PostgreSQL.

Solución: Se creó el algoritmo sanitizador limpiarNumero, el cual distingue puntos de miles versus comas decimales y fuerza redondeos enteros (Math.round) en CLP.

Parseo y normalización de fechas históricas

Problema: Excel exporta fechas como números de serie (45565) o cadenas locales (DD-MM-YYYY), provocando que JavaScript devolviera NaN e insertara la fecha del día por defecto.

Solución: Se desarrolló formatearFechaChile, utilizando XLSX.SSF.parse_date_code() y expresiones regulares para convertir cualquier formato entrante a fechas ISO (YYYY-MM-DD).

Integridad atómica y transacciones en Backend

Problema: La inserción de planillas de más de 700 filas mediante llamadas HTTP individuales saturaba la red y dejaba registros a medias si ocurría un error.

Solución: Se creó la ruta /movimientos/carga-masiva, respaldada por transacciones atómicas (BEGIN / COMMIT / ROLLBACK) en movimientoModel.js.

Visualización gráfica y filtrado por tipos ENUM de PostgreSQL

Problema: Los gráficos no agrupaban correctamente las transacciones al existir variaciones en la escritura de los tipos de flujo o condiciones contables.

Solución: Se estandarizó la normalización de cadenas con .toUpperCase().trim() sobre los valores ENUM (INGRESO OPERACIONAL, COSTO, GASTO) y se implementó un selector dinámico por año con sincronización en tiempo real en los componentes del Dashboard y Proyecciones.

Simulación de proyecciones financieras en memoria (Sin persistencia)

Problema: Permitir a los administradores proyectar la liquidez futura mediante nuevas estimaciones sin alterar ni sobreescribir la base de datos real.

Solución: Se creó el componente ProyeccionesPage.jsx, combinando los registros reales de PostgreSQL con un estado en memoria que recalcula dinámicamente el Saldo Proyectado Acumulado a lo largo de una línea de tiempo continua.

5. Integrantes y roles

Sebastián Ignacio Barrios Varas

Análisis y levantamiento de requerimientos.

Modelamiento de procesos BPMN.

Diseño e implementación de la Base de Datos PostgreSQL.

Desarrollo del frontend en React (Layout, Modales, Dashboard, Proyectos, Simulador de Proyecciones, Carga Masiva).

Gestión y seguimiento del proyecto.

Gabriel Francisco Tello Fernández

Análisis y estructuración de la información.

Desarrollo del Backend en Node.js / Express.

Implementación de la lógica de negocio, endpoints masivos y conexión a BD.

Pruebas, soporte técnico y documentación de la API REST.

Trabajo colaborativo: Ambos integrantes participan colaborativamente en el análisis, desarrollo, pruebas e integración.

6. Metodología de trabajo

Se utiliza una metodología ágil basada en Kanban mediante Trello.

Las etapas del proyecto abarcan:

Levantamiento y análisis de requerimientos.

Diagnóstico y modelamiento de procesos.

Propuesta y diseño de la solución tecnológica.

Desarrollo e integración de componentes.

Pruebas, validación y optimización de datos.

Documentación técnica y entrega.

7. Arquitectura del sistema

La arquitectura comprende tres capas conectadas mediante servicios REST:

[ Cliente / Navegador ]
          |
          v
[ Frontend (React / Vite + Chart.js) ]
          |
          | HTTP / API REST
          v
[ Backend (Node.js / Express) ]
          |
          v
[ PostgreSQL (BlueHosting) ]

Componentes de la arquitectura

Frontend (React): Interfaz cliente SPA responsiva con componentes modulares, selector dinámico de año y gráficos de Chart.js.

Backend (Node.js / Express): Capa de controladores, modelos y rutas RESTful.

Base de Datos (PostgreSQL): Almacenamiento persistente con tablas normalizadas (registro_movimientos) y validación de tipos ENUM.

Infraestructura (BlueHosting): Alojamiento y disponibilidad a través del dominio corporativo.

8. Acceso a la plataforma

Sitio corporativo: https://zoron.cl

Plataforma interna: https://teamzoron.cl/

9. Estado actual del proyecto

Etapas completadas

Levantamiento y análisis de requerimientos.

Modelamiento de procesos en Bizagi BPMN.

Estructuración e implementación DDL de PostgreSQL en BlueHosting.

Desarrollo del Backend (API REST, Endpoints CRUD, Carga Masiva con Transacciones y Swagger UI).

Desarrollo del Frontend (Layout responsivo, Sidebar, Modales CRUD, Filtros de Proyectos con Drill-Down, Módulo ETL de Carga Masiva Excel).

Normalización e integración exitosa de datos masivos (Limpieza CLP y Fechas).

Implementación de Dashboard con Gráficos de Indicadores Contables (Doughnut de Egresos, Top Proveedores, Rentabilidad por Proyecto y Burn Rate Semanal).

Personalización de la línea gráfica corporativa final del Frontend.

En desarrollo / Próximos pasos

Corrección de Módulo de Proyección Financiera (Simulador en Memoria) con curva continua de saldo acumulado.

Testing

Despliegue final en producción.

Proyecto Capstone – Ingeniería en Informática

Duoc UC – Sede Valparaíso

Empresa: ZORON E.I.R.L.
