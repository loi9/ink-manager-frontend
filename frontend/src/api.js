// frontend/src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://ink-manager-backend-production.up.railway.app/api",
});

export default api;
