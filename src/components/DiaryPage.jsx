import React from 'react';
import '../App.css'; 

export default function DiaryPage() {
  return (
    <div className="scrapbook-page glass-card blue-glow">
      <h1>Nhật ký Ba nhất</h1>
      <p className="slogan">Kỷ luật nhất – Trung thành nhất – Gần dân nhất</p>
      
      <div style={{ marginTop: '20px', lineHeight: '1.6', fontSize: '15px' }}>
        <p>Đây là trang mẫu hiển thị phong cách Scrapbook.</p>
        <br />
        <p>Mỗi trang sẽ hiển thị hình ảnh và câu chuyện của các chiến sĩ, mang lại một trải nghiệm thực tế như lật giở một cuốn lưu bút.</p>
      </div>
    </div>
  );
}
