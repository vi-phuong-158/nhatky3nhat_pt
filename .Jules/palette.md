## 2026-05-28 - Icon-only Button Accessibility
**Learning:** Icon-only buttons (like the 'close' button in search inputs) require an `aria-label` on the button itself, and the inner icon element (e.g., Material Symbols spans) MUST have `aria-hidden="true"` to prevent screen readers from announcing the raw icon name (like 'close' instead of the intended 'Xóa tìm kiếm đơn vị').
**Action:** Always add `aria-hidden="true"` to inner icons when adding `aria-label` to parent buttons.
