# 07 — Hướng dẫn Phase 2: Đổi icon (lucide) + Redesign "Trang nhật ký"

> **File này dành cho AI agent tiếp nhận công việc (khởi động lạnh).** Đọc hết file này
> + `00`→`06` trong `docs/brain/` TRƯỚC khi sửa code. Đây là spec thực thi chi tiết cho Phase 2.
> Người viết: Claude Code, 2026-06-24. Trạng thái: Phase 1 (hiệu năng) đã xong, Phase 2 chưa làm.

---

## 0. Bối cảnh — đã có gì, làm gì tiếp

**Dự án:** "Nhật ký Ba nhất" — web React 19 + Vite 8, backend Google Apps Script + Sheets.
Xem `00-project-overview.md` và `01-architecture.md` (có Code Graph) để nắm kiến trúc.

**Phase 1 (ĐÃ XONG — xem `06-ai-working-log.md`):**
- Nén 2 logo (4.85MB→48KB, 841KB→15KB).
- Bỏ Tailwind CDN, chuyển hết utility class sang plain CSS.

**Phase 2 (FILE NÀY — cần làm), gồm 2 phần, NÊN làm cùng lúc trên từng component để tránh sửa 2 lần:**
- **2A.** Thay icon web-font Material Symbols → `lucide-react` (đã cài sẵn, v1.7.0). Sau đó gỡ
  2 link font Material Symbols khỏi `index.html` để bớt tải nặng + bỏ render-blocking.
- **2B.** Redesign `PostCard` (và đồng bộ nhẹ các màn khác) sang phong cách **trang nhật ký trang trí**.

**Vì sao gộp 2A + 2B:** redesign sẽ viết lại markup/CSS của PostCard; nếu đổi icon riêng rồi
redesign sau là chạm file 2 lần. Làm song song từng component thì gọn hơn.

---

## 1. Quy tắc bắt buộc (KHÔNG được bỏ qua)

1. **Đọc `docs/brain/00`→`06` trước.** Đặc biệt Code Graph trong `01-architecture.md`.
2. **Thay đổi phẫu thuật:** chỉ sửa phần cần; giữ nguyên logic nghiệp vụ (fetch API, rate limit,
   sanitize DOMPurify, validation form). KHÔNG đụng `src/services/api.js` và `GoogleAppsScript.js`.
3. **Không hardcode secret.** Không sửa `.env`, `SPREADSHEET_ID`.
4. **Sau khi sửa: ghi entry vào `06-ai-working-log.md`** (bắt buộc).
5. **Kiểm chứng sau mỗi component:** `npm run build` PASS và `npm run lint` KHÔNG tăng số lỗi so
   với baseline. Baseline hiện tại = **65 lỗi** (toàn lỗi có sẵn từ trước: `api.js` async executor,
   vài biến unused như `getBadgeClass`, `formatDate`, `motion`...). Mục tiêu: giữ ≤ 65, đừng thêm mới.
6. **Giữ accessibility:** mọi icon trang trí giữ `aria-hidden="true"`; nút chỉ-có-icon giữ `aria-label`.

---

## 2A. Migration Material Symbols → lucide-react

### 2A.1 Cách dùng lucide (QUAN TRỌNG về kích thước)

Material Symbols là **web font** — sửa cỡ bằng CSS `font-size`. Lucide render ra **SVG** —
`font-size` KHÔNG đổi cỡ SVG. Phải truyền prop `size`:

```jsx
// CŨ:
<span className="material-symbols-outlined sf-input-icon">person</span>
// MỚI:
import { User } from 'lucide-react';
<User className="sf-input-icon" size={20} aria-hidden="true" />
```

- **Giữ nguyên `className`** cũ → lucide forward className xuống `<svg>`, nên các rule CSS về
  `color`, `position`, `margin`... vẫn áp dụng (màu dùng `currentColor` → hoạt động sẵn).
- **`size={N}`** = đúng giá trị `font-size` mà CSS class đang đặt (bảng ở 2A.4). Sau khi đổi,
  có thể xoá dòng `font-size` trong CSS class đó (tuỳ chọn, không bắt buộc).
- Import gọn từng icon: `import { User, Phone, Send } from 'lucide-react';` (tree-shake).

### 2A.2 Bảng ánh xạ icon (ĐẦY ĐỦ — tên Material Symbol → component lucide)

> Đã xác minh tất cả tên dưới đây TỒN TẠI trong lucide-react 1.7.0.

| Material Symbol | lucide-react | Material Symbol | lucide-react |
|-----------------|--------------|-----------------|--------------|
| `close` | `X` | `search` | `Search` |
| `person` | `User` | `search_off` | `SearchX` |
| `call` | `Phone` | `cloud_off` | `CloudOff` |
| `apartment` | `Building2` | `wifi_off` | `WifiOff` |
| `title` | `Type` | `refresh` | `RefreshCw` |
| `military_tech` | `Award` | `home` | `Home` |
| `edit_note` | `NotebookPen` | `photo_library` | `Images` |
| `edit` | `SquarePen` | `image_not_supported` | `ImageOff` |
| `add_photo_alternate` | `ImagePlus` | `auto_stories` | `BookOpen` |
| `send` | `Send` | `smart_toy` | `Bot` |
| `schedule` | `Clock` | `insights` | `TrendingUp` |
| `rate_review` | `MessageSquareText` | `analytics` | `LineChart` |
| `error` | `CircleAlert` | `leaderboard` | `BarChart3` |
| `check_circle` | `CircleCheck` | `table_chart` | `Table` |
| `info` | `Info` | `calendar_today` | `Calendar` |
| `expand_more` | `ChevronDown` | `article` | `FileText` |
| `expand_less` | `ChevronUp` | `groups` | `Users` |
| `light_mode` | `Sun` | `local_florist` | `Flower2` |
| `dark_mode` | `Moon` | | |

### 2A.3 ⚠️ Icon ĐỘNG (rất dễ bị sót — KHÔNG xuất hiện khi grep tên icon tĩnh)

Các chỗ render icon bằng biểu thức điều kiện — phải đổi sang render component động:

| File:dòng (≈) | Biểu thức cũ | Cách làm mới |
|---------------|--------------|--------------|
| `App.jsx:19,30` | Toast `icon = success?'check_circle':error?'error':'info'` | map sang component: `success→CircleCheck, error→CircleAlert, info→Info`; render `<Icon … />` |
| `ScrapbookViewer.jsx:158` | `{darkMode ? 'light_mode' : 'dark_mode'}` | `{darkMode ? <Sun …/> : <Moon …/>}` |
| `ScrapbookViewer.jsx:241` | `{hasFilters ? 'search_off' : 'auto_stories'}` | `{hasFilters ? <SearchX …/> : <BookOpen …/>}` |
| `PostCard.jsx:119` | `{expanded ? 'expand_less' : 'expand_more'}` | `{expanded ? <ChevronUp …/> : <ChevronDown …/>}` |

Lưu ý: `flower-icon` trong PostCard footer hiện là **emoji 🌸** (không phải Material Symbol).
Khi redesign (2B) nên đổi thành `<Flower2 />` cho đồng bộ — xem 2B.

### 2A.4 Bảng kích thước (size prop) theo class CSS hiện có

| CSS class | size | CSS class | size |
|-----------|------|-----------|------|
| `.toast-icon` | 20 | `.feed-empty-icon` | 56 |
| `.album-header-icon` | 26 | `.btm-nav-icon` | 22 |
| `.album-empty-icon` | 48 | `.stats-header-icon` | 26 |
| `.feed-search-icon` | 20 | `.stats-card-icon` | 28 |
| `.btn-expand-icon` | 18 | `.stats-sort-icon` | 16 |
| `.post-footer-icon` | 17 | `.sf-header-icon` | 28 |
| `.flower-icon` | 18 | `.sf-alert-icon` | 20 |
| `.sf-label-icon` | 18 | `.sf-input-icon` | 20 |
| badge tiêu chí (`.post-criteria-badge svg`) | 14 | nút FAB "Viết bài" (`btm-nav-fab`) | 26 |

Nút close không có class riêng → dùng `size={22}` (hoặc 20) cho nhất quán.

### 2A.5 Checklist từng file (số dòng ≈, có thể lệch sau khi sửa)

- **`src/App.jsx`** — Toast: `check_circle/error/info` (động) + `close`.
- **`src/components/ScrapbookViewer.jsx`** — `light_mode/dark_mode` (động), `wifi_off`, `search`,
  `close`, `cloud_off`, `refresh`, `search_off/auto_stories` (động), `check_circle`, `close`(lightbox),
  `home`, `photo_library`, `edit`(FAB), `smart_toy`, `insights`.
- **`src/components/PostCard.jsx`** — `military_tech`(badge), `expand_more/expand_less`(động),
  `schedule`, `rate_review`, và 🌸 flower (đổi sang `Flower2`).
- **`src/components/SubmitForm.jsx`** — `edit_note`, `close`, `error`, `check_circle`, `person`,
  `call`, `apartment`, `title`, `military_tech`, `add_photo_alternate`, `send`.
- **`src/components/StatsView.jsx`** — `analytics`, `close`, `calendar_today`, `apartment`,
  `article`, `groups`, `local_florist`, `leaderboard`, `table_chart`.
- **`src/components/AlbumView.jsx`** — `photo_library`, `close`, `image_not_supported`, `close`(lightbox).

### 2A.6 Sau khi đổi HẾT icon → gỡ Material Symbols font

Chỉ làm khi **không còn** chuỗi `material-symbols-outlined` nào trong `src/` và `index.html`
(kiểm tra: `grep -rn "material-symbols" src/ index.html`).
1. Trong `index.html`, xoá 2 block `<link>`/`<noscript>` nạp `Material+Symbols+Outlined`
   (khoảng dòng 29–41 — phần "Material Symbols").
2. Nếu `index.css` / `App.css` có rule `.material-symbols-outlined { font-variation-settings… }`
   thì xoá luôn (grep để chắc).
3. ⚠️ **Lưu ý `Admin.html`** (trang admin do GAS phục vụ riêng) cũng dùng Material Symbols nhưng
   **độc lập** với build Vite — KHÔNG bắt buộc đổi ở Phase 2, để riêng. Đừng nhầm là phải sửa.

---

## 2B. Redesign PostCard → "Trang nhật ký trang trí"

### 2B.1 Mục tiêu thẩm mỹ (mức "vừa phải" — đã được người dùng chốt)

Biến mỗi bài (`PostCard`) từ thẻ "glass-card social feed" thành **một trang nhật ký** đẹp:
giấy kẻ dòng, washi tape, dấu mộc tiêu chí, ảnh dán kiểu polaroid, tiêu đề viết tay, dấu ngày.
Vẫn phải **dễ đọc**, không rối. Giữ theme Sky-Blue + Golden-Yellow của dự án.

### 2B.2 Biến màu / font có sẵn (dùng lại, đừng chế màu mới tuỳ tiện)

```
--sky-blue: #52B5E9;  --sky-blue-dark: #005A8C;  --golden-yellow: #FFCE00;
--sky-surface: #E8F4FD;  --text-dark: #1a2a3a;   (định nghĩa ở src/App.css)
```
Font viết tay **Dancing Script** ĐÃ nạp sẵn trong `index.html` → dùng cho tiêu đề/dấu ngày:
`font-family: 'Dancing Script', cursive;`

### 2B.3 Cấu trúc & chi tiết trang trí (CSS thuần, không thêm thư viện)

PostCard hiện có: header (tác giả, đơn vị, badge tiêu chí) · body (tiêu đề, nội dung,
nút Xem chi tiết) · media (ảnh/video) · footer (tặng hoa, thời gian, nhận xét).
Giữ nguyên các phần đó, **bọc trong "trang giấy"** và thêm trang trí:

1. **Nền giấy kẻ dòng:** thay nền glass bằng giấy kem + dòng kẻ ngang + **lề đỏ dọc bên trái**.
   ```css
   background: #FBF7EC;
   background-image: repeating-linear-gradient(#FBF7EC, #FBF7EC 31px, #E9DFC6 32px);
   border: 1px solid #E5DCC3; border-radius: 10px;
   /* lề đỏ: dùng ::before là 1 dải dọc #E79A9A opacity .5 ở left ~44px */
   ```
   ⚠️ Dark mode (`[data-theme="dark"]`): đổi sang tông giấy tối (vd nền `#2a2620`, dòng kẻ mờ,
   chữ sáng) — PHẢI test cả 2 theme, dự án mặc định Light.
2. **Washi tape:** 2–3 dải băng dính màu (`--sky-blue` / `--golden-yellow`, opacity ~.55) xoay nhẹ
   (`transform: rotate(-3deg)`) ở mép trên, dùng `::before/::after` hoặc div nhỏ tuyệt đối.
3. **Tiêu đề viết tay:** `.post-title` → font Dancing Script, cỡ ~24–26px, màu `--sky-blue-dark`.
4. **Dấu mộc tiêu chí:** thay `.post-criteria-badge` hiện tại bằng "con dấu" tròn nét đứt
   (`border: 2px dashed`, `border-radius: 50%`, xoay nhẹ) chứa icon `<Award/>` + tên tiêu chí nhỏ
   bên dưới. Màu theo tiêu chí (gợi ý dùng lại hàm `getBadgeClass` đang bị bỏ không trong PostCard:
   Kỷ luật / Trung thành / Gần dân → 3 tông màu khác nhau).
5. **Ảnh dán polaroid:** bọc `.post-image` trong khung trắng (`padding`, viền, `transform: rotate(-2deg)`)
   + một mẩu "băng dính" phía trên ảnh. Video giữ logic iframe (class `.post-video-*` đã có).
6. **Tặng hoa kiểu "cánh hoa ép":** đổi emoji 🌸 → `<Flower2/>`; nút bo tròn, tông hồng/đỏ nhạt.
   GIỮ NGUYÊN logic `handleFlower`, `sendFlower`, optimistic update — chỉ đổi diện mạo.
7. **Dấu ngày viết tay:** góc dưới phải footer, font Dancing Script, màu nhạt, xoay nhẹ;
   dùng lại hàm `timeAgo`/ngày từ `entry.thoiGian`.

> Tham khảo bố cục: trong hội thoại gốc đã có 1 mockup HTML minh hoạ đúng hướng này
> (giấy kẻ, washi tape xanh+vàng, dấu mộc "Gần dân nhất", ảnh polaroid, nút Flower2, dấu ngày).
> Nếu cần dựng lại mockup để xem trước, tạo 1 file HTML tĩnh trong `scratch/` rồi mở thử.

### 2B.4 CSS đặt ở đâu

Style của PostCard nằm trong `src/components/ScrapbookViewer.css` (PostCard.jsx không import CSS
riêng; nó dùng class do ScrapbookViewer.css cung cấp). Thêm/sửa class trong file đó. Các class
mới của Phase 1 đã có ở cuối file: `.post-criteria-badge`, `.post-video-*` — có thể tái dùng/đổi.

### 2B.5 Đồng bộ các màn khác (tuỳ chọn, ưu tiên thấp)

Sau khi PostCard ổn, có thể áp ngôn ngữ trang trí (tape/dấu mộc/viết tay) cho `BookCover`,
`StatsView`, `AlbumView` cho nhất quán — nhưng làm sau, không nằm trong "must" của Phase 2.

---

## 3. Kiểm chứng & hoàn tất

### 3.1 Lệnh kiểm tra (chạy sau mỗi component và lần cuối)
```bash
npm run build      # phải PASS
npm run lint       # số "errors" phải ≤ 65 (baseline). Không thêm lỗi mới.
grep -rn "material-symbols" src/ index.html   # sau 2A.6 phải KHÔNG còn kết quả trong src/
```
### 3.2 Kiểm tra trực quan (khuyến nghị)
- `npm run dev` → mở `http://localhost:5173`.
- Modal "Thông Điệp Nổi" hiện đầu trang → bấm đóng để vào app (BookCover → bấm mở → feed).
- Test **CẢ Light VÀ Dark mode** (nút mặt trời/trăng trên top bar). Dự án mặc định Light.
- Kiểm: icon hiển thị đúng & đúng cỡ; PostCard ra dáng trang nhật ký; tặng hoa vẫn tăng/giảm số;
  nộp bài (form) + upload ảnh vẫn chạy; không lỗi console đỏ.
- ⚠️ App cần `VITE_GAS_API_URL` hợp lệ trong `.env` để có dữ liệu thật; nếu trống sẽ là feed rỗng
  (vẫn render được). Xem `05-testing-and-deploy.md`.

### 3.3 Định nghĩa "Hoàn thành" (Definition of Done)
- [ ] Không còn `material-symbols-outlined` trong `src/`; 2 link font đã gỡ khỏi `index.html`.
- [ ] Mọi icon (kể cả icon động ở 2A.3) hiển thị đúng & đúng cỡ ở cả 2 theme.
- [ ] PostCard có diện mạo "trang nhật ký" như spec 2B; vẫn dễ đọc; dark mode ổn.
- [ ] Logic nghiệp vụ KHÔNG đổi (fetch, tặng hoa, submit, sanitize, validation).
- [ ] `npm run build` PASS; `npm run lint` ≤ 65 lỗi.
- [ ] Đã thêm entry vào `06-ai-working-log.md` và cập nhật `04-current-tasks.md`.

### 3.4 Rollback nếu cần
- Ảnh gốc (trước nén) còn ở `scratch/img-backup/` (đừng xoá cho tới khi chắc chắn).
- Mọi thay đổi đều trong git — `git diff` / `git stash` để so sánh hoặc hoàn tác.

---

## 4. Bẫy thường gặp (đọc kẻo mất thời gian)

- **Quên icon động** (2A.3) → icon mất ở toast/dark-mode/empty-state/nút mở rộng. Luôn rà 4 chỗ đó.
- **Đổi icon nhưng quên `size`** → SVG ra cỡ mặc định 24px, lệch layout. Dùng bảng 2A.4.
- **Gỡ font Material Symbols quá sớm** (khi còn `<span>material-symbols</span>`) → icon thành chữ.
  Chỉ gỡ font ở bước cuối, sau khi grep sạch.
- **Quên test Dark mode** → nền giấy sáng + chữ sáng = không đọc được. Test cả 2 theme.
- **Đụng nhầm `Admin.html`** → đó là trang GAS độc lập, không thuộc build Vite. Để yên.
- **Refactor lan man** sang `api.js`/logic → vi phạm "thay đổi phẫu thuật". Chỉ làm icon + diện mạo.
