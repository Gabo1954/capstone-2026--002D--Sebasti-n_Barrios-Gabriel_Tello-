import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Layout({ children, usuario, cerrarSesion }) {
  const location = useLocation();

  // Menú dinámico:
  // - Home, Dashboard, Movimientos, Flujo de Caja, Proyectos y Excel visibles para todos
  // - Carga Masiva y Proyecciones visibles SOLO para el rol Administrador
  const esAdmin = usuario?.rol?.toLowerCase() === 'administrador';

  const menuItems = [
    { path: '/', label: '🏠 Inicio (Home)' },
    { path: '/dashboard', label: '📊 Dashboard' },
    { path: '/movimientos', label: '📝 Movimientos' },
    { path: '/flujo-caja', label: '💰 Flujo de Caja' },
    { path: '/proyectos', label: '📁 Proyectos' },
    { path: '/excel', label: '📈 Excel Tiempo Real' },
    ...(esAdmin ? [
      { path: '/carga-masiva', label: '📥 Carga Masiva' },
      { path: '/proyecciones', label: '🔮 Proyecciones' }
    ] : []),
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', backgroundColor: '#F8FAFC', margin: 0, padding: 0, boxSizing: 'border-box' }}>
      
      {/* SIDEBAR LATERAL */}
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
          {/* ENCABEZADO CON MARCA */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            padding: '0 8px 18px 8px', 
            borderBottom: '1px solid #27272A', 
            marginBottom: '20px' 
          }}>
            <img 
              src="/logo zoron.png" 
              alt="Logo Zoron" 
              style={{ height: '90px', width: 'auto', objectFit: 'contain' }}
              onError={(e) => { e.target.style.display = 'none'; }}
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

          {/* MENÚ DE NAVEGACIÓN DINÁMICO */}
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

        {/* PIE DEL SIDEBAR / DATOS DEL USUARIO Y BOTÓN DE CERRAR SESIÓN */}
        <div style={{ borderTop: '1px solid #27272A', paddingTop: '16px', paddingLeft: '8px', paddingRight: '8px' }}>
          <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#F8FAFC' }}>
            {usuario?.nombre || 'Usuario'}
          </div>
          <div style={{ fontSize: '11px', color: '#FFCC00', textTransform: 'capitalize', marginTop: '2px' }}>
            Rol: {usuario?.rol || 'Sin rol'}
          </div>
          <div style={{ fontSize: '11px', color: '#A1A1AA', marginBottom: '10px' }}>
            {usuario?.email}
          </div>

          <button 
            onClick={cerrarSesion}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: 'transparent',
              border: '1px solid #EF4444',
              color: '#EF4444',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Cerrar Sesión
          </button>
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