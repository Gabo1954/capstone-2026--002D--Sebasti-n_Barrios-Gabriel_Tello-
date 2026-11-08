import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Layout({ children }) {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/movimientos', label: 'Movimientos' },
    { path: '/proyectos', label: 'Proyectos' },
    { path: '/carga-masiva', label: 'Carga Masiva' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', backgroundColor: '#F8FAFC', margin: 0, padding: 0, boxSizing: 'border-box' }}>
      
      {/* SIDEBAR LATERAL CON COLORES CORPORATIVOS Y LOGO */}
      <aside style={{ 
        width: '240px', 
        minWidth: '240px', 
        backgroundColor: '#0D0D0D', 
        color: 'white', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between', 
        padding: '20px 14px',
        boxSizing: 'border-box',
        borderRight: '1px solid #1E293B'
      }}>
        <div>
          {/* ENCABEZADO: LOGO Y MARCA ZORON */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            padding: '0 8px 18px 8px', 
            borderBottom: '1px solid #27272A', 
            marginBottom: '20px' 
          }}>
            <img 
              src="/logo-zoron.png" 
              alt="Logo Zoron" 
              style={{ height: '32px', width: 'auto', objectFit: 'contain' }}
            />
            <div>
              <h3 style={{ margin: 0, color: '#FFCC00', fontSize: '18px', letterSpacing: '1px', fontWeight: 'bold' }}>
                ZORON
              </h3>
              <span style={{ fontSize: '10px', color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Gestión Financiera
              </span>
            </div>
          </div>

          {/* MENÚ DE NAVEGACIÓN */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    display: 'block',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    color: isActive ? '#0D0D0D' : '#A1A1AA',
                    backgroundColor: isActive ? '#FFCC00' : 'transparent',
                    textDecoration: 'none',
                    fontWeight: isActive ? '700' : '400',
                    fontSize: '14px',
                    transition: 'all 0.2s'
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* PIE DEL SIDEBAR / USUARIO */}
        <div style={{ borderTop: '1px solid #27272A', paddingTop: '16px', paddingLeft: '8px', paddingRight: '8px' }}>
          <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#F8FAFC' }}>Usuario Finanzas</div>
          <div style={{ fontSize: '11px', color: '#A1A1AA' }}>admin@zoron.cl</div>
        </div>
      </aside>

      {/* ÁREA DE CONTENIDO */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, boxSizing: 'border-box' }}>
        
        {/* Navbar Superior */}
        <header style={{ height: '56px', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', boxSizing: 'border-box' }}>
          <h4 style={{ margin: 0, color: '#334155', fontWeight: '500' }}>
            Plataforma de Control de Gestión y Finanzas
          </h4>
          <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', backgroundColor: '#E0F2FE', color: '#0369A1', fontWeight: 'bold' }}>
            Entorno Local
          </span>
        </header>

        {/* Contenido principal */}
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto', boxSizing: 'border-box' }}>
          {children}
        </main>
      </div>

    </div>
  );
}