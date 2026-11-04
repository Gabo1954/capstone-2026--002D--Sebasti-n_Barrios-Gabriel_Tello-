import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout';
import MovimientosPage from './pages/MovimientosPage';
import DashboardPage from './pages/DashboardPage';
import ProyectosPage from './pages/ProyectosPage';
import CargaMasivaPage from './pages/CargaMasivaPage';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/movimientos" element={<MovimientosPage />} />
          <Route path="/proyectos" element={<ProyectosPage />} />
          <Route path="/carga-masiva" element={<CargaMasivaPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;