// src/api/config.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Make sure this matches your backend URL
  timeout: 10000, 
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- ADD THIS INTERCEPTOR ---
// This code runs BEFORE any request is sent
api.interceptors.request.use(
  (config) => {
    // 1. Get the token from localStorage
    const token = localStorage.getItem('token');

    // 2. If the token exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 3. Return the modified config
    return config;
  },
  (error) => {
    // Handle request error
    return Promise.reject(error);
  }
);
// --- END OF NEW CODE ---

export default api;