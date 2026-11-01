# capstone-2026--002D--Sebasti-n_Barrios-Gabriel_Tello-
Repositorio GitHub de Proyecto ATP Capstone 2026. Sebastián Barrios y Gabriel Tello

# Zoron – Plataforma de Gestión Financiera

## 1. Descripción del proyecto

El proyecto consiste en el diseño y desarrollo de una plataforma interna para ZORON E.I.R.L., empresa dedicada a la consultoría en sostenibilidad y cambio climático. Su propósito es mejorar la gestión y organización de la información empresarial mediante herramientas tecnológicas que permitan sistematizar procesos internos, facilitar el registro y consulta de información y disponer de dashboards interactivos para apoyar la toma de decisiones.

La solución estará dirigida principalmente a los colaboradores y administración de la empresa, incorporando funcionalidades de acceso restringido, gestión de información y visualización de indicadores. Se busca complementar los procesos actuales de trabajo, manteniendo Excel como fuente de información para esta etapa del proyecto.

## 2. Tecnologías utilizadas

Las tecnologías seleccionadas para el desarrollo de la plataforma se organizan de la siguiente manera:

**Frontend**
- **React:** Desarrollo de la interfaz de usuario y dashboards interactivos.

**Backend**
- **Node.js v24.21.0:** Entorno de ejecución del backend.
- **Express:** Gestión de solicitudes, lógica de negocio y comunicación con la base de datos.

**Herramientas de desarrollo**
- **npm 11.19.0:** Administración de dependencias.
- **npx 11.19.0:** Ejecución de herramientas y paquetes del entorno Node.js.

**Base de datos**
- **PostgreSQL:** Almacenamiento y organización de la información del sistema.
- **pgAdmin 4:** Administración y gestión de la base de datos.

**Infraestructura**
- **BlueHosting / cPanel:** Alojamiento de los componentes de la solución.

**Control de versiones**
- **Git / GitHub:** Administración y seguimiento del código fuente.

**Gestión del proyecto**
- **Trello:** Organización y seguimiento de actividades.

**Modelamiento de procesos**
- **Bizagi Modeler / BPMN:** Representación y análisis de los procesos organizacionales.

*Las versiones específicas de las demás tecnologías se incorporarán durante la implementación.*

## 3. Ejecución local

Actualmente, la base de datos PostgreSQL se encuentra implementada en el hosting de BlueHosting. El desarrollo del backend y frontend se realizará utilizando Node.js, Express y React, respectivamente.

Una vez completada la implementación, los pasos para ejecutar el proyecto localmente serán los siguientes:

1. Instalar Node.js, npm y las herramientas necesarias para trabajar con PostgreSQL.
2. Clonar el repositorio desde GitHub.
3. Instalar las dependencias del backend y frontend.
4. Configurar las variables de entorno mediante el archivo `.env.example`.
5. Configurar los parámetros de conexión con la base de datos PostgreSQL alojada en BlueHosting.
6. Ejecutar el servidor backend.
7. Ejecutar la aplicación frontend.
8. Acceder a la aplicación desde la dirección local configurada.

## 4. Integrantes y roles

**Sebastián Ignacio Barrios Varas**
- Análisis y levantamiento de requerimientos.
- Modelamiento de procesos BPMN.
- Documentación del proyecto.
- Diseño e implementación de la Base de Datos Postgre SQL.
- Desarrollo del frontend mediante React.
- Gestión y seguimiento del proyecto.

**Gabriel Francisco Tello Fernández**
- Análisis y estructuración de información.
- Desarrollo del Backend mediante Node.js / Express.
- Implementación de la lógica de negocio y los servicios de comunicación con la Base de Datos. 
- Apoyo en el diseño de la solución tecnológica y gestión de datos.

Ambos integrantes participan colaborativamente en el análisis, diseño, desarrollo, pruebas y documentación de la solución.

## 5. Metodología de trabajo

Para el desarrollo del proyecto se utiliza una metodología de trabajo basada en Kanban, apoyada por la herramienta Trello, que permite organizar las actividades, asignar responsabilidades y realizar seguimiento continuo de los avances.

Se optó por este enfoque debido a que permite visualizar el estado de cada tarea, priorizar actividades y adaptarse a los requerimientos que puedan surgir durante el desarrollo del proyecto.

Las actividades se organizan en las siguientes etapas:

- Levantamiento y análisis de requerimientos.
- Diagnóstico y modelamiento de procesos.
- Propuesta de solución tecnológica.
- Diseño de la solución tecnológica.
- Desarrollo e integración de componentes.
- Pruebas y validación.
- Documentación y entrega.

El seguimiento de las actividades, tareas pendientes y avances se encuentra registrado en el tablero de Trello del proyecto.

## 6. Arquitectura del sistema

La plataforma contempla una arquitectura organizada en tres componentes principales: frontend, backend y base de datos, alojados mediante los servicios de BlueHosting. La aplicación interna estará disponible a través del dominio `https://teamzoron.cl/`, mientras que el sitio corporativo `https://zoron.cl/` mantendrá un enlace directo hacia ella.

### Componentes de la arquitectura

- **Frontend (React):** Interfaz de usuario mediante la cual los colaboradores podrán iniciar sesión, registrar información y consultar dashboards e indicadores.
- **Backend (Node.js / Express):** Responsable de procesar las solicitudes del frontend, gestionar la lógica de negocio y establecer la comunicación con PostgreSQL.
- **Base de datos (PostgreSQL):** Encargada del almacenamiento y organización de la información necesaria para el funcionamiento de la plataforma.
- **Infraestructura (BlueHosting):** Proporcionará el entorno de alojamiento para los componentes correspondientes y la disponibilidad de la plataforma mediante el dominio definido.

### Flujo de comunicación

1. El colaborador accede al sitio corporativo `zoron.cl` y selecciona el enlace disponible en su menú de navegación (navbar) para ingresar a la plataforma interna.
2. El navegador carga la interfaz desarrollada en React desde `teamzoron.cl`.
3. El frontend realiza solicitudes al backend mediante una API.
4. El backend procesa las solicitudes y consulta o modifica la información almacenada en PostgreSQL.
5. Los resultados son enviados al frontend para su presentación al usuario.

### Diagrama de arquitectura

El diagrama de arquitectura se incorporará en esta sección una vez definida la distribución definitiva de los componentes y su implementación en el hosting.

## 7. Acceso a la plataforma

El sitio corporativo de ZORON E.I.R.L. se encuentra disponible en:

- **Sitio corporativo:** [https://zoron.cl](https://zoron.cl)

La plataforma interna será alojada en el dominio `https://teamzoron.cl/`, donde los colaboradores podrán acceder al sistema mediante sus credenciales de usuario.

Además, se incorporará un hipervínculo directo en el menú de navegación (navbar) del sitio corporativo `zoron.cl`, permitiendo acceder a la plataforma interna de manera sencilla y centralizada.

- **Sitio corporativo:** [https://zoron.cl](https://zoron.cl)
- **Plataforma interna:** [https://teamzoron.cl/](https://teamzoron.cl/)

## 8. Estado actual del proyecto

El estado de avance de los principales componentes del proyecto se detalla a continuación:

**Etapas completadas**
- Levantamiento de requerimientos.
- Análisis y modelamiento de procesos.
- Diseño de la solución.

**Componentes implementados**
- Base de datos PostgreSQL en BlueHosting.

**Componentes pendientes**
- Backend Node.js / Express.
- Frontend React.
- Integración con PostgreSQL.
- Dashboards e indicadores.
- Configuración y despliegue del dominio de acceso.
- Integración y pruebas.

**En desarrollo**
- Documentación técnica.

---

**Proyecto Capstone – Ingeniería en Informática**  
**Duoc UC – Sede Valparaíso**  
**Empresa:** ZORON E.I.R.L.