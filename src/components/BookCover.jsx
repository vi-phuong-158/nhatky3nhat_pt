import React from 'react';
import { motion } from 'framer-motion';
import logoCand from '../assets/logo-cand.png';
import logoPhuNu from '../assets/logo-phunu.png';
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
          <img src={logoCand} alt="Logo CAND" className="emblem-logo" />
          <img src={logoPhuNu} alt="Logo Hội Phụ Nữ" className="emblem-logo" />
        </motion.div>
        
        <motion.div variants={itemVariants} className="agency-name">
          <p>HỘI PHỤ NỮ CÔNG AN TỈNH PHÚ THỌ</p>
          <p className="sub-agency">BAN PHỤ NỮ</p>
        </motion.div>
        
        <motion.div variants={itemVariants} className="book-title-wrapper">
          <h2 className="title-small">Nhật ký</h2>
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
      </motion.div>
    </div>
  );
}
