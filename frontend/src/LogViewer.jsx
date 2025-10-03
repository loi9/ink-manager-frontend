// frontend/src/LogViewer.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function LogViewer() {
    // Dữ liệu cho Bảng Logs và Form Dropdown
    const [logs, setLogs] = useState([]);
    const [inkUnits, setInkUnits] = useState([]); // Danh sách hộp mực riêng biệt
    const [printers, setPrinters] = useState([]); // Danh sách máy in
    const [loading, setLoading] = useState(true);

    // State cho Form Ghi Log Mới (Đã chuyển từ Dashboard)
    const [newLog, setNewLog] = useState({
        unit_id: '',
        printer_id: '',
        event_type: 'INSTALL',
        status_detail: ''
    });

    const fetchData = async () => {
        try {
            // Tải 3 loại dữ liệu cần thiết: Hộp mực, Máy in (cho Form) và Logs (cho Bảng)
            const [inkUnitsRes, printersRes, logsRes] = await Promise.all([
                axios.get(`${API_URL}/inkunits`),
                axios.get(`${API_URL}/printers`),
                axios.get(`${API_URL}/logs`),
            ]);
            
            setInkUnits(inkUnitsRes.data);
            setPrinters(printersRes.data);
            setLogs(logsRes.data);
            setLoading(false);
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleLogChange = (e) => {
        setNewLog({ ...newLog, [e.target.name]: e.target.value });
    };

    const handleLogSubmit = async (e) => {
        e.preventDefault();
        // Kiểm tra logic tối thiểu cho việc ghi log
        if (!newLog.unit_id || !newLog.printer_id) {
            alert("Vui lòng chọn Mã Hộp Mực RIÊNG BIỆT và Máy In.");
            return;
        }
        try {
            await axios.post(`${API_URL}/events`, newLog);
            alert('Ghi log thành công! Trạng thái hộp mực đã được cập nhật.');
            setNewLog({ unit_id: '', printer_id: '', event_type: 'INSTALL', status_detail: '' });
            fetchData(); // Tải lại logs và dropdowns sau khi ghi log
        } catch (error) {
            console.error("Lỗi khi ghi log:", error);
            alert(`Ghi log thất bại. Lỗi: ${error.response?.data?.error || error.message}`);
        }
    };

    const handleDeleteLog = async (logId) => {
        if (!confirm("Bạn có chắc chắn muốn xóa Log này? Hành động này không thể hoàn tác và có thể làm sai lệch dữ liệu thống kê.")) return;
        try {
            await axios.delete(`${API_URL}/logs/${logId}`);
            alert('Xóa Log thành công! Vui lòng làm mới trang Dashboard để xem sự thay đổi.');
            fetchData(); // Tải lại logs sau khi xóa
        } catch (error) {
            alert(`Xóa Log thất bại: ${error.response?.data?.error || error.message}`);
        }
    };

    if (loading) return <div className="content-loading">Đang tải dữ liệu...</div>;
    
    // Nếu không có Logs nào nhưng tải dữ liệu đã xong, vẫn hiển thị Form để người dùng tạo Log đầu tiên
    const isLogsEmpty = logs.length === 0;

    return (
        <div>
            
            {/* Form Ghi Log Mới (Đã chuyển từ Dashboard) */}
            <div className="log-form-container">
                <h2>Ghi Log Sự Kiện Mới</h2>
                <form onSubmit={handleLogSubmit} className="log-form">
                    
                    <label>Mã Hộp Mực Riêng Biệt:</label>
                    <select name="unit_id" value={newLog.unit_id} onChange={handleLogChange} required>
                        <option value="">-- Chọn Hộp Mực --</option>
                        {inkUnits.map(unit => (
                            <option key={unit.unit_id} value={unit.unit_id}>
                                {unit.unit_id} - {unit.custom_name || unit.ink_code.ink_name} ({unit.status})
                            </option>
                        ))}
                    </select>

                    <label>Máy In/Vị Trí:</label>
                    <select name="printer_id" value={newLog.printer_id} onChange={handleLogChange} required>
                        <option value="">-- Chọn Máy In --</option>
                        {printers.map(printer => <option key={printer.printer_id} value={printer.printer_id}>{printer.printer_name} ({printer.printer_id})</option>)}
                    </select>
                    
                    <label>Loại Sự Kiện:</label>
                    <select name="event_type" value={newLog.event_type} onChange={handleLogChange}>
                        <option value="INSTALL">Lắp Mới (Trạng thái: INSTALLED)</option>
                        <option value="REFILL">Nạp Mực</option>
                        <option value="DRUM_REPLACE">Thay Drum</option>
                        <option value="DISPOSE">Hủy (Trạng thái: DISPOSED)</option>
                    </select>
                    
                    <label>Chi Tiết (Tùy chọn):</label>
                    <input type="text" name="status_detail" value={newLog.status_detail} onChange={handleLogChange} />
                    
                    <button type="submit">Ghi Log</button>
                </form>
            </div>
            
            <hr/>

            {/* Bảng Logs Chi Tiết */}
            <div>
                <h2>Lịch Sử Sự Kiện (Event Logs)</h2>

                {isLogsEmpty ? (
                    <div style={{ padding: '20px', color: 'gray', textAlign: 'center' }}>
                        Không tìm thấy Logs nào. Vui lòng ghi Log sự kiện đầu tiên ở Form trên.
                    </div>
                ) : (
                    <table className="dashboard-table">
                        <thead>
                            <tr>
                                <th>ID Log</th>
                                <th>Ngày</th>
                                <th>Mã Unit</th>
                                <th>Máy In</th>
                                <th>Loại Sự Kiện</th>
                                <th>Chi Tiết</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => (
                                <tr key={log._id}>
                                    <td>{log._id.slice(0, 8)}...</td>
                                    <td>{new Date(log.date).toLocaleString()}</td>
                                    <td>{log.unit_id}</td>
                                    <td>{log.printer_id}</td>
                                    <td>{log.event_type}</td>
                                    <td>{log.status_detail}</td>
                                    <td>
                                        <button onClick={() => handleDeleteLog(log._id)} className="delete-btn">Xóa</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default LogViewer;