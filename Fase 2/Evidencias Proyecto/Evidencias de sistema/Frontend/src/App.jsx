import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout';
import Login from './pages/Login';
import Home from './pages/Home'; // Importamos el nuevo Home
import Dashboard from './pages/DashboardPage';
import Movimientos from './pages/MovimientosPage';
import Proyectos from './pages/ProyectosPage';
import CargaMasivaPage from './pages/CargaMasivaPage';
import FlujoCaja from './pages/FlujoCajaPage';
import Proyecciones from './pages/ProyeccionesPage';
import RealtimeExcel from './pages/RealtimeExcel'; // Ajusta el nombre de importación al de tu archivo (ej: RealtimeExcel_3)

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuarioZoron');
    if (usuarioGuardado) {
      try {
        setUsuario(JSON.parse(usuarioGuardado));
      } catch (error) {
        localStorage.removeItem('usuarioZoron');
      }
    }
    setCargando(false);
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem('usuarioZoron');
    setUsuario(null);
  };

  if (cargando) {
    return <div style={{ backgroundColor: '#0D0D0D', height: '100vh', color: 'white', padding: '20px' }}>Cargando sistema ZORON...</div>;
  }

  if (!usuario) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<Login setUsuario={setUsuario} />} />
        </Routes>
      </BrowserRouter>
    );
  }

  // Normalizar el rol del usuario ignorando mayúsculas/minúsculas y espacios[cite: 22]
  const rolUsuario = usuario?.rol ? String(usuario.rol).trim().toLowerCase() : '';

  return (
    <BrowserRouter>
      {/* Pasamos el usuario a Layout para que el menú evalúe si es admin o no[cite: 22] */}
      <Layout usuario={usuario} cerrarSesion={cerrarSesion}>
        <Routes>
          {/* RUTAS PÚBLICAS (ACCESIBLES PARA TODOS) */}
          <Route path="/" element={<Home usuario={usuario} />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/movimientos" element={<Movimientos usuario={usuario} />} />
          <Route path="/flujo-caja" element={<FlujoCaja />} />
          <Route path="/proyectos" element={<Proyectos />} />
          <Route path="/excel" element={<RealtimeExcel />} />
          
          {/* RUTAS PROTEGIDAS SOLO PARA ADMINISTRADOR[cite: 22] */}
          <Route 
            path="/carga-masiva" 
            element={rolUsuario === 'administrador' ? <CargaMasivaPage /> : <Navigate to="/" replace />} 
          />
          <Route 
            path="/proyecciones" 
            element={rolUsuario === 'administrador' ? <Proyecciones /> : <Navigate to="/" replace />} 
          />

          {/* RUTA COMODÍN PARA REDIRIGIR RUTAS INEXISTENTES */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}