// frontend/src/services/api.js
import axios from "axios";
console.log("API URL:", import.meta.env.VITE_API_URL);
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://ink-manager-backend.onrender.com/api",
});

export default api;
