import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - can be used for adding user_id or other headers if needed
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Backend doesn't use JWT tokens currently
    // If needed in the future, you can add user_id or token here
    const userId = localStorage.getItem('user_id');
    if (userId && config.headers) {
      // Some endpoints might need user_id in headers or params
      // This is a placeholder for future authentication
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    // Backend doesn't use JWT tokens, so we just return the response
    return response;
  },
  (error) => {
    // Handle 401 errors (unauthorized) - clear user data
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      localStorage.removeItem('user_id');
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
