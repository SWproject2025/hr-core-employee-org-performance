import axios from 'axios';

// 🛑 STOP: Do not use relative paths like '/auth'
// ✅ GO: Use the full http://localhost:3000/auth address
const API_URL = 'http://localhost:3000/auth'; 

export const AuthService = {
  login: async (credentials: any) => {
    // This logs where we are sending the request (for debugging)
    console.log(`Sending Login to: ${API_URL}/login`); 
    
    const { data } = await axios.post(`${API_URL}/login`, credentials);
    if (data.access_token) {
      localStorage.setItem('access_token', data.access_token);
    }
    return data;
  },

  register: async (userData: any) => {
    // This logs where we are sending the request
    console.log(`Sending Register to: ${API_URL}/register`);

    const { data } = await axios.post(`${API_URL}/register`, userData);
    return data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
    window.location.href = '/login';
  }
};