import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

  // Bộ lọc tìm kiếm Mục Lục thời gian thực
  const filteredEntries = entries.filter(e => 
    e.tieuDe.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.donVi.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.hoTen.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Bọc phần hiển thị với Framer Motion
  return (
    <AnimatePresence mode="wait">
      {!isBookOpen ? (
        <motion.div 
          key="cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, transition: { duration: 0.5 } }}
        >
          <BookCover onOpen={() => setIsBookOpen(true)} />
        </motion.div>
      ) : (
        <motion.div 
          key="book"
          className="app-wrapper"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0, transition: { duration: 0.6, type: "spring", bounce: 0.2 } }}
        >
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
            <AnimatePresence>
              {isFormVisible && (
                <motion.div 
                  className="submit-modal-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div 
                    className="submit-modal-content scrapbook-page"
                    initial={{ y: 50, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } }}
                    exit={{ y: 30, opacity: 0, scale: 0.95 }}
                  >
                    <SubmitForm onFormSuccess={loadData} onClose={() => setIsFormVisible(false)} />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            
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
          <AnimatePresence>
            {isDrawerOpen && (
              <motion.div 
                className="drawer-overlay open" 
                onClick={() => setIsDrawerOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}
          </AnimatePresence>
          
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
              {filteredEntries.map((entry, index) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0, transition: { delay: index * 0.05 + 0.1 } }}
                  key={entry.id} 
                  className="toc-card" 
                  onClick={() => {
                    const targetIndex = entries.findIndex(e => e.id === entry.id);
                    if (targetIndex !== -1) {
                      setCurrentPage(targetIndex);
                    }
                    setIsDrawerOpen(false);
                  }}
                >
                  <div className="toc-card-header">
                    <span className="toc-date">{entry.timestamp.split(' ')[0]}</span>
                    <span className="toc-badge">{entry.tieuChi}</span>
                  </div>
                  <h4>{entry.tieuDe}</h4>
                  <p>{entry.hoTen} - {entry.donVi}</p>
                </motion.div>
              ))}
              {filteredEntries.length === 0 && (
                <p className="empty-search-msg" style={{textAlign: 'center', marginTop: '20px'}}>Không tìm thấy bài viết.</p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default App;
