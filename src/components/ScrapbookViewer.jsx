import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import './ScrapbookViewer.css';

export default function ScrapbookViewer({ entries }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [isFlipping, setIsFlipping] = useState('');

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Trong Layout hiện tại, ScrapbookViewer nằm bên phải (1 trang), SubmitForm nằm bên trái (1 trang). 
  // Desktop và Mobile đều lật 1 trang một lần cho Viewer này.
  const itemsPerPage = 1;
  const totalPages = Math.ceil((entries || []).length / itemsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setIsFlipping('next');
      setTimeout(() => {
        setCurrentPage(currentPage + 1);
        setIsFlipping('');
      }, 400);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setIsFlipping('prev');
      setTimeout(() => {
        setCurrentPage(currentPage - 1);
        setIsFlipping('');
      }, 400);
    }
  };

  // @react-best-practices: Tách component hiển thị trang để tiện tái sử dụng
  const renderPage = (entry, idx) => {
    if (!entry) return <div className="scrapbook-page empty-page" key={`empty-${idx}`}></div>;

    // @frontend-security-coder: Sanitize dữ liệu (chống XSS) và cho phép linebreak an toàn
    const safeHtml = DOMPurify.sanitize(entry.noiDung.replace(/\n/g, '<br/>'), {
      ALLOWED_TAGS: ['br']
    });

    return (
      <div className="scrapbook-page" key={entry.id}>
        {entry.linkAnh && (
          <div className="diary-image-container">
            {/* Lazy Load cho hình ảnh */}
            <img 
              src={entry.linkAnh} 
              alt={entry.tieuDe} 
              loading="lazy" 
              className="diary-image" 
            />
            <div className="image-overlay"></div>
          </div>
        )}
        
        <div className="diary-content-overlay">
          <div className="diary-header">
            <span className="diary-badge">{entry.tieuChi}</span>
            <span className="diary-date">{entry.timestamp}</span>
          </div>
          
          <h2 className={`diary-title ${entry.linkAnh ? 'text-light' : 'text-dark'}`}>{entry.tieuDe}</h2>
          
          <div 
             className={`diary-text ${entry.linkAnh ? 'text-light' : 'text-dark'}`} 
             dangerouslySetInnerHTML={{ __html: safeHtml }} 
          />
          
          <div className={`diary-footer ${entry.linkAnh ? 'text-light' : 'text-dark'}`}>
            <strong>{entry.hoTen}</strong>
            <br />
            <small>{entry.donVi}</small>
          </div>

          {entry.nhanXet && (
            <div className="diary-critic">
              <em>📝 Ban Phụ nữ: {entry.nhanXet}</em>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!entries || entries.length === 0) {
    return <div className="scrapbook-viewer-container"><div className="scrapbook-page empty">Chưa có bài viết nào...</div></div>;
  }

  const startIndex = currentPage * itemsPerPage;
  const currentEntries = entries.slice(startIndex, startIndex + itemsPerPage);

  // Đảm bảo Desktop luôn có 2 trang (nếu ở trang cuối chỉ có chiều trái thì bù chiều phải)
  if (isDesktop && currentEntries.length === 1) {
    currentEntries.push(null); 
  }

  return (
    <div className={`scrapbook-viewer-container ${isFlipping}`}>
      {currentEntries.map((entry, idx) => renderPage(entry, idx))}
      
      {/* Nút lật trang trái */}
      {currentPage > 0 && (
        <button className="flip-btn prev-btn" onClick={prevPage} aria-label="Trang trước">
          &#10094;
        </button>
      )}

      {/* Nút lật trang phải */}
      {currentPage < totalPages - 1 && (
        <button className="flip-btn next-btn" onClick={nextPage} aria-label="Trang kế">
          &#10095;
        </button>
      )}
    </div>
  );
}
