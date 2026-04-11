import React, { useRef, useState } from 'react';
import { submitEntry } from '../services/api';
import { donViList } from '../constants';
import './SubmitForm.css';

export default function SubmitForm({ onFormSuccess, onClose, onToast }) {
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
  const [hasFile, setHasFile] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setHasFile(true);
      setFileName(file.name);
    } else {
      setHasFile(false);
      setFileName('');
    }
  };

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
      
      if (onToast) onToast('Gửi lưu bút thành công! Bài viết đang chờ phê duyệt.', 'success');
      else setSuccess('Gửi lưu bút thành công! Bài viết đang chờ Ban Phụ nữ phê duyệt.');
      if (onFormSuccess) onFormSuccess();
      e.target.reset();
      setHasFile(false);
      setFileName('');
    } catch(err) {
      setError('Đã xảy ra lỗi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sf-container">
      {/* ── Header ── */}
      <div className="sf-header">
        <div className="sf-header-left">
          <span className="material-symbols-outlined sf-header-icon">edit_note</span>
          <h2 className="sf-title">Viết trang mới</h2>
        </div>
        {onClose && (
          <button type="button" onClick={onClose} className="sf-btn-close" aria-label="Đóng">
            <span className="material-symbols-outlined">close</span>
          </button>
        )}
      </div>

      {/* ── Alerts ── */}
      {error && (
        <div className="sf-alert sf-alert-error">
          <span className="material-symbols-outlined sf-alert-icon">error</span>
          {error}
        </div>
      )}
      {success && (
        <div className="sf-alert sf-alert-success">
          <span className="material-symbols-outlined sf-alert-icon">check_circle</span>
          {success}
        </div>
      )}

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} className="sf-form">
        {/* Họ tên */}
        <div className="sf-field">
          <label htmlFor="input-name" className="sf-label">
            Họ và tên <span className="sf-required">*</span>
          </label>
          <div className="sf-input-wrapper">
            <span className="material-symbols-outlined sf-input-icon">person</span>
            <input id="input-name" type="text" ref={nameRef} placeholder="Vd: Nguyễn Thị Lan" disabled={loading} />
          </div>
        </div>

        {/* SĐT */}
        <div className="sf-field">
          <label htmlFor="input-phone" className="sf-label">Số điện thoại</label>
          <div className="sf-input-wrapper">
            <span className="material-symbols-outlined sf-input-icon">call</span>
            <input id="input-phone" type="tel" inputMode="numeric" ref={phoneRef} placeholder="Nhập SĐT..." disabled={loading} />
          </div>
        </div>

        {/* Đơn vị */}
        <div className="sf-field">
          <label htmlFor="input-unit" className="sf-label">
            Đơn vị <span className="sf-required">*</span>
          </label>
          <div className="sf-input-wrapper">
            <span className="material-symbols-outlined sf-input-icon">apartment</span>
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
          </div>
          <datalist id="donvi-list">
            {donViList.map((dv, index) => (
              <option key={index} value={dv} />
            ))}
          </datalist>
        </div>

        {/* Tiêu đề */}
        <div className="sf-field">
          <label htmlFor="input-title" className="sf-label">
            Tiêu đề bài viết <span className="sf-required">*</span>
          </label>
          <div className="sf-input-wrapper">
            <span className="material-symbols-outlined sf-input-icon">title</span>
            <input id="input-title" type="text" ref={titleRef} placeholder="Nhập tiêu đề..." disabled={loading} />
          </div>
        </div>

        {/* Tiêu chí */}
        <div className="sf-field">
          <label htmlFor="select-criteria" className="sf-label">
            Tiêu chí 3 Nhất <span className="sf-required">*</span>
          </label>
          <div className="sf-input-wrapper sf-select-wrapper">
            <span className="material-symbols-outlined sf-input-icon">military_tech</span>
            <select id="select-criteria" ref={criteriaRef} disabled={loading}>
              <option value="">-- Chọn tiêu chí --</option>
              <option value="Kỷ luật nhất">Kỷ luật nhất</option>
              <option value="Trung thành nhất">Trung thành nhất</option>
              <option value="Gần dân nhất">Gần dân nhất</option>
            </select>
          </div>
        </div>

        {/* Nội dung */}
        <div className="sf-field">
          <label htmlFor="textarea-content" className="sf-label">
            Câu chuyện thi đua <span className="sf-required">*</span>
          </label>
          <textarea 
            id="textarea-content" 
            ref={contentRef} 
            rows="5" 
            placeholder="Hôm nay tôi đã làm..." 
            disabled={loading}
          ></textarea>
        </div>

        {/* Upload ảnh */}
        <div className="sf-field">
          <label htmlFor="input-file" className="sf-label">
            <span className="material-symbols-outlined sf-label-icon">add_photo_alternate</span>
            Ảnh Kỷ Niệm
            <span className="sf-label-hint">(JPG/PNG &lt; 5MB)</span>
          </label>
          <input 
            id="input-file" 
            type="file" 
            accept="image/png, image/jpeg" 
            ref={fileRef} 
            onChange={handleFileChange}
            disabled={loading || hasFile} 
            className="w-full"
          />
          {hasFile && (
            <div className="flex items-center justify-between mt-2 px-3 py-2 bg-green-50 border border-green-200 rounded-md">
              <span className="text-sm font-medium text-green-700 truncate mr-2" title={fileName}>
                ✓ Đã chọn: {fileName}
              </span>
              <button 
                type="button" 
                disabled={loading}
                onClick={() => {
                  setHasFile(false);
                  setFileName('');
                  if (fileRef.current) fileRef.current.value = '';
                }}
                className="text-xs font-semibold text-red-600 hover:text-red-800 transition-colors shrink-0"
              >
                Hủy ảnh
              </button>
            </div>
          )}
        </div>

        {/* Submit */}
        <button type="submit" className="sf-btn-submit" disabled={loading} aria-label="Gửi lưu bút">
          {loading ? (
            <>
              <span className="sf-spinner"></span>
              Đang gửi...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined">send</span>
              Gửi Lưu Bút
            </>
          )}
        </button>
      </form>
    </div>
  );
}
