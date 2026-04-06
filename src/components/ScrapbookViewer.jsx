import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import './ScrapbookViewer.css';

const getDirectImageUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const driveIdMatch = url.match(/[-\w]{25,}/);
  if (url.includes('drive.google.com') && driveIdMatch) {
    // Tránh dùng /uc?export=view do dễ dính lỗi chặn Cookie bên thứ 3 (403 Forbidden)
    return `https://lh3.googleusercontent.com/d/${driveIdMatch[0]}`;
  }
  return url;
};

const formatDate = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString; // fallback
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
};

export default function ScrapbookViewer({ entries, currentPage = 0, onPageChange }) {
  const [internalPage, setInternalPage] = useState(currentPage);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [isFlipping, setIsFlipping] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Đồng bộ thay đổi currentPage từ component cha (Mục lục dội vào)
  useEffect(() => {
    if (currentPage !== internalPage && isFlipping === '') {
      const target = Math.max(0, Math.min(currentPage, entries ? entries.length - 1 : 0));
      if (target === internalPage) return;

      const dir = target > internalPage ? 'next' : 'prev';
      setIsFlipping(dir);
      
      setTimeout(() => {
        setInternalPage(target);
        setIsFlipping('');
      }, 400); // Trùng với thời gian animation
    }
  }, [currentPage, internalPage, isFlipping, entries]);

  const itemsPerPage = 1;
  const totalPages = Math.ceil((entries || []).length / itemsPerPage);

  const nextPage = () => {
    if (internalPage < totalPages - 1) {
      if (onPageChange) {
        onPageChange(internalPage + 1);
      } else {
        setIsFlipping('next');
        setTimeout(() => {
          setInternalPage(internalPage + 1);
          setIsFlipping('');
        }, 400);
      }
    }
  };

  const prevPage = () => {
    if (internalPage > 0) {
      if (onPageChange) {
        onPageChange(internalPage - 1);
      } else {
        setIsFlipping('prev');
        setTimeout(() => {
          setInternalPage(internalPage - 1);
          setIsFlipping('');
        }, 400);
      }
    }
  };

  const renderPage = (entry, idx) => {
    if (!entry) return <div className="scrapbook-page empty-page" key={`empty-${idx}`}></div>;

    const safeHtml = DOMPurify.sanitize(entry.noiDung.replace(/\n/g, '<br/>'), {
      ALLOWED_TAGS: ['br']
    });

    return (
      <div className="scrapbook-page" key={entry.id}>
        
        <div className="diary-content-overlay">
          <div className="diary-header text-dark">
            <span className="diary-badge-main">NHẬT KÝ BA NHẤT</span>
            <span className="diary-date">{formatDate(entry.timestamp)}</span>
          </div>
          
          <div className="diary-body-content">
            <h2 className="diary-title text-dark">{entry.tieuDe}</h2>
            <div className="diary-badge-inline">{entry.tieuChi}</div>
            
            <div 
               className="diary-text text-dark" 
               dangerouslySetInnerHTML={{ __html: safeHtml }} 
            />

            {entry.linkAnh && (
              <img 
                src={getDirectImageUrl(entry.linkAnh)}
                alt="Ảnh hoạt động 3 Nhất"
                loading="lazy"
                className="scrapbook-photo"
                onClick={() => setSelectedImage(getDirectImageUrl(entry.linkAnh))}
                title="Nhấn để xem ảnh phóng to"
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = 'https://placehold.co/400x300/E6E2D3/8B0000.png?text=Loi+Hien+Thi+Anh'; 
                }}
              />
            )}
          </div>
          
          <div className="diary-footer text-dark">
            <div className="author-info">
              <strong>{entry.hoTen}</strong>
              <br />
              <small>{entry.donVi}</small>
            </div>
            
            {entry.nhanXet && (
              <div className="diary-critic-tooltip">
                <em>📝 {entry.nhanXet}</em>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!entries || entries.length === 0) {
    return <div className="scrapbook-viewer-container"><div className="scrapbook-page empty">Chưa có bài viết nào...</div></div>;
  }

  const startIndex = internalPage * itemsPerPage;
  const currentEntries = entries.slice(startIndex, startIndex + itemsPerPage);

  // Đảm bảo Desktop luôn có 2 trang (nếu ở trang cuối chỉ có chiều trái thì bù chiều phải)
  if (isDesktop && currentEntries.length === 1) {
    currentEntries.push(null); 
  }

  return (
    <div className={`scrapbook-viewer-container ${isFlipping}`}>
      {currentEntries.map((entry, idx) => renderPage(entry, idx))}
      
      {/* Nút lật trang trái */}
      {internalPage > 0 && (
        <button className="flip-btn prev-btn" onClick={prevPage} aria-label="Trang trước">
          &#10094;
        </button>
      )}

      {/* Nút lật trang phải */}
      {internalPage < totalPages - 1 && (
        <button className="flip-btn next-btn" onClick={nextPage} aria-label="Trang kế">
          &#10095;
        </button>
      )}

      {/* Lightbox xem ảnh Full màn hình */}
      {selectedImage && (
        <div className="lightbox-overlay" onClick={() => setSelectedImage(null)}>
          <button className="lightbox-close" onClick={() => setSelectedImage(null)}>✕</button>
          <img src={selectedImage} alt="Phóng to" className="lightbox-image" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
