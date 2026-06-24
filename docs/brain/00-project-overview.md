# 00 — Project Overview

## Mục tiêu

Web app để các thành viên Hội Phụ nữ Công an tỉnh Phú Thọ tham gia phong trào **"Nhật ký Ba nhất"**:
nộp bài nhật ký, đọc bài của nhau dưới dạng scrapbook/album lưu bút, và tương tác bằng tặng hoa.
Mục đích: số hóa phong trào thi đua, lưu giữ ký ức, kết nối hơn 160 chi hội trên toàn tỉnh.

## Người dùng chính

- **Hội viên phụ nữ Công an** (~160+ đơn vị) — nộp bài nhật ký, đọc bài bạn bè, tặng hoa
- **Ban tổ chức / Admin** — duyệt bài, xem thống kê, quản lý qua trang Admin (GAS)
- **Người xem thụ động** — đọc nhật ký mà không cần đăng nhập

## Phạm vi

### Trong scope
- Nộp nhật ký: văn bản, ảnh, video (upload lên Google Drive)
- Hiển thị feed bài viết dạng scrapbook (phân trang vô hạn, tìm kiếm)
- Tặng hoa (flower reaction) — toggle, server là nguồn tin cậy
- Thống kê tổng hợp (số bài theo đơn vị, tổng hoa)
- Album ảnh từ thư mục Google Drive
- Trang Admin qua Google Apps Script (`?view=admin`)
- Dark mode / Light mode
- Giao diện sky-blue & golden-yellow, hình bìa sách (BookCover)

### Ngoài scope
- Đăng nhập/đăng ký (dùng Device ID thay thế)
- Thông báo push / email
- Chỉnh sửa/xóa bài sau khi đã nộp (chỉ Admin mới làm được)
- Backend riêng (không có server Node.js/DB — dùng GAS + Sheets)

## Điểm khác biệt / giá trị cốt lõi

Toàn bộ backend chạy trên **Google Apps Script + Google Sheets + Drive** — zero hosting cost,
dễ bảo trì bởi người không chuyên IT, không cần VPS hay database riêng. Phù hợp quy mô tổ chức
nhà nước với ngân sách hạn chế.

## Trạng thái dự án (2026-06-24)

Đang ở giai đoạn **production** — giao diện đã ổn định (sky-blue & gold theme, BookCover).
Tính năng cốt lõi hoạt động: feed, submit, flower, stats, album.
Commit gần nhất tập trung vào UI polish (BookCover layout, dove alignment).
