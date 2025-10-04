// frontend/src/UnitManager.jsx
import React, { useState, useEffect } from 'react';
import axios from './api';   // ✅ Dùng axios client chung (baseURL auto)

function UnitManager() {
    const [units, setUnits] = useState([]);
    const [inkCatalogue, setInkCatalogue] = useState([]); 
    const [printers, setPrinters] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [editingUnit, setEditingUnit] = useState(null);

    const [newUnit, setNewUnit] = useState({
        unit_id: '',
        custom_name: '',
        ink_code: '',
        status: 'IN_STOCK',
        current_printer_id: null,
    });

    const fetchData = async () => {
        try {
            const [unitsRes, inksRes, printersRes] = await Promise.all([
                axios.get('/inkunits'),
                axios.get('/inks'),
                axios.get('/printers'), 
            ]);
            
            setUnits(unitsRes.data);
            setInkCatalogue(inksRes.data);
            setPrinters(printersRes.data);
            setLoading(false);
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (e) => {
        setNewUnit({ ...newUnit, [e.target.name]: e.target.value });
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;

        if (name === 'status' && (value === 'IN_STOCK' || value === 'DISPOSED')) {
            setEditingUnit({ ...editingUnit, [name]: value, current_printer_id: null });
        } else {
            setEditingUnit({ ...editingUnit, [name]: value });
        }
    };

    // --- Tạo mới Unit ---
    const handleCreateUnit = async (e) => {
        e.preventDefault();
        if (!newUnit.unit_id || !newUnit.ink_code) {
            alert("Mã Unit ID và Mã Loại Mực không được để trống.");
            return;
        }
        try {
            await axios.post('/inkunits', newUnit); 
            alert('Tạo hộp mực mới thành công!');
            setNewUnit({ unit_id: '', custom_name: '', ink_code: '', status: 'IN_STOCK', current_printer_id: null });
            fetchData();
        } catch (error) {
            alert(`Tạo hộp mực thất bại. Lỗi: ${error.response?.data?.error || error.message}`);
        }
    };

    // --- Xóa Unit ---
    const handleDeleteUnit = async (unitId) => {
        if (!confirm(`Bạn có chắc chắn muốn XÓA vĩnh viễn Unit ${unitId} và TẤT CẢ logs liên quan?`)) return;
        try {
            await axios.delete(`/inkunits/${unitId}`);
            alert('Đã xóa hộp mực thành công!');
            fetchData();
        } catch (error) {
            alert(`Xóa thất bại. Lỗi: ${error.response?.data?.error || error.message}`);
        }
    };

    // --- Cập nhật Unit ---
    const handleUpdateUnit = async (e) => {
        e.preventDefault();
        try {
            const updatePayload = {
                custom_name: editingUnit.custom_name,
                status: editingUnit.status,
                current_printer_id: (editingUnit.status === 'IN_STOCK' || editingUnit.status === 'DISPOSED')
                    ? null
                    : editingUnit.current_printer_id, 
            };

            await axios.put(`/inkunits/${editingUnit.unit_id}`, updatePayload);
            alert('Cập nhật hộp mực thành công!');
            setEditingUnit(null);
            fetchData();
        } catch (error) {
            alert(`Cập nhật thất bại. Lỗi: ${error.response?.data?.error || error.message}`);
        }
    };

    if (loading) return <div className="content-loading">Đang tải dữ liệu...</div>;

    return (
        <div>
            <h2>Tạo Hộp Mực Riêng Biệt Mới</h2>
            <div className="log-form-container">
                <form onSubmit={handleCreateUnit} className="log-form">
                    <label>Mã Unit ID (Duy nhất):</label>
                    <input type="text" name="unit_id" value={newUnit.unit_id} onChange={handleChange} required/>
                    
                    <label>Tên Tùy Chỉnh (Tùy chọn):</label>
                    <input type="text" name="custom_name" value={newUnit.custom_name} onChange={handleChange} />

                    <label>Mã Loại Mực:</label>
                    <select name="ink_code" value={newUnit.ink_code} onChange={handleChange} required>
                        <option value="">-- Chọn Loại Mực --</option>
                        {inkCatalogue.map(ink => (
                            <option key={ink.ink_code} value={ink.ink_code}>
                                {ink.ink_name} ({ink.ink_code})
                            </option>
                        ))}
                    </select>

                    <label>Trạng thái Ban đầu:</label>
                    <select name="status" value={newUnit.status} onChange={handleChange}>
                        <option value="IN_STOCK">Tồn Kho (IN_STOCK)</option>
                        <option value="INSTALLED">Đã Lắp (INSTALLED)</option>
                        <option value="DISPOSED">Đã Hủy (DISPOSED)</option>
                    </select>
                    
                    <button type="submit">Tạo Hộp Mực</button> 
                </form>
            </div>
            
            <hr/>
            <h2>Danh Sách Hộp Mực Đang Hoạt Động ({units.length})</h2>
            <table className="dashboard-table">
                <thead>
                    <tr>
                        <th>Mã Unit</th>
                        <th>Tên Tùy Chỉnh</th>
                        <th>Loại Mực</th>
                        <th>Trạng thái</th>
                        <th>Máy đang lắp</th>
                        <th>Hành động</th> 
                    </tr>
                </thead>
                <tbody>
                    {units.map((unit) => (
                        <tr key={unit.unit_id}>
                            {editingUnit && editingUnit.unit_id === unit.unit_id ? (
                                <>
                                    <td>{unit.unit_id}</td>
                                    <td><input type="text" name="custom_name" value={editingUnit.custom_name} onChange={handleEditChange} /></td>
                                    <td>{unit.ink_code?.ink_name || unit.ink_code}</td> 
                                    <td>
                                        <select name="status" value={editingUnit.status} onChange={handleEditChange}>
                                            <option value="IN_STOCK">Tồn Kho</option>
                                            <option value="INSTALLED">Đã Lắp</option>
                                            <option value="DISPOSED">Đã Hủy</option>
                                        </select>
                                    </td>
                                    <td>
                                        <select 
                                            name="current_printer_id" 
                                            value={editingUnit.current_printer_id || ''} 
                                            onChange={handleEditChange} 
                                            disabled={editingUnit.status !== 'INSTALLED'}
                                        >
                                            <option value="">KHO</option>
                                            {printers.map(p => (
                                                <option key={p.printer_id} value={p.printer_id}>
                                                    {p.printer_id}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>
                                        <button onClick={handleUpdateUnit} className="save-btn">Lưu</button>
                                        <button onClick={() => setEditingUnit(null)} className="cancel-btn">Hủy</button>
                                    </td>
                                </>
                            ) : (
                                <>
                                    <td>{unit.unit_id}</td>
                                    <td>{unit.custom_name || 'N/A'}</td>
                                    <td>{unit.ink_code?.ink_name || unit.ink_code}</td>
                                    <td className={unit.status === 'IN_STOCK' ? 'low-stock' : ''}>{unit.status}</td>
                                    <td>{unit.current_printer_id || 'KHO'}</td>
                                    <td>
                                        <button onClick={() => setEditingUnit(unit)} className="edit-btn">Sửa</button>
                                        <button onClick={() => handleDeleteUnit(unit.unit_id)} className="delete-btn">Xóa</button>
                                    </td>
                                </>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default UnitManager;

