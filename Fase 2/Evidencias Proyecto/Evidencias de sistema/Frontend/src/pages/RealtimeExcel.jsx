import React, { useState } from 'react';

const RealtimeExcel = () => {
  const DOCUMENT_ID = '1TILPTOEaSe8C75r695ObAKAw35TEGXZE';
  const [pantallaCompleta, setPantallaCompleta] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [cargandoIframe, setCargandoIframe] = useState(true);
  const [zoom, setZoom] = useState(0.8); // 80% por defecto para ver más columnas

  const embedUrl = `https://docs.google.com/spreadsheets/d/${DOCUMENT_ID}/edit?rm=minimal`;
  const externalUrl = `https://docs.google.com/spreadsheets/d/${DOCUMENT_ID}/edit`;

  const handleRecargar = () => {
    setCargandoIframe(true);
    setReloadKey((prev) => prev + 1);
  };

  // Cálculo inverso para que el iframe escalado llene el 100% del contenedor sin dejar espacios vacíos
  const dimensionCompensada = `${(100 / zoom).toFixed(2)}%`;

  const wrapperStyle = pantallaCompleta
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#F8FAFC',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        padding: '16px',
        boxSizing: 'border-box',
        textAlign: 'left'
      }
    : {
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 104px)',
        width: '100%',
        boxSizing: 'border-box',
        textAlign: 'left'
      };

  return (
    <div style={wrapperStyle}>
      {/* BARRA SUPERIOR CORPORATIVA */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          padding: '14px 20px',
          marginBottom: '14px',
          border: '1px solid #E2E8F0',
          borderLeft: '5px solid #FFCC00',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <h2 style={{ color: '#0D0D0D', margin: 0, fontSize: '18px', fontWeight: '700' }}>
              Planilla Maestra de Movimientos
            </h2>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                fontWeight: '600',
                color: '#166534',
                backgroundColor: '#DCFCE7',
                padding: '3px 10px',
                borderRadius: '999px'
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: '#16A34A',
                  display: 'inline-block'
                }}
              />
              Sincronizado con Google Drive
            </span>
          </div>
          <p style={{ color: '#64748B', fontSize: '13px', margin: 0 }}>
            Edición colaborativa en tiempo real. Los cambios guardados se reflejan automáticamente en los reportes.
          </p>
        </div>

        {/* Controles de Zoom y Acciones */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Selector de Zoom */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              padding: '5px 10px'
            }}
          >
            <label htmlFor="zoomExcelSelect" style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>
              Zoom:
            </label>
            <select
              id="zoomExcelSelect"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                fontSize: '12px',
                fontWeight: '700',
                color: '#0D0D0D',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value={0.7}>70%</option>
              <option value={0.8}>80%</option>
              <option value={0.9}>90%</option>
              <option value={1}>100%</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleRecargar}
            style={{
              backgroundColor: '#F8FAFC',
              color: '#1E293B',
              border: '1px solid #CBD5E1',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Refrescar vista
          </button>

          <button
            type="button"
            onClick={() => setPantallaCompleta(!pantallaCompleta)}
            style={{
              backgroundColor: '#0D0D0D',
              color: '#FFCC00',
              border: '1px solid #0D0D0D',
              padding: '8px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            {pantallaCompleta ? 'Salir de pantalla completa' : 'Expandir planilla'}
          </button>

          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              backgroundColor: '#FFCC00',
              color: '#0D0D0D',
              border: '1px solid #EAB308',
              padding: '8px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '700',
              textDecoration: 'none',
              display: 'inline-block'
            }}
          >
            Abrir en Google Sheets
          </a>
        </div>
      </div>

      {/* CONTENEDOR DE LA HOJA DE CÁLCULO CON ESCALA */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          border: '1px solid #CBD5E1',
          borderTop: '3px solid #0D0D0D',
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)'
        }}
      >
        {cargandoIframe && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569',
              fontSize: '13px',
              fontWeight: '600',
              zIndex: 1
            }}
          >
            Cargando planilla colaborativa...
          </div>
        )}

        <iframe
          key={reloadKey}
          src={embedUrl}
          title="Planilla Maestra Zoron"
          frameBorder="0"
          allowFullScreen
          onLoad={() => setCargandoIframe(false)}
          style={{
            display: 'block',
            border: 'none',
            width: dimensionCompensada,
            height: dimensionCompensada,
            transform: `scale(${zoom})`,
            transformOrigin: '0 0'
          }}
        />
      </div>
    </div>
  );
};

export default RealtimeExcel;