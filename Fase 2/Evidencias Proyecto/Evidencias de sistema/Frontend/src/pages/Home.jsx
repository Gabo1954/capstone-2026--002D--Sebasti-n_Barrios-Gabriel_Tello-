import React from 'react';
import { Link } from 'react-router-dom';

export default function Home({ usuario }) {
  // Normalizar rol
  const rolUsuario = usuario?.rol ? String(usuario.rol).trim().toLowerCase() : '';
  const esAdmin = rolUsuario === 'administrador';

  return (
    <div style={{ padding: '10px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* TARJETA DE BIENVENIDA */}
      <div style={{ backgroundColor: '#121212', padding: '30px', borderRadius: '10px', color: 'white', marginBottom: '24px', border: '1px solid #27272A' }}>
        <h1 style={{ color: '#FFCC00', margin: '0 0 10px 0', fontSize: '28px' }}>¡Bienvenido a ZORON!</h1>
        <p style={{ fontSize: '15px', color: '#A1A1AA', margin: 0 }}>
          Hola, <strong style={{ color: '#FFFFFF' }}>{usuario?.nombre || usuario?.email || 'Usuario'}</strong>. Selecciona un módulo para comenzar a gestionar tus finanzas.
        </p>
      </div>

      {/* REJILLA DE MÓDULOS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        
        <ModuloCard 
          titulo="Dashboard" 
          desc="Resumen financiero, KPI y gráficos del negocio." 
          ruta="/dashboard" 
          color="#0284C7" 
          icono="📊"
        />
        <ModuloCard 
          titulo="Movimientos" 
          desc="Registro y control de ingresos y egresos." 
          ruta="/movimientos" 
          color="#166534" 
          icono="📝"
        />
        <ModuloCard 
          titulo="Flujo de Caja" 
          desc="Matriz semanal de ingresos, egresos y saldos." 
          ruta="/flujo-caja" 
          color="#854D0E" 
          icono="💰"
        />
        <ModuloCard 
          titulo="Proyectos" 
          desc="Rentabilidad y gestión por centros de costo." 
          ruta="/proyectos" 
          color="#4F46E5" 
          icono="📁"
        />
        <ModuloCard 
          titulo="Excel Tiempo Real" 
          desc="Visualiza los datos en vivo directamente desde Google Sheets." 
          ruta="/excel" 
          color="#059669" 
          icono="📈"
        />

        {/* Solo mostrar módulos de admin a administradores */}
        {esAdmin && (
          <>
            <ModuloCard 
              titulo="Carga Masiva" 
              desc="Importa datos históricos a PostgreSQL desde Excel." 
              ruta="/carga-masiva" 
              color="#DC2626" 
              icono="📥"
            />
            <ModuloCard 
              titulo="Proyecciones" 
              desc="Simula escenarios y variables financieras futuras." 
              ruta="/proyecciones" 
              color="#7C3AED" 
              icono="🔮"
            />
          </>
        )}

      </div>
    </div>
  );
}

// Componente visual para las tarjetas de acceso rápido
function ModuloCard({ titulo, desc, ruta, color, icono }) {
  return (
    <Link to={ruta} style={{ textDecoration: 'none' }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        padding: '24px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        borderLeft: `6px solid ${color}`,
        borderTop: '1px solid #E2E8F0',
        borderRight: '1px solid #E2E8F0',
        borderBottom: '1px solid #E2E8F0',
        transition: 'transform 0.1s ease-in-out, box-shadow 0.1s ease-in-out',
        cursor: 'pointer',
        height: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
      }}
      >
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>{icono}</div>
        <h3 style={{ margin: '0 0 8px 0', color: '#1E293B', fontSize: '18px' }}>{titulo}</h3>
        <p style={{ margin: 0, color: '#64748B', fontSize: '13px', lineHeight: '1.5' }}>{desc}</p>
      </div>
    </Link>
  );
}