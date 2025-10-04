// frontend/src/LogViewer.jsx
import React, { useState, useEffect } from 'react';
import axios from './api';   // ✅ dùng axios config sẵn (baseURL đã set ở services/api.js)

function LogViewer() {
    const [logs, setLogs] = useState([]);
    const [inkUnits, setInkUnits] = useState([]);
    const [printers, setPrinters] = useState([]);
    const [loading, setLoading] = useState(true);

    const [newLog, setNewLog] = useState({
        unit_id: '',
        printer_id: '',
        event_type: 'INSTALL',
        status_detail: ''
    });

    const fetchData = async () => {
        try {
            const [inkUnitsRes, printersRes, logsRes] = await Promise.all([
                axios.get('/inkunits'),
                axios.get('/printers'),
                axios.get('/logs'),
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
        if (!newLog.unit_id || !newLog.printer_id) {
            alert("Vui lòng chọn Mã Hộp Mực RIÊNG BIỆT và Máy In.");
            return;
        }
        try {
            await axios.post('/events', newLog);
            alert('Ghi log thành công! Trạng thái hộp mực đã được cập nhật.');
            setNewLog({ unit_id: '', printer_id: '', event_type: 'INSTALL', status_detail: '' });
            fetchData();
        } catch (error) {
            console.error("Lỗi khi ghi log:", error);
            alert(`Ghi log thất bại. Lỗi: ${error.response?.data?.error || error.message}`);
        }
    };

    const handleDeleteLog = async (logId) => {
        if (!confirm("Bạn có chắc chắn muốn xóa Log này?")) return;
        try {
            await axios.delete(`/logs/${logId}`);
            alert('Xóa Log thành công! Vui lòng làm mới trang Dashboard để xem sự thay đổi.');
            fetchData();
        } catch (error) {
            alert(`Xóa Log thất bại: ${error.response?.data?.error || error.message}`);
        }
    };

    if (loading) return <div className="content-loading">Đang tải dữ liệu...</div>;

    const isLogsEmpty = logs.length === 0;

    return (
        <div>
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
                        {printers.map(printer => (
                            <option key={printer.printer_id} value={printer.printer_id}>
                                {printer.printer_name} ({printer.printer_id})
                            </option>
                        ))}
                    </select>
                    
                    <label>Loại Sự Kiện:</label>
                    <select name="event_type" value={newLog.event_type} onChange={handleLogChange}>
                        <option value="INSTALL">Lắp Mới (INSTALLED)</option>
                        <option value="REFILL">Nạp Mực</option>
                        <option value="DRUM_REPLACE">Thay Drum</option>
                        <option value="DISPOSE">Hủy (DISPOSED)</option>
                    </select>
                    
                    <label>Chi Tiết (Tùy chọn):</label>
                    <input type="text" name="status_detail" value={newLog.status_detail} onChange={handleLogChange} />
                    
                    <button type="submit">Ghi Log</button>
                </form>
            </div>
            
            <hr/>

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

