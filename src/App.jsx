import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import './App.css';
import SubmitForm from './components/SubmitForm';
import ScrapbookViewer from './components/ScrapbookViewer';
import BookCover from './components/BookCover';
import { fetchEntries } from './services/api';

function App() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Trạng thái UX mới theo Blueprint
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchEntries();
      setEntries(data);
      setCurrentPage(0); // Về trang đầu khi có dữ liệu mới
      setError(null);
    } catch (err) {
      setError("Không thể lấy dữ liệu từ máy chủ. Đang hiển thị bản nháp mố phỏng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Giao diện mở đầu: Bìa cuốn Nhật ký
  if (!isBookOpen) {
    return <BookCover onOpen={() => setIsBookOpen(true)} />;
  }

  // Bộ lọc tìm kiếm Mục Lục thời gian thực
  const filteredEntries = entries.filter(e => 
    e.tieuDe.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.donVi.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.hoTen.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app-wrapper">
      {/* Cụm Action Buttons góc trên */}
      <div className="top-actions">
        {!isFormVisible && (
          <button className="btn-action" onClick={() => setIsFormVisible(true)}>
            ✍️ <span className="menu-text">Viết trang mới</span>
          </button>
        )}
        <button className="btn-action" onClick={() => setIsDrawerOpen(true)}>
          <Menu size={20} /> <span className="menu-text">Mục lục</span>
        </button>
      </div>

      <div className="scrapbook-container">
        
        {/* Modal Đăng Bài Viết */}
        {isFormVisible && (
          <div className="submit-modal-overlay">
            <div className="submit-modal-content scrapbook-page">
              <SubmitForm onFormSuccess={loadData} onClose={() => setIsFormVisible(false)} />
            </div>
          </div>
        )}
        
        {/* Khung hiển thị sổ lưu bút */}
        <div className="viewer-full-width" style={{ width: '100%', height: '100%' }}>
          <ScrapbookViewer 
            entries={entries} 
            currentPage={currentPage} 
            onPageChange={setCurrentPage} 
          />
        </div>
      </div>

      {/* Drawer Mục Lục: Ảnh nền đen tối màn hình */}
      <div 
        className={`drawer-overlay ${isDrawerOpen ? 'open' : ''}`} 
        onClick={() => setIsDrawerOpen(false)}
      ></div>
      
      {/* Drawer Menu Nội dung */}
      <div className={`toc-drawer ${isDrawerOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h3>Mục lục Nhật ký</h3>
          <button className="btn-close" onClick={() => setIsDrawerOpen(false)}>
            <X size={24} />
          </button>
        </div>
        
        <div className="drawer-search">
          <input 
            type="text" 
            placeholder="Tìm kiếm bài viết, tác giả..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="drawer-body">
          {filteredEntries.map(entry => (
            <div key={entry.id} className="toc-card" onClick={() => {
              const targetIndex = entries.findIndex(e => e.id === entry.id);
              if (targetIndex !== -1) {
                setCurrentPage(targetIndex);
              }
              setIsDrawerOpen(false);
            }}>
              <div className="toc-card-header">
                <span className="toc-date">{entry.timestamp.split(' ')[0]}</span>
                <span className="toc-badge">{entry.tieuChi}</span>
              </div>
              <h4>{entry.tieuDe}</h4>
              <p>{entry.hoTen} - {entry.donVi}</p>
            </div>
          ))}
          {filteredEntries.length === 0 && (
            <p className="empty-search-msg" style={{textAlign: 'center', marginTop: '20px'}}>Không tìm thấy bài viết.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
