# Chameleon Design System — Minimal & Luxury

## Brand Philosophy
A refined, minimal aesthetic that communicates trust, quality, and sophistication. Every element should breathe — generous whitespace, understated typography, and purposeful interactions create an experience that feels curated and premium.

---

## Color Palette

### Core Colors
| Token | Hex | Usage |
|---|---|---|
| `--background` | `#FAFAF8` | Page background (warm off-white) |
| `--foreground` | `#1A1A1A` | Primary text |
| `--muted` | `#F5F5F0` | Card backgrounds, sections |
| `--muted-foreground` | `#737373` | Secondary text, captions |
| `--border` | `#E8E8E3` | Borders, dividers |
| `--border-subtle` | `#F0F0EB` | Subtle separators |

### Accent Colors (per-store, via CSS variables)
| Token | Role |
|---|---|
| `--primary` | Brand accent — buttons, links, highlights |
| `--secondary` | Supporting accent (complementary) |

### Semantic Colors
| Token | Hex | Usage |
|---|---|---|
| `--success` | `#16A34A` | In-stock, success states |
| `--warning` | `#CA8A04` | Low stock, warnings |
| `--error` | `#DC2626` | Errors, out of stock |

### Usage Rules
1. **Primary accent**: Use sparingly — CTAs, active states, key highlights only
2. **Never** use accent color for large background fills (except hero CTA sections)
3. Body text is always `--foreground` on `--background`
4. Muted text uses `--muted-foreground` (minimum 4.5:1 contrast ratio)
5. Borders are `--border` by default, `--border-subtle` for inner dividers

---

## Typography System

### Font Stack
- **Display / Headlines**: `"Playfair Display", Georgia, serif` — conveys luxury
- **Body / UI**: `"Inter", -apple-system, sans-serif` — clean readability

### Scale
| Level | Size | Weight | Font | Letter Spacing | Use |
|---|---|---|---|---|---|
| Display | 4rem (64px) | 700 | Serif | -0.02em | Hero headlines |
| H1 | 2.5rem (40px) | 600 | Serif | -0.01em | Page titles |
| H2 | 1.875rem (30px) | 600 | Serif | 0 | Section headings |
| H3 | 1.25rem (20px) | 600 | Sans | 0 | Card titles |
| Body | 1rem (16px) | 400 | Sans | 0 | Paragraphs |
| Small | 0.875rem (14px) | 400 | Sans | 0 | Captions |
| Overline | 0.75rem (12px) | 500 | Sans | 0.1em | Labels, badges |

### Rules
1. Headlines use **serif** font for luxury character
2. Body and UI elements use **sans-serif** for clarity
3. Overline text is always `uppercase` with wide letter-spacing  
4. Never use `font-bold` on body text — use `font-medium` maximum
5. Line height: 1.2 for headlines, 1.6 for body

---

## Spacing & Grid

### Spacing Scale (8px base)
| Token | Value | Use |
|---|---|---|
| `xs` | 4px | Inline gaps |
| `sm` | 8px | Tight component spacing |
| `md` | 16px | Standard component padding |
| `lg` | 24px | Card padding |
| `xl` | 32px | Section inner padding |
| `2xl` | 48px | Between major sections |
| `3xl` | 64px | Hero padding |
| `4xl` | 96px | Section top/bottom spacing |

### Grid
- Max container width: **1200px**
- Column count: **12**
- Gutter: **24px** (desktop), **16px** (mobile)
- Product grid: 4 columns (desktop) → 2 columns (mobile)

### Section Rhythm
- Sections separated by `96px` vertical spacing (desktop)
- `48px` on tablet, `32px` on mobile
- Use `border-b border-border` between sections instead of background color changes

---

## Component Styles

### Buttons

#### Primary Button
```
bg: var(--primary)
text: white
padding: 14px 32px
border-radius: 2px
font: 13px / 500 / uppercase / 0.08em tracking
transition: opacity 300ms
hover: opacity 0.85
active: scale(0.98)
```

#### Secondary Button (Outline)
```
bg: transparent
border: 1px solid var(--foreground)
text: var(--foreground)
padding: 14px 32px
border-radius: 2px
font: 13px / 500 / uppercase / 0.08em tracking
hover: bg var(--foreground), text white
```

#### Ghost Button
```
bg: transparent
text: var(--foreground)
padding: 14px 32px
font: 13px / 500 / uppercase / 0.08em tracking
hover: bg var(--muted)
```

### Product Cards
```
bg: white
border: 1px solid var(--border)
border-radius: 0 (sharp corners = luxury)
overflow: hidden
transition: border-color 400ms, box-shadow 400ms
hover: border-color var(--foreground), shadow 0 8px 30px rgba(0,0,0,0.06)
```
- Image: `aspect-[3/4]` (portrait orientation for products)
- Content padding: 20px
- Name: H3 style, single line truncate
- Price: Body size, medium weight

### Badges / Tags
```
bg: transparent
border: 1px solid var(--border)
padding: 4px 12px
border-radius: 0
font: 11px / 500 / uppercase / 0.08em tracking
```

### Input Fields
```
bg: white
border: 1px solid var(--border)
border-radius: 2px
padding: 14px 16px
font: 15px / 400
focus: border-color var(--foreground)
transition: border-color 200ms
```
- No shadows on focus, just border color change
- Labels: overline style above input

---

## Animation & Interaction Guidelines

### Principles
1. **Restrained**: Animations should be felt, not seen
2. **Purposeful**: Every animation communicates state change
3. **Slow-luxury**: Prefer 300-500ms durations
4. **Ease**: Use `cubic-bezier(0.25, 0.1, 0.25, 1)` for elegance

### Micro-interactions
| Element | Interaction | Duration | Easing |
|---|---|---|---|
| Buttons | Opacity fade | 300ms | ease |
| Cards | Border color + shadow | 400ms | ease |
| Nav links | Underline slide-in | 300ms | ease-out |
| Images | Scale 1 → 1.03 | 600ms | ease |
| Page sections | Fade-in-up on scroll | 500ms | ease-out |
| Cart drawer | Slide from right | 350ms | cubic-bezier(0.25, 0.1, 0.25, 1) |

### Scroll Animations
- Elements fade in with 20px upward translate
- Staggered delay: 50ms between sibling elements
- Use `IntersectionObserver` with `threshold: 0.1`

### Hover States
- **Product images**: Slow zoom (scale 1.03)
- **Links**: Underline animates from left to right
- **Buttons**: Opacity reduction (not color change)
- **Cards**: Border darkens to `--foreground`

### Transitions (Prohibited)
- No bounce/spring effects
- No color flashes
- No translateY hover lifts on cards (too playful)
- No glow/pulse effects

---

## Iconography
- **Library**: Lucide React
- **Stroke width**: 1.5px (default)
- **Size**: 20px standard, 16px small, 24px large
- Use icons sparingly — let typography do the work
- Prefer text labels over icon-only buttons

---

## Responsive Breakpoints
| Name | Width | Grid Cols |
|---|---|---|
| Mobile | < 640px | 2 cols |
| Tablet | 640-1024px | 2-3 cols |
| Desktop | 1024-1280px | 3-4 cols |
| Wide | > 1280px | 4 cols |
