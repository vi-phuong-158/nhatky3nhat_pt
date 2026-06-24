# 05 — Testing & Deploy

> Mọi lệnh để dựng môi trường, chạy, test, build, deploy. Agent đọc đây thay vì đoán lệnh.

## Cài đặt môi trường local

```bash
# Clone (nếu chưa có)
git clone <repo-url>
cd nhatky3nhat_pt

# Cài dependencies
npm install

# Tạo file .env (copy từ .env.example, điền URL thật)
cp .env.example .env
```

Biến môi trường cần thiết (tạo file `.env`, không commit):
```
VITE_GAS_API_URL=https://script.google.com/macros/s/<DEPLOYMENT_ID>/exec
```

Lấy `DEPLOYMENT_ID` từ Google Apps Script Editor → Deploy → Manage Deployments.

## Chạy local (dev)

```bash
npm run dev
```

Truy cập: `http://localhost:5173`

> Lưu ý: Frontend cần `VITE_GAS_API_URL` hợp lệ để load dữ liệu. Nếu chưa có URL thật,
> sẽ thấy cảnh báo console nhưng app vẫn render (với dữ liệu rỗng).

## Build (production)

```bash
npm run build
```

Output: thư mục `dist/` — chứa static files để deploy.

```bash
# Preview build trước khi deploy
npm run preview
```

## Lint

```bash
npm run lint
```

## Test

Dự án chưa có test tự động. Checklist thủ công trước khi commit/push:

- [ ] `npm run lint` — không có lỗi
- [ ] `npm run dev` — console không có lỗi đỏ
- [ ] BookCover hiển thị đúng, click "Mở sách" chuyển sang feed
- [ ] Feed load bài viết từ Sheets, scroll xuống cuối tải thêm
- [ ] Tìm kiếm lọc được bài viết (debounce 500ms)
- [ ] Click flower: số hoa tăng/giảm đúng, toggle lại hoạt động
- [ ] Modal nộp bài mở/đóng đúng (click overlay, Escape)
- [ ] Nộp bài text thành công (xuất hiện toast success)
- [ ] Upload ảnh nhỏ kèm bài viết thành công
- [ ] Trang Thống kê mở và hiển thị bảng xếp hạng
- [ ] Album ảnh mở và hiển thị grid ảnh
- [ ] Dark mode toggle hoạt động và persist qua reload

## Deploy

### Frontend (static build)

1. Chạy `npm run build` → lấy thư mục `dist/`
2. Upload `dist/` lên hosting tĩnh _(cần bổ sung — chưa xác định hosting cụ thể)_

### Backend (Google Apps Script)

1. Mở Google Apps Script Editor (script.google.com)
2. Copy nội dung `GoogleAppsScript.js` vào Editor
3. Copy nội dung `Admin.html` vào file `Admin.html` trong GAS project
4. Deploy → New Deployment → Web App
   - Execute as: Me
   - Who has access: Anyone
5. Copy Deployment URL → điền vào `.env` của frontend

> Mỗi lần sửa GAS code phải tạo **New Deployment** (không phải chỉnh Deployment cũ)
> để thay đổi có hiệu lực.

## Môi trường

| Môi trường | Branch | URL |
|-----------|--------|-----|
| Production | `main` | _(cần bổ sung)_ |
| Local dev | — | `http://localhost:5173` |

## Lưu ý

- **GAS Quota**: Mỗi ngày GAS có giới hạn URL Fetch, execution time. Nếu quá nhiều request cùng lúc có thể bị throttle.
- **GAS cold start**: Request đầu tiên sau thời gian không dùng có thể mất 2-5 giây.
- **Drive upload CORS**: Resumable Upload cần gửi `origin` parameter để GAS set đúng CORS header cho Drive URL.
- **Sheets row limit**: Google Sheets giới hạn 10 triệu ô — không phải vấn đề với quy mô hiện tại (~160 đơn vị, vài trăm bài).
