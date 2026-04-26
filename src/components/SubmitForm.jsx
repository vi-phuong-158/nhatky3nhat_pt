import React, { useRef, useState } from 'react';
import { submitEntry, uploadFileToDrive } from '../services/api';
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
  const [uploadProgress, setUploadProgress] = useState(0);
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

  const validateFile = (file) => {
    return new Promise((resolve) => {
      // Giới hạn 100MB cho video, 10MB cho ảnh (để đảm bảo an toàn)
      const isVideo = file.type.startsWith('video/');
      const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
      
      if (file.size > maxSize) {
        resolve({ isValid: false, error: `Kích thước file vượt quá ${isVideo ? '100MB' : '10MB'}.` });
        return;
      }
      
      // Chấp nhận ảnh JPEG, PNG và các định dạng Video phổ biến
      if (file.type.startsWith('image/jpeg') || 
          file.type.startsWith('image/png') || 
          file.type.startsWith('video/mp4') || 
          file.type.startsWith('video/quicktime') || 
          file.type.startsWith('video/webm')) {
        resolve({ isValid: true, isVideo: isVideo });
      } else {
        resolve({ isValid: false, error: 'Định dạng file không hỗ trợ (.jpg, .png, .mp4, .mov).' });
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    setUploadProgress(0);

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
    let filePayload = {}; // Lưu giữ fileId và cờ isVideo

    if (file) {
      const { isValid, error: fileError, isVideo } = await validateFile(file);
      if (!isValid) {
        setError(fileError);
        setLoading(false);
        return;
      }
      try {
        // Tải file trực tiếp lên Drive bằng method mới (Cách B)
        const uploadedFileId = await uploadFileToDrive(file, (progress) => {
          setUploadProgress(progress);
        });
        
        filePayload = {
          fileId: uploadedFileId,
          hasVideo: isVideo
        };
      } catch(e) {
        setError("Lỗi xử lý file: " + e.message);
        setLoading(false);
        return;
      }
    }

    try {
      setUploadProgress(100); // Đã tải file xong, chuyển sang Submit form
      
      await submitEntry({
        hoTen: name,
        soDienThoai: phone,
        donVi: unit,
        tieuDe: title,
        tieuChi: criteria,
        noiDung: content,
        ...filePayload
      });
      
      if (onToast) onToast('Gửi lưu bút thành công! Bài viết đang chờ phê duyệt.', 'success');
      else setSuccess('Gửi lưu bút thành công! Bài viết đang chờ Ban Phụ nữ phê duyệt.');
      if (onFormSuccess) onFormSuccess();
      e.target.reset();
      setHasFile(false);
      setFileName('');
      setUploadProgress(0);
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
        <div className="sf-alert sf-alert-error" role="alert" aria-live="assertive">
          <span className="material-symbols-outlined sf-alert-icon">error</span>
          {error}
        </div>
      )}
      {success && (
        <div className="sf-alert sf-alert-success" role="status" aria-live="polite">
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
            <input id="input-name" type="text" ref={nameRef} placeholder="Vd: Nguyễn Thị Lan" disabled={loading} aria-required="true" />
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
              aria-required="true"
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
            <input id="input-title" type="text" ref={titleRef} placeholder="Nhập tiêu đề..." disabled={loading} aria-required="true" />
          </div>
        </div>

        {/* Tiêu chí */}
        <div className="sf-field">
          <label htmlFor="select-criteria" className="sf-label">
            Tiêu chí Ba nhất <span className="sf-required">*</span>
          </label>
          <div className="sf-input-wrapper sf-select-wrapper">
            <span className="material-symbols-outlined sf-input-icon">military_tech</span>
            <select id="select-criteria" ref={criteriaRef} disabled={loading} aria-required="true">
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
            aria-required="true"
          ></textarea>
        </div>

        {/* Upload ảnh/video */}
        <div className="sf-field">
          <label htmlFor="input-file" className="sf-label">
            <span className="material-symbols-outlined sf-label-icon">add_photo_alternate</span>
            Ảnh / Video Kỷ Niệm
            <span className="sf-label-hint" style={{marginLeft: '8px', fontSize: '11px', color: '#666'}}>(&lt; 100MB)</span>
          </label>
          <input 
            id="input-file" 
            type="file" 
            accept="image/png, image/jpeg, video/mp4, video/quicktime, video/webm" 
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
                Hủy file
              </button>
            </div>
          )}
        </div>

        {/* Progress Bar & Submit */}
        {loading && uploadProgress > 0 && uploadProgress < 100 && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4 mt-2">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%`, transition: 'width 0.3s ease' }}></div>
            <p className="text-xs text-center text-gray-500 mt-1">Đang tải file: {uploadProgress}%</p>
          </div>
        )}

        <button type="submit" className="sf-btn-submit" disabled={loading} aria-label="Gửi lưu bút">
          {loading ? (
            <>
              <span className="sf-spinner"></span>
              {uploadProgress > 0 && uploadProgress < 100 ? 'Đang tải file...' : 'Đang xử lý...'}
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
