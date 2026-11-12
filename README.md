# ZORON -- Plataforma de Gestión Financiera

![Proyecto Capstone
2026](https://img.shields.io/badge/Capstone-2026--002D-1f6feb)
![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61dafb)
![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933)
![Base de
datos](https://img.shields.io/badge/Base%20de%20datos-PostgreSQL-4169e1)

Repositorio del proyecto **ATP Capstone 2026 -- 002D**, desarrollado en
el marco de la carrera de Ingeniería en Informática de Duoc UC, sede
Valparaíso.

**Integrantes:** Sebastián Ignacio Barrios Varas y Gabriel Francisco
Tello Fernández\
**Empresa:** ZORON E.I.R.L.\
**Proyecto:** Plataforma de Gestión Financiera

------------------------------------------------------------------------

## 1. Descripción general

**ZORON** es una plataforma interna desarrollada para **ZORON
E.I.R.L.**, empresa dedicada a la consultoría en sostenibilidad y cambio
climático. Su objetivo es fortalecer la gestión y organización de la
información empresarial mediante herramientas que permitan sistematizar
procesos internos, centralizar registros y facilitar el análisis de
información para la toma de decisiones.

La solución está orientada a los colaboradores y al equipo
administrativo de la empresa. Integra funcionalidades de acceso
restringido, gestión de movimientos financieros, consulta de proyectos
mediante navegación de detalle (*drill-down*), carga masiva de planillas
Excel, dashboards de indicadores contables y simulación de proyecciones
financieras en memoria.

### Funcionalidades principales

-   Acceso restringido a la plataforma.
-   Registro, consulta, edición y eliminación de movimientos
    financieros.
-   Visualización de proyectos y navegación hacia su información
    detallada.
-   Carga masiva de movimientos desde archivos Excel.
-   Procesamiento y normalización de montos en pesos chilenos (CLP) y
    fechas.
-   Dashboards interactivos con indicadores contables y financieros.
-   Simulación de proyecciones financieras sin modificar los registros
    persistidos en la base de datos.
-   Documentación interactiva de los servicios del backend mediante
    Swagger UI.

## 2. Tecnologías y herramientas

### Frontend

  -----------------------------------------------------------------------
  Tecnología                          Uso
  ----------------------------------- -----------------------------------
  React                               Construcción de la interfaz
                                      mediante componentes reutilizables
                                      y gestión del estado de la
                                      aplicación.

  Vite                                Herramienta de desarrollo y
                                      compilación del frontend.

  React Router DOM                    Navegación entre los módulos de la
                                      plataforma.

  Chart.js y react-chartjs-2          Visualización de gráficos de
                                      indicadores financieros.

  SheetJS (xlsx)                      Lectura y procesamiento de archivos
                                      Excel desde el navegador.

  Axios                               Comunicación HTTP con la API REST
                                      del backend.
  -----------------------------------------------------------------------

### Backend

  -----------------------------------------------------------------------
  Tecnología                          Uso
  ----------------------------------- -----------------------------------
  Node.js                             Entorno de ejecución de JavaScript
                                      del lado del servidor.

  Express                             Framework para implementar rutas,
                                      controladores y middlewares de la
                                      API REST.

  pg (node-postgres)                  Conexión y administración de
                                      consultas y transacciones con
                                      PostgreSQL.

  CORS                                Configuración del acceso entre
                                      distintos orígenes.

  dotenv                              Lectura de variables de entorno y
                                      configuración sensible.

  Swagger UI Express                  Publicación de la documentación
                                      interactiva de la API en
                                      `/api-docs`.
  -----------------------------------------------------------------------

### Base de datos e infraestructura

  -----------------------------------------------------------------------
  Tecnología / herramienta            Uso
  ----------------------------------- -----------------------------------
  PostgreSQL                          Almacenamiento persistente de la
                                      información, con claves,
                                      restricciones de integridad y tipos
                                      de datos definidos.

  pgAdmin 4                           Administración y gestión de la base
                                      de datos.

  BlueHosting / cPanel                Infraestructura de alojamiento de
                                      la solución.
  -----------------------------------------------------------------------

### Desarrollo y gestión

-   **npm / npx:** administración y ejecución de dependencias y
    paquetes.
-   **Git / GitHub:** control de versiones, trabajo con ramas y revisión
    de cambios mediante Pull Requests.
-   **Trello:** organización y seguimiento de tareas mediante
    metodología Kanban.
-   **Bizagi Modeler / BPMN:** modelamiento y representación de procesos
    organizacionales.

## 3. Arquitectura del sistema

La solución utiliza una arquitectura de tres capas. El frontend consume
los servicios REST expuestos por el backend, mientras que este último
administra la comunicación con PostgreSQL.

``` text
┌──────────────────────────────┐
│      Cliente / Navegador     │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│     Frontend: React + Vite   │
│       Chart.js / Axios       │
└──────────────┬───────────────┘
               │ HTTP / API REST
               ▼
┌──────────────────────────────┐
│    Backend: Node.js/Express  │
│      Rutas y controladores   │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│          PostgreSQL          │
│       Base de datos          │
└──────────────────────────────┘
```

### Capas y responsabilidades

-   **Frontend:** aplicación web de una sola página (SPA), con interfaz
    responsiva, componentes modulares, filtros y gráficos interactivos.
-   **Backend:** concentra las rutas, controladores, modelos y lógica de
    negocio. Expone los servicios mediante una API REST.
-   **Base de datos:** almacena los registros de manera persistente y
    aplica restricciones de integridad y validaciones definidas en el
    modelo.
-   **Infraestructura:** los componentes publicados utilizan los
    servicios de alojamiento de BlueHosting, de acuerdo con la
    configuración del entorno.

## 4. Requisitos previos

Para ejecutar el proyecto localmente se requiere:

-   Node.js (versión 20 o superior).
-   npm, incluido con Node.js.
-   PostgreSQL en ejecución o acceso a una instancia remota.
-   Git para clonar el repositorio.

> **Importante:** las credenciales de conexión deben configurarse
> localmente en un archivo `.env`. No se deben publicar contraseñas ni
> datos sensibles en GitHub.

## 5. Instalación y ejecución local

### Paso 1. Clonar el repositorio

``` bash
git clone https://github.com/Sebastianignaciobarriosvaras/capstone-2026--002D--Sebasti-n_Barrios-Gabriel_Tello-.git
cd capstone-2026--002D--Sebasti-n_Barrios-Gabriel_Tello-
```

### Paso 2. Configurar el backend

Ingresar a la carpeta del backend e instalar las dependencias:

``` bash
cd Backend
npm install
```

Crear un archivo llamado `.env` dentro de la carpeta `Backend`,
utilizando la siguiente estructura:

``` env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=zoron_bd
```

Reemplazar los valores de ejemplo por los datos correspondientes al
entorno de PostgreSQL que se utilizará. El archivo `.env` contiene
configuración local y no debe subirse al repositorio.

### Paso 3. Configurar el frontend

Desde la raíz del proyecto, ingresar a la carpeta `Frontend` e instalar
sus dependencias:

``` bash
cd ../Frontend
npm install
```

### Paso 4. Iniciar los servicios

Se deben utilizar dos terminales independientes.

**Terminal 1 -- Backend**

``` bash
cd Backend
npm run dev
```

El backend debe iniciar en el puerto configurado y establecer conexión
con PostgreSQL. Si la aplicación muestra un mensaje de inicio y conexión
exitosa, el servicio estará disponible.

**Terminal 2 -- Frontend**

``` bash
cd Frontend
npm run dev
```

Vite mostrará en la terminal la dirección local de la aplicación.
Habitualmente estará disponible en:

``` text
http://localhost:5173
```

### Nota para Windows PowerShell

Si PowerShell bloquea la ejecución de scripts requeridos por npm, se
puede habilitar temporalmente la ejecución para la sesión actual:

``` powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
```

## 6. Desafíos técnicos y soluciones implementadas

Durante el desarrollo se abordaron distintos problemas relacionados con
la calidad, consistencia e integración de los datos.

### 6.1. Procesamiento ETL y carga masiva de Excel (CLP)

**Problema:** los formatos numéricos utilizados en Chile, como
`$67.334`, podían interpretarse incorrectamente como valores decimales
al procesarse con convenciones de otras regiones.

**Solución:** se implementó la función `limpiarNumero`, encargada de
reconocer separadores de miles y decimales, normalizar los valores y
redondear los montos a números enteros para su almacenamiento en pesos
chilenos.

### 6.2. Parseo y normalización de fechas

**Problema:** los archivos Excel pueden entregar fechas como números de
serie (por ejemplo, `45565`) o como cadenas con formato local
(`DD-MM-YYYY`). Una interpretación incorrecta podía producir valores
inválidos o fechas no correspondientes al registro original.

**Solución:** se desarrolló la función `formatearFechaChile`, que
utiliza `XLSX.SSF.parse_date_code()` y expresiones regulares para
reconocer los formatos de entrada y convertirlos a formato ISO
(`YYYY-MM-DD`).

### 6.3. Integridad de la carga masiva mediante transacciones

**Problema:** procesar planillas de cientos de filas mediante
solicitudes HTTP individuales aumentaba la carga de comunicación y podía
dejar información parcialmente insertada ante un error.

**Solución:** se implementó el endpoint `/movimientos/carga-masiva`,
utilizando transacciones de PostgreSQL (`BEGIN`, `COMMIT` y `ROLLBACK`)
para asegurar que la operación se confirme completa o se revierta ante
un fallo.

### 6.4. Normalización de categorías y visualización de indicadores

**Problema:** las diferencias de escritura o formato en los valores
asociados a los tipos de movimiento podían provocar agrupaciones
incorrectas en los gráficos.

**Solución:** se normalizaron las cadenas mediante
`.toUpperCase().trim()` para estandarizar los valores, incluyendo
categorías como `INGRESO OPERACIONAL`, `COSTO` y `GASTO`. Además, se
incorporó un selector dinámico de año sincronizado con los módulos
Dashboard y Proyecciones.

### 6.5. Simulación de proyecciones financieras en memoria

**Problema:** se necesitaba permitir que los administradores evaluaran
escenarios futuros de liquidez sin alterar ni sobrescribir los
movimientos reales almacenados.

**Solución:** se desarrolló el componente `ProyeccionesPage.jsx`, que
combina los registros obtenidos desde PostgreSQL con estimaciones
mantenidas en el estado de la aplicación. De esta manera, se recalcula
el saldo proyectado acumulado a lo largo de una línea de tiempo, sin
persistir las simulaciones en la base de datos.

## 7. Módulos de la plataforma

La solución contempla los siguientes módulos:

  -----------------------------------------------------------------------
  Módulo                              Descripción
  ----------------------------------- -----------------------------------
  Movimientos                         Gestión de los registros
                                      financieros de la organización.

  Proyectos                           Consulta de proyectos y navegación
                                      hacia información de mayor detalle
                                      (*drill-down*).

  Dashboard                           Visualización de indicadores
                                      contables y financieros mediante
                                      gráficos interactivos.

  Carga Masiva                        Importación de movimientos desde
                                      planillas Excel, con normalización
                                      y validación de datos.

  Proyecciones                        Simulación de escenarios
                                      financieros y evolución del saldo
                                      acumulado en memoria.
  -----------------------------------------------------------------------

## 8. Integrantes y responsabilidades

### Sebastián Ignacio Barrios Varas

-   Análisis y levantamiento de requerimientos.
-   Modelamiento de procesos mediante BPMN.
-   Diseño e implementación de la base de datos PostgreSQL.
-   Desarrollo frontend en React: estructura visual, modales, Dashboard,
    Proyectos, Proyecciones y Carga Masiva.
-   Gestión y seguimiento del proyecto.

### Gabriel Francisco Tello Fernández

-   Análisis y estructuración de la información.
-   Desarrollo del backend utilizando Node.js y Express.
-   Implementación de lógica de negocio y endpoints para operaciones
    masivas.
-   Integración y conexión con PostgreSQL.
-   Pruebas, soporte técnico y documentación de la API REST.

**Trabajo colaborativo:** ambos integrantes participan en el análisis,
desarrollo, pruebas, validación e integración de los componentes de la
solución.

## 9. Metodología de trabajo

El proyecto utiliza una metodología ágil basada en **Kanban**, apoyada
por Trello para organizar tareas, visualizar avances y dar seguimiento
al trabajo.

Las principales etapas consideradas son:

1.  Levantamiento y análisis de requerimientos.
2.  Diagnóstico y modelamiento de procesos.
3.  Propuesta y diseño de la solución tecnológica.
4.  Desarrollo e integración de componentes.
5.  Pruebas, validación y optimización de datos.
6.  Documentación técnica y entrega.

## 10. Estado del proyecto

### Etapas completadas

-   Levantamiento y análisis de requerimientos.
-   Modelamiento de procesos mediante Bizagi y BPMN.
-   Estructuración e implementación del modelo DDL de PostgreSQL en
    BlueHosting.
-   Desarrollo del backend: API REST, endpoints CRUD, carga masiva con
    transacciones y documentación Swagger UI.
-   Desarrollo del frontend: layout responsivo, menú lateral, modales
    CRUD, filtros de proyectos con *drill-down* y módulo de carga masiva
    Excel.
-   Normalización e integración de datos masivos, incluyendo montos CLP
    y fechas.
-   Implementación del Dashboard con indicadores contables, gráficos de
    egresos, principales proveedores, rentabilidad por proyecto y Burn
    Rate semanal.
-   Personalización de la línea gráfica corporativa del frontend.

### En desarrollo y próximos pasos

-   Corrección y validación del módulo de proyección financiera,
    especialmente la continuidad de la curva de saldo acumulado.
-   Ejecución de pruebas funcionales y validación integral de los
    módulos.
-   Despliegue final y verificación de la solución en producción.

## 11. Acceso a la plataforma

-   **Sitio corporativo:** <https://zoron.cl>
-   **Plataforma interna:** <https://teamzoron.cl/>

El acceso a la plataforma interna puede requerir credenciales
autorizadas.

## 12. Documentación de la API

Una vez iniciado el backend, la documentación interactiva de Swagger UI
se encuentra disponible en:

``` text
http://localhost:3000/api-docs
```

La disponibilidad de esta ruta depende de que el backend esté
correctamente configurado y en ejecución.

------------------------------------------------------------------------

## Información académica

**Proyecto:** Capstone -- Ingeniería en Informática\
**Código:** ATP Capstone 2026 -- 002D\
**Institución:** Duoc UC -- Sede Valparaíso\
**Empresa:** ZORON E.I.R.L.
