import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Debug: print configured API base URL at runtime (visible in browser console)
try {
  // eslint-disable-next-line no-console
  console.log('API baseURL:', API_URL);
} catch (e) {}

const api = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    } else {
      delete config.headers["Content-Type"];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle specific status codes
      if (error.response.status === 401) {
        const currentPath = window.location.pathname;
        const isPublicPage = currentPath === '/register' || currentPath === '/teacher/register' || currentPath === '/admin/login' || currentPath === '/application-form';
        
        if (!isPublicPage) {
          // Handle unauthorized access only for protected pages
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
