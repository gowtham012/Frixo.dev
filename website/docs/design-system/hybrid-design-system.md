# Hybrid Design System: Neumorphic Cyberpunk

A unique design system combining **Neumorphic layouts and structure** with **Cyberpunk colors and text effects**.

---

## Design Philosophy

| Aspect | Source | Implementation |
|--------|--------|----------------|
| **Layout Structure** | Neumorphism | Soft extruded/inset cards, dual shadows, rounded corners |
| **Colors** | Cyberpunk | Void black backgrounds, neon accents |
| **Text Effects** | Cyberpunk | Chromatic aberration, glow, glitch animations |
| **Interaction** | Hybrid | Soft press states + neon glow feedback |

---

## Color Palette

### Background Colors (Cyberpunk Base)
| Name | Hex | CSS Variable | Usage |
|------|-----|--------------|-------|
| Void Black | `#0a0a0f` | `--bg-void` | Main background |
| Deep Space | `#0d1117` | `--bg-deep` | Card backgrounds |
| Dark Matter | `#161b22` | `--bg-matter` | Elevated surfaces |
| Nebula Gray | `#21262d` | `--bg-nebula` | Borders, dividers |

### Neon Accent Colors
| Name | Hex | CSS Variable | Usage |
|------|-----|--------------|-------|
| Neon Cyan | `#00d4ff` | `--neon-cyan` | Primary CTA, highlights |
| Neon Purple | `#a855f7` | `--neon-purple` | Secondary accent |
| Neon Magenta | `#ff00ff` | `--neon-magenta` | Tertiary/hover states |
| Neon Green | `#00ff88` | `--neon-green` | Success states |
| Electric Blue | `#3b82f6` | `--neon-blue` | Links, interactive |

### Text Colors
| Name | Hex | CSS Variable | Usage |
|------|-----|--------------|-------|
| Pure White | `#ffffff` | `--text-primary` | Headings |
| Light Gray | `#e5e7eb` | `--text-secondary` | Body text |
| Muted Gray | `#9ca3af` | `--text-muted` | Secondary text |
| Dim Gray | `#6b7280` | `--text-dim` | Placeholder, disabled |

---

## Neumorphic Structure

### Shadow System (Adapted for Dark Mode)

```css
/* Base neumorphic shadows for dark backgrounds */
:root {
  /* Light source: top-left */
  --nm-shadow-light: rgba(255, 255, 255, 0.05);
  --nm-shadow-dark: rgba(0, 0, 0, 0.5);

  /* Distances */
  --nm-distance-sm: 4px;
  --nm-distance-md: 8px;
  --nm-distance-lg: 16px;
  --nm-distance-xl: 24px;
}

/* Extruded (raised) effect */
.nm-extruded {
  background: var(--bg-deep);
  box-shadow:
    calc(var(--nm-distance-md) * -1) calc(var(--nm-distance-md) * -1) calc(var(--nm-distance-lg)) var(--nm-shadow-light),
    var(--nm-distance-md) var(--nm-distance-md) calc(var(--nm-distance-lg)) var(--nm-shadow-dark);
  border-radius: 24px;
}

/* Inset (pressed) effect */
.nm-inset {
  background: var(--bg-deep);
  box-shadow:
    inset calc(var(--nm-distance-md) * -1) calc(var(--nm-distance-md) * -1) calc(var(--nm-distance-lg)) var(--nm-shadow-light),
    inset var(--nm-distance-md) var(--nm-distance-md) calc(var(--nm-distance-lg)) var(--nm-shadow-dark);
  border-radius: 24px;
}

/* Flat (subtle) effect */
.nm-flat {
  background: var(--bg-deep);
  box-shadow:
    calc(var(--nm-distance-sm) * -1) calc(var(--nm-distance-sm) * -1) calc(var(--nm-distance-md)) var(--nm-shadow-light),
    var(--nm-distance-sm) var(--nm-distance-sm) calc(var(--nm-distance-md)) var(--nm-shadow-dark);
  border-radius: 16px;
}
```

### Border Radius System
| Size | Value | Usage |
|------|-------|-------|
| `sm` | `8px` | Small buttons, chips |
| `md` | `16px` | Cards, inputs |
| `lg` | `24px` | Large cards, sections |
| `xl` | `32px` | Hero elements, modals |
| `full` | `9999px` | Pills, avatars |

---

## Cyberpunk Text Effects

### Chromatic Aberration (RGB Split)
```css
.text-chromatic {
  position: relative;
  color: var(--text-primary);
}

.text-chromatic::before,
.text-chromatic::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.text-chromatic::before {
  color: var(--neon-cyan);
  clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
  transform: translate(-2px, -1px);
  opacity: 0.8;
}

.text-chromatic::after {
  color: var(--neon-magenta);
  clip-path: polygon(0 55%, 100% 55%, 100% 100%, 0 100%);
  transform: translate(2px, 1px);
  opacity: 0.8;
}
```

### Neon Glow Text
```css
.text-glow-cyan {
  color: var(--neon-cyan);
  text-shadow:
    0 0 10px var(--neon-cyan),
    0 0 20px var(--neon-cyan),
    0 0 40px var(--neon-cyan),
    0 0 80px var(--neon-cyan);
}

.text-glow-purple {
  color: var(--neon-purple);
  text-shadow:
    0 0 10px var(--neon-purple),
    0 0 20px var(--neon-purple),
    0 0 40px var(--neon-purple);
}

.text-glow-green {
  color: var(--neon-green);
  text-shadow:
    0 0 10px var(--neon-green),
    0 0 20px var(--neon-green),
    0 0 40px var(--neon-green);
}
```

### Glitch Animation
```css
@keyframes glitch {
  0% {
    clip-path: polygon(0 2%, 100% 2%, 100% 5%, 0 5%);
    transform: translate(-2px);
  }
  10% {
    clip-path: polygon(0 15%, 100% 15%, 100% 15%, 0 15%);
    transform: translate(2px);
  }
  20% {
    clip-path: polygon(0 10%, 100% 10%, 100% 20%, 0 20%);
    transform: translate(-2px);
  }
  30% {
    clip-path: polygon(0 1%, 100% 1%, 100% 2%, 0 2%);
    transform: translate(0);
  }
  40% {
    clip-path: polygon(0 33%, 100% 33%, 100% 33%, 0 33%);
    transform: translate(2px);
  }
  50% {
    clip-path: polygon(0 44%, 100% 44%, 100% 44%, 0 44%);
    transform: translate(-2px);
  }
  60% {
    clip-path: polygon(0 50%, 100% 50%, 100% 20%, 0 20%);
    transform: translate(0);
  }
  70% {
    clip-path: polygon(0 70%, 100% 70%, 100% 70%, 0 70%);
    transform: translate(2px);
  }
  80% {
    clip-path: polygon(0 80%, 100% 80%, 100% 80%, 0 80%);
    transform: translate(-2px);
  }
  90% {
    clip-path: polygon(0 50%, 100% 50%, 100% 55%, 0 55%);
    transform: translate(0);
  }
  100% {
    clip-path: polygon(0 60%, 100% 60%, 100% 70%, 0 70%);
    transform: translate(-2px);
  }
}

.text-glitch {
  position: relative;
}

.text-glitch::before,
.text-glitch::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--bg-void);
}

.text-glitch::before {
  color: var(--neon-cyan);
  animation: glitch 3s infinite linear alternate-reverse;
}

.text-glitch::after {
  color: var(--neon-magenta);
  animation: glitch 2s infinite linear alternate-reverse;
  animation-delay: -1s;
}
```

### Scanline Effect
```css
.scanlines::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.15),
    rgba(0, 0, 0, 0.15) 1px,
    transparent 1px,
    transparent 2px
  );
  pointer-events: none;
  z-index: 10;
}
```

---

## Hybrid Components

### Neumorphic Card with Neon Accent
```css
.card-hybrid {
  /* Neumorphic structure */
  background: var(--bg-deep);
  border-radius: 24px;
  padding: 32px;
  box-shadow:
    -8px -8px 16px rgba(255, 255, 255, 0.03),
    8px 8px 16px rgba(0, 0, 0, 0.5);

  /* Cyberpunk accent */
  border: 1px solid transparent;
  background-clip: padding-box;
  position: relative;
}

.card-hybrid::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: 25px;
  padding: 1px;
  background: linear-gradient(135deg, var(--neon-cyan), var(--neon-purple));
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0.5;
  transition: opacity 0.3s ease;
}

.card-hybrid:hover::before {
  opacity: 1;
}
```

### Neumorphic Button with Neon Glow
```css
.btn-hybrid {
  /* Neumorphic base */
  background: var(--bg-matter);
  border-radius: 16px;
  padding: 16px 32px;
  border: none;
  box-shadow:
    -4px -4px 8px rgba(255, 255, 255, 0.03),
    4px 4px 8px rgba(0, 0, 0, 0.4);

  /* Cyberpunk text */
  color: var(--neon-cyan);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;

  transition: all 0.3s ease;
}

.btn-hybrid:hover {
  /* Inset on press */
  box-shadow:
    inset -4px -4px 8px rgba(255, 255, 255, 0.03),
    inset 4px 4px 8px rgba(0, 0, 0, 0.4);

  /* Neon glow */
  text-shadow:
    0 0 10px var(--neon-cyan),
    0 0 20px var(--neon-cyan);
}

.btn-hybrid:active {
  transform: scale(0.98);
}
```

### Neumorphic Input with Neon Focus
```css
.input-hybrid {
  /* Neumorphic inset */
  background: var(--bg-void);
  border-radius: 12px;
  padding: 16px 20px;
  border: 1px solid var(--bg-nebula);
  box-shadow:
    inset -4px -4px 8px rgba(255, 255, 255, 0.02),
    inset 4px 4px 8px rgba(0, 0, 0, 0.3);

  /* Text styling */
  color: var(--text-primary);
  font-size: 16px;

  transition: all 0.3s ease;
}

.input-hybrid:focus {
  outline: none;
  border-color: var(--neon-cyan);
  box-shadow:
    inset -4px -4px 8px rgba(255, 255, 255, 0.02),
    inset 4px 4px 8px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(0, 212, 255, 0.2);
}

.input-hybrid::placeholder {
  color: var(--text-dim);
}
```

---

## Gradients

### Background Gradients
```css
/* Hero mesh gradient */
.bg-hero-mesh {
  background:
    radial-gradient(ellipse at 20% 50%, rgba(0, 212, 255, 0.1) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 50%, rgba(168, 85, 247, 0.1) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 100%, rgba(255, 0, 255, 0.05) 0%, transparent 50%),
    var(--bg-void);
}

/* Card gradient */
.bg-card-gradient {
  background: linear-gradient(180deg, var(--bg-matter) 0%, var(--bg-deep) 100%);
}
```

### Accent Gradients
```css
/* Primary CTA gradient */
.gradient-primary {
  background: linear-gradient(135deg, var(--neon-cyan), var(--neon-purple));
}

/* Text gradient */
.text-gradient {
  background: linear-gradient(135deg, var(--neon-cyan), var(--neon-purple));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

---

## Animation Utilities

### Hover Glow Pulse
```css
@keyframes glow-pulse {
  0%, 100% {
    box-shadow:
      -8px -8px 16px rgba(255, 255, 255, 0.03),
      8px 8px 16px rgba(0, 0, 0, 0.5),
      0 0 20px rgba(0, 212, 255, 0.2);
  }
  50% {
    box-shadow:
      -8px -8px 16px rgba(255, 255, 255, 0.03),
      8px 8px 16px rgba(0, 0, 0, 0.5),
      0 0 40px rgba(0, 212, 255, 0.4);
  }
}

.glow-pulse:hover {
  animation: glow-pulse 2s ease-in-out infinite;
}
```

### Float Animation
```css
@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.float {
  animation: float 3s ease-in-out infinite;
}
```

### Neon Flicker
```css
@keyframes neon-flicker {
  0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% {
    text-shadow:
      0 0 10px var(--neon-cyan),
      0 0 20px var(--neon-cyan),
      0 0 40px var(--neon-cyan);
    opacity: 1;
  }
  20%, 24%, 55% {
    text-shadow: none;
    opacity: 0.8;
  }
}

.neon-flicker {
  animation: neon-flicker 3s infinite;
}
```

---

## Typography

### Font Family
```css
:root {
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}
```

### Type Scale
| Element | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|----------------|
| H1 | 56px / 3.5rem | 700 | 1.1 | -0.02em |
| H2 | 40px / 2.5rem | 700 | 1.2 | -0.01em |
| H3 | 32px / 2rem | 600 | 1.3 | 0 |
| H4 | 24px / 1.5rem | 600 | 1.4 | 0 |
| Body | 16px / 1rem | 400 | 1.6 | 0 |
| Small | 14px / 0.875rem | 400 | 1.5 | 0 |
| Caption | 12px / 0.75rem | 500 | 1.4 | 0.05em |

---

## Spacing System

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 4px | Tight gaps |
| `sm` | 8px | Component internal |
| `md` | 16px | Component padding |
| `lg` | 24px | Section gaps |
| `xl` | 32px | Card padding |
| `2xl` | 48px | Section padding |
| `3xl` | 64px | Large sections |
| `4xl` | 96px | Hero sections |

---

## Usage Examples

### Hero Section
```html
<section class="bg-hero-mesh min-h-screen flex items-center relative scanlines">
  <div class="container mx-auto px-6">
    <h1 class="text-chromatic text-6xl font-bold mb-6" data-text="Ship Reliable AI Agents">
      Ship Reliable AI Agents
    </h1>
    <p class="text-secondary text-xl mb-8 max-w-2xl">
      The open-source SDK + managed platform for building,
      evaluating, and deploying AI agents that actually work.
    </p>
    <div class="flex gap-4">
      <button class="btn-hybrid btn-primary">
        Get Early Access
      </button>
      <button class="btn-hybrid btn-secondary">
        Star on GitHub
      </button>
    </div>
  </div>
</section>
```

### Feature Card
```html
<div class="card-hybrid group">
  <div class="nm-extruded w-16 h-16 flex items-center justify-center mb-6 group-hover:glow-pulse">
    <svg class="w-8 h-8 text-glow-cyan"><!-- icon --></svg>
  </div>
  <h3 class="text-xl font-semibold text-primary mb-3">
    Open Source SDK
  </h3>
  <p class="text-muted">
    Start locally with our MIT-licensed SDK. Python and TypeScript.
    Full control, zero vendor lock-in.
  </p>
</div>
```

---

## Tailwind CSS Configuration

See `tailwind.config.ts` for the complete configuration implementing this design system.
