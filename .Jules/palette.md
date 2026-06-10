
## 2025-06-10 - Missing aria-hidden on Material Symbols inside icon-only buttons
**Learning:** Icon-only buttons using Material Symbols (like `<span className="material-symbols-outlined">close</span>`) can cause redundant or confusing screen reader announcements if the inner `span` lacks `aria-hidden="true"`. Also, a visual tooltip (`title` attribute) is helpful for sighted users alongside `aria-label`.
**Action:** Add `title` attribute to icon-only buttons, and ensure the inner `span` with the icon ligature has `aria-hidden="true"`.
