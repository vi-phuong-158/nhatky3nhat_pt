import React from 'react';
import logoCand from '../assets/logo-cand.png';
import logoPhuNu from '../assets/logo-phunu.png';
import './BookCover.css';

export default function BookCover({ onOpen }) {
  return (
    <div className="book-cover-container">
      {/* Lớp vân da thật */}
      <div className="book-cover-texture"></div>
      
      {/* Bản lề / Gáy cứng bên trái */}
      <div className="book-cover-binding"></div>
      
      <div className="book-cover-content">
        <div className="emblem-wrapper">
          <img src={logoCand} alt="Logo CAND" className="emblem-logo" />
          <img src={logoPhuNu} alt="Logo Hội Phụ Nữ" className="emblem-logo" />
        </div>
        
        <div className="agency-name">
          <p>HỘI PHỤ NỮ CÔNG AN TỈNH PHÚ THỌ</p>
          <p className="sub-agency">BAN PHỤ NỮ</p>
        </div>
        
        <div className="book-title-wrapper">
          <h2 className="title-small">Nhật ký</h2>
          <h1 className="title-large">BA NHẤT</h1>
        </div>
        
        <button className="btn-open-book" onClick={onOpen}>
          MỞ SỔ NHẬT KÝ
        </button>
      </div>
    </div>
  );
}
