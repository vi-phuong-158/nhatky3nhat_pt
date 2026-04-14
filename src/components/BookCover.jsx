import React from 'react';
import { motion } from 'framer-motion';
import logoDove from '../assets/logo-dove.png';
import './BookCover.css';

export default function BookCover({ onOpen }) {
  // Biến thể Animation
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50, damping: 15 } }
  };

  return (
    <div className="book-cover-container">
      {/* Lớp vân da thật */}
      <div className="book-cover-texture"></div>
      
      {/* Bản lề / Gáy cứng bên trái */}
      <div className="book-cover-binding"></div>
      
      <motion.div 
        className="book-cover-content"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants} className="emblem-wrapper">
          <img src="/nhat-ky-3-nhat.png" alt="Logo Nhật Ký 3 Nhất" className="emblem-logo" />
        </motion.div>
        
        <motion.div variants={itemVariants} className="agency-name">
          <p>HỘI PHỤ NỮ CÔNG AN TỈNH PHÚ THỌ</p>
        </motion.div>
        
        <motion.div variants={itemVariants} className="book-title-wrapper">
          <div className="title-row">
            <h2 className="title-small">Nhật ký</h2>
            <img src={logoDove} alt="Dove Small" className="dove-title-right" />
          </div>
          <h1 className="title-large">BA NHẤT</h1>
        </motion.div>
        
        <motion.button 
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-open-book" 
          onClick={onOpen}
        >
          MỞ SỔ NHẬT KÝ
        </motion.button>

        <motion.div variants={itemVariants} className="cover-footer">
          <p>PHÚ THỌ - 2026</p>
        </motion.div>

        {/* Con chim lớn góc dưới bên trái */}
        <motion.img 
          src={logoDove} 
          alt="Dove Large" 
          className="dove-bottom-left"
          initial={{ opacity: 0, x: -100, rotate: -20 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          transition={{ delay: 0.8, duration: 1, type: "spring" }}
        />
      </motion.div>
    </div>
  );
}
