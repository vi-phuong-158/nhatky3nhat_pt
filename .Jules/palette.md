## 2025-06-03 - StatsView Filter Accessibility
**Learning:** When creating custom filter chips or selectable lists that function like toggle buttons, simply making them clickable is not enough for screen reader users. They need context to know these buttons are part of a group and need to know which filters are currently active.
**Action:** Apply `role="group"` to the container, link it to a descriptive label via `aria-labelledby`, and use `aria-pressed` on individual filter buttons to communicate their toggle states.
