import { useState, useEffect } from 'react';
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
  
  // Trạng thái UX
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchEntries();
      setEntries(data);
      setError(null);
    } catch (err) {
      setError("Không thể lấy dữ liệu từ máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
          key="feed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.5 } }}
          style={{ minHeight: '100vh' }}
        >
          {/* ─── Social Feed (ScrapbookViewer tự quản layout & topbar) ─── */}
          <ScrapbookViewer 
            entries={entries} 
            onOpenForm={() => setIsFormVisible(true)} 
          />

          {/* ─── Modal Đăng Bài Viết ─── */}
          <AnimatePresence>
            {isFormVisible && (
              <motion.div 
                className="submit-modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div 
                  className="submit-modal-content"
                  initial={{ y: 50, opacity: 0, scale: 0.9 }}
                  animate={{ y: 0, opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } }}
                  exit={{ y: 30, opacity: 0, scale: 0.95 }}
                >
                  <SubmitForm onFormSuccess={loadData} onClose={() => setIsFormVisible(false)} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default App;
