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
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#F8FAFC', width: '100vw', overflowX: 'hidden' }}>
      
      {/* SIDEBAR (MENÚ LATERAL) */}
      <aside style={{ width: '220px', minWidth: '220px', backgroundColor: '#0F172A', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px 12px', boxSizing: 'border-box' }}>
        <div>
          <div style={{ padding: '0 12px 20px 12px', borderBottom: '1px solid #1E293B', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: '#38BDF8', fontSize: '18px' }}>API ZORON</h3>
            <span style={{ fontSize: '11px', color: '#94A3B8' }}>Gestión Financiera</span>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
                    color: isActive ? '#FFFFFF' : '#94A3B8',
                    backgroundColor: isActive ? '#0284C7' : 'transparent',
                    textDecoration: 'none',
                    fontWeight: isActive ? '600' : '400',
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

        <div style={{ borderTop: '1px solid #1E293B', paddingTop: '16px', paddingLeft: '8px', paddingRight: '8px' }}>
          <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#F8FAFC' }}>Usuario Finanzas</div>
          <div style={{ fontSize: '11px', color: '#94A3B8' }}>admin@zoron.cl</div>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL CON CONTROL DE ANCHO EXACTO */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, maxWidth: 'calc(100vw - 220px)', overflowX: 'hidden' }}>
        
        {/* Navbar Superior */}
        <header style={{ height: '56px', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
          <h4 style={{ margin: 0, color: '#334155', fontWeight: '500' }}>
            Plataforma de Control de Gestión y Finanzas
          </h4>
          <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', backgroundColor: '#E0F2FE', color: '#0369A1', fontWeight: 'bold' }}>
            Entorno Local
          </span>
        </header>

        {/* Área donde cargan las vistas */}
        <main style={{ flex: 1, padding: '16px 20px', overflowY: 'auto', overflowX: 'hidden', boxSizing: 'border-box' }}>
          {children}
        </main>
      </div>

    </div>
  );
}