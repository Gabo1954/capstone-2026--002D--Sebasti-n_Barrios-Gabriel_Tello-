const express = require('express');
const router = express.Router();
const { getExcelData } = require('../controllers/reatimeController');

// Ruta GET para obtener los datos
router.get('/datos', getExcelData);

module.exports = router;