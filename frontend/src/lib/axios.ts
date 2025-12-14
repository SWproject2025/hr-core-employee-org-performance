import axios from 'axios';

// Assuming your NestJS runs on port 3000
const api = axios.create({
  baseURL: 'http://localhost:3000', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add Interceptor for Auth Token (Assuming you store JWT in localStorage)
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.jm_token; // Or however you store your auth token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;