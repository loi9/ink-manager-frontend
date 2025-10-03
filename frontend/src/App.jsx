import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
// Các import này PHẢI tồn tại trong cùng thư mục (frontend/src/)
import Dashboard from './Dashboard'; 
import UnitManager from './UnitManager';
import LogViewer from './LogViewer';
import './App.css'; 

function App() {
    return (
        <>
            {/* Logo đặt ngoài container, fixed ở góc trái */}
            <img 
                src="/logo.png" 
                alt="Ink Manager Logo" 
                className="site-logo" 
            />

            <div className="container">
                <nav>
                    <div className="logo-container">
                        <span className="app-title">LT Manager</span>
                    </div>

                    <div className="nav-links">
                        <NavLink 
                            to="/" 
                            className={({ isActive }) => (isActive ? 'active-link' : '')}
                        >
                            Dashboard & Logs
                        </NavLink>
                        
                        <NavLink 
                            to="/units" 
                            className={({ isActive }) => (isActive ? 'active-link' : '')}
                        >
                            Quản lý Hộp Mực
                        </NavLink>
                        
                        <NavLink 
                            to="/logs" 
                            className={({ isActive }) => (isActive ? 'active-link' : '')}
                        >
                            Quản lý Logs
                        </NavLink>
                    </div>
                </nav>

                <div className="app-content">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/units" element={<UnitManager />} />
                        <Route path="/logs" element={<LogViewer />} />
                    </Routes>
                </div>
            </div>
        </>
    );
}


export default App;
