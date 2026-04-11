# Nâng cấp Giao diện Nhật ký "3 Nhất" — Scrapbook Edition

Nâng cấp giao diện từ phong cách "Mạng xã hội" hiện tại sang kiến trúc "Scrapbook/Nhật ký" cao cấp, mang đậm nét truyền thống nhưng vẫn đảm bảo hiệu năng mượt mà khi xử lý hàng nghìn bài viết.

---

## Đã hoàn thành ✅

### Bug fix: sortBy và filterCriteria không hoạt động

- **File:** `ScrapbookViewer.jsx`
- `sortBy` và `filterCriteria` trước đây là state "chết" — không áp dụng vào dữ liệu hiển thị.
- Đã thêm `useMemo` → `displayEntries` để filter theo tiêu chí và sort (mới nhất / cũ nhất / nhiều hoa nhất) **client-side**.
- Nút "Xóa bộ lọc" giờ cũng reset `sortBy` về mặc định.

### Font Dancing Script

- **File:** `index.html`
- Đã thêm `Dancing Script:wght@700` vào Google Fonts (non-blocking, cùng pattern preload/swap).
- Áp dụng cho: logo topbar + tiêu đề bài viết (chỉ light mode).

### Thống nhất CSS variables

- **File:** `index.css` ← nguồn chính thức
- `--cherry-red`, `--butter-yellow`, `--paper-cream` đã chuyển từ `App.css` sang `index.css`.
- Thêm biến scrapbook: `--paper-card-bg`, `--paper-card-border`, `--paper-tape`.
- Dark mode: các biến scrapbook trả về giá trị trung tính (giữ glassmorphism).

### Scrapbook Aesthetic (light mode only)

- **File:** `ScrapbookViewer.css`

#### Nền feed

- Light: `--paper-cream (#EDE8DC)` + radial gradient ấm giả hiệu ứng vầng sáng giấy.
- Dark: giữ nguyên glassmorphism.

#### Topbar

- Light: nền trắng `rgba(255,255,255,0.88)` + viền dưới đỏ CAND.
- Logo chuyển sang **Dancing Script**, màu đỏ CAND.

#### PostCard — "Trang ký ức"

- Light: `linear-gradient(160deg, #fdfaf5, #f5f1e8)` — giấy kem.
- Border trái 4px đỏ CAND (như dấu gáy sổ).
- Box-shadow 3 lớp → nổi như trang giấy thật.
- Hover: nhấc lên + xoay nhẹ 0.2deg.

#### Tiêu đề bài viết

- Light: **Dancing Script** 21px, màu nâu đậm `#2c1a0e`.

#### Tên tác giả

- Light: màu đỏ CAND, bold — nổi bật như chữ ký.

#### Badge tiêu chí

- Light: viền vàng, nền trắng, xoay -1.5deg → kiểu dấu mộc/tem.

#### Washi tape trên ảnh

- Light: `::before` và `::after` pseudo-elements → 2 dải băng vàng `--paper-tape` ở 2 góc trên ảnh (xoay ±6-7deg).

#### Đường kẻ footer

- Light: dashed `rgba(180,140,80,0.35)` → kiểu đường kẻ giấy học sinh.

#### Search input

- Light: nền trắng, viền vàng-nâu, focus đổi viền đỏ CAND.

---

## Quyết định thiết kế

| Vấn đề | Quyết định |
| --- | --- |
| Dark mode + scrapbook | Giữ glassmorphism ở dark mode. Scrapbook aesthetic CHỈ áp dụng ở light mode. |
| Font tiêu đề | Dancing Script 21px cho `post-title` (đủ lớn để đọc rõ). |
| Sort/Filter | Client-side (API chưa hỗ trợ `sort` param). |
| Virtualization | Giữ infinite scroll pagination (20 bài/trang). Chưa dùng `react-window` vì chưa cần. |
| BookCover.css | Giữ nguyên — đã có aesthetic bìa da đẹp, không cần thay đổi. |

---

## Open Questions (chưa xử lý)

> [!NOTE]
>
> 1. **Timeline Navigation:** Có muốn thêm sidebar timeline (nhảy theo năm/tháng) không?
> 2. **Hiệu ứng flip trang:** Video `video2.webp` có hiệu ứng lật sách. Giữ cho từng bài hay chỉ bìa sách?
> 3. **Dấu mộc "đã duyệt":** Cần Google Sheet có cột `status/approved` → backend mới hỗ trợ được.

---

## Verification Plan

### Automated Tests

- Kiểm tra hiệu năng scroll (FPS) trên DevTools khi có nhiều mock data.

### Manual Verification

- [ ] Light mode: nền parchment, card giấy, washi tape hiển thị đúng.
- [ ] Dark mode: glassmorphism giữ nguyên, không bị vỡ layout.
- [ ] Filter tiêu chí: chọn "Kỷ luật nhất" → chỉ hiện bài đúng tiêu chí.
- [ ] Sort: "Nhiều hoa nhất" → bài có `flowerCount` cao nhất lên đầu.
- [ ] Washi tape không che khuất nội dung ảnh.
- [ ] Dancing Script đọc rõ trên mobile (≥ 20px).
- [ ] Tương phản màu đỏ CAND trên nền giấy kem (accessibility).
