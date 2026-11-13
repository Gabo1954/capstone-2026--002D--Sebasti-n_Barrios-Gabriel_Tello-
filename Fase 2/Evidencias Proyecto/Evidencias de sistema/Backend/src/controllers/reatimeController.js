const { google } = require('googleapis');
const path = require('path');
const xlsx = require('xlsx'); // Importamos la librería para leer .xlsx

const KEYFILEPATH = path.join(__dirname, '../../credentials.json');
// IMPORTANTE: El permiso cambia de Sheets a Drive
const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];

const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
});

// El ID de tu archivo .xlsx original
const FILE_ID = '1TILPTOEaSe8C75r695ObAKAw35TEGXZE'; 

const getExcelData = async (req, res) => {
    try {
        const client = await auth.getClient();
        
        // Inicializamos la API de Drive, no la de Sheets
        const drive = google.drive({ version: 'v3', auth: client });

        // Descargamos el archivo directamente a la memoria del servidor (arraybuffer)
        const response = await drive.files.get(
            { fileId: FILE_ID, alt: 'media' },
            { responseType: 'arraybuffer' } // Necesario para manejar archivos binarios
        );

        // Parseamos el buffer del archivo descargado
        const workbook = xlsx.read(response.data, { type: 'buffer' });
        
        // Seleccionamos la primera pestaña del Excel dinámicamente
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convertimos la hoja a una matriz (arreglo de arreglos), que es exactamente lo que espera tu frontend
        const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

        if (!rows || rows.length === 0) {
            return res.status(404).json({ message: 'El archivo Excel está vacío.' });
        }

        return res.status(200).json({ 
            message: 'Datos obtenidos con éxito',
            data: rows 
        });

    } catch (error) {
        console.error('Error al descargar o leer el archivo Excel desde Drive:', error);
        return res.status(500).json({ error: 'Error interno del servidor al procesar el archivo .xlsx.' });
    }
};

module.exports = {
    getExcelData
};