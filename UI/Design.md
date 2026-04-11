# Design System Document

 

## 1. Overview & Creative North Star: "The Digital Heritage Gallery"

 

This design system is built to transform a community social media platform into a high-end, editorial experience. We are moving away from the cluttered, "utility-first" look of traditional social networks and toward a philosophy we call **The Digital Heritage Gallery**.

 

The "North Star" of this system is to treat every piece of community content—from a status update to a formal announcement—with the reverence of a gallery exhibit. We achieve this through:

*   **Intentional Asymmetry:** Breaking the rigid 12-column grid to allow for more dynamic, breathable layouts.

*   **Tonal Authority:** Using a "white-on-white" layering technique that creates depth without visual noise.

*   **Vietnamese Modernity:** Pairing the stability of the `inter` sans-serif with the elegant, authoritative character of `Be Vietnam Pro` to reflect a community that is both rooted in tradition and forward-looking.

 

---

 

## 2. Colors: Tonal Depth & The No-Line Rule

 

Our palette is anchored in a deep, trustworthy `primary` blue (#005eaa) and accented with a warm, prestigious `secondary` yellow (#725c00).

 

### The "No-Line" Rule

**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning. Structural boundaries must be defined solely through:

1.  **Background Color Shifts:** Use `surface-container-low` (#f1f4fa) for secondary regions sitting on a `surface` (#f7f9ff) background.

2.  **Vertical Rhythm:** Use whitespace to separate content, not lines.

 

### Surface Hierarchy & Nesting

Treat the UI as a series of physical layers—like stacked sheets of fine paper. 

*   **Background:** `surface` (#f7f9ff)

*   **Card/Main Content:** `surface-container-lowest` (#ffffff)

*   **Nested Elements (e.g., Comments/Sub-actions):** `surface-container` (#ebeef4)

 

### The "Glass & Gradient" Rule

To add soul to the interface, use **Glassmorphism** for floating elements (e.g., top navigation bars or floating action buttons). Use the `surface` color at 70% opacity with a `backdrop-blur` of 20px. 

*   **Signature Textures:** Apply a subtle linear gradient from `primary` (#005eaa) to `primary_container` (#0077d4) for hero CTAs to provide a professional, satin-like finish.

 

---

 

## 3. Typography: Editorial Authority

 

We use a dual-font system to create a sophisticated hierarchy. 

 

*   **Display & Headlines (`Be Vietnam Pro`):** This is our "Character Font." It provides a clean yet distinct personality for the Vietnamese community. Use `headline-lg` for impactful storytelling.

*   **Body & Titles (`Inter`):** This is our "Functional Font." It is engineered for maximum legibility in social feeds. 

 

**Hierarchy Strategy:**

*   **Primary Interaction:** All interaction labels (buttons, chips) use `label-md` in `Be Vietnam Pro` to feel intentional and crafted.

*   **Reading Flow:** Long-form posts should utilize `body-lg` with a line-height of 1.6 for an effortless, book-like reading experience.

 

---

 

## 4. Elevation & Depth: Tonal Layering

 

Traditional shadows and borders are replaced by **Tonal Layering**.

 

*   **The Layering Principle:** Depth is achieved by "stacking." A `surface-container-lowest` card placed on a `surface-container-low` background creates a natural, soft lift.

*   **Ambient Shadows:** For floating modals, use an extra-diffused shadow: `box-shadow: 0 12px 40px rgba(24, 28, 32, 0.06)`. The tint should be a dark version of the `on-surface` color to mimic natural light.

*   **The "Ghost Border" Fallback:** If a border is strictly necessary for accessibility, use `outline-variant` (#c0c7d4) at 15% opacity. Never use 100% opaque borders.

 

---

 

## 5. Components: Modern Vietnamese Social UI

 

### Buttons

*   **Primary:** Gradient of `primary` to `primary_container`. Radius: `md` (0.75rem). No shadow.

*   **Secondary:** `secondary_fixed` (#ffe07d) background with `on_secondary_fixed` (#231b00) text. Use for positive reinforcements or highlights.

 

### Cards & Feed Items

*   **Constraint:** Forbid divider lines between posts.

*   **Separation:** Use 24px of vertical whitespace between cards. Cards should use `surface_container_lowest` (#ffffff) against a `surface` (#f7f9ff) background.

 

### Input Fields

*   **Style:** Minimalist. No bottom border. Use `surface_container_high` (#e5e8ee) as the background with `md` roundedness. 

*   **Active State:** Transitions to a `ghost border` of `primary` at 20% opacity.

 

### Chips (Selection/Tags)

*   Use `secondary_container` (#fcd011) for active states to draw the eye to community "Hot Topics" or tags, reflecting the gold from the brand logo.

 

### Community Signature: The "Heritage Banner"

A unique component for this system. A thin, semi-transparent top-bar decoration using a subtle `tertiary` (#b32420) accent, used only for official community announcements to convey importance and "Red Seal" authority.

 

---

 

## 6. Do's and Don'ts

 

### Do

*   **Do** use asymmetrical margins (e.g., 24px left, 32px right) for editorial article layouts to create a high-end feel.

*   **Do** use `backdrop-blur` on top navigation to keep the content visible as the user scrolls.

*   **Do** utilize the `secondary` yellow for "small but mighty" moments, like notification dots or verified badges.

 

### Don't

*   **Don't** use 1px black or grey borders to separate content.

*   **Don't** use standard "Drop Shadows" (high opacity, small blur). It makes the UI feel dated.

*   **Don't** crowd the interface. If a screen feels full, increase the `surface` whitespace instead of shrinking elements.

*   **Don't** use `Times New Roman` (from the brand profile) for UI elements; it is reserved for formal, downloadable document headings only. The app remains 100% Sans-Serif for a modern feel.