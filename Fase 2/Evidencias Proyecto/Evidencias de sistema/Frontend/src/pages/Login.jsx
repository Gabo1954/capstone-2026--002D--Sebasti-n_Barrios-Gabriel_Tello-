import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Importar el logo guardado en src/assets
import logoZoron from '../assets/logo zoron.png';

export default function Login({ setUsuario }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!aceptaTerminos) {
      setError('Debe aceptar la política de tratamiento de datos personales para ingresar.');
      return;
    }

    try {
      const res = await axios.post('http://localhost:3000/api/auth/login', { email, password });
      
      // En tu backend, res.data contiene directamente el objeto usuario
      const usuarioData = res.data.usuario || res.data;

      localStorage.setItem('usuarioZoron', JSON.stringify(usuarioData));
      setUsuario(usuarioData);
      navigate('/');
    } catch (err) {
      console.error('Error en Login:', err);
      setError(err.response?.data?.mensaje || 'Error al iniciar sesión');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0D0D0D'
    }}>
      <div style={{
        backgroundColor: '#121212',
        border: '1px solid #27272A',
        borderRadius: '8px',
        padding: '32px',
        width: '380px',
        color: '#FFFFFF'
      }}>
        {/* ENCABEZADO CON LOGO DE LA EMPRESA */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <img 
            src={logoZoron} 
            alt="Logo Zoron" 
            style={{ 
              height: '150px', 
              width: 'auto', 
              objectFit: 'contain',
              marginBottom: '12px' 
            }} 
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <h2 style={{ color: '#FFCC00', margin: 0, fontSize: '24px', fontWeight: 'bold' }}>ZORON</h2>
          <span style={{ fontSize: '12px', color: '#A1A1AA' }}>Plataforma de Control Financiero</span>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            color: '#F87171',
            padding: '10px',
            borderRadius: '6px',
            fontSize: '12px',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#A1A1AA', marginBottom: '6px' }}>
              Correo electrónico
            </label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@zoron.cl"
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#1E1E1E',
                border: '1px solid #27272A',
                borderRadius: '6px',
                color: '#FFFFFF',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#A1A1AA', marginBottom: '6px' }}>
              Contraseña
            </label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#1E1E1E',
                border: '1px solid #27272A',
                borderRadius: '6px',
                color: '#FFFFFF',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Consentimiento Ley de Protección de Datos Chile */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <input 
              type="checkbox"
              id="terminos"
              checked={aceptaTerminos}
              onChange={(e) => setAceptaTerminos(e.target.checked)}
              style={{ marginTop: '3px' }}
            />
            <label htmlFor="terminos" style={{ fontSize: '11px', color: '#A1A1AA', lineHeight: '1.4' }}>
              Acepto la política de uso y privacidad para el tratamiento de datos personales según la normativa vigente en Chile.
            </label>
          </div>

          <button 
            type="submit" 
            style={{
              marginTop: '8px',
              padding: '12px',
              backgroundColor: '#FFCC00',
              color: '#0D0D0D',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
}