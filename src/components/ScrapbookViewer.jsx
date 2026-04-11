import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PostCard from './PostCard';
import './ScrapbookViewer.css';

/* ─── Stagger animation variants ─── */
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ─── Skeleton Loader ─── */
function SkeletonCard() {
  return (
    <div className="post-card skeleton-card" aria-hidden="true">
      <div className="post-header">
        <div className="post-header-left">
          <div className="post-meta">
            <span className="skeleton-line skeleton-name"></span>
            <span className="skeleton-line skeleton-unit"></span>
          </div>
        </div>
        <div className="post-header-right">
          <span className="skeleton-badge"></span>
        </div>
      </div>
      <div className="post-body">
        <div className="skeleton-line skeleton-title"></div>
        <div className="skeleton-line skeleton-text-1"></div>
        <div className="skeleton-line skeleton-text-2"></div>
        <div className="skeleton-line skeleton-text-3"></div>
      </div>
      <div className="post-footer">
        <span className="skeleton-line skeleton-btn"></span>
        <span className="skeleton-line skeleton-time"></span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   COMPONENT CHÍNH — Social Feed (cuộn dọc + Infinite Scroll)
   ═══════════════════════════════════════════════════════ */
export default function ScrapbookViewer({
  entries,
  loading,
  loadingMore,
  hasMore,
  totalCount,
  onLoadMore,
  error,
  onRetry,
  onOpenForm,
  onToast,
  darkMode,
  onToggleDarkMode,
  onOpenStats,
  onOpenAlbum,
  searchTerm,
  onSearchChange,
}) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [filterCriteria, setFilterCriteria] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // ─── Infinite Scroll: IntersectionObserver sentinel ───
  const sentinelRef = useRef(null);

  useEffect(() => {
    // Chỉ kích hoạt infinite scroll khi KHÔNG có bộ lọc/tìm kiếm đang hoạt động
    const isFilterActive = searchTerm.trim() || filterCriteria;
    if (!onLoadMore || !hasMore || loading || loadingMore || isFilterActive) return;

    const observer = new IntersectionObserver(
      (observerEntries) => {
        if (observerEntries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: '300px' } // Bắt đầu tải trước khi cuộn tới 300px
    );

    const el = sentinelRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [onLoadMore, hasMore, loading, loadingMore, searchTerm, filterCriteria]);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => { setIsOnline(true); if (onToast) onToast('Đã kết nối mạng', 'success'); };
    const handleOffline = () => { setIsOnline(false); if (onToast) onToast('Mất kết nối mạng', 'error'); };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onToast]);

  // Close lightbox on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && selectedImage) setSelectedImage(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedImage]);

  const handleImageClick = useCallback((url) => setSelectedImage(url), []);

  const hasFilters = searchTerm || filterCriteria;

  return (
    <div className="feed-container">
      {/* ─── Offline Banner ─── */}
      {!isOnline && (
        <div className="offline-banner" role="alert">
          <span className="material-symbols-outlined" aria-hidden="true">wifi_off</span>
          Mất kết nối mạng
        </div>
      )}

      {/* ─── TOP APP BAR ─── */}
      <header className="feed-topbar glass-card">
        <span className="feed-logo">Nhật ký 3 Nhất</span>
        <div className="feed-topbar-actions">
          <button
            className="feed-btn-write"
            onClick={onToggleDarkMode}
            aria-label={darkMode ? 'Chuyển sang sáng' : 'Chuyển sang tối'}
            title={darkMode ? 'Chế độ sáng' : 'Chế độ tối'}
            style={{ padding: '0 12px', minWidth: '40px' }}
          >
            <span className="material-symbols-outlined" aria-hidden="true">{darkMode ? 'light_mode' : 'dark_mode'}</span>
          </button>
        </div>
      </header>

      {/* ─── SEARCH & FILTER BAR ─── */}
      <div className="feed-toolbar glass-card" role="search">
        <div className="feed-search-wrapper">
          <span className="material-symbols-outlined feed-search-icon" aria-hidden="true">search</span>
          <input
            type="search"
            className="feed-search-input glass-card bg-white/40 border border-white/50 shadow-inner text-slate-800 focus:bg-white/60 focus:ring-2 focus:ring-blue-500/40 focus:outline-none"
            placeholder="Tìm bài viết..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Tìm kiếm bài viết"
          />
          {searchTerm && (
            <button className="feed-search-clear" onClick={() => onSearchChange('')} aria-label="Xóa tìm kiếm">
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
        </div>
        <div className="feed-filters">
          <select
            className="feed-filter-select glass-card bg-white/40 border border-white/50 shadow-inner text-slate-800 focus:bg-white/60 focus:ring-2 focus:ring-blue-500/40 focus:outline-none"
            value={filterCriteria}
            onChange={(e) => setFilterCriteria(e.target.value)}
            aria-label="Lọc theo tiêu chí"
          >
            <option value="" className="bg-white/95 text-slate-800 dark:bg-slate-800 dark:text-gray-100">Tất cả tiêu chí</option>
            <option value="Kỷ luật nhất" className="bg-white/95 text-slate-800 dark:bg-slate-800 dark:text-gray-100">Kỷ luật nhất</option>
            <option value="Trung thành nhất" className="bg-white/95 text-slate-800 dark:bg-slate-800 dark:text-gray-100">Trung thành nhất</option>
            <option value="Gần dân nhất" className="bg-white/95 text-slate-800 dark:bg-slate-800 dark:text-gray-100">Gần dân nhất</option>
          </select>
          <select
            className="feed-filter-select glass-card bg-white/40 border border-white/50 shadow-inner text-slate-800 focus:bg-white/60 focus:ring-2 focus:ring-blue-500/40 focus:outline-none"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sắp xếp bài viết"
          >
            <option value="newest" className="bg-white/95 text-slate-800 dark:bg-slate-800 dark:text-gray-100">Mới nhất</option>
            <option value="oldest" className="bg-white/95 text-slate-800 dark:bg-slate-800 dark:text-gray-100">Cũ nhất</option>
            <option value="flowers" className="bg-white/95 text-slate-800 dark:bg-slate-800 dark:text-gray-100">Nhiều hoa nhất</option>
          </select>
        </div>
      </div>

      {/* ─── Bộ đếm bài viết ─── */}
      {!loading && !error && entries.length > 0 && (
        <div className="feed-counter">
          Đã hiển thị {entries.length} / {totalCount || entries.length} bài viết
        </div>
      )}

      {/* ─── MAIN FEED ─── */}
      <main className="feed-main">
        {/* Loading skeleton */}
        {loading && (
          <div className="feed-posts">
            {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Error state with retry */}
        {!loading && error && (
          <div className="feed-empty feed-error-state">
            <span className="material-symbols-outlined feed-empty-icon">cloud_off</span>
            <p>{error}</p>
            {onRetry && (
              <button className="feed-retry-btn" onClick={onRetry}>
                <span className="material-symbols-outlined" aria-hidden="true">refresh</span>
                Thử lại
              </button>
            )}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && entries.length === 0 && (
          <div className="feed-empty">
            <span className="material-symbols-outlined feed-empty-icon">
              {hasFilters ? 'search_off' : 'auto_stories'}
            </span>
            <p>{hasFilters ? 'Không tìm thấy bài viết phù hợp.' : 'Chưa có bài viết nào...'}</p>
            {hasFilters && (
              <button className="feed-retry-btn" onClick={() => { onSearchChange(''); setFilterCriteria(''); }}>
                Xóa bộ lọc
              </button>
            )}
          </div>
        )}

        {/* Posts */}
        {!loading && !error && entries.length > 0 && (
          <motion.div
            className="feed-posts"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {entries.map((entry) => (
              <PostCard
                key={entry.id}
                entry={entry}
                onImageClick={handleImageClick}
                onToast={onToast}
              />
            ))}
          </motion.div>
        )}

        {/* ─── Loading More Indicator ─── */}
        {loadingMore && (
          <div className="feed-loading-more">
            <div className="feed-loading-spinner" />
            <span>Đang tải thêm bài viết...</span>
          </div>
        )}

        {/* ─── Infinite Scroll Sentinel ─── */}
        {!loading && !error && hasMore && !hasFilters && (
          <div ref={sentinelRef} className="feed-sentinel" aria-hidden="true" />
        )}

        {/* ─── Hết bài viết ─── */}
        {!loading && !error && !hasMore && entries.length > 0 && !hasFilters && (
          <div className="feed-end-message">
            <span className="material-symbols-outlined" aria-hidden="true">check_circle</span>
            Bạn đã xem hết tất cả bài viết
          </div>
        )}
      </main>

      {/* ─── LIGHTBOX ─── */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="lightbox-overlay"
            onClick={() => setSelectedImage(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Phóng to ảnh"
          >
            <button
              className="lightbox-close"
              onClick={() => setSelectedImage(null)}
              aria-label="Đóng ảnh phóng to"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <motion.img
              src={selectedImage}
              alt="Phóng to"
              className="lightbox-image"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, transition: { type: 'spring', damping: 22 } }}
              exit={{ scale: 0.9, opacity: 0 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Bottom Navigation (Mobile Only) — 5 cột ─── */}
      <nav className="btm-nav md:hidden glass-card blue-glow">
        <div className="btm-nav-inner">
          {/* 1. Trang chủ */}
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="btm-nav-item">
            <span className="material-symbols-outlined btm-nav-icon" aria-hidden="true">home</span>
            <span className="btm-nav-label">Trang chủ</span>
          </button>

          {/* 2. Album ảnh */}
          <button onClick={onOpenAlbum} className="btm-nav-item">
            <span className="material-symbols-outlined btm-nav-icon" aria-hidden="true">photo_library</span>
            <span className="btm-nav-label">Album</span>
          </button>

          {/* 3. Viết bài (Nổi bật - giữa) */}
          <div className="btm-nav-center">
            <button onClick={onOpenForm} className="btm-nav-fab" aria-label="Viết bài mới">
              <span className="material-symbols-outlined text-[26px]">edit</span>
            </button>
            <span className="btm-nav-label btm-nav-label-primary">Viết bài</span>
          </div>

          {/* 4. Trợ lý AI */}
          <a href="https://notebooklm.google.com/notebook/ad20daef-a080-4103-a6e8-3ee5271866ed" target="_blank" rel="noopener noreferrer" className="btm-nav-item">
            <span className="material-symbols-outlined btm-nav-icon" aria-hidden="true">smart_toy</span>
            <span className="btm-nav-label">Trợ lý AI</span>
          </a>

          {/* 5. Thống kê */}
          <button onClick={onOpenStats} className="btm-nav-item">
            <span className="material-symbols-outlined btm-nav-icon" aria-hidden="true">insights</span>
            <span className="btm-nav-label">Thống kê</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
