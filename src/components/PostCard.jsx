import React, { useState, useCallback } from 'react';
import { motion as Motion } from 'framer-motion';
import DOMPurify from 'dompurify';
import { Award, ChevronDown, ChevronUp, Clock, Flower2, MessageSquareText } from 'lucide-react';
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
  if (lower.includes('kỷ luật') || lower.includes('ky luat')) return 'badge-nhat1';
  if (lower.includes('trung thành') || lower.includes('trung thanh')) return 'badge-nhat2';
  if (lower.includes('gần dân') || lower.includes('gan dan')) return 'badge-nhat3';
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
    <Motion.article className="post-card glass-card blue-glow" variants={cardVariants}>
      <span className="post-tape post-tape-left" aria-hidden="true" />
      <span className="post-tape post-tape-right" aria-hidden="true" />
      {/* Header */}
      <div className="post-header">
        <div className="post-header-left">
          <div className="post-meta">
            <span className="post-author">{entry.hoTen}</span>
            <span className="post-unit">{entry.donVi}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="post-body">
        <div className="post-title-row">
          <h3 className="post-title">{entry.tieuDe}</h3>
          <span className={`post-criteria-badge ${getBadgeClass(entry.tieuChi)}`}>
            <Award size={14} aria-hidden="true" />
            <span className="post-criteria-label">{entry.tieuChi}</span>
          </span>
        </div>
        <div
          className={`post-text ${expanded ? '' : 'clamped'}`}
          dangerouslySetInnerHTML={{ __html: safeHtml }}
        />
        <button
          className="btn-expand"
          onClick={() => setExpanded((p) => !p)}
          aria-expanded={expanded}
        >
          {expanded ? (
            <ChevronUp className="btn-expand-icon" size={18} aria-hidden="true" />
          ) : (
            <ChevronDown className="btn-expand-icon" size={18} aria-hidden="true" />
          )}
          {expanded ? 'Thu gọn' : 'Xem chi tiết'}
        </button>
      </div>

      {/* Media (Ảnh/Video) */}
      {rawUrl && (
        <div className="post-image-wrapper">
          {isVideo ? (
            <div className="post-video-box">
              <div className="post-video-inner">
                <iframe
                  src={mediaUrl}
                  className="post-video-frame"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                  title="Video Kỷ Niệm"
                ></iframe>
              </div>
              <a
                href={mediaUrl}
                target="_blank"
                rel="noreferrer"
                className="post-video-link"
              >
                Mở Video trong thẻ mới (Nếu video đang bị nghẽn)
              </a>
            </div>
          ) : (
            <div className="post-polaroid-frame">
              <img
                src={mediaUrl}
                alt={`Ảnh hoạt động: ${entry.tieuDe}`}
                loading="lazy"
                className="post-image"
                role="button"
                tabIndex={0}
                aria-label={`Phóng to ảnh hoạt động: ${entry.tieuDe}`}
                onClick={() => onImageClick && onImageClick({
                  src: mediaUrl,
                  alt: entry.tieuDe,
                  author: entry.hoTen,
                  unit: entry.donVi
                })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    if (e.key === ' ') e.preventDefault();
                    if (onImageClick) {
                      onImageClick({
                        src: mediaUrl,
                        alt: entry.tieuDe,
                        author: entry.hoTen,
                        unit: entry.donVi
                      });
                    }
                  }
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    'https://placehold.co/600x400/ebeef4/005eaa.png?text=Loi+Hien+Thi+Anh';
                }}
              />
            </div>
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
          <Flower2 className="flower-icon" size={18} aria-hidden="true" />
          <span className="flower-label">
            {isActive ? 'Đã tặng hoa' : 'Tặng hoa'}
          </span>
          <span className="flower-count">{flowerCount}</span>
          {flowerAnimating && (
            <span className="flower-petals" aria-hidden="true">
              {[...Array(6)].map((_, i) => (
                <Flower2 key={i} className={`petal petal-${i + 1}`} size={16} />
              ))}
            </span>
          )}
        </button>

        <span className="post-timestamp">
          <Clock className="post-footer-icon" size={17} aria-hidden="true" />
          {timeAgo(entry.thoiGian)}
        </span>
        {entry.nhanXet && (
          <span className="post-comment">
            <MessageSquareText className="post-footer-icon" size={17} aria-hidden="true" />
            {entry.nhanXet}
          </span>
        )}
      </div>
    </Motion.article>
  );
}

export default React.memo(PostCard);
