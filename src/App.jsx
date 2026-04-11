import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';
import ScrapbookViewer from './components/ScrapbookViewer';
import { fetchEntries, fetchAllEntries, fetchAlbumImages } from './services/api';

const SubmitForm = lazy(() => import('./components/SubmitForm'));
const BookCover = lazy(() => import('./components/BookCover'));
const StatsView = lazy(() => import('./components/StatsView'));
const AlbumView = lazy(() => import('./components/AlbumView'));

/* ─── Toast Component ─── */
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icon = type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info';

  return (
    <motion.div
      className={`toast toast-${type} glass-card`}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      role="alert"
      aria-live="polite"
    >
      <span className="material-symbols-outlined toast-icon" aria-hidden="true">{icon}</span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose} aria-label="Đóng thông báo">
        <span className="material-symbols-outlined">close</span>
      </button>
    </motion.div>
  );
}

/* ─── Dark Mode Hook ─── */
function useDarkMode() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('nk3n_dark_mode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('nk3n_dark_mode', String(dark));
  }, [dark]);

  return [dark, setDark];
}

function App() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [darkMode, setDarkMode] = useDarkMode();
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [statsEntries, setStatsEntries] = useState([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [showAlbum, setShowAlbum] = useState(false);
  const [albumImages, setAlbumImages] = useState([]);
  const [albumLoading, setAlbumLoading] = useState(false);

  const POSTS_PER_PAGE = 20;

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev.slice(-4), { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Tải trang đầu tiên (hoặc làm mới toàn bộ)
  const loadData = useCallback(async (search = "") => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchEntries(1, POSTS_PER_PAGE, search);
      setEntries(result.data);
      setHasMore(result.hasMore);
      setTotalCount(result.totalCount);
      setCurrentPage(1);
    } catch (err) {
      setError('Không thể lấy dữ liệu từ máy chủ.');
      addToast('Không thể lấy dữ liệu từ máy chủ.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  // Infinite Scroll tải thêm trang tiếp theo
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = currentPage + 1;
    try {
      const result = await fetchEntries(nextPage, POSTS_PER_PAGE, searchTerm);
      setEntries((prev) => [...prev, ...result.data]);
      setHasMore(result.hasMore);
      setCurrentPage(nextPage);
    } catch (err) {
      addToast('Không thể tải thêm bài viết.', 'error');
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, currentPage, searchTerm, addToast]);

  // Tự động load lại khi từ khóa tìm kiếm thay đổi (Debounce 500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFormSuccess = useCallback(() => {
    addToast('Gửi lưu bút thành công! Bài viết đang chờ phê duyệt.', 'success');
    loadData();
  }, [addToast, loadData]);

  // Close modal on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && isFormVisible) setIsFormVisible(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isFormVisible]);

  // Mở trang thống kê — tải toàn bộ entries
  const openStats = useCallback(async () => {
    setShowStats(true);
    setStatsLoading(true);
    try {
      const all = await fetchAllEntries();
      setStatsEntries(all);
    } catch (err) {
      addToast('Không thể tải dữ liệu thống kê.', 'error');
    } finally {
      setStatsLoading(false);
    }
  }, [addToast]);

  // Mở album ảnh — tải danh sách ảnh từ Google Drive
  const openAlbum = useCallback(async () => {
    setShowAlbum(true);
    setAlbumLoading(true);
    try {
      const imgs = await fetchAlbumImages();
      setAlbumImages(imgs);
    } catch (err) {
      addToast('Không thể tải album ảnh.', 'error');
    } finally {
      setAlbumLoading(false);
    }
  }, [addToast]);

  return (
    <>
      <AnimatePresence mode="wait">
        {!isBookOpen ? (
          <motion.div
            key="cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05, transition: { duration: 0.5 } }}
          >
            <Suspense fallback={<div className="cover-fallback" />}>
              <BookCover onOpen={() => setIsBookOpen(true)} />
            </Suspense>
          </motion.div>
        ) : (
          <motion.div
            key="feed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.5 } }}
            style={{ minHeight: '100vh' }}
          >
            <ScrapbookViewer
              entries={entries}
              loading={loading}
              loadingMore={loadingMore}
              hasMore={hasMore}
              totalCount={totalCount}
              onLoadMore={loadMore}
              error={error}
              onRetry={loadData}
              onOpenForm={() => setIsFormVisible(true)}
              onToast={addToast}
              darkMode={darkMode}
              onToggleDarkMode={() => setDarkMode((d) => !d)}
              onOpenStats={openStats}
              onOpenAlbum={openAlbum}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />



            {/* Modal Đăng Bài */}
            <AnimatePresence>
              {isFormVisible && (
                <motion.div
                  className="submit-modal-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={(e) => { if (e.target === e.currentTarget) setIsFormVisible(false); }}
                  role="dialog"
                  aria-modal="true"
                  aria-label="Viết bài mới"
                >
                  <motion.div
                    className="submit-modal-content glass-card blue-glow"
                    initial={{ y: 50, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } }}
                    exit={{ y: 30, opacity: 0, scale: 0.95 }}
                  >
                    <Suspense fallback={<div className="sf-loading">Đang tải...</div>}>
                      <SubmitForm onFormSuccess={handleFormSuccess} onClose={() => setIsFormVisible(false)} onToast={addToast} />
                    </Suspense>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Trang Thống kê */}
            <AnimatePresence>
              {showStats && (
                <Suspense fallback={<div className="sf-loading">Đang tải thống kê...</div>}>
                  <StatsView
                    entries={statsEntries}
                    loading={statsLoading}
                    onClose={() => setShowStats(false)}
                  />
                </Suspense>
              )}
            </AnimatePresence>

            {/* Album Ảnh */}
            <AnimatePresence>
              {showAlbum && (
                <Suspense fallback={<div className="sf-loading">Đang tải album...</div>}>
                  <AlbumView
                    images={albumImages}
                    loading={albumLoading}
                    onClose={() => setShowAlbum(false)}
                  />
                </Suspense>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Container */}
      <div className="toast-container" aria-live="polite">
        <AnimatePresence>
          {toasts.map((t) => (
            <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}

export default App;
