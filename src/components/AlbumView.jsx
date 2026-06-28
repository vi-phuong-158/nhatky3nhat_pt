import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageOff, Images, X } from 'lucide-react';
import './AlbumView.css';

/* ─── Card animation ─── */
const imgVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (i) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.04, duration: 0.4, ease: [0.25, 0.8, 0.25, 1] },
  }),
};

/* ═══════════════════════════════════════
   COMPONENT: AlbumView — Pinterest-style
   ═══════════════════════════════════════ */
export default function AlbumView({ images, loading, onClose }) {
  const [selectedImg, setSelectedImg] = useState(null);

  const handleClose = useCallback(() => setSelectedImg(null), []);

  return (
    <motion.div
      className="album-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="album-container"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 300 } }}
        exit={{ y: 40, opacity: 0 }}
      >
        {/* Header */}
        <header className="album-header">
          <div className="album-header-left">
            <Images className="album-header-icon" size={26} aria-hidden="true" />
            <div>
              <h2 className="album-title">Album ảnh</h2>
              {!loading && images.length > 0 && (
                <span className="album-count">{images.length} ảnh</span>
              )}
            </div>
          </div>
          <button className="album-close" onClick={onClose} aria-label="Đóng album">
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        {/* Loading */}
        {loading && (
          <div className="album-loading">
            <div className="album-loading-spinner" />
            <span>Đang tải album ảnh...</span>
          </div>
        )}

        {/* Empty state */}
        {!loading && images.length === 0 && (
          <div className="album-empty">
            <ImageOff className="album-empty-icon" size={48} aria-hidden="true" />
            <p>Chưa có ảnh nào trong album</p>
          </div>
        )}

        {/* Pinterest masonry grid */}
        {!loading && images.length > 0 && (
          <div className="album-grid">
            {images.map((img, i) => (
              <motion.div
                key={img.id}
                className="album-card"
                custom={i}
                variants={imgVariants}
                initial="hidden"
                animate="visible"
                layoutId={`album-img-${img.id}`}
                onClick={() => setSelectedImg(img)}
                role="button"
                tabIndex={0}
                aria-label={`Phóng to ảnh: ${img.name.replace(/\.(jpg|jpeg|png|gif|webp|bmp)$/i, '')}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedImg(img);
                  }
                }}
              >
                <div className="album-img-wrapper">
                  <img
                    src={img.thumb}
                    alt={img.name}
                    className="album-img"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = img.url;
                    }}
                  />
                </div>
                <div className="album-card-info">
                  <span className="album-card-name" title={img.name}>
                    {img.name.replace(/\.(jpg|jpeg|png|gif|webp|bmp)$/i, '')}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImg && (
          <motion.div
            className="album-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          >
            <button className="album-lightbox-close" onClick={handleClose} aria-label="Đóng ảnh">
              <X size={22} aria-hidden="true" />
            </button>
            <motion.img
              src={selectedImg.url}
              alt={selectedImg.name}
              className="album-lightbox-img"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, transition: { type: 'spring', damping: 22 } }}
              exit={{ scale: 0.9, opacity: 0 }}
            />
            <div className="album-lightbox-caption" onClick={(e) => e.stopPropagation()}>
              {selectedImg.name.replace(/\.(jpg|jpeg|png|gif|webp|bmp)$/i, '')}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
