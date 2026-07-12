## 2024-07-12 - Accessibility Pattern for Filter Chips
**Learning:** Filter chips acting like mutually exclusive toggle buttons need proper grouping and state announcements. Screen readers do not intrinsically understand visual groupings of buttons.
**Action:** Always wrap filter chips in a container with `role="group"` and `aria-labelledby="[id-of-group-label]"`, and use `aria-pressed={isActive}` on individual chip buttons to communicate their state clearly.
