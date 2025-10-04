// frontend/src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://ink-manager-backend.onrender.com/api",
});

export default api;
