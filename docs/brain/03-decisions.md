# 03 — Technical Decisions

> Ghi lại quyết định kỹ thuật quan trọng để agent sau không "phát minh lại" hoặc đảo ngược
> mà không biết lý do. Mỗi entry: quyết định gì, vì sao, đánh đổi gì.

---

## [~2026-04] Google Apps Script + Sheets làm backend thay vì server riêng

- **Quyết định:** Toàn bộ backend (API, database, media storage) chạy trên GAS + Google Sheets + Drive.
- **Lý do:** Zero hosting cost; không cần VPS hay DB; Admin có thể tự quản lý dữ liệu trực tiếp trên Google Sheets mà không cần dashboard kỹ thuật; phù hợp tổ chức nhà nước ngân sách hạn chế.
- **Đánh đổi:** GAS có quota giới hạn (execution time, URL fetch); cold start chậm ~1-2s; không có real-time; không scale tốt nếu dữ liệu cực lớn.
- **Người quyết định:** User (chủ dự án)

---

## [~2026-04] Content-Type: text/plain cho POST lên GAS

- **Quyết định:** Tất cả POST request đến GAS endpoint dùng `Content-Type: text/plain;charset=utf-8` thay vì `application/json`.
- **Lý do:** GAS không hỗ trợ CORS preflight (OPTIONS). `application/json` kích hoạt preflight và bị block. `text/plain` là "simple request" — không cần preflight.
- **Đánh đổi:** Body phải `JSON.stringify()` thủ công ở client và `JSON.parse()` trong GAS `doPost`.
- **Người quyết định:** Claude Code (xác minh từ comment trong api.js)

---

## [~2026-04] Device ID thay cho đăng nhập

- **Quyết định:** Nhận diện user bằng UUID ngẫu nhiên lưu trong `localStorage['nk3n_device_id']`, không có hệ thống login.
- **Lý do:** Giảm ma sát cho người dùng (không cần tạo tài khoản); phong trào thi đua không cần auth nghiêm ngặt; đủ để track flower reaction theo thiết bị.
- **Đánh đổi:** Không thể xác minh danh tính thật; xóa localStorage mất lịch sử; flower có thể bị reset nếu đổi thiết bị.
- **Người quyết định:** User

---

## [~2026-04] Resumable Upload cho file lớn qua GAS intermediary

- **Quyết định:** Upload ảnh/video bằng Drive Resumable Upload API — GAS cấp `uploadUrl`, client upload trực tiếp lên Drive (không qua GAS payload).
- **Lý do:** GAS có giới hạn request body ~50MB và RAM hạn chế; Base64 encoding sẽ làm file lớn hơn 33%; Resumable Upload cho phép track tiến độ và resume nếu mạng yếu.
- **Đánh đổi:** Flow phức tạp hơn (2 bước: lấy URL → upload); cần CORS header `origin` trong request đầu để Drive trả đúng header.
- **Người quyết định:** Claude Code

---

## [~2026-04] React 19 + Vite 8, không TypeScript

- **Quyết định:** Dùng JavaScript thuần (JSX), không TypeScript.
- **Lý do:** Dự án nhỏ, 1 developer; TypeScript thêm overhead build và learning curve không cần thiết cho scope hiện tại.
- **Đánh đổi:** Không có type checking tĩnh — phải cẩn thận hơn với shape dữ liệu từ API.
- **Người quyết định:** User

---

## [~2026-04] Theme Sky Blue & Golden Yellow

- **Quyết định:** Màu chủ đạo là xanh trời (sky blue) và vàng vàng (golden yellow); font chữ tay cho modal; giao diện hình bìa sách (BookCover) làm landing.
- **Lý do:** Màu đặc trưng của Công an nhân dân (xanh); vàng là màu thi đua/danh dự; bìa sách phù hợp với concept "nhật ký".
- **Đánh đổi:** Theme khá đặc thù, khó tái sử dụng cho dự án khác.
- **Người quyết định:** User

---

## Template cho entry mới

```
## [YYYY-MM-DD] Tiêu đề quyết định

- **Quyết định:** <mô tả>
- **Lý do:** <vì sao chọn hướng này>
- **Đánh đổi:** <cái gì bị đánh đổi>
- **Người quyết định:** <user / Claude Code / Codex>
```
