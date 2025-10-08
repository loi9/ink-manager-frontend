import React, { useState, useEffect } from 'react';
import axios from './api';
import './LogViewer.css';

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

  const [editingLog, setEditingLog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [inkUnitsRes, printersRes, logsRes] = await Promise.all([
        axios.get('/inkunits'),
        axios.get('/printers'),
        axios.get('/logs')
      ]);
      setInkUnits(inkUnitsRes.data);
      setPrinters(printersRes.data);
      setLogs(logsRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ==== Ghi log mới ====
  const handleLogChange = (e) => setNewLog({ ...newLog, [e.target.name]: e.target.value });

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    if (!newLog.unit_id || !newLog.printer_id) {
      alert("Vui lòng chọn Mã Hộp Mực và Máy In.");
      return;
    }
    try {
      await axios.post('/events', newLog);
      alert('Ghi log thành công!');
      setNewLog({ unit_id: '', printer_id: '', event_type: 'INSTALL', status_detail: '' });
      fetchData();
    } catch (err) {
      alert(`Ghi log thất bại: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleDeleteLog = async (logId) => {
    if (!confirm("Bạn có chắc chắn muốn xóa Log này?")) return;
    try {
      await axios.delete(`/logs/${logId}`);
      fetchData();
    } catch (err) {
      alert(`Xóa log thất bại: ${err.message}`);
    }
  };

  // ==== Chỉnh sửa log ====
  const handleEditClick = (log) => {
    const localDate = log.date ? new Date(log.date).toISOString().slice(0,16) : '';
    setEditingLog({ ...log, date: localDate });
    setIsModalOpen(true);
  };

  const handleEditingLogChange = (e) => {
    setEditingLog({ ...editingLog, [e.target.name]: e.target.value });
  };

  const handleUpdateLog = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        unit_id: editingLog.unit_id,
        printer_id: editingLog.printer_id,
        event_type: editingLog.event_type,
        status_detail: editingLog.status_detail || '',
        date: new Date(editingLog.date)
      };
      await axios.put(`/logs/${editingLog._id}`, payload);
      alert('Cập nhật log thành công!');
      setEditingLog(null);
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(`Cập nhật thất bại: ${err.response?.data?.error || err.message}`);
    }
  };

  if (loading) return <div className="content-loading">Đang tải dữ liệu...</div>;

  return (
    <div className="log-viewer">
      {/* Form Ghi log mới */}
      <div className="log-form-container">
        <h2>Ghi Log Sự Kiện Mới</h2>
        <form onSubmit={handleLogSubmit} className="log-form">
          <label>Mã Hộp Mực:</label>
          <select name="unit_id" value={newLog.unit_id} onChange={handleLogChange} required>
            <option value="">-- Chọn Hộp Mực --</option>
            {inkUnits.map(u => <option key={u.unit_id} value={u.unit_id}>{u.unit_id} - {u.custom_name || u.ink_code}</option>)}
          </select>

          <label>Máy In:</label>
          <select name="printer_id" value={newLog.printer_id} onChange={handleLogChange} required>
            <option value="">-- Chọn Máy In --</option>
            {printers.map(p => <option key={p.printer_id} value={p.printer_id}>{p.printer_name}</option>)}
          </select>

          <label>Loại Sự Kiện:</label>
          <select name="event_type" value={newLog.event_type} onChange={handleLogChange}>
            <option value="INSTALL">Lắp Mới</option>
            <option value="REFILL">Nạp Mực</option>
            <option value="DRUM_REPLACE">Thay Drum</option>
            <option value="DISPOSE">Hủy</option>
          </select>

          <label>Chi Tiết:</label>
          <input type="text" name="status_detail" value={newLog.status_detail} onChange={handleLogChange} />

          <button type="submit">Ghi Log</button>
        </form>
      </div>

      <hr />

      {/* Bảng logs */}
      <h2>Lịch Sử Sự Kiện</h2>
      {logs.length === 0 ? <p>Không có log nào.</p> :
        <table className="dashboard-tables">
          <thead>
            <tr>
              <th>ID</th><th>Ngày</th><th>Unit</th><th>Máy In</th><th>Sự Kiện</th><th>Chi Tiết</th><th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log._id}>
                <td>{log._id.slice(0,8)}...</td>
                <td>{new Date(log.date).toLocaleString()}</td>
                <td>{log.unit_id}</td>
                <td>{log.printer_id}</td>
                <td>{log.event_type}</td>
                <td>{log.status_detail}</td>
                <td>
                  <button onClick={() => handleEditClick(log)}>Sửa</button>
                  <button onClick={() => handleDeleteLog(log._id)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      }

      {/* Modal */}
      {isModalOpen && editingLog && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Chỉnh Sửa Log</h2>
            <form onSubmit={handleUpdateLog}>
              <label>Ngày & Giờ:</label>
              <input type="datetime-local" name="date" value={editingLog.date} onChange={handleEditingLogChange} />

              <label>Mã Hộp Mực:</label>
              <select name="unit_id" value={editingLog.unit_id} onChange={handleEditingLogChange}>
                {inkUnits.map(u => <option key={u.unit_id} value={u.unit_id}>{u.unit_id} - {u.custom_name || u.ink_code}</option>)}
              </select>

              <label>Máy In:</label>
              <select name="printer_id" value={editingLog.printer_id} onChange={handleEditingLogChange}>
                {printers.map(p => <option key={p.printer_id} value={p.printer_id}>{p.printer_name}</option>)}
              </select>

              <label>Loại Sự Kiện:</label>
              <select name="event_type" value={editingLog.event_type} onChange={handleEditingLogChange}>
                <option value="INSTALL">Lắp Mới</option>
                <option value="REFILL">Nạp Mực</option>
                <option value="DRUM_REPLACE">Thay Drum</option>
                <option value="DISPOSE">Hủy</option>
              </select>

              <label>Chi Tiết:</label>
              <input type="text" name="status_detail" value={editingLog.status_detail || ''} onChange={handleEditingLogChange} />

              <div className="modal-buttons">
                <button type="submit">Cập nhật</button>
                <button type="button" onClick={() => setIsModalOpen(false)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default LogViewer;

