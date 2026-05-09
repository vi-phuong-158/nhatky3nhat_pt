## 2024-05-10 - Standardized Escape Key Usage for Overlays
**Learning:** Custom overlay and modal components in the app (like `AlbumView` and `StatsView`) lacked keyboard accessibility for dismissal via the `Escape` key, which is standard behavior for modal dialogs.
**Action:** When creating new modals or overlays in the future, always implement a global `keydown` event listener in a `useEffect` hook to catch the `Escape` key and close the overlay or lightbox.
