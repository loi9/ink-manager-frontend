// frontend/src/services/api.js
import axios from "axios";

// Kiểm tra biến môi trường VITE_API_URL
const backendURL = import.meta.env.VITE_API_URL || "https://ink-manager-backend.onrender.com/api";

console.log("API Base URL:", backendURL);

// Tạo instance Axios
const api = axios.create({
  baseURL: backendURL,
  timeout: 10000, // 10 giây timeout
  headers: {
    "Content-Type": "application/json"
  }
});

// Thêm interceptor để log request/response (debug)
api.interceptors.request.use(
  (config) => {
    console.log(`[API REQUEST] ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("[API REQUEST ERROR]", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`[API RESPONSE] ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error("[API RESPONSE ERROR]", error?.response?.status, error?.response?.data);
    return Promise.reject(error);
  }
);

export default api;
