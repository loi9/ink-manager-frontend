// frontend/src/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import api from './api';   // ✅ dùng api đã cấu hình sẵn baseURL

function Dashboard() {
  const [dashboardData, setDashboardData] = useState([]);
  const [printers, setPrinters] = useState([]);
  const [inkUnits, setInkUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newLog, setNewLog] = useState({
    unit_id: '', 
    printer_id: '',
    event_type: 'INSTALL',
    status_detail: ''
  });

  const fetchData = async () => {
    try {
      const [dashboardRes, printersRes, inkUnitsRes] = await Promise.all([
        api.get("/dashboard"),   // ✅ không cần API_URL
        api.get("/printers"),
        api.get("/inkunits"),
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
      await api.post("/events", newLog);   // ✅ dùng api
      alert('Ghi log thành công! Trạng thái hộp mực đã được cập nhật.');
      setNewLog({ unit_id: '', printer_id: '', event_type: 'INSTALL', status_detail: '' });
      fetchData(); 
    } catch (error) {
      console.error("Lỗi khi ghi log:", error);
      alert(`Ghi log thất bại. Lỗi: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleInitData = async () => {
    if (!confirm("Bạn có chắc chắn muốn XÓA TOÀN BỘ dữ liệu và khởi tạo lại dữ liệu mẫu không?")) return;
    try {
      await api.post("/init");   // ✅ dùng api
      alert('Khởi tạo dữ liệu mẫu thành công!');
      fetchData();
    } catch (error) {
      alert('Khởi tạo thất bại.');
    }
  };

  if (loading) return <div className="content-loading">Đang tải dữ liệu...</div>;

  return (
    <div>
      {/* 
      <button onClick={handleInitData} className="init-btn">
        Khởi Tạo Dữ Liệu Mẫu (Chạy lần đầu)
      </button>
      ...
      */}

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

