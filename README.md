# EIA x Green Infrastructure — Interactive Presentation 🌿

An interactive, high-impact web presentation on **Environmental Impact Assessment (EIA) and Green Infrastructure (GI)**.

🔗 **Live Website / Demo:** [albin170.github.io/vj](https://albin170.github.io/vj/)

---

## 🌟 Design & Key Features

- **Deep Forest Visual Theme:** Natural gradient (`#071C16` → `#0B2920`) with subtle topographic contour patterns.
- **Full-Screen Responsive Slide Deck:**
  - Each slide fits 100% within the browser window with no topbar overlap and no bottom clipping.
  - Smooth vertical scroll-snapping (`scroll-snap-type: y mandatory`).
  - Maximized slide content box for crystal-clear readability on all screen sizes.
- **Top Navigation Bar:**
  - 7 quick-jump sections: `Overview` · `EIA` · `Process` · `Green Infrastructure` · `Benefits` · `Case Study` · `Q&A`.
  - Live slide counter (`01 / 41`) and real-time progress bar.
  - Visible **Reduce Motion** accessibility controller with persistent settings.
- **Ambient Effects & Motion:**
  - Subtle floating leaf canvas in the background (slow, organic, relaxing).
  - Animated number counters for key statistics and steps.
  - Keyboard navigation: `←` / `→` arrow keys, `Spacebar`, `PageUp` / `PageDown`, `Home`, `End`.
- **Slide Overview & Transcript Modal:**
  - Press `O` or click the grid icon to open the full 41-slide thumbnail overview.
  - Accessible text dialog for reading slide transcripts.

---

## 📁 Repository Structure

```
├── index.html     # Main presentation structure & all 41 slides
├── styles.css     # Design system, viewport-fitting layout, and theme styles
├── script.js      # Interactive features, floating leaves canvas, navigation engine
├── .nojekyll      # Ensures instant static hosting on GitHub Pages
└── README.md      # Documentation and presentation guide
```

---

## 🚀 Running Locally

1. Clone this repository:
   ```bash
   git clone https://github.com/albin170/vj.git
   ```
2. Open `index.html` in any web browser.
