# 06 — AI Working Log

> Nhật ký các lần AI (Claude Code / Codex) sửa code. Mỗi agent PHẢI thêm entry sau mỗi lần
> chạm vào code. Đọc ngược từ trên xuống để biết gần đây ai đã làm gì và vì sao.

---

## Format entry

```
## [YYYY-MM-DD] [Tên task ngắn gọn]
- **Agent:** Claude Code | Codex
- **Thay đổi:** <mô tả ngắn những gì đã làm>
- **File đã sửa:** <danh sách file>
- **Lý do:** <vì sao cần thay đổi>
- **Kiểm tra:** <cách xác minh hoạt động đúng>
```

---

## [2026-06-24] Phase 2: lucide icons + trang nhật ký

- **Agent:** Codex
- **Thay đổi:** Thay toàn bộ Material Symbols trong frontend Vite sang `lucide-react`, gỡ font Material Symbols khỏi `index.html`, redesign `PostCard` thành trang nhật ký giấy kẻ với washi tape, dấu mộc tiêu chí, ảnh polaroid, nút hoa dùng icon SVG và dark mode tương ứng. Sửa nhỏ lightbox feed để nhận đúng object ảnh từ `PostCard`.
- **File đã sửa:** `index.html`, `src/App.jsx`, `src/App.css`, `src/components/ScrapbookViewer.jsx`, `src/components/ScrapbookViewer.css`, `src/components/PostCard.jsx`, `src/components/SubmitForm.jsx`, `src/components/SubmitForm.css`, `src/components/StatsView.jsx`, `src/components/StatsView.css`, `src/components/AlbumView.jsx`, `docs/brain/04-current-tasks.md`.
- **Lý do:** Hoàn thành Phase 2 trong backlog: bỏ web font icon render-blocking và đưa giao diện bài viết về phong cách "trang nhật ký" đúng concept dự án.
- **Kiểm tra:** `npm run build` PASS; `npm run lint` còn 64 lỗi (≤ baseline 65, không tăng lỗi); `rg "material-symbols" src index.html` không có kết quả; Chrome headless mở `http://127.0.0.1:5173`, feed thật render có post, 84 SVG, không lộ text Material; đã chụp kiểm tra light/dark tại `scratch/phase2-feed.png` và `scratch/phase2-feed-dark.png`.

## [2026-06-24] Phase 1 Hiệu năng: tối ưu ảnh + bỏ Tailwind CDN

- **Agent:** Claude Code
- **Thay đổi:**
  1. Nén + resize 2 logo (sharp, dùng 1 lần rồi gỡ): `nhat-ky-3-nhat.png` 4.85MB→48KB, `logo-dove.png` 841KB→15KB (giảm ~99%). Ảnh gốc backup ở `scratch/img-backup/`.
  2. Bỏ Tailwind CDN runtime (`cdn.tailwindcss.com`) khỏi `index.html`; chuyển toàn bộ utility class còn dùng sang plain CSS.
- **File đã sửa:** `index.html` (bỏ CDN+config, modal Thông Điệp → class `.wm-*`), `src/components/PostCard.jsx` (+ CSS `.post-criteria-badge`, `.post-video-*`), `src/components/ScrapbookViewer.jsx` (input/select/option/icon), `src/components/SubmitForm.jsx` (+ CSS `.sf-file-*`, `.sf-progress-*`), `ScrapbookViewer.css`, `SubmitForm.css`. Thêm `.claude/launch.json`.
- **Lý do:** ~5.6MB ảnh tải ở màn hình đầu là thủ phạm hiệu năng số 1; Tailwind CDN là script chặn render + compile runtime, không nên dùng production.
- **Kiểm tra:** `npm run build` PASS; `npm run lint` = 65 lỗi (y hệt baseline, không thêm lỗi mới); audit grep xác nhận hết Tailwind class trong src + index.html.
- **Chưa làm (Phase 2):** Material Symbols web font → lucide-react (gộp vào lúc redesign từng component để tránh sửa 2 lần); redesign PostCard kiểu "trang nhật ký".

---

## [2026-06-24] Khởi tạo bộ não dự án (AI project brain)

- **Agent:** Claude Code
- **Thay đổi:** Tạo `CLAUDE.md`, `AGENTS.md` và `docs/brain/00-06` làm bộ nhớ dùng chung cho AI agent.
- **File đã tạo:** `CLAUDE.md`, `AGENTS.md`, `docs/brain/00-project-overview.md`, `docs/brain/01-architecture.md`, `docs/brain/02-coding-rules.md`, `docs/brain/03-decisions.md`, `docs/brain/04-current-tasks.md`, `docs/brain/05-testing-and-deploy.md`, `docs/brain/06-ai-working-log.md`
- **Lý do:** Thiết lập ngữ cảnh, Code Graph và quy tắc dùng chung để mọi agent đọc trước khi code — tránh code mù, lặp sai lầm cũ, đổi stack tùy tiện.
- **Kiểm tra:** Các file tồn tại trong `docs/brain/`, nội dung phản ánh đúng stack và kiến trúc dự án tại thời điểm khởi tạo (React 19 + Vite 8 + GAS + Sheets).
---

## [2026-06-24] Phase 2B: PostCard mobile-first font

- **Agent:** Codex
- **Thay đổi:** Đưa nhãn tiêu chí vào cùng hàng với tiêu đề bài viết, chỉnh PostCard theo hướng mobile-first đã duyệt: tiêu đề dùng `Be Vietnam Pro`, nội dung bài viết dùng `Dancing Script`, badge tiêu chí thu gọn hơn trên màn hình nhỏ. Alias `motion` thành `Motion` để ESLint không báo unused sai với JSX member.
- **File đã sửa:** `src/components/PostCard.jsx`, `src/components/ScrapbookViewer.css`.
- **Lý do:** Triển khai bản hiển thị mỗi bài viết như một trang nhật ký/trang vở trang trí, ưu tiên trải nghiệm đọc trên mobile và sửa đúng yêu cầu font tiếng Việt.
- **Kiểm tra:** `npm run build` PASS; `npx eslint src/components/PostCard.jsx` PASS; `git diff --check -- src/components/PostCard.jsx src/components/ScrapbookViewer.css` PASS; kiểm tra browser mobile 390px xác nhận app mở được, nhưng dữ liệu feed từ máy chủ đang lỗi không ổn định nên chưa đo được card thật trong live feed. `npm run lint` toàn repo bị timeout/kẹt sau 4 phút trong môi trường hiện tại.
---

## [2026-06-24] Text home + modal PA01

- **Agent:** Codex
- **Thay đổi:** Đổi tên đơn vị hiển thị ở trang bìa thành `Chi hội phụ nữ Phòng PA01`. Phần modal chào mừng bỏ tên cá nhân và để một dòng chung `Chi hội phụ nữ Phòng PA01`.
- **File đã sửa:** `src/components/BookCover.jsx`, `index.html`.
- **Lý do:** Đồng bộ thông tin nhận diện ở màn hình trang chủ và modal chào mừng theo đơn vị được yêu cầu.
- **Kiểm tra:** `npm run build` PASS; `rg` xác nhận chuỗi mới có mặt ở `src/components/BookCover.jsx` và `index.html`; `git diff --check -- src/components/BookCover.jsx index.html` PASS.
---

## [2026-06-24] Sync meta description PA01

- **Agent:** Codex
- **Thay đổi:** Đổi `meta description` trong `index.html` từ tên cấp tỉnh sang `Chi hội Phụ nữ Phòng PA01`.
- **File đã sửa:** `index.html`.
- **Lý do:** Tránh còn sót tên đơn vị cũ ở metadata user-facing sau khi đã đổi text trang bìa và modal.
- **Kiểm tra:** `rg` không còn chuỗi cũ trong `src/` và `index.html`; `git diff --check -- index.html` PASS.
