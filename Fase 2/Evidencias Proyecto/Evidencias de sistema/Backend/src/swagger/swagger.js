// src/swagger/swagger.js
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API ZORON Finanzas - Tesis',
      version: '1.0.0',
      description: 'Documentación y pruebas de endpoints para el MVP de ZORON E.I.R.L.',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor Local de Desarrollo',
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/index.js'], // Ruta donde buscará las anotaciones de los endpoints
};

const swaggerSpec = swaggerJSDoc(options);

const swaggerDocs = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log('📄 Documentación de Swagger disponible en http://localhost:3000/api-docs');
};

module.exports = { swaggerDocs };