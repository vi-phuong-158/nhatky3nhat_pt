import React, { useRef, useState } from 'react';
import { submitEntry } from '../services/api';
import { donViList } from '../constants';
import './SubmitForm.css';

export default function SubmitForm({ onFormSuccess, onClose }) {
  // @react-best-practices: Sử dụng uncontrolled inputs (useRef) 
  const nameRef = useRef(null);
  const phoneRef = useRef(null);
  const unitRef = useRef(null);
  const titleRef = useRef(null);
  const criteriaRef = useRef(null);
  const contentRef = useRef(null);
  const fileRef = useRef(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // @frontend-security-coder: Base XSS Sanitization
  const sanitizeInput = (input) => {
    if (!input) return '';
    return input.trim()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  };

  const validateImageHeader = (file) => {
    return new Promise((resolve) => {
      if (file.size > 5 * 1024 * 1024) {
        resolve({ isValid: false, error: 'Kích thước file vượt quá 5MB.' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = (e) => {
        const arr = new Uint8Array(e.target.result).subarray(0, 4);
        let header = '';
        for (let i = 0; i < arr.length; i++) {
          header += arr[i].toString(16);
        }
        if (header.startsWith('89504e47') || header.startsWith('ffd8')) {
          resolve({ isValid: true });
        } else {
          resolve({ isValid: false, error: 'File ảnh không hợp lệ (.jpg hoặc .png).' });
        }
      };
      reader.onerror = () => resolve({ isValid: false, error: 'Không thể đọc file.' });
      reader.readAsArrayBuffer(file.slice(0, 4));
    });
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const name = sanitizeInput(nameRef.current.value);
    const phone = sanitizeInput(phoneRef.current.value);
    const unit = sanitizeInput(unitRef.current.value);
    const title = sanitizeInput(titleRef.current.value);
    const criteria = sanitizeInput(criteriaRef.current.value);
    const content = sanitizeInput(contentRef.current.value);

    // Validate Input
    if (!name || !unit || !title || !criteria || !content) {
      setError('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      setLoading(false);
      return;
    }

    if (!donViList.includes(unit)) {
      setError('Vui lòng chọn tên đơn vị từ danh sách có sẵn (không được nhập ngoài).');
      setLoading(false);
      return;
    }

    const file = fileRef.current?.files?.[0];
    let fileDataObj = { base64Data: '', mimeType: '', fileName: '' };

    if (file) {
      const { isValid, error: fileError } = await validateImageHeader(file);
      if (!isValid) {
        setError(fileError);
        setLoading(false);
        return;
      }
      try {
        const base64Str = await fileToBase64(file);
        fileDataObj = {
          base64Data: base64Str,
          mimeType: file.type,
          fileName: file.name
        };
      } catch(e) {
        setError("Lỗi xử lý file ảnh.");
        setLoading(false);
        return;
      }
    }

    try {
      await submitEntry({
        hoTen: name,
        soDienThoai: phone,
        donVi: unit,
        tieuDe: title,
        tieuChi: criteria,
        noiDung: content,
        ...fileDataObj
      });
      
      setSuccess('✅ Gửi lưu bút thành công! Bài viết đang chờ Ban Phụ nữ phê duyệt.');
      // Giả lập callback cho component cha để load lại nếu cần
      if(onFormSuccess) onFormSuccess();
      
      // Reset form
      e.target.reset();
    } catch(err) {
      setError('❌ Đã xảy ra lỗi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="submit-form-container">
      <div className="form-header-row" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h2>✍️ Viết trang mới</h2>
        {onClose && (
          <button type="button" onClick={onClose} className="btn-close-form" style={{background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#666'}}>
            ✕
          </button>
        )}
      </div>
      
      {error && <div className="form-error">{error}</div>}
      {success && <div className="form-success">{success}</div>}
      
      <form onSubmit={handleSubmit} className="scrapbook-form">
        <label htmlFor="input-name">Họ và tên *</label>
        <input id="input-name" type="text" ref={nameRef} placeholder="Vd: Nguyễn Thị Lan" disabled={loading} />

        <label htmlFor="input-phone">Số điện thoại</label>
        <input id="input-phone" type="tel" inputMode="numeric" ref={phoneRef} placeholder="Nhập SĐT..." disabled={loading} />

        <label htmlFor="input-unit">Đơn vị *</label>
        <input 
          id="input-unit" 
          type="text" 
          list="donvi-list" 
          ref={unitRef} 
          placeholder="Chọn hoặc gõ tên đơn vị..." 
          disabled={loading}
          onBlur={(e) => {
            const val = e.target.value;
            if (val && !donViList.includes(val)) {
              e.target.value = '';
              if (unitRef.current) unitRef.current.value = '';
            }
          }}
        />
        <datalist id="donvi-list">
          {donViList.map((dv, index) => (
            <option key={index} value={dv} />
          ))}
        </datalist>

        <label htmlFor="input-title">Tiêu đề bài viết *</label>
        <input id="input-title" type="text" ref={titleRef} placeholder="Nhập tiêu đề..." disabled={loading} />

        <label htmlFor="select-criteria">Tiêu chí 3 Nhất *</label>
        <select id="select-criteria" ref={criteriaRef} disabled={loading}>
          <option value="">-- Chọn tiêu chí --</option>
          <option value="Kỷ luật nhất">Kỷ luật nhất</option>
          <option value="Trung thành nhất">Trung thành nhất</option>
          <option value="Gần dân nhất">Gần dân nhất</option>
        </select>

        <label htmlFor="textarea-content">Câu chuyện thi đua *</label>
        <textarea id="textarea-content" ref={contentRef} rows="5" placeholder="Hôm nay tôi đã làm..." disabled={loading}></textarea>

        <label htmlFor="input-file">Ảnh Kỷ Niệm (Chỉ JPG/PNG &lt; 5MB)</label>
        <input id="input-file" type="file" accept="image/png, image/jpeg" ref={fileRef} disabled={loading} />

        <button type="submit" className="submit-btn" disabled={loading} aria-label="Gửi lưu bút">
          {loading ? '⏳ Đang gửi...' : 'Gửi Lưu Bút'}
        </button>
      </form>
    </div>
  );
}
