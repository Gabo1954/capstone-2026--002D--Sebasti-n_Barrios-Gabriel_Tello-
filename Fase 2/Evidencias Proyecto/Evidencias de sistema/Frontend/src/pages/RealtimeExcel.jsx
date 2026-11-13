import React from 'react';

const RealtimeExcel = () => {

  const DOCUMENT_ID = '1TILPTOEaSe8C75r695ObAKAw35TEGXZE'; 

  // Construimos la URL para embeber (usamos /edit?rm=minimal para ocultar los menús superiores de Google y se vea más limpio)
  // Si prefieres ver todos los menús de Google Sheets, quita el ?rm=minimal y usa solo /edit
  const embedUrl = `https://docs.google.com/spreadsheets/d/${DOCUMENT_ID}/edit?rm=minimal`;

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: 'calc(100vh - 120px)', // Ocupar todo el alto disponible restando el header
      fontFamily: 'Arial, sans-serif' 
    }}>
      
      {/* Cabecera del Módulo */}
      <div style={{ marginBottom: '15px' }}>
        <h2 style={{ color: '#1E293B', margin: '0 0 5px 0' }}>Excel Colaborativo en Tiempo Real</h2>
        <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>
          Edita esta planilla simultáneamente con tu equipo. Los cambios se guardan automáticamente en Google Drive.
        </p>
      </div>

      {/* Contenedor del Iframe */}
      <div style={{ 
        flex: 1, 
        border: '1px solid #E2E8F0', 
        borderRadius: '8px', 
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        {DOCUMENT_ID === 'TU_ID_DE_GOOGLE_SHEETS_AQUI' ? (
          <div style={{ 
            padding: '40px', 
            textAlign: 'center', 
            color: '#DC2626',
            backgroundColor: '#FEF2F2',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <h3>¡Falta configurar el ID!</h3>
            <p>Por favor, edita el archivo <strong>RealtimeExcel.jsx</strong> y reemplaza la variable <code>DOCUMENT_ID</code> con el ID real de tu planilla de Google Sheets.</p>
          </div>
        ) : (
          <iframe 
            src={embedUrl}
            title="Google Sheets Colaborativo"
            width="100%" 
            height="100%" 
            frameBorder="0"
            allowFullScreen
            style={{ display: 'block' }}
          ></iframe>
        )}
      </div>

    </div>
  );
};

export default RealtimeExcel;