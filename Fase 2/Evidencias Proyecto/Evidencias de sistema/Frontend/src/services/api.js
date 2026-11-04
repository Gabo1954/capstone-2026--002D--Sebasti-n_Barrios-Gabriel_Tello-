import axios from 'axios';

// Conexión centralizada hacia el Backend en localhost:3000
const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Apunta directo al Backend local
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;