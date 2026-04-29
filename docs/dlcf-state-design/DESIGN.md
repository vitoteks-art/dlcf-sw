# Design System Document: High-End Editorial Ministry

## 1. Overview & Creative North Star: "The Modern Sanctuary"

This design system is built to transcend the "template" look of traditional religious organizations. Our Creative North Star is **"The Modern Sanctuary"**—a digital environment that feels as intentional, spacious, and reverent as a physical cathedral, yet remains accessible through modern editorial design.

We move away from rigid, boxed-in layouts in favor of **intentional asymmetry** and **breathable compositions**. By utilizing large-scale typography and overlapping elements, we create a sense of movement and community. The goal is not just to provide information, but to curate an experience of peace and authority.

---

## 2. Colors: Tonal Depth & Soul

Our palette is rooted in the "Deep Blue" of trust and the "Gold" of divine value. We avoid flat, lifeless interfaces by using Material Design tonal tiers to create a sense of physical light and shadow.

### Core Palette
*   **Primary (#002659):** Our anchor. Used for high-authority elements and deep-sea backgrounds.
*   **Secondary (#485e8c):** A softer bridge between the deep primary and the light surfaces.
*   **Tertiary (#362500 / Gold):** Reserved for "Divine Accents"—calls to action, highlights, and sacred moments.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section content. Boundaries must be defined solely through background color shifts or subtle tonal transitions. For example, a `surface-container-low` section should sit directly against a `surface` background to define its edge.

### The "Glass & Gradient" Rule
To add visual "soul," use subtle linear gradients (e.g., `primary` to `primary_container`) for Hero sections. Floating navigation or modal elements should utilize **Glassmorphism**:
*   **Background:** Semi-transparent `surface_container_lowest` (e.g., 80% opacity).
*   **Effect:** `backdrop-filter: blur(12px)`.

---

## 3. Typography: Editorial Reverence

We pair the geometric strength of **Montserrat** (Headings) with the high-legibility precision of **Inter** (Body). 

*   **Display (Montserrat):** Used for bold, aspirational statements. Set with tight letter-spacing (-2%) to feel premium and custom.
*   **Headline (Montserrat):** Used for page sectioning. These should often be asymmetrical—aligned to a grid but allowed to "breathe" with significant top-margin whitespace.
*   **Body (Inter):** Our workhorse. High line-height (1.6x) is mandatory to ensure readability and a feeling of "calm" in the text.
*   **Labels (Inter):** Always uppercase with 5-10% letter-spacing for a sophisticated, "captioned" look.

---

## 4. Elevation & Depth: Tonal Layering

We do not use structural lines. Depth is achieved by "stacking" surface tiers like sheets of fine paper.

### The Layering Principle
*   **Base:** `surface` (The foundation).
*   **Sectioning:** `surface_container_low` (Subtle areas like footers or sidebars).
*   **Cards:** `surface_container_lowest` (The brightest white, used to "lift" content off the page).

### Ambient Shadows
When a "floating" effect is required (e.g., a primary CTA button or a featured testimony card), use **Ambient Shadows**:
*   **Blur:** 24px - 40px.
*   **Opacity:** 4% - 6%.
*   **Color:** Tint the shadow with a hint of `primary` rather than pure black to keep the UI feeling "airy."

### The "Ghost Border" Fallback
If a border is absolutely necessary for accessibility, use the `outline_variant` token at **15% opacity**. Never use 100% opaque lines.

---

## 5. Components: Precision & Grace

### Buttons (The "Elegant Interaction")
*   **Primary:** `primary` background with `on_primary` text. Use `xl` (3rem/48px) rounding.
*   **Secondary:** A "Ghost" style. No fill, but a `surface_variant` background on hover.
*   **Tertiary:** Gold (`tertiary_container`) text with a small, 2px bottom-accent bar instead of a box.

### Cards & Lists
*   **Corner Radius:** Cards must use `lg` (2rem) or `md` (1.5rem) rounding to feel approachable.
*   **No Dividers:** Forbid the use of divider lines in lists. Instead, use vertical white space (32px - 48px) or a alternating `surface_container` background shifts.

### Signature Component: The "Ministry Spotlight"
A bespoke card component using a `surface_container_highest` background, featuring an image that "breaks" the container (overflowing the top edge) to create 3D depth.

### Input Fields
*   **Style:** Minimalist. Only a bottom-weighted `surface_variant` fill. No full-box borders.
*   **Focus:** Transition to a `primary` 2px bottom border with a subtle `surface_tint` glow.

---

## 6. Do's and Don'ts

### Do:
*   **Use Whitespace as a Component:** Treat empty space as a design element that directs the eye.
*   **Embrace Asymmetry:** Place a heading on the left and the body text on the right of a 12-column grid to create an editorial feel.
*   **Layer Colors:** Use `soft_gold_tint` behind `dark_blue` text for high-end "call-out" quotes.

### Don't:
*   **Don't use 1px Dividers:** It breaks the "Modern Sanctuary" flow.
*   **Don't use pure black:** Use `on_background` (#191C1E) for text to maintain a soft, premium look.
*   **Don't crowd the edges:** Elements should never be closer than 24px (our `md` spacing) to their container edges.