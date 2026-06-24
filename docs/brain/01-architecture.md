# 01 — Architecture

## Stack

| Layer | Công nghệ |
|-------|-----------|
| Frontend | React 19.2.4 + Vite 8 (JSX, không TypeScript) |
| Animation | Framer Motion 12 |
| Icons | Lucide React 1.7 |
| Sanitize | DOMPurify 3.3 (XSS prevention) |
| Backend / API | Google Apps Script (GAS) — `GoogleAppsScript.js` |
| Database | Google Sheets (`DuLieu` sheet + `TangHoa` sheet) |
| Media storage | Google Drive (folder ID hardcoded trong GAS) |
| Hosting frontend | _(cần bổ sung — static build, likely GitHub Pages hoặc tương tự)_ |
| Hosting backend | Google Apps Script deployment URL (qua `VITE_GAS_API_URL`) |

## Cấu trúc thư mục chính

```
nhatky3nhat_pt/
├── src/
│   ├── main.jsx              — Entry point React
│   ├── App.jsx               — Root component: state chính, routing view, toast
│   ├── App.css               — CSS toàn cục, biến theme (sky-blue & gold)
│   ├── index.css             — Reset + font
│   ├── constants.js          — donViList: danh sách ~160+ đơn vị Công an
│   ├── components/
│   │   ├── BookCover.jsx/.css    — Màn hình bìa sách (landing)
│   │   ├── ScrapbookViewer.jsx/.css — Feed chính: infinite scroll, search, nav
│   │   ├── PostCard.jsx          — Card hiển thị 1 bài nhật ký
│   │   ├── SubmitForm.jsx/.css   — Modal nộp bài (văn bản + media)
│   │   ├── StatsView.jsx/.css    — Trang thống kê
│   │   └── AlbumView.jsx/.css    — Album ảnh từ Google Drive
│   └── services/
│       └── api.js            — Tất cả call lên GAS API
├── GoogleAppsScript.js       — Backend GAS: doGet/doPost, Sheets, Drive
├── Admin.html                — Trang Admin (serve bởi GAS ?view=admin)
├── public/                   — Static assets (favicon, images)
├── index.html                — HTML entry point
├── vite.config.js            — Vite config
├── package.json              — Dependencies
└── .env                      — VITE_GAS_API_URL (không commit)
```

## Code Graph (bản đồ module)

> Mục quan trọng nhất. Agent đọc đây để biết "đụng vào X ảnh hưởng đâu" trước khi sửa.
> Cập nhật lại MỖI KHI thay đổi cấu trúc/quan hệ phụ thuộc.

### Module/file then chốt

| Module / file | Vai trò | Được gọi bởi | Phụ thuộc vào |
|---------------|---------|--------------|---------------|
| `src/App.jsx` | Root: quản lý toàn bộ state app (entries, pagination, modal, toast, dark mode) | `src/main.jsx` | ScrapbookViewer, SubmitForm, BookCover, StatsView, AlbumView, api.js |
| `src/services/api.js` | Tất cả HTTP calls đến GAS — fetchEntries, submitEntry, sendFlower, uploadFileToDrive | App.jsx (trực tiếp) | GAS URL từ `VITE_GAS_API_URL` |
| `src/components/ScrapbookViewer.jsx` | Feed chính: danh sách bài, search bar, floating nav, infinite scroll trigger | App.jsx | PostCard, api.js (qua props) |
| `src/components/PostCard.jsx` | Render 1 bài nhật ký: text, ảnh, video, flower button | ScrapbookViewer | api.sendFlower (qua props onFlower) |
| `src/components/SubmitForm.jsx` | Modal nộp bài: validation, upload file, submit | App.jsx (lazy) | api.submitEntry, api.uploadFileToDrive, constants.donViList |
| `src/components/BookCover.jsx` | Màn hình bìa sách ban đầu — click để mở feed | App.jsx (lazy) | — |
| `src/components/StatsView.jsx` | Trang thống kê: tổng bài, tổng hoa, bảng xếp hạng đơn vị | App.jsx (lazy) | — (nhận entries qua props) |
| `src/components/AlbumView.jsx` | Album ảnh từ Drive | App.jsx (lazy) | — (nhận images qua props) |
| `src/constants.js` | `donViList` — danh sách chuẩn ~160+ đơn vị | SubmitForm, StatsView, ScrapbookViewer | — |
| `GoogleAppsScript.js` | Backend: doGet (API + Admin page), doPost (submit + flower) | GAS runtime (Google) | Spreadsheet `DuLieu`, `TangHoa`, Drive folder |
| `Admin.html` | Trang Admin dashboard | GAS doGet (`?view=admin`) | GAS runtime |

### Luồng xử lý chính

```
1. LOAD FEED
   User → BookCover (click "Mở sách")
       → App.jsx (setIsBookOpen=true)
       → ScrapbookViewer render
       → App.loadData() → api.fetchEntries(page=1, limit=20)
       → GAS doGet(?page=1&limit=20&deviceId=...)
       → Google Sheets DuLieu
       → data[] + flower counts (từ TangHoa)
       → PostCard[] render

2. INFINITE SCROLL
   User scroll xuống cuối → ScrapbookViewer trigger onLoadMore
       → App.loadMore() → api.fetchEntries(nextPage)
       → append entries vào state

3. NỘP BÀI
   User click "Viết bài" → SubmitForm modal
       → Nếu có file: api.uploadFileToDrive() → GAS getUploadUrl → Drive Resumable Upload
       → api.submitEntry(data) → GAS doPost → Sheets DuLieu.appendRow

4. TẶNG HOA
   User click flower trên PostCard → api.sendFlower(articleId)
       → GAS doPost({action:'tangHoa', articleId, deviceId})
       → TangHoa Sheet (toggle: add/remove)
       → trả về {toggled, flowerCount}
       → UI cập nhật optimistically

5. THỐNG KÊ
   User click Stats → App.openStats() → api.fetchAllEntries() (limit=99999)
       → StatsView render bảng tổng hợp

6. ALBUM
   User click Album → App.openAlbum() → api.fetchAlbumImages()
       → GAS doGet(?action=album) → Drive folder listing
       → AlbumView render grid ảnh
```

## Mô hình dữ liệu / API

### GAS Endpoints

| Method | Params | Mô tả |
|--------|--------|-------|
| GET | `?page=&limit=&q=&deviceId=` | Lấy entries có phân trang và tìm kiếm |
| GET | `?action=album` | Danh sách ảnh từ Drive folder |
| GET | `?view=admin` | Serve Admin.html |
| GET | `?action=getUploadUrl&fileName=&mimeType=&origin=` | Lấy URL Resumable Upload |
| POST | body JSON (text/plain) | Nộp bài mới |
| POST | `{action:'tangHoa', articleId, deviceId}` | Toggle flower reaction |

### Shape dữ liệu entry (từ Sheets `DuLieu`)

_(cần bổ sung — xem GoogleAppsScript.js để biết cột chính xác)_

Biết chắc gồm: `articleId`, nội dung text, đơn vị (`donVi`), ngày nộp, ID ảnh/video Drive, flower count.

### Sheet `TangHoa`

| Cột | Mô tả |
|-----|-------|
| ArticleId | ID bài viết |
| DeviceId | Device ID của người tặng |
| Timestamp | Thời điểm tặng |

## Biến môi trường

```
VITE_GAS_API_URL=   # URL deployment của Google Apps Script (doGet/doPost)
```

## Lưu ý kiến trúc quan trọng

- **GAS CORS**: POST phải dùng `Content-Type: text/plain` để tránh preflight OPTIONS (GAS không hỗ trợ preflight).
- **Device ID thay login**: User được nhận diện qua `localStorage['nk3n_device_id']`. Không có auth thật — không kiểm tra quyền phức tạp phía server.
- **Rate limiting chỉ ở client**: `checkRateLimit` trong `api.js` chặn spam từ client, nhưng không bảo vệ khỏi request trực tiếp đến GAS. Không nên tin hoàn toàn.
- **Stats load toàn bộ**: `fetchAllEntries` gọi `limit=99999` — nếu dữ liệu lớn sẽ chậm. Hiện chấp nhận được.
- **Resumable Upload**: Ảnh/video lớn upload trực tiếp vào Drive qua URL do GAS cấp — tránh qua GAS payload 50MB limit.
- **Lazy load components**: BookCover, SubmitForm, StatsView, AlbumView đều `React.lazy()` — chỉ tải khi cần.
- **Gibberish detection**: SubmitForm có filter phát hiện nội dung vô nghĩa/teencode — xem git log `859428b`.
