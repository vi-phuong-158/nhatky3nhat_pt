## 2024-05-18 - [Accessibility] Explicit Escape Key & Dialog roles for custom modals
**Learning:** Custom modals and overlays in this project (`StatsView`, `AlbumView`) lack native dialog behaviors, meaning screen readers don't automatically recognize them as modals and users cannot dismiss them using the `Escape` key by default.
**Action:** When creating or modifying custom modals/overlays, always implement an explicit `useEffect` to handle `Escape` key dismissal and explicitly add `role="dialog"`, `aria-modal="true"`, and `aria-labelledby`/`aria-label` attributes.
