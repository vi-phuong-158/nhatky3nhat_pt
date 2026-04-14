# Nâng cấp Luồng Tải Hình ảnh/Video Trực tiếp lên Google Drive (Cách B)

Thay đổi kiến trúc tải file từ việc gửi chuỗi Base64 thông qua Apps Script sang cơ chế **Resumable Upload** trực tiếp lên Google Drive API. Việc này giúp vượt qua giới hạn dung lượng 50MB, khắc phục tình trạng tràn RAM trên điện thoại khi tải video, và tăng tốc độ tải file đáng kể.

## User Review Required

> [!WARNING]
> **Thay đổi Backend (Google Apps Script):**
> Việc cập nhật mã nguồn GAS yêu cầu bạn phải tự copy mã mới dán vào `script.google.com` và thực hiện **Deploy as Web App** (chọn bản "New" thay vì chỉnh sửa bản cũ). Hãy cân nhắc xem bạn đã sẵn sàng thực hiện thao tác này chưa trước khi phê duyệt.

## Proposed Changes

### Thay đổi Backend (Google Apps Script)

#### [MODIFY] `GoogleAppsScript.js`
- **Thêm API cấp phát URL tải lên (`doGet`):** Xử lý tham số `action=getUploadUrl`, sử dụng `UrlFetchApp` cùng `ScriptApp.getOAuthToken()` để tạo 1 URL tải lên tạm thời (Resumable Session) trỏ trực tiếp đến thư mục ảnh/video. Backend trả `uploadUrl` này về cho Frontend.
- **Tối ưu hàm nhận bài viết (`doPost`):** Giữ khả năng tương thích ngược với Base64 (nếu cần), đồng thời thêm logic mới: khi Frontend gửi `fileId`, tự động thiết lập quyền mở rộng (`ANYONE_WITH_LINK`) cho file đó và gắn tag `[VIDEO]` vào đường link nếu file gốc là video để dễ nhận diện khi render.

---

### Thay đổi Frontend (React & HTML)

#### [MODIFY] `src/services/api.js`
- **Viết hàm upload riêng (`uploadFileToDrive`):** 
  - Bước 1: Fetch URL tạm thời từ GAS.
  - Bước 2: Dùng `XMLHttpRequest` thực hiện HTTP PUT gửi Binary Data của file trực tiếp đến server Google Drive. Cơ chế này đính kèm lắng nghe sự kiện `progress` để đo % hoàn thành.

#### [MODIFY] `src/components/SubmitForm.jsx`
- **Mở rộng định dạng:** Cho phép chọn `video/mp4`, `video/quicktime` (giới hạn dung lượng khả dụng có thể nâng lên ~100MB cho video).
- **Thêm thanh Progress Bar:** Áp dụng hàm upload mới cùng giao diện Progress Bar cho phép người dùng thấy số % đang tải lên, tránh cảm giác bị treo khi tải video lớn.

#### [MODIFY] `src/components/ScrapbookViewer.jsx`
- **Hỗ trợ Player Video:** Bổ sung logic kiểm tra đường link `[VIDEO]`. Nếu phát hiện, thay vì dùng thẻ `<img>`, sổ lưu bút sẽ render thẻ `<iframe>` nhúng trực tiếp API xem trước (`/preview`) tốc độ cao của Google Drive.

#### [MODIFY] `Admin.html`
- **Bổ sung UI Video ở Dashboard:** Ở cột Hình ảnh, nếu là video, sẽ tự động render một nút "Xem Video" thay vì thumbnail. Giúp giảm tải tải thumbnail nặng từ video khi quản trị viên load bảng danh sách.

## Verification Plan

### Manual Verification
- Bạn (Admin) cập nhật mã lên GAS và sinh URL API mới.
- Tôi sẽ thử tải một video ~20-30MB lên form trên localhost hiển thị thanh tiến trình 1->100%.
- Kiểm tra dữ liệu được ghi trên Google Sheet xem có chứa đoạn `[VIDEO]https://...` không.
- Kiểm tra trang xem nhật ký và trang Admin xem file ảnh/video có hiển thị đúng cấu trúc được thiết kế không.
