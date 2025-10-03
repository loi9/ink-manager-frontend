// frontend/src/services/api.js
import axios from "axios";

// Lấy URL backend từ environment variable (Vite)
const backendURL = import.meta.env.VITE_API_URL;

// Nếu không có VITE_API_URL, fallback về backend Render
const baseURL = backendURL ? backendURL : "https://ink-manager-backend.onrender.com/api";

console.log("API Base URL:", baseURL);

// Tạo instance Axios
const api = axios.create({
  baseURL: baseURL,
  timeout: 10000, // 10 giây timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptors để debug request/response
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
