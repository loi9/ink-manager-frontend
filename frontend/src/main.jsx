// frontend/src/main.jsx (Cập nhật để sử dụng Router)
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './App.css'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> {/* THÊM BrowserRouter */}
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);