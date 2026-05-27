import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://tilebazaardemowork-production.up.railway.app', // Fallback to railway if env is not set
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically add the JWT token to every request if it exists
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
