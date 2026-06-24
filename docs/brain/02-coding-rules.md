# 02 — Coding Rules

## Nguyên tắc chung

- Viết ít nhất có thể để giải quyết đúng task. Không tính năng speculative.
- Không abstraction sớm: 3 đoạn lặp vẫn tốt hơn 1 abstraction non.
- Không xử lý lỗi cho kịch bản không thể xảy ra.
- Comment WHY, không comment WHAT — tên biến/hàm đã nói WHAT.
- Không refactor code lân cận nếu không liên quan task.

## Nguyên tắc Ponytail ("senior dev lười hiệu quả")

> LUÔN có hiệu lực, trừ khi người dùng nói **"tắt ponytail"** / **"normal mode"**.
> Lười = hiệu quả, không phải cẩu thả. Code tốt nhất là code không cần viết.

### Thang quyết định — dừng ở nấc đầu tiên thỏa mãn
1. Việc này có cần tồn tại không? Nhu cầu suy diễn → bỏ qua, nói rõ 1 dòng. (YAGNI)
2. Thư viện chuẩn (stdlib) làm được? → Dùng nó.
3. Tính năng có sẵn của nền tảng phủ được? → Dùng (CSS thay vì JS khi có thể).
4. Dependency đã cài giải quyết được? → Dùng. KHÔNG thêm thư viện mới cho việc vài dòng.
5. Gói trong 1 dòng được? → Một dòng.
6. Chỉ khi đó: viết lượng code tối thiểu chạy được.

### TUYỆT ĐỐI KHÔNG được "lười" ở
- Validation dữ liệu đầu vào (đặc biệt nội dung bài viết — có gibberish filter).
- Xử lý lỗi để tránh mất dữ liệu người dùng.
- Bảo mật: sanitize HTML (DOMPurify), không hardcode secret.
- Bất cứ thứ gì người dùng yêu cầu rõ ràng.

## Style code

- **Ngôn ngữ / runtime:** JavaScript (ESM) — không TypeScript, không CommonJS
- **Format:** 2-space indent, single quotes, không semicolon cuối dòng (xem code hiện tại)
- **Linter:** ESLint 9 với `eslint-plugin-react-hooks` và `eslint-plugin-react-refresh`
- **CSS:** File `.css` riêng cho từng component, dùng CSS variables cho theme (định nghĩa trong `App.css`)

## Đặt tên

- **Component:** PascalCase (`ScrapbookViewer`, `PostCard`)
- **File component:** `ComponentName.jsx` + `ComponentName.css`
- **Hàm/biến:** camelCase (`fetchEntries`, `donViList`, `isFormVisible`)
- **CSS class:** kebab-case (`glass-card`, `blue-glow`, `submit-modal-overlay`)
- **LocalStorage key:** prefix `nk3n_` (`nk3n_device_id`, `nk3n_dark_mode`)
- **Biến môi trường:** `VITE_` prefix theo quy ước Vite

## Bảo mật

- Không hardcode secret/API key — dùng `.env` (đã có `.gitignore`).
- Không commit file `.env`.
- Sanitize HTML bằng DOMPurify trước khi render nội dung user-generated.
- POST lên GAS phải dùng `Content-Type: text/plain` (xem `03-decisions.md`).
- `checkRateLimit` trong `api.js` là client-side guard — không thay thế validation server.
- Không log nội dung bài viết hay device ID ra console production.

## Không làm

- Không chuyển sang TypeScript mà không thảo luận trước.
- Không thêm state management library (Redux, Zustand…) — React state + props hiện tại đủ dùng.
- Không thêm CSS framework (Tailwind, MUI…) — đang dùng plain CSS với variables.
- Không xóa gibberish/teencode filter trong SubmitForm mà không có lý do rõ ràng.
- Không thay đổi SPREADSHEET_ID hay SHEET_NAME trong GAS mà không được yêu cầu.

## Test

Dự án chưa có test tự động. Checklist thủ công trước khi commit:
- [ ] `npm run lint` không có lỗi
- [ ] `npm run dev` chạy được, không lỗi console
- [ ] Nộp bài test (text + ảnh nhỏ) thành công
- [ ] Feed load được, scroll vô hạn hoạt động
- [ ] Tặng hoa toggle đúng (add/remove)
- [ ] Dark mode switch hoạt động
- [ ] Trang Stats mở ra và hiển thị dữ liệu

## Git

- Branch từ `main`, đặt tên: `feat/...`, `fix/...`, `docs/...`, `ui/...`.
- Commit message format: `type: short description` (xem git log để theo style hiện tại).
- Không push thẳng `main` nếu chưa được yêu cầu.
- Không `--force` push trừ khi được yêu cầu rõ ràng.
