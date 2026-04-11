import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DOMPurify from 'dompurify';
import './ScrapbookViewer.css';

/* ─── Utilities ─── */
const getDirectImageUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const driveIdMatch = url.match(/[-\w]{25,}/);
  if (url.includes('drive.google.com') && driveIdMatch) {
    return `https://lh3.googleusercontent.com/d/${driveIdMatch[0]}`;
  }
  return url;
};

const formatDate = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
};

const timeAgo = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return formatDate(isoString);
};

/* Tạo avatar viết tắt từ họ tên */
const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/* ─── Badge color theo tiêu chí ─── */
const getBadgeClass = (tieuChi) => {
  if (!tieuChi) return 'badge-default';
  const lower = tieuChi.toLowerCase();
  if (lower.includes('nhất 1') || lower.includes('nhat 1')) return 'badge-nhat1';
  if (lower.includes('nhất 2') || lower.includes('nhat 2')) return 'badge-nhat2';
  if (lower.includes('nhất 3') || lower.includes('nhat 3')) return 'badge-nhat3';
  return 'badge-default';
};

/* ─── Stagger animation variants ─── */
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.25, 0.8, 0.25, 1] },
  },
};

/* ═══════════════════════════════════════════════════════
   COMPONENT CHÍNH — Social Feed (cuộn dọc)
   ═══════════════════════════════════════════════════════ */
export default function ScrapbookViewer({ entries, onOpenForm }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [expandedPosts, setExpandedPosts] = useState(new Set());

  const toggleExpand = (id) => {
    setExpandedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  /* ── Empty state ── */
  if (!entries || entries.length === 0) {
    return (
      <div className="feed-container">
        <header className="feed-topbar">
          <span className="feed-logo">Nhật ký 3 Nhất</span>
        </header>
        <main className="feed-main">
          <div className="feed-empty">
            <span className="material-symbols-outlined feed-empty-icon">auto_stories</span>
            <p>Chưa có bài viết nào...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="feed-container">
      {/* ─── TOP APP BAR (sticky + blur) ─── */}
      <header className="feed-topbar">
        <span className="feed-logo">Nhật ký 3 Nhất</span>
        <div className="feed-topbar-actions">
          {onOpenForm && (
            <button className="feed-btn-write" onClick={onOpenForm}>
              <span className="material-symbols-outlined">edit_square</span>
              <span className="feed-btn-write-text">Viết bài</span>
            </button>
          )}
        </div>
      </header>

      {/* ─── SCROLLABLE MAIN FEED ─── */}
      <main className="feed-main">
        {/* Heritage Banner */}
        <div className="feed-banner">
          <span className="material-symbols-outlined feed-banner-icon">campaign</span>
          <p>Cổng thông tin phong trào Nhật ký 3 Nhất — Hội Phụ nữ Công an tỉnh Phú Thọ</p>
        </div>

        {/* Post cards — stagger in */}
        <motion.div
          className="feed-posts"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {entries.map((entry) => {
            const safeHtml = DOMPurify.sanitize(
              entry.noiDung.replace(/\n/g, '<br/>'),
              { ALLOWED_TAGS: ['br'] }
            );
            const imgUrl = entry.linkAnh ? getDirectImageUrl(entry.linkAnh) : null;

            return (
              <motion.article
                key={entry.id}
                className="post-card"
                variants={cardVariants}
              >
                {/* ── Post header: avatar + meta ── */}
                <div className="post-header">
                  <div className="post-header-left">
                    <div className="post-avatar">{getInitials(entry.hoTen)}</div>
                    <div className="post-meta">
                      <span className="post-author">{entry.hoTen}</span>
                      <span className="post-unit">{entry.donVi}</span>
                    </div>
                  </div>
                  <div className="post-header-right">
                    <span className={`post-badge ${getBadgeClass(entry.tieuChi)}`}>
                      {entry.tieuChi}
                    </span>
                  </div>
                </div>

                {/* ── Post body ── */}
                <div className="post-body">
                  <h3 className="post-title">{entry.tieuDe}</h3>
                  <div
                    className={`post-text ${expandedPosts.has(entry.id) ? '' : 'clamped'}`}
                    dangerouslySetInnerHTML={{ __html: safeHtml }}
                  />
                  <button
                    className="btn-expand"
                    onClick={() => toggleExpand(entry.id)}
                  >
                    <span className="material-symbols-outlined btn-expand-icon">
                      {expandedPosts.has(entry.id) ? 'expand_less' : 'expand_more'}
                    </span>
                    {expandedPosts.has(entry.id) ? 'Thu gọn' : 'Xem chi tiết'}
                  </button>
                </div>

                {/* ── Post image ── */}
                {imgUrl && (
                  <div className="post-image-wrapper">
                    <img
                      src={imgUrl}
                      alt="Ảnh hoạt động 3 Nhất"
                      loading="lazy"
                      className="post-image"
                      onClick={() => setSelectedImage(imgUrl)}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          'https://placehold.co/600x400/ebeef4/005eaa.png?text=Loi+Hien+Thi+Anh';
                      }}
                    />
                  </div>
                )}

                {/* ── Post footer ── */}
                <div className="post-footer">
                  <span className="post-timestamp">
                    <span className="material-symbols-outlined post-footer-icon">schedule</span>
                    {timeAgo(entry.timestamp)}
                  </span>
                  {entry.nhanXet && (
                    <span className="post-comment">
                      <span className="material-symbols-outlined post-footer-icon">rate_review</span>
                      {entry.nhanXet}
                    </span>
                  )}
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </main>

      {/* ─── LIGHTBOX (phóng to ảnh) ─── */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="lightbox-overlay"
            onClick={() => setSelectedImage(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button className="lightbox-close" onClick={() => setSelectedImage(null)}>
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
    </div>
  );
}
