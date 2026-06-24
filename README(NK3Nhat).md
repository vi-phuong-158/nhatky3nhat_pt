# 📖 Nhật ký 3 nhất - Digital Scrapbook Platform

> Nền tảng ghi chép và chia sẻ những khoảnh khắc "3 nhất" đầy ấn tượng, kết hợp trải nghiệm tương tác hiện đại và lưu trữ đám mây bền vững.

---

## 🌟 Giới thiệu

**Nhật ký 3 nhất** là một ứng dụng Web (Digital Scrapbook) được thiết kế để lưu giữ những kỷ niệm, thành tích và khoảnh khắc đáng nhớ trong chiến dịch viết Nhật ký 3 nhất". Dự án mang đến trải nghiệm lật sách tương tác sinh động, giúp người dùng dễ dàng theo dõi, gửi bài viết và quản lý các hoạt động phong trào một cách trực quan và chuyên nghiệp.

---

## ✨ Tính năng nổi bật

* **📖 Trải nghiệm lật sách (Book Flip):** Hiệu ứng mở bìa sách và lật trang mượt mà, tạo cảm giác như đang sử dụng một cuốn nhật ký thật.
* **📝 Lưu bút điện tử:** Cho phép người dùng gửi bài viết kèm hình ảnh, tích hợp xử lý an toàn dữ liệu (DOMPurify).
* **📊 Dashboard Thống kê:** Hệ thống biểu đồ và dữ liệu thống kê trực quan về số lượng bài viết, đơn vị tham gia.
* **🖼️ Album ảnh thông minh:** Tự động đồng bộ và hiển thị hình ảnh từ Google Drive.
* **🌓 Chế độ Dark/Light Mode:** Tùy chỉnh giao diện theo sở thích người dùng với hiệu ứng Glassmorphism sang trọng.
* **🔍 Tìm kiếm & Phân trang:** Hỗ trợ tìm kiếm bài viết nhanh chóng và tải dữ liệu vô hạn (Infinite Scroll).

---

## 💻 Công nghệ sử dụng

### **Frontend**

* **Framework:** React 19 + Vite (Tối ưu tốc độ build và runtime).
* **Animations:** Framer Motion (Xử lý các hiệu ứng chuyển cảnh và tương tác phức tạp).
* **Icons:** Lucide React & Material Symbols.
* **Styling:** Vanilla CSS (Modern CSS variables, Glassmorphism design).

### **Backend & Storage**

* **Engine:** Google Apps Script (GAS) - Chạy serverless trên hạ tầng Google.
* **Database:** Google Sheets (Quản lý dữ liệu bài viết và thống kê).
* **File Storage:** Google Drive API (Lưu trữ và phục vụ hình ảnh).

---

## 📁 Cấu trúc thư mục

```text
nhatky3nhat_pt/
├── src/
│   ├── components/       # Các thành phần UI (Album, BookCover, Stats, Form...)
│   ├── services/         # api.js - Xử lý kết nối với Google Apps Script
│   ├── assets/           # Hình ảnh, font và tài nguyên tĩnh
│   ├── App.jsx           # Component gốc, quản lý trạng thái chính
│   └── main.jsx          # Điểm đầu vào (Entry point) của ứng dụng
├── public/               # Tài liệu công khai
├── GoogleAppsScript.js   # Mã nguồn phía Backend (Triển khai trên GAS)
├── Admin.html            # Giao diện quản trị (nếu có)
├── vite.config.js        # Cấu hình công cụ đóng gói Vite
└── .env.example          # Mẫu cấu hình biến môi trường
```

---

## 🚀 Hướng dẫn cài đặt & Chạy dự án

### **1. Yêu cầu hệ thống**

* Node.js (Phiên bản 18.0 trở lên)
* NPM hoặc Yarn

### **2. Các bước cài đặt**

1. **Clone mã nguồn:**

    ```bash
    git clone [url-cua-ban]
    cd nhatky3nhat_pt
    ```

2. **Cài đặt thư viện:**

    ```bash
    npm install
    ```

3. **Cấu hình biến môi trường:**
    * Tạo file `.env` từ file mẫu:

        ```bash
        cp .env.example .env
        ```

    * Mở file `.env` và điền URL của Web App Google Apps Script đã triển khai:

        ```env
        VITE_GAS_API_URL=https://script.google.com/macros/s/YOUR_API_ID/exec
        ```

### **3. Khởi chạy**

* **Chế độ phát triển (Development):**

    ```bash
    npm run dev
    ```

* **Đóng gói sản phẩm (Production):**

    ```bash
    npm run build
    ```

---

## 🗺️ Kế hoạch phát triển (Roadmap)

1. **📥 Export Digital to Physical:** Phát triển tính năng xuất toàn bộ nội dung nhật ký ra định dạng file PDF chất lượng cao để người dùng có thể in ấn thành sách thật.
2. **🤖 AI Content Enhancement:** Tích hợp AI (Gemini API) để tự động gợi ý caption cho hình ảnh và phân loại nội dung bài viết theo chủ đề tự động.

---
**Senior Software Engineer** | *Dự án Nhật ký 3 nhất*
