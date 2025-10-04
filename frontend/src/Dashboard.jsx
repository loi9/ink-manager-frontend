// frontend/src/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from './services/api';

const API_URL = 'http://localhost:5000/api';

function Dashboard() {
  const [dashboardData, setDashboardData] = useState([]);
  const [printers, setPrinters] = useState([]);
  const [inkUnits, setInkUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newLog, setNewLog] = useState({
    unit_id: '', // Đã đổi từ ink_code sang unit_id
    printer_id: '',
    event_type: 'INSTALL',
    status_detail: ''
  });

  const fetchData = async () => {
    try {
      const [dashboardRes, printersRes, inkUnitsRes] = await Promise.all([
        axios.get(`${API_URL}/dashboard`),
        axios.get(`${API_URL}/printers`),
        axios.get(`${API_URL}/inkunits`),
      ]);
      setDashboardData(dashboardRes.data);
      setPrinters(printersRes.data);
      setInkUnits(inkUnitsRes.data);
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
      await axios.post(`${API_URL}/events`, newLog);
      alert('Ghi log thành công! Trạng thái hộp mực đã được cập nhật.');
      setNewLog({ unit_id: '', printer_id: '', event_type: 'INSTALL', status_detail: '' });
      fetchData(); // Tải lại dữ liệu sau khi ghi log
    } catch (error) {
      console.error("Lỗi khi ghi log:", error);
      alert(`Ghi log thất bại. Lỗi: ${error.response?.data?.error || error.message}`);
    }
  };
  
  const handleInitData = async () => {
      if (!confirm("Bạn có chắc chắn muốn XÓA TOÀN BỘ dữ liệu và khởi tạo lại dữ liệu mẫu không?")) return;
      try {
          await axios.post(`${API_URL}/init`);
          alert('Khởi tạo dữ liệu mẫu thành công!');
          fetchData();
      } catch (error) {
          alert('Khởi tạo thất bại.');
      }
  };


  if (loading) return <div className="content-loading">Đang tải dữ liệu...</div>;

  return (
	<div>
	{/*<button onClick={handleInitData} className="init-btn">
        Khởi Tạo Dữ Liệu Mẫu (Chạy lần đầu)
      </button>

      <div className="log-form-container">
        <h2>Ghi Log Sự Kiện Mới</h2>
        <form onSubmit={handleLogSubmit} className="log-form">
          
          <label>Mã Hộp Mực Riêng Biệt:</label>
          <select name="unit_id" value={newLog.unit_id} onChange={handleLogChange}>
            <option value="">-- Chọn Hộp Mực --</option>
            {inkUnits.map(unit => (
                <option key={unit.unit_id} value={unit.unit_id}>
                    {unit.unit_id} - {unit.custom_name || unit.ink_code.ink_name} ({unit.status})
                </option>
            ))}
          </select>

          <label>Máy In/Vị Trí:</label>
          <select name="printer_id" value={newLog.printer_id} onChange={handleLogChange}>
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
	</div>*/}

      <hr/>

      <h2>Bảng Quản Lý Tổng Quan (Theo Từng Hộp Mực)</h2>
      <table className="dashboard-table">
        <thead>
          <tr>
            <th>Mã Unit</th>
            <th>Tên/Loại Mực</th>
            <th>Trạng thái</th>
            <th>Máy đang SD/Vị trí</th>
            <th>Ngày Nạp Gần Nhất</th>
            <th>Tổng Lần Nạp</th>
            <th>Ngày Thay Drum Gần Nhất</th>
            <th className="highlight-col">Nạp SAU Thay Drum</th>
            <th>Chu kỳ Nạp TB</th>
          </tr>
        </thead>
        <tbody>
          {dashboardData.map((item) => (
            <tr key={item.unit_id}>
              <td>{item.unit_id}</td>
              <td>{item.ink_name}</td>
              <td className={item.status === 'IN_STOCK' ? 'low-stock' : ''}>{item.status}</td>
              <td>{item.printer_using}</td>
              <td>{item.latest_refill_date}</td>
              <td>{item.total_refill_count}</td>
              <td>{item.latest_drum_date}</td>
              <td className="highlight-col count-result">{item.refills_after_drum}</td> 
              <td>{item.avg_refill_cycle}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


export default Dashboard;
