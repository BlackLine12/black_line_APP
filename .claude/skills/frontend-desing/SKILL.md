---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, or applications in Angular 19. Generates creative, polished code that avoids generic AI aesthetics. For BlackLine tattoo marketplace, apply the artisanal dark luxury design system.
license: Complete terms in LICENSE.txt
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:
- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc. There are so many flavors to choose from. Use these for inspiration but design one that is true to the aesthetic direction.
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work - the key is intentionality, not intensity.

Then implement working code (HTML/CSS/JS, React, Vue, etc.) that is:
- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## Frontend Aesthetics Guidelines

Focus on:
- **Typography**: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics; unexpected, characterful font choices. Pair a distinctive display font with a refined body font.
- **Color & Theme**: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes.
- **Motion**: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions. Use scroll-triggering and hover states that surprise.
- **Spatial Composition**: Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density.
- **Backgrounds & Visual Details**: Create atmosphere and depth rather than defaulting to solid colors. Add contextual effects and textures that match the overall aesthetic. Apply creative forms like gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, custom cursors, and grain overlays.

NEVER use generic AI-generated aesthetics like overused font families (Inter, Roboto, Arial, system fonts), cliched color schemes (particularly purple gradients on white backgrounds), predictable layouts and component patterns, and cookie-cutter design that lacks context-specific character.

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Vary between light and dark themes, different fonts, different aesthetics. NEVER converge on common choices (Space Grotesk, for example) across generations.

**IMPORTANT**: Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive animations and effects. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details. Elegance comes from executing the vision well.

Remember: Claude is capable of extraordinary creative work. Don't hold back, show what can truly be created when thinking outside the box and committing fully to a distinctive vision.

## Scroll-Driven Website Design Guidelines

When this skill is invoked for a scroll-driven animated website (used alongside `video-to-website`), follow these additional rules:

### Typography as Design
- Hero headings: **6rem minimum**, tight line-height (0.9-1.0), heavy weight (700-800)
- Section headings: **3rem minimum**, confident weight (600-700)
- Horizontal marquee text: **10-15vw**, uppercase, letterspaced
- Section labels: small (0.7rem), uppercase, letterspaced (0.15em+), muted color — like "001 / Features"
- Text hierarchy replaces card containers. Size, weight, and color ARE the structure

### No Cards, No Boxes
- **NEVER** use glassmorphism cards, frosted glass, or visible containers around text on scroll-driven sites
- Text sits directly on the background — clean, confident, editorial
- Readability comes from: font weight (600+), text-shadow if needed, and ensuring video frames have clean backgrounds at text scroll points
- The only acceptable "container" is generous padding on the section itself

### Color Zones
- Background color must shift between sections (light → dark → accent → light)
- Define color zones in CSS variables: `--bg-light`, `--bg-dark`, `--bg-accent`
- Text color inverts automatically: `--text-on-light`, `--text-on-dark`
- Transitions happen via GSAP, not CSS transitions

### Layout Variety
Every scroll-driven page needs at least 3 different layout patterns:
1. **Centered** — hero sections, CTAs
2. **Left-aligned** — feature descriptions with product on right
3. **Right-aligned** — alternate features
4. **Full-width** — horizontal marquee text, stats rows
5. **Split** — text on one side, supporting visual on the other

Never use the same layout for consecutive sections.

### Animation Choreography
- Every section must use a DIFFERENT entrance animation (fade-up, slide-left, slide-right, scale-up, clip-path reveal)
- Elements within a section enter with staggered delays (0.08-0.12s between items)
- Sequence: label first → heading → body text → CTA/button
- At least one section must pin (stay fixed) while its contents animate internally
- At least one oversized text element must move horizontally on scroll

### Stats & Numbers
- Display stats at **4rem+** font size
- Numbers MUST count up via GSAP (never appear statically)
- Use a suffix element for units (x, M, %, etc.) at a smaller size
- Labels below in small caps or uppercase muted text

---

## BlackLine Project: Design System & Angular 19 Patterns

When working on the **BlackLine** tattoo marketplace (`/home/oscar/Documents/black_line/frontend`), apply this specific design system. All components are **Angular 19 standalone**.

### Color Tokens
```scss
// Backgrounds (dark to darker)
--bl-bg-primary:    #0C0A08;   // main canvas
--bl-bg-secondary:  #111110;   // alternate sections
--bl-bg-panel:      #0F0D0B;   // sidebars, panels
--bl-bg-footer:     #0A0908;   // footer

// Gold accent system
--bl-gold:          #C9A84C;   // primary accent
--bl-gold-muted:    #C9A84C33; // borders, subtle dividers
--bl-gold-border:   #C9A84C30; // card strokes

// Text
--bl-text-primary:  #EDE0C4;   // main readable text
--bl-text-secondary:#8A7E72;   // subtitles, captions
--bl-text-muted:    #5A5248;   // placeholders, disabled

// Structural dividers
--bl-divider:       #2A2420;   // internal borders, separators
```

### Typography
- **Headings / Display**: `Playfair Display` — weights 400, 700. All major titles.
- **Body / UI**: `Inter` — weights 400, 500, 600. Labels, inputs, buttons, descriptions.
- Load both via Google Fonts in `index.html`:
  ```html
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  ```

### Visual Motifs
- **Gold hairlines**: 1px borders in `#C9A84C15`–`#C9A84C33` on cards, navbars, sections
- **Warm noise texture** (optional): subtle `background-image: url()` grain overlay at 4–6% opacity
- **No pure white**: use `#EDE0C4` for the brightest text
- **No pure black**: darkest bg is `#0A0908`
- **Dark glassmorphism**: `background: rgba(12,10,8,0.85); backdrop-filter: blur(12px)` for overlays/modals
- **Gold hover glow**: `box-shadow: 0 0 0 1px #C9A84C40, 0 4px 20px #C9A84C15` on interactive cards

### Angular 19 Implementation Rules
All components MUST be **standalone**. Follow this template:

```typescript
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss'],
})
export class ExampleComponent {
  private fb = inject(FormBuilder);
  // Use signals for reactive state
  loading = signal(false);
  items = signal<Item[]>([]);
}
```

**Key Angular 19 patterns:**
- Use `inject()` instead of constructor injection
- Use `signal()`, `computed()`, `effect()` for reactive state
- Use `@for` / `@if` / `@switch` (new control flow syntax), NOT `*ngFor`/`*ngIf`
- Services return `Observable` — use `async` pipe or `.subscribe()` with proper cleanup

### Component File Structure (BlackLine)
```
frontend/src/app/features/[role]/pages/[component]/
  ├── [component].component.ts      ← standalone, signals
  ├── [component].component.html    ← new Angular control flow
  └── [component].component.scss    ← SCSS with BL tokens
```

### SCSS Base Template for BlackLine Components
```scss
:host {
  display: block;
  background: var(--bl-bg-primary, #0C0A08);
  color: var(--bl-text-primary, #EDE0C4);
  font-family: 'Inter', sans-serif;
  min-height: 100vh;
}

h1, h2, h3 {
  font-family: 'Playfair Display', serif;
  color: var(--bl-text-primary, #EDE0C4);
}

.card {
  background: var(--bl-bg-panel, #0F0D0B);
  border: 1px solid var(--bl-divider, #2A2420);
  border-radius: 8px;
  
  &:hover {
    border-color: var(--bl-gold-muted, #C9A84C33);
    box-shadow: 0 4px 20px rgba(201, 168, 76, 0.08);
  }
}

.btn-primary {
  background: var(--bl-gold, #C9A84C);
  color: #0C0A08;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  padding: 12px 24px;
  cursor: pointer;
  transition: opacity 0.2s;
  
  &:hover { opacity: 0.9; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
}

.btn-outline {
  background: transparent;
  color: var(--bl-gold, #C9A84C);
  border: 1px solid var(--bl-gold-muted, #C9A84C33);
  border-radius: 6px;
  padding: 12px 24px;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  
  &:hover {
    border-color: var(--bl-gold, #C9A84C);
    background: rgba(201, 168, 76, 0.06);
  }
}
```

### Screen Layouts (from Pencil design)
- **Landing**: Full-width sections alternating `#0C0A08` / `#111110`, hero split 680px/760px
- **Login**: Split 600px art panel (left) + 840px form (right), no shared navbar
- **Cotizador**: 60px nav + body split (300px sidebar steps + fill main)
- **Match**: 64px top bar + fill content (sidebar filters + card grid)
- **Dashboard Artista**: 64px nav (tabs) + body split (280px sidebar + fill main)

### Responsive Breakpoints
```scss
// Mobile-first
$bp-sm: 640px;
$bp-md: 768px;
$bp-lg: 1024px;
$bp-xl: 1280px;

// Collapse sidebar to drawer at $bp-md
// Stack split layouts vertically at $bp-md
// Reduce padding 80px→24px at mobile
```