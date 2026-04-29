import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage or auth store
    const token = sessionStorage.getItem('acvs_token') || localStorage.getItem('acvs_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config || {};

    // Handle 401 unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear auth data and redirect to login
      sessionStorage.removeItem('acvs_token');
      sessionStorage.removeItem('acvs_user');
      localStorage.removeItem('acvs_token');
      localStorage.removeItem('acvs_user');
      
      // You could implement token refresh logic here
      // For now, we'll just redirect to login
      window.location.href = '/auth/signin';
      return Promise.reject(error);
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      return Promise.reject({
        ...error,
        message: 'Network error. Please check your connection and try again.',
      });
    }

    // Handle server errors
    if (error.response.status >= 500) {
      console.error('Server error:', error.response.data?.message || error.message);
      return Promise.reject({
        ...error,
        message: 'Server error. Please try again later.',
      });
    }

    // Handle client errors
    if (error.response.status >= 400 && error.response.status < 500) {
      const message = error.response.data?.message || error.response.data?.errors?.[0] || 'Request failed';
      return Promise.reject({
        ...error,
        message,
      });
    }

    return Promise.reject(error);
  }
);

// Retry configuration for failed requests
const retryConfig = {
  retries: 3,
  retryDelay: (retryCount) => Math.pow(2, retryCount) * 1000, // Exponential backoff
  retryCondition: (error) => {
    return (
      error.code === 'ECONNABORTED' || // Timeout
      error.code === 'ENOTFOUND' || // DNS lookup failed
      error.code === 'ECONNRESET' || // Connection reset
      (error.response?.status ? error.response.status >= 500 : false) // Server errors
    );
  },
};

// Enhanced request function with retry logic
export const makeRequest = async (config, retryCount = 0) => {
  try {
    return await api(config);
  } catch (error) {
    if (
      retryCount < retryConfig.retries &&
      retryConfig.retryCondition(error)
    ) {
      const delay = retryConfig.retryDelay(retryCount);
      console.warn(`Request failed, retrying in ${delay}ms (attempt ${retryCount + 1}/${retryConfig.retries})`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return makeRequest(config, retryCount + 1);
    }
    
    throw error;
  }
};

// Utility functions for common request patterns
export const apiGet = (url, config) =>
  makeRequest({ method: 'GET', url, ...config });

export const apiPost = (url, data, config) =>
  makeRequest({ method: 'POST', url, data, ...config });

export const apiPut = (url, data, config) =>
  makeRequest({ method: 'PUT', url, data, ...config });

export const apiDelete = (url, config) =>
  makeRequest({ method: 'DELETE', url, ...config });

export const apiPatch = (url, data, config) =>
  makeRequest({ method: 'PATCH', url, data, ...config });

// File upload helper
export const uploadFile = async (url, file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return makeRequest({
    method: 'POST',
    url,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: onProgress,
  });
};

// Batch file upload helper
export const uploadFiles = async (url, files, onProgress) => {
  const formData = new FormData();
  files.forEach((file, index) => {
    formData.append(`files[${index}]`, file);
  });
  
  return makeRequest({
    method: 'POST',
    url,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: onProgress,
  });
};

export default api;