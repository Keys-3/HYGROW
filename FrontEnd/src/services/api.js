/**
 * Farm Help — API Service
 */

import axios from 'axios';
import Config from '../utils/config';

const api = axios.create({
  baseURL: Config.api.baseUrl,
  timeout: Config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach auth token
api.interceptors.request.use(
  (config) => {
    // SWAP: Get token from secure storage if needed
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle errors globally
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message;
    console.error(`[API Error] ${error.config.method?.toUpperCase()} ${error.config.url}:`, message);
    
    if (error.response?.status === 401) {
      // Handle Unauthorized
    }
    return Promise.reject(error);
  }
);

export default api;
