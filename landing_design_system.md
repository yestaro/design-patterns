## Design System: Design Patterns Mastery

### Pattern
- **Name:** Scroll-Triggered Storytelling
- **Conversion Focus:** Narrative increases time-on-page 3x. Use progress indicator. Mobile: simplify animations.
- **CTA Placement:** End of each chapter (mini) + Final climax CTA
- **Color Strategy:** Progressive reveal. Each chapter has distinct color. Building intensity.
- **Sections:** 1. Intro hook, 2. Chapter 1 (problem), 3. Chapter 2 (journey), 4. Chapter 3 (solution), 5. Climax CTA

### Style
- **Name:** Exaggerated Minimalism
- **Keywords:** Bold minimalism, oversized typography, high contrast, negative space, loud minimal, statement design
- **Best For:** Fashion, architecture, portfolios, agency landing pages, luxury brands, editorial
- **Performance:** ??Excellent | **Accessibility:** ??WCAG AA

### Colors
| Role | Hex |
|------|-----|
| Primary | #0EA5E9 |
| Secondary | #38BDF8 |
| CTA | #F97316 |
| Background | #F0F9FF |
| Text | #0C4A6E |

*Notes: Sky blue trust + warm CTA*

### Typography
- **Heading:** Cinzel
- **Body:** Josefin Sans
- **Mood:** real estate, luxury, elegant, sophisticated, property, premium
- **Best For:** Real estate, luxury properties, architecture, interior design
- **Google Fonts:** https://fonts.google.com/share?selection.family=Cinzel:wght@400;500;600;700|Josefin+Sans:wght@300;400;500;600;700
- **CSS Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Josefin+Sans:wght@300;400;500;600;700&display=swap');
```

### Key Effects
font-size: clamp(3rem 10vw 12rem), font-weight: 900, letter-spacing: -0.05em, massive whitespace

### Avoid (Anti-patterns)
- Complex navigation
- Hidden contact info

### Pre-Delivery Checklist
- [ ] No emojis as icons (use SVG: Heroicons/Lucide)
- [ ] cursor-pointer on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard nav
- [ ] prefers-reduced-motion respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px

