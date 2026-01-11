import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token from localStorage
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token storage
axiosInstance.interceptors.response.use(
  (response) => {
    // Store token if it comes in the response (adjust based on your API)
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response;
  },
  (error) => {
    // Handle 401 errors (unauthorized) - clear token and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Optionally redirect to login page
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
