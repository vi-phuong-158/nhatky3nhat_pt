## 2025-02-14 - Accessible Custom Chip Toggle Groups
**Learning:** Custom toggle buttons (like chips) used as a group filter need explicit roles and states to be properly understood by screen readers.
**Action:** When implementing custom chip filters, group them in a container with `role="group"` (linked to a label via `aria-labelledby`), and use `aria-pressed="true|false"` on the individual buttons to announce their active state instead of relying purely on visual active classes.
