import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import DOMPurify from 'dompurify';
import { sendFlower } from '../services/api';

/* ─── Utilities ─── */
const getDirectImageUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const driveIdMatch = url.match(/[-\w]{25,}/);
  if (url.includes('drive.google.com') && driveIdMatch) {
    return `https://lh3.googleusercontent.com/d/${driveIdMatch[0]}`;
  }
  return url;
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
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
};

const getBadgeClass = (tieuChi) => {
  if (!tieuChi) return 'badge-default';
  const lower = tieuChi.toLowerCase();
  if (lower.includes('nhất 1') || lower.includes('nhat 1')) return 'badge-nhat1';
  if (lower.includes('nhất 2') || lower.includes('nhat 2')) return 'badge-nhat2';
  if (lower.includes('nhất 3') || lower.includes('nhat 3')) return 'badge-nhat3';
  return 'badge-default';
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

function PostCard({ entry, onImageClick, onToast }) {
  const [expanded, setExpanded] = useState(false);
  const [flowerState, setFlowerState] = useState(null);
  const [flowerAnimating, setFlowerAnimating] = useState(false);

  const safeHtml = DOMPurify.sanitize(
    entry.noiDung.replace(/\n/g, '<br/>'),
    { ALLOWED_TAGS: ['br'], ALLOWED_ATTR: [] }
  );

  const isVideo = entry.linkAnh && entry.linkAnh.startsWith('[VIDEO]');
  const rawUrl = isVideo ? entry.linkAnh.substring(7) : entry.linkAnh;
  const mediaUrl = rawUrl ? (isVideo ? rawUrl : getDirectImageUrl(rawUrl)) : null;

  const isActive = flowerState?.active ?? entry.hasFlowered;
  const flowerCount = flowerState?.count ?? entry.flowerCount ?? 0;

  const handleFlower = useCallback(async () => {
    if (flowerAnimating) return;
    setFlowerAnimating(true);
    setTimeout(() => setFlowerAnimating(false), 1200);

    try {
      const result = await sendFlower(entry.id);
      setFlowerState({
        count: result.flowerCount,
        active: result.toggled === 'added',
      });
    } catch (err) {
      setFlowerAnimating(false);
      if (onToast) onToast(err.message || 'Tặng hoa thất bại', 'error');
    }
  }, [flowerAnimating, entry.id, onToast]);

  return (
    <motion.article className="post-card glass-card blue-glow" variants={cardVariants}>
      {/* Header */}
      <div className="post-header">
        <div className="post-header-left">
          <div className="post-meta">
            <span className="post-author">{entry.hoTen}</span>
            <span className="post-unit">{entry.donVi}</span>
          </div>
        </div>
        <div className="post-header-right">
          <span className="px-2 py-0.5 rounded-[2px] border border-blue-400/40 bg-blue-50/60 backdrop-blur-md text-[#52B5E9] text-[11px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px]">military_tech</span>
            <span className="leading-none">{entry.tieuChi}</span>
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="post-body">
        <h3 className="post-title">{entry.tieuDe}</h3>
        <div
          className={`post-text ${expanded ? '' : 'clamped'}`}
          dangerouslySetInnerHTML={{ __html: safeHtml }}
        />
        <button
          className="btn-expand"
          onClick={() => setExpanded((p) => !p)}
          aria-expanded={expanded}
        >
          <span className="material-symbols-outlined btn-expand-icon">
            {expanded ? 'expand_less' : 'expand_more'}
          </span>
          {expanded ? 'Thu gọn' : 'Xem chi tiết'}
        </button>
      </div>

      {/* Media (Ảnh/Video) */}
      {rawUrl && (
        <div className="post-image-wrapper">
          {isVideo ? (
            <div className="flex flex-col w-full px-[18px] pb-4 pt-2 relative z-10">
              <div className="rounded-md overflow-hidden shadow-sm border border-black/10 bg-black">
                <iframe 
                  src={mediaUrl} 
                  className="w-full aspect-video border-none" 
                  allow="autoplay; fullscreen" 
                  allowFullScreen
                  title="Video Kỷ Niệm"
                ></iframe>
              </div>
              <a 
                href={mediaUrl} 
                target="_blank" 
                rel="noreferrer"
                className="mt-3 text-center text-[12px] font-semibold text-[#52B5E9] hover:text-[#3da0d6] hover:underline"
              >
                Mở Video trong thẻ mới (Nếu video đang bị nghẽn)
              </a>
            </div>
          ) : (
            <img
              src={mediaUrl}
              alt={`Ảnh hoạt động: ${entry.tieuDe}`}
              loading="lazy"
                className="post-image cursor-zoom-in focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:ring-offset-2 rounded-md"
                role="button"
                tabIndex={0}
              onClick={() => onImageClick && onImageClick({ 
                src: mediaUrl, 
                alt: entry.tieuDe,
                author: entry.hoTen,
                unit: entry.donVi
              })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onImageClick && onImageClick({
                      src: mediaUrl,
                      alt: entry.tieuDe,
                      author: entry.hoTen,
                      unit: entry.donVi
                    });
                  }
                }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  'https://placehold.co/600x400/ebeef4/005eaa.png?text=Loi+Hien+Thi+Anh';
              }}
            />
          )}
        </div>
      )}

      {/* Footer */}
      <div className="post-footer">
        <button
          className={`flower-btn ${isActive ? 'flower-active' : ''}`}
          onClick={handleFlower}
          aria-label={isActive ? 'Bỏ tặng hoa' : 'Tặng hoa'}
        >
          <span className="flower-icon" aria-hidden="true">🌸</span>
          <span className="flower-label">
            {isActive ? 'Đã tặng hoa' : 'Tặng hoa'}
          </span>
          <span className="flower-count">{flowerCount}</span>
          {flowerAnimating && (
            <span className="flower-petals" aria-hidden="true">
              {[...Array(6)].map((_, i) => (
                <span key={i} className={`petal petal-${i + 1}`}>🌸</span>
              ))}
            </span>
          )}
        </button>

        <span className="post-timestamp">
          <span className="material-symbols-outlined post-footer-icon" aria-hidden="true">schedule</span>
          {timeAgo(entry.thoiGian)}
        </span>
        {entry.nhanXet && (
          <span className="post-comment">
            <span className="material-symbols-outlined post-footer-icon" aria-hidden="true">rate_review</span>
            {entry.nhanXet}
          </span>
        )}
      </div>
    </motion.article>
  );
}

export default React.memo(PostCard);
