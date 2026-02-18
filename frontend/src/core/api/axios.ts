import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { env } from '../../config/env';

const axiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach JWT token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - unwrap data & handle 401
axiosInstance.interceptors.response.use(
  (response) => {
    // Backend wraps responses in { success: boolean, data: T, meta?: ... }
    // We unwrap the data field so components get T directly
    if (response.data && response.data.data !== undefined) {
      // Attach meta to response if it exists for pagination help
      if (response.data.meta) {
        (response as any).meta = response.data.meta;
      }
      return { ...response, data: response.data.data };
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && originalRequest) {
      // Try to refresh the token
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          // Use axiosInstance to go through interceptors, but skip the 401 retry to avoid infinite loop
          const response = await axios.post(`${env.apiBaseUrl}/auth/refresh`, {
            refreshToken,
          });
          
          // Backend wraps response: { data: { tokens: { accessToken, refreshToken, expiresIn } } }
          const tokens = response.data.data.tokens;
          const { accessToken, refreshToken: newRefreshToken } = tokens;
          
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          // Retry the original request
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - clear tokens and redirect to login
        console.error('[Axios] Token refresh failed:', refreshError);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    console.error('[Axios] Request failed:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    return Promise.reject(error);
  }
);

export default axiosInstance;