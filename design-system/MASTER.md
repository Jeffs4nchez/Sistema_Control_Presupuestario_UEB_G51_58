# UEB Design System — Sistema de Control Presupuestario
## Universidad Estatal de Bolívar · G51-58

---

## 1. Brand Identity

### Primary Colors
| Token | Hex | Usage |
|---|---|---|
| `primary` | `#1a3a5c` | Headings, sidebar bg, dark elements |
| `primaryMid` | `#2e6ca4` | Buttons, links, accents, active states |
| `primaryLight` | `#54b3e0` | Glows, focus rings, hover accents |
| `red` | `#ff0000` | Critical indicators |
| `redDark` | `#8b0f0f` | Danger buttons (gradient start) |
| `white` | `#FFFFFF` | Card bg, text on dark |
| `bg` | `#f0f4f8` | Page background |

### Semantic State Colors
| State | Hex |
|---|---|
| Success | `#059669` |
| Warning | `#d97706` |
| Error | `#b91c1c` |
| Info | `#2e6ca4` |

### Text Hierarchy (Light Backgrounds)
| Role | Hex |
|---|---|
| Heading | `#1a3a5c` |
| Body | `#2e4a6c` |
| Secondary | `#5a7a9f` |
| Muted | `#8fa3c0` |
| Light | `#b0c4d8` |
| Inverse (on dark) | `#ffffff` |

### Accent Palette (Charts / Badges)
```
blue:   #2e6ca4    light:  #54b3e0    teal:   #0891b2
green:  #059669    amber:  #d97706    red:    #8b0f0f
purple: #7c3aed    orange: #ea580c
```

---

## 2. Typography

**Font Family:** `'Montserrat', system-ui, sans-serif`  
**Google Fonts:** `Montserrat:wght@300;400;500;600;700;800`

### Type Scale
| Token | px | Usage |
|---|---|---|
| `xs` | 11px | Labels, badges, captions |
| `sm` | 12px | Helper text, secondary info |
| `md` | 13px | Body text, table cells |
| `base` | 14px | Default UI text |
| `lg` | 15px | Subheadings |
| `xl` | 16px | Card titles |
| `2xl` | 18px | Section headings |
| `3xl` | 20px | Page titles |
| `4xl` | 24px | Large headings |
| `5xl` | 28px | Hero numbers |
| `6xl` | 32px | Display |

### Font Weights
| Token | Value | Usage |
|---|---|---|
| `light` | 300 | Decorative |
| `normal` | 400 | Body text |
| `medium` | 500 | Nav items |
| `semibold` | 600 | Labels, buttons |
| `bold` | 700 | Headings, numbers |
| `black` | 800 | Display, hero titles |

---

## 3. Visual Style: Glassmorphism

### Glass Card
```css
background: rgba(255,255,255,0.85);
border: 1px solid rgba(255,255,255,0.95);
box-shadow: 0 4px 24px rgba(26,58,92,0.10);
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);
border-radius: 16px;
```

### Glass Card Small
```css
background: rgba(255,255,255,0.90);
border: 1px solid rgba(46,108,164,0.14);
box-shadow: 0 2px 16px rgba(26,58,92,0.06);
backdrop-filter: blur(12px);
border-radius: 12px;
```

### Dark Glass (Sidebar)
```css
background: linear-gradient(160deg, #0a1929, #1a3a5c);
```

---

## 4. Sidebar

### Layout
- Width open: `264px`
- Width collapsed: `64px`
- Background: `linear-gradient(160deg, #0a1929, #1a3a5c)`
- Animated with `framer-motion` width transition

### Nav Item States
| State | Style |
|---|---|
| Default | `color: rgba(255,255,255,0.60)` |
| Hover | `x: +3` translate, `rgba(84,179,224,0.08)` bg |
| Active | Blue left border, `rgba(84,179,224,0.14)` bg, icon glow `drop-shadow(0 0 6px rgba(84,179,224,0.6))` |

### Menu Groups
1. **Principal** — Inicio
2. **Presupuesto** — Presupuesto Disponible, Estructura, Cédula
3. **Operaciones** — Certificaciones, Liquidaciones, Entidades
4. **Administración** — Usuarios, Auditoría, Reportes

---

## 5. Header (Floating)

```css
background: rgba(240,244,248,0.92);
backdrop-filter: blur(20px);
border-bottom: 1px solid rgba(26,58,92,0.08);
box-shadow: 0 2px 16px rgba(26,58,92,0.06);
height: 60px;
position: sticky;
top: 0;
z-index: 40;
```

---

## 6. Shadows

| Token | Value |
|---|---|
| `sm` | `0 2px 8px rgba(26,58,92,0.08)` |
| `md` | `0 4px 20px rgba(26,58,92,0.10)` |
| `lg` | `0 8px 32px rgba(26,58,92,0.12)` |
| `xl` | `0 20px 60px rgba(26,58,92,0.18)` |
| `glow` | `0 0 20px rgba(84,179,224,0.35)` |

---

## 7. Border Radius

| Token | Value | Usage |
|---|---|---|
| `radiusSmall` | `6px` | Buttons, badges |
| `radiusMd` | `10px` | Inputs, table cells |
| `radiusLg` | `14px` | Cards |
| `radiusXl` | `20px` | Modals |
| `radiusFull` | `9999px` | Pills, avatars |

---

## 8. Spacing Scale

| Token | rem | px |
|---|---|---|
| `xs` | 0.25rem | 4px |
| `sm` | 0.5rem | 8px |
| `md` | 1rem | 16px |
| `lg` | 1.5rem | 24px |
| `xl` | 2rem | 32px |
| `2xl` | 2.5rem | 40px |
| `3xl` | 3rem | 48px |

---

## 9. Motion (framer-motion)

### Timing
| Token | Value | Usage |
|---|---|---|
| `fast` | 0.18s ease | Micro-interactions |
| `normal` | 0.28s ease | Page transitions |
| `slow` | 0.45s ease | Complex transitions |
| `spring` | `cubic-bezier(0.34,1.56,0.64,1)` | Bouncy UI |

### Standard Entrance
```jsx
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: -10 }}
transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
```

### Staggered List Items
```jsx
initial={{ opacity: 0, x: -8 }}
animate={{ opacity: 1, x: 0 }}
transition={{ delay: idx * 0.04, duration: 0.25 }}
```

### Card Hover
```jsx
whileHover={{ y: -4, scale: 1.01 }}
```

### Modal Spring
```jsx
initial={{ opacity: 0, scale: 0.94, y: 20 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
transition={{ type: 'spring', stiffness: 160, damping: 22 }}
```

---

## 10. Form Inputs

### Light Theme Input
```js
const INPUT_S = {
  padding: '8px 11px',
  background: '#f8fafd',
  border: '1px solid rgba(46,108,164,0.22)',
  borderRadius: '8px',
  color: '#1a3a5c',
  fontSize: '13px',
  fontFamily: 'var(--font-primary)',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}
// Focus: borderColor '#54b3e0', boxShadow '0 0 0 3px rgba(84,179,224,0.18)'
```

### Label
```js
const LABEL_S = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 700,
  color: '#5a7a9f',
  marginBottom: '5px',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
}
```

---

## 11. Buttons

### Primary (Gradient)
```css
background: linear-gradient(135deg, #1a3a5c, #2e6ca4);
color: #fff;
border: none;
border-radius: 8px;
font-weight: 700;
box-shadow: 0 4px 16px rgba(26,58,92,0.25);
```

### Danger
```css
background: linear-gradient(135deg, #8b0f0f, #b91c1c);
color: #fff;
```

### Ghost
```css
background: rgba(26,58,92,0.06);
border: 1px solid rgba(26,58,92,0.12);
color: #5a7a9f;
```

---

## 12. Badges

| Class | Color |
|---|---|
| `.badge-blue` | `#2e6ca4` (bg `rgba(46,108,164,0.10)`) |
| `.badge-green` | `#059669` (bg `rgba(5,150,105,0.10)`) |
| `.badge-red` | `#b91c1c` (bg `rgba(185,28,28,0.10)`) |
| `.badge-gold` | `#d97706` (bg `rgba(217,119,6,0.10)`) |
| `.badge-purple` | `#7c3aed` (bg `rgba(124,58,237,0.10)`) |
| `.badge-orange` | `#ea580c` (bg `rgba(234,88,12,0.10)`) |

---

## 13. Tables

```css
/* .ueb-table */
width: 100%;
border-collapse: collapse;

/* thead tr */
background: rgba(240,244,248,0.80);

/* th */
padding: 10px 14px;
font-size: 11px;
font-weight: 700;
color: #8fa3c0;
text-transform: uppercase;
letter-spacing: 0.05em;
border-bottom: 1px solid rgba(46,108,164,0.14);

/* td */
padding: 12px 14px;
color: #2e4a6c;
border-bottom: 1px solid rgba(46,108,164,0.08);

/* tr:hover */
background: rgba(84,179,224,0.04);
```

---

## 14. Modals

```css
/* Overlay */
background: rgba(10,25,47,0.50);
backdrop-filter: blur(8px);

/* Modal card */
background: rgba(255,255,255,0.97);
border: 1px solid rgba(255,255,255,0.95);
border-radius: 20px;
box-shadow: 0 24px 80px rgba(10,25,47,0.25);

/* Modal header */
background: linear-gradient(135deg, #0d1f35, #1a3a5c);
color: #fff;
```

---

## 15. Page Structure

```
Dashboard (root)
├── Sidebar (motion.aside, dark navy gradient)
│   ├── Logo + Collapse toggle
│   ├── Menu groups (motion.button items)
│   └── User avatar + logout
├── Main content area
│   ├── Floating header (glassmorphism, sticky)
│   └── Page content (motion.div keyed to pathname)
│       └── Background floating shapes (radial-gradient)
```

---

## 16. CSS Variables

```css
:root {
  --ueb-navy:    #1a3a5c;
  --ueb-blue:    #2e6ca4;
  --ueb-light:   #54b3e0;
  --ueb-red:     #ff0000;
  --ueb-red-dk:  #8b0f0f;
  --ueb-bg:      #f0f4f8;
  --ueb-white:   #ffffff;

  --page-bg:     #f0f4f8;
  --text-heading: #1a3a5c;
  --text-body:    #2e4a6c;
  --text-secondary: #5a7a9f;
  --text-muted:   #8fa3c0;
  --font-primary: 'Montserrat', system-ui, sans-serif;
}
```

---

## 17. Z-Index Scale

| Layer | Value |
|---|---|
| Base | 0 |
| Card | 10 |
| Header | 50 |
| Sidebar | 100 |
| Modal | 1000 |
| Toast | 1100 |
| Loading | 9999 |

---

## 18. Page-Level Components (Summary)

| Component | Key Visual |
|---|---|
| `Dashboard.jsx` | Dark sidebar + light content, page transitions |
| `Inicio.jsx` | 3D flip KPI cards, animated counter, recharts bar chart |
| `LoadingScreen.jsx` | Dark navy, SVG brand mark, animated progress bar |
| `Usuarios.jsx` | Glass table, glass modals, staggered row entrance |
| `Auditoria.jsx` | Timeline badges, glass filter panel, paginated table |
| `Reportes.jsx` | Glassmorphism report cards, preview modal |
| `Certificacion.jsx` | Sticky glass header with animated tab indicator |
| `PresupuestoDisponible.jsx` | Animated saldo bars, glass summary cards |
| `CambiarContrasenaModal.jsx` | Spring modal, navy header, requirements checklist |
| `ListaCertificaciones.jsx` | Light table, estado badges, audit timeline modal |
| `EntidadRequiriente.jsx` | Glass CRUD table, spring modals |
| `Liquidaciones.jsx` | Accordion certs, mini progress bars, side panel |
| `CrearCertificacion.jsx` | Multi-section form, cascading selects, budget check |

---

*Generated: 2026-05-21 · UEB G51-58*
