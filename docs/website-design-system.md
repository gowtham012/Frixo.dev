# Agent Platform Website Design System

> **Version:** 1.0
> **Date:** January 14, 2026
> **Status:** Final Specification

---

## Executive Summary

This document defines the complete design system, messaging strategy, and implementation guidelines for the Agent Platform website. The goal is to create **one of the best startup websites ever built** — a site that feels AI-native, premium, and alive.

**Design Philosophy:** *"Built by AI, for AI builders"*

The website should feel like it was designed and developed by an intelligent system — cutting-edge, responsive, almost sentient. Every element should reinforce that this is a next-generation AI platform.

---

## Table of Contents

1. [Brand Identity](#brand-identity)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Visual Language](#visual-language)
6. [Animation System](#animation-system)
7. [Component Specifications](#component-specifications)
8. [Page Sections](#page-sections)
9. [Messaging Strategy](#messaging-strategy)
10. [Technical Requirements](#technical-requirements)

---

## Brand Identity

### Core Positioning

**One-Line:** *"The platform that turns AI agents from prototypes into production systems — with self-evolving capabilities and human oversight built-in."*

**Tagline Options:**
- *"Agents that fix themselves"*
- *"Self-evolving AI. Human-approved."*
- *"Intelligence that improves itself"*

### Brand Personality

| Attribute | Expression |
|-----------|------------|
| **Intelligent** | AI-native visuals, computed aesthetics, living interfaces |
| **Premium** | Obsessive attention to detail, world-class polish |
| **Trustworthy** | Human approval emphasis, transparency, control |
| **Technical** | Developer-focused, code-forward, precise |
| **Futuristic** | Cutting-edge feel, ahead of the curve |

### Design Benchmarks

We aim to match or exceed:
- **Linear** — Smooth animations, dark elegance
- **Vercel** — Developer-first, stunning gradients
- **Stripe** — Polished micro-interactions, depth
- **Raycast** — Native feel, glowing UI
- **Arc** — Bold, memorable, playful-premium

---

## Color System

### Primary Palette — "Neural Dark"

A sophisticated dark palette with electric accent colors that feel alive and computational.

```css
:root {
  /* ═══════════════════════════════════════════════════════════
     BACKGROUNDS — Deep, dimensional, layered
     ═══════════════════════════════════════════════════════════ */

  --bg-void: #000000;           /* True black — for maximum contrast */
  --bg-deep: #050508;           /* Primary background — deep space */
  --bg-base: #0a0a0f;           /* Secondary background — cards, surfaces */
  --bg-elevated: #0f0f17;       /* Elevated surfaces — modals, dropdowns */
  --bg-hover: #14141f;          /* Hover states on surfaces */

  /* ═══════════════════════════════════════════════════════════
     ACCENT COLORS — Electric, alive, glowing
     ═══════════════════════════════════════════════════════════ */

  /* Primary Accent — Plasma Cyan */
  --accent-primary: #00FFFF;          /* Pure cyan — main accent */
  --accent-primary-bright: #00FFFF;   /* Bright state */
  --accent-primary-dim: #00B8B8;      /* Dimmed state */
  --accent-primary-glow: rgba(0, 255, 255, 0.4);   /* For box-shadows */
  --accent-primary-subtle: rgba(0, 255, 255, 0.08); /* Backgrounds */

  /* Secondary Accent — Neural Violet */
  --accent-secondary: #8B5CF6;        /* Violet — evolution, AI */
  --accent-secondary-bright: #A78BFA;
  --accent-secondary-dim: #7C3AED;
  --accent-secondary-glow: rgba(139, 92, 246, 0.4);
  --accent-secondary-subtle: rgba(139, 92, 246, 0.08);

  /* Tertiary Accent — Synapse Magenta */
  --accent-tertiary: #D946EF;         /* Magenta — highlights, special */
  --accent-tertiary-glow: rgba(217, 70, 239, 0.4);

  /* ═══════════════════════════════════════════════════════════
     SEMANTIC COLORS — Status indicators
     ═══════════════════════════════════════════════════════════ */

  --status-success: #00FF94;          /* Bright green — success, online */
  --status-success-dim: #00CC77;
  --status-success-glow: rgba(0, 255, 148, 0.4);

  --status-warning: #FFBB00;          /* Amber — warnings, caution */
  --status-warning-glow: rgba(255, 187, 0, 0.4);

  --status-error: #FF3366;            /* Red-pink — errors, critical */
  --status-error-glow: rgba(255, 51, 102, 0.4);

  --status-info: #3B82F6;             /* Blue — informational */

  /* ═══════════════════════════════════════════════════════════
     TEXT COLORS — Hierarchy and readability
     ═══════════════════════════════════════════════════════════ */

  --text-primary: #FFFFFF;            /* Primary text — headlines */
  --text-secondary: #B4B4C7;          /* Secondary — body text */
  --text-tertiary: #6B6B80;           /* Tertiary — captions, hints */
  --text-muted: #4A4A5C;              /* Muted — disabled, subtle */
  --text-ghost: #2A2A3C;              /* Ghost — very subtle elements */

  /* ═══════════════════════════════════════════════════════════
     BORDERS & DIVIDERS
     ═══════════════════════════════════════════════════════════ */

  --border-subtle: rgba(255, 255, 255, 0.06);
  --border-default: rgba(255, 255, 255, 0.10);
  --border-strong: rgba(255, 255, 255, 0.16);
  --border-accent: rgba(0, 255, 255, 0.30);

  /* ═══════════════════════════════════════════════════════════
     GRADIENTS — Mesh gradients for depth
     ═══════════════════════════════════════════════════════════ */

  --gradient-hero: radial-gradient(
    ellipse 80% 50% at 50% -20%,
    rgba(139, 92, 246, 0.15) 0%,
    rgba(0, 255, 255, 0.08) 40%,
    transparent 70%
  );

  --gradient-glow-cyan: radial-gradient(
    circle at center,
    rgba(0, 255, 255, 0.2) 0%,
    transparent 70%
  );

  --gradient-glow-violet: radial-gradient(
    circle at center,
    rgba(139, 92, 246, 0.2) 0%,
    transparent 70%
  );

  --gradient-text-primary: linear-gradient(
    135deg,
    #00FFFF 0%,
    #8B5CF6 50%,
    #D946EF 100%
  );

  --gradient-text-evolution: linear-gradient(
    135deg,
    #8B5CF6 0%,
    #D946EF 100%
  );

  --gradient-surface: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.03) 0%,
    rgba(255, 255, 255, 0.01) 100%
  );

  --gradient-border: linear-gradient(
    135deg,
    rgba(0, 255, 255, 0.3) 0%,
    rgba(139, 92, 246, 0.3) 50%,
    rgba(217, 70, 239, 0.3) 100%
  );
}
```

### Color Usage Guidelines

| Use Case | Color |
|----------|-------|
| Primary CTAs | `--accent-primary` with glow |
| Secondary CTAs | `--accent-secondary` |
| Headlines | `--text-primary` or gradient |
| Body text | `--text-secondary` |
| Captions | `--text-tertiary` |
| Card backgrounds | `--bg-base` |
| Hover states | `--bg-hover` + border glow |
| Success states | `--status-success` |
| Evolution/AI features | `--accent-secondary` |
| Interactive elements | `--accent-primary` |

### Glow Effects

```css
/* Primary glow (cyan) */
.glow-primary {
  box-shadow:
    0 0 20px var(--accent-primary-glow),
    0 0 40px rgba(0, 255, 255, 0.2),
    0 0 60px rgba(0, 255, 255, 0.1);
}

/* Secondary glow (violet) */
.glow-secondary {
  box-shadow:
    0 0 20px var(--accent-secondary-glow),
    0 0 40px rgba(139, 92, 246, 0.2),
    0 0 60px rgba(139, 92, 246, 0.1);
}

/* Success glow (green) */
.glow-success {
  box-shadow:
    0 0 20px var(--status-success-glow),
    0 0 40px rgba(0, 255, 148, 0.2);
}

/* Text glow */
.text-glow-primary {
  text-shadow:
    0 0 10px var(--accent-primary-glow),
    0 0 20px rgba(0, 255, 255, 0.3);
}
```

---

## Typography

### Font Stack

```css
:root {
  /* Primary — Headlines and UI */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

  /* Monospace — Code, terminal, technical */
  --font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace;
}
```

### Type Scale

```css
:root {
  /* Display — Hero headlines */
  --text-display-1: 5rem;      /* 80px */
  --text-display-2: 4rem;      /* 64px */

  /* Headlines */
  --text-h1: 3.5rem;           /* 56px */
  --text-h2: 2.5rem;           /* 40px */
  --text-h3: 1.75rem;          /* 28px */
  --text-h4: 1.25rem;          /* 20px */

  /* Body */
  --text-body-lg: 1.125rem;    /* 18px */
  --text-body: 1rem;           /* 16px */
  --text-body-sm: 0.875rem;    /* 14px */

  /* Small */
  --text-caption: 0.75rem;     /* 12px */
  --text-overline: 0.6875rem;  /* 11px */

  /* Line Heights */
  --leading-none: 1;
  --leading-tight: 1.15;
  --leading-snug: 1.3;
  --leading-normal: 1.5;
  --leading-relaxed: 1.65;

  /* Letter Spacing */
  --tracking-tight: -0.03em;
  --tracking-normal: 0;
  --tracking-wide: 0.05em;
  --tracking-wider: 0.1em;
  --tracking-widest: 0.2em;
}
```

### Typography Styles

```css
/* Display Headlines */
.text-display-1 {
  font-family: var(--font-sans);
  font-size: var(--text-display-1);
  font-weight: 700;
  line-height: var(--leading-none);
  letter-spacing: var(--tracking-tight);
  color: var(--text-primary);
}

/* Gradient Text */
.text-gradient {
  background: var(--gradient-text-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Terminal/Code Text */
.text-mono {
  font-family: var(--font-mono);
  font-size: var(--text-body-sm);
  line-height: var(--leading-relaxed);
  letter-spacing: 0;
}

/* Overline Labels */
.text-overline {
  font-family: var(--font-mono);
  font-size: var(--text-overline);
  font-weight: 500;
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--text-tertiary);
}

/* Accent Labels */
.text-label-accent {
  font-family: var(--font-mono);
  font-size: var(--text-caption);
  font-weight: 500;
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
  color: var(--accent-primary);
}
```

### Responsive Typography

```css
/* Mobile adjustments */
@media (max-width: 768px) {
  :root {
    --text-display-1: 3rem;    /* 48px */
    --text-display-2: 2.5rem;  /* 40px */
    --text-h1: 2.25rem;        /* 36px */
    --text-h2: 1.75rem;        /* 28px */
    --text-h3: 1.5rem;         /* 24px */
  }
}
```

---

## Spacing & Layout

### Spacing Scale

```css
:root {
  --space-0: 0;
  --space-1: 0.25rem;    /* 4px */
  --space-2: 0.5rem;     /* 8px */
  --space-3: 0.75rem;    /* 12px */
  --space-4: 1rem;       /* 16px */
  --space-5: 1.25rem;    /* 20px */
  --space-6: 1.5rem;     /* 24px */
  --space-8: 2rem;       /* 32px */
  --space-10: 2.5rem;    /* 40px */
  --space-12: 3rem;      /* 48px */
  --space-16: 4rem;      /* 64px */
  --space-20: 5rem;      /* 80px */
  --space-24: 6rem;      /* 96px */
  --space-32: 8rem;      /* 128px */
  --space-40: 10rem;     /* 160px */
}
```

### Layout Containers

```css
:root {
  --container-sm: 640px;
  --container-md: 768px;
  --container-lg: 1024px;
  --container-xl: 1280px;
  --container-2xl: 1440px;
  --container-full: 1600px;
}

.container {
  width: 100%;
  max-width: var(--container-xl);
  margin: 0 auto;
  padding: 0 var(--space-6);
}

@media (min-width: 1024px) {
  .container {
    padding: 0 var(--space-8);
  }
}
```

### Section Spacing

```css
.section {
  padding: var(--space-24) 0;
}

@media (min-width: 1024px) {
  .section {
    padding: var(--space-32) 0;
  }
}

.section-hero {
  padding: var(--space-32) 0 var(--space-24);
  min-height: 100vh;
}
```

### Grid System

```css
.grid {
  display: grid;
  gap: var(--space-6);
}

.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }

/* Auto-fit responsive grid */
.grid-auto {
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}
```

---

## Visual Language

### Design Principles

1. **Dimensional Depth** — Multiple layers, shadows, parallax
2. **Living Motion** — Ambient animations, responsive elements
3. **Intelligent Feel** — Computed aesthetics, terminal vibes
4. **Premium Polish** — Obsessive attention to detail
5. **Dark Excellence** — Volumetric lighting, glowing accents

### Card Styles

```css
/* Base Card */
.card {
  background: var(--bg-base);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  padding: var(--space-6);
  transition: all 0.3s ease;
}

.card:hover {
  background: var(--bg-hover);
  border-color: var(--border-default);
  transform: translateY(-2px);
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.3),
    0 0 0 1px var(--border-default);
}

/* Glass Card */
.card-glass {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
}

/* Glowing Card */
.card-glow {
  position: relative;
  background: var(--bg-base);
  border-radius: 16px;
  overflow: hidden;
}

.card-glow::before {
  content: '';
  position: absolute;
  inset: 0;
  padding: 1px;
  border-radius: 16px;
  background: var(--gradient-border);
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.card-glow:hover::before {
  opacity: 1;
}

/* Terminal Card */
.card-terminal {
  background: var(--bg-void);
  border: 1px solid var(--border-default);
  border-radius: 12px;
  font-family: var(--font-mono);
  overflow: hidden;
}

.card-terminal-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: var(--bg-base);
  border-bottom: 1px solid var(--border-subtle);
}

.card-terminal-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--text-muted);
}

.card-terminal-body {
  padding: var(--space-4);
}
```

### Button Styles

```css
/* Primary Button */
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-6);
  font-family: var(--font-sans);
  font-size: var(--text-body-sm);
  font-weight: 600;
  color: var(--bg-void);
  background: var(--accent-primary);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: var(--accent-primary-bright);
  box-shadow:
    0 0 20px var(--accent-primary-glow),
    0 4px 16px rgba(0, 0, 0, 0.3);
  transform: translateY(-1px);
}

.btn-primary:active {
  transform: translateY(0);
}

/* Secondary Button (Ghost) */
.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-6);
  font-family: var(--font-sans);
  font-size: var(--text-body-sm);
  font-weight: 500;
  color: var(--text-secondary);
  background: transparent;
  border: 1px solid var(--border-default);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
  border-color: var(--border-strong);
}

/* CTA Button (Large) */
.btn-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-8);
  font-family: var(--font-sans);
  font-size: var(--text-body);
  font-weight: 600;
  color: var(--bg-void);
  background: var(--accent-primary);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.btn-cta::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transform: translateX(-100%);
  transition: transform 0.5s ease;
}

.btn-cta:hover::before {
  transform: translateX(100%);
}

.btn-cta:hover {
  box-shadow:
    0 0 30px var(--accent-primary-glow),
    0 8px 24px rgba(0, 0, 0, 0.3);
  transform: translateY(-2px);
}

/* Terminal Button */
.btn-terminal {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-5);
  font-family: var(--font-mono);
  font-size: var(--text-body-sm);
  font-weight: 500;
  color: var(--accent-primary);
  background: var(--accent-primary-subtle);
  border: 1px solid var(--border-accent);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-terminal:hover {
  background: rgba(0, 255, 255, 0.15);
  box-shadow: 0 0 20px var(--accent-primary-glow);
}
```

### Input Styles

```css
/* Terminal Input */
.input-terminal {
  width: 100%;
  padding: var(--space-4) var(--space-5);
  font-family: var(--font-mono);
  font-size: var(--text-body);
  color: var(--text-primary);
  background: var(--bg-void);
  border: 1px solid var(--border-default);
  border-radius: 12px;
  outline: none;
  transition: all 0.2s ease;
}

.input-terminal::placeholder {
  color: var(--text-muted);
}

.input-terminal:focus {
  border-color: var(--accent-primary);
  box-shadow:
    0 0 0 3px var(--accent-primary-subtle),
    0 0 20px var(--accent-primary-glow);
}

/* Input with prefix */
.input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.input-prefix {
  position: absolute;
  left: var(--space-4);
  font-family: var(--font-mono);
  font-size: var(--text-body);
  color: var(--accent-primary);
  pointer-events: none;
}

.input-with-prefix {
  padding-left: calc(var(--space-4) + 1.5rem);
}
```

### Badge Styles

```css
/* Status Badge */
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
  font-family: var(--font-mono);
  font-size: var(--text-caption);
  font-weight: 500;
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  border-radius: 6px;
}

.badge-primary {
  color: var(--accent-primary);
  background: var(--accent-primary-subtle);
  border: 1px solid rgba(0, 255, 255, 0.2);
}

.badge-success {
  color: var(--status-success);
  background: rgba(0, 255, 148, 0.1);
  border: 1px solid rgba(0, 255, 148, 0.2);
}

.badge-secondary {
  color: var(--accent-secondary);
  background: var(--accent-secondary-subtle);
  border: 1px solid rgba(139, 92, 246, 0.2);
}

/* Status Dot */
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

---

## Animation System

### Animation Principles

1. **Purposeful** — Every animation has meaning
2. **Smooth** — 60fps minimum, ease curves
3. **Subtle** — Enhance, don't distract
4. **Responsive** — React to user input
5. **Ambient** — Always slightly alive

### Timing Functions

```css
:root {
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);

  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  --duration-slower: 800ms;
}
```

### Core Animations

```css
/* Fade In Up */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp var(--duration-slow) var(--ease-out) forwards;
}

/* Glow Pulse */
@keyframes glowPulse {
  0%, 100% {
    box-shadow: 0 0 20px var(--accent-primary-glow);
  }
  50% {
    box-shadow: 0 0 40px var(--accent-primary-glow);
  }
}

.animate-glow-pulse {
  animation: glowPulse 3s ease-in-out infinite;
}

/* Float */
@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

/* Spin Slow */
@keyframes spinSlow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin-slow {
  animation: spinSlow 8s linear infinite;
}

/* Shimmer */
@keyframes shimmer {
  from {
    background-position: -200% 0;
  }
  to {
    background-position: 200% 0;
  }
}

.animate-shimmer {
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  background-size: 200% 100%;
  animation: shimmer 2s ease-in-out infinite;
}

/* Typing Cursor */
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.cursor {
  display: inline-block;
  width: 2px;
  height: 1em;
  background: var(--accent-primary);
  margin-left: 2px;
  animation: blink 1s step-end infinite;
}

/* Gradient Flow */
@keyframes gradientFlow {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.animate-gradient-flow {
  background-size: 200% 200%;
  animation: gradientFlow 8s ease infinite;
}

/* Scale In */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale-in {
  animation: scaleIn var(--duration-normal) var(--ease-out) forwards;
}

/* Draw Line */
@keyframes drawLine {
  from {
    stroke-dashoffset: 1000;
  }
  to {
    stroke-dashoffset: 0;
  }
}

.animate-draw-line {
  stroke-dasharray: 1000;
  animation: drawLine 2s var(--ease-out) forwards;
}
```

### Stagger Delays

```css
.stagger-1 { animation-delay: 0.1s; }
.stagger-2 { animation-delay: 0.2s; }
.stagger-3 { animation-delay: 0.3s; }
.stagger-4 { animation-delay: 0.4s; }
.stagger-5 { animation-delay: 0.5s; }
.stagger-6 { animation-delay: 0.6s; }
```

### Framer Motion Variants

```typescript
// Fade In Up
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
};

// Stagger Container
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

// Scale on Hover
export const scaleOnHover = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: { type: "spring", stiffness: 400, damping: 17 }
};

// Glow on Hover
export const glowOnHover = {
  whileHover: {
    boxShadow: "0 0 30px rgba(0, 255, 255, 0.4)"
  },
  transition: { duration: 0.3 }
};

// Parallax
export const parallax = (offset: number) => ({
  y: offset,
  transition: { type: "spring", stiffness: 100, damping: 30 }
});
```

---

## Component Specifications

### Navigation

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  [Logo]                    Features  Docs  Pricing  Blog    [Get Access]│
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Behavior:**
- Transparent on hero, solid on scroll
- Blur backdrop when scrolled
- Hide on scroll down, show on scroll up
- Mobile: Hamburger menu with slide-out drawer

**Specs:**
- Height: 64px (desktop), 56px (mobile)
- Background: `transparent` → `var(--bg-base)/80` with backdrop blur
- Border bottom: `var(--border-subtle)` when scrolled
- Logo: 32px height, glow on hover
- CTA: Primary button style, small variant

---

### Hero Section

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                        [Ambient 3D Background]                          │
│                                                                         │
│                    [Badge: Self-Evolving AI Platform]                   │
│                                                                         │
│                       Agents that fix                                   │
│                       ████████████                                      │
│                        themselves                                       │
│                                                                         │
│     Self-diagnosing. Self-healing. Self-evolving. Human-approved.      │
│                                                                         │
│               [Get Early Access]    [Watch Demo →]                      │
│                                                                         │
│                   ┌──────────────────────────────────┐                 │
│                   │  [Live Terminal Demo Preview]    │                 │
│                   │                                  │                 │
│                   │  > create support agent...       │                 │
│                   │  ✓ Agent configured              │                 │
│                   │  ✓ Running 47 evals...           │                 │
│                   │  ✓ Agent deployed                │                 │
│                   └──────────────────────────────────┘                 │
│                                                                         │
│        ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐           │
│        │Up-to-  │    │Valid   │    │Trace-  │    │Safe    │           │
│        │Date    │    │        │    │able    │    │        │           │
│        └────────┘    └────────┘    └────────┘    └────────┘           │
│                                                                         │
│                          [Scroll Indicator]                             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Elements:**
1. **Background:** Subtle 3D particle network or gradient mesh
2. **Badge:** Animated border, monospace font
3. **Headline:** Morphing word cycles through: "fix" → "heal" → "evolve" → "improve"
4. **Subheadline:** Fades in after headline settles
5. **CTAs:** Primary + Ghost button
6. **Terminal Preview:** Live typing animation showing agent creation
7. **Guarantees:** Four badges showing platform guarantees
8. **Scroll Indicator:** Animated arrow or mouse icon

---

### Features Section (Evolution Loop)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                 [OVERLINE: HOW SELF-EVOLUTION WORKS]                   │
│                                                                         │
│              Intelligence that improves itself                          │
│                                                                         │
│                    ┌─────────────────────┐                             │
│              ┌─────│      MONITOR        │─────┐                       │
│              │     └─────────────────────┘     │                       │
│              │              │                  │                       │
│              │              ▼                  │                       │
│      ┌───────┴───────┐           ┌────────────┴────────┐              │
│      │    APPROVE    │           │     DIAGNOSE        │              │
│      └───────┬───────┘           └────────────┬────────┘              │
│              │                                │                        │
│              │              ▲                 │                        │
│              │     ┌───────┴────────┐        │                        │
│              └─────│    PROPOSE     │────────┘                        │
│                    └────────────────┘                                  │
│                                                                         │
│        [Particles flowing through the loop, continuous animation]       │
│                                                                         │
│   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│   │   MONITOR    │ │   DIAGNOSE   │ │   PROPOSE    │ │   APPROVE    │ │
│   │              │ │              │ │              │ │              │ │
│   │ 24/7 anomaly │ │ Root cause   │ │ Generate fix │ │ Human        │ │
│   │ detection    │ │ analysis     │ │ + sandbox    │ │ confirmation │ │
│   └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ │
│                                                                         │
│     Note: Approval required for production agents only                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### Code Preview / Interactive Demo

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│              [OVERLINE: SEE IT IN ACTION]                              │
│                                                                         │
│              Describe it. We build it. It evolves.                     │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │ ● ● ●                              Agent Builder        ● LIVE │  │
│   ├─────────────────────────────────────────────────────────────────┤  │
│   │                                                                 │  │
│   │   YOU                                                           │  │
│   │   ┌─────────────────────────────────────────────────────────┐  │  │
│   │   │ Create a customer support agent for my e-commerce       │  │  │
│   │   │ store that can check orders and handle returns          │  │  │
│   │   └─────────────────────────────────────────────────────────┘  │  │
│   │                                                                 │  │
│   │   PLATFORM                                                      │  │
│   │   ┌─────────────────────────────────────────────────────────┐  │  │
│   │   │ Building agent with 3 capabilities:                     │  │  │
│   │   │ ✓ Order lookup via Shopify API                         │  │  │
│   │   │ ✓ Return processing with approval                      │  │  │
│   │   │ ✓ Product Q&A from catalog                             │  │  │
│   │   └─────────────────────────────────────────────────────────┘  │  │
│   │                                                                 │  │
│   │   ○ Running evals... 44/47 passed                              │  │
│   │                                                                 │  │
│   │   ⚡ SELF-EVOLUTION                                             │  │
│   │   ┌─────────────────────────────────────────────────────────┐  │  │
│   │   │ Issue: Return policy missing regional variations        │  │  │
│   │   │ Fix: Add region-aware policy lookup                     │  │  │
│   │   │                                                         │  │  │
│   │   │              [ APPROVE FIX ]                            │  │  │
│   │   └─────────────────────────────────────────────────────────┘  │  │
│   │                                                                 │  │
│   │   ✓ All tests passed. Agent deployed.                         │  │
│   │                                                                 │  │
│   │   STATS                                                        │  │
│   │   Accuracy: 98.2%  |  Self-Healing: ON  |  Latency: 1.2s     │  │
│   │                                                                 │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│         [Self-evolving]        [User-approved]        [Production]     │
│              ●                      ●                     ●            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### Build Options Section

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│              [OVERLINE: TWO INTERFACES. ONE INTELLIGENCE.]             │
│                                                                         │
│                      Your way, your choice                              │
│                                                                         │
│        ┌──────────────────────────────────────────────────────┐        │
│        │  [Prompts]                              [Code]       │        │
│        └──────────────────────────────────────────────────────┘        │
│                                                                         │
│   ┌─────────────────────────────┐ ┌─────────────────────────────┐     │
│   │                             │ │                             │     │
│   │  BUILD WITH PROMPTS         │ │  BUILD WITH CODE            │     │
│   │  No code required           │ │  Full control               │     │
│   │                             │ │                             │     │
│   │  "Create a LinkedIn agent   │ │  from agentplatform import  │     │
│   │   that posts about AI       │ │    Agent, tool              │     │
│   │   trends daily at 10am"     │ │                             │     │
│   │                             │ │  agent = Agent(             │     │
│   │                             │ │    name="meeting-prep",     │     │
│   │  ✓ Visual builder           │ │    tools=[calendar, gmail], │     │
│   │  ✓ Auto self-evolution      │ │    self_evolution=True,     │     │
│   │  ✓ One-click approval       │ │    require_approval=True    │     │
│   │  ✓ No coding needed         │ │  )                          │     │
│   │                             │ │                             │     │
│   │                             │ │  ✓ Python & TypeScript      │     │
│   │                             │ │  ✓ Custom tools             │     │
│   │                             │ │  ✓ Self-healing APIs        │     │
│   │                             │ │  ✓ Full control             │     │
│   │                             │ │                             │     │
│   └─────────────────────────────┘ └─────────────────────────────┘     │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ Both approaches get: Self-evolution · User approval · Auto evals │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### How It Works Section

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                     [OVERLINE: THE JOURNEY]                            │
│                                                                         │
│              From prompt to self-healing agent                          │
│                                                                         │
│     01                02                03                04            │
│   ┌─────┐           ┌─────┐           ┌─────┐           ┌─────┐       │
│   │ 💬  │───────────│ ✓  │───────────│ ⚡ │───────────│ 🚀  │       │
│   └─────┘           └─────┘           └─────┘           └─────┘       │
│   DESCRIBE          EVALUATE          EVOLVE           DEPLOY          │
│                                                                         │
│   Tell us what      Auto-generate     When issues      One-click       │
│   you need in       100+ test         arise, agent     deploy with     │
│   plain English     scenarios         proposes fix     24/7 monitoring │
│                                                                         │
│   ──────────────────────────────────────────────────────────────────   │
│                                                                         │
│         ┌─────────────────────────────────────────────────────┐        │
│         │  ⚡ Continuous Evolution Loop                        │        │
│         │     Steps 2-4 repeat automatically when issues       │        │
│         │     are detected in production                       │        │
│         └─────────────────────────────────────────────────────┘        │
│                                                                         │
│                      [ Get Started → ]                                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### Platform / SDK Section

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│              [OVERLINE: FULL PLATFORM]                                 │
│                                                                         │
│              More than an SDK.                                         │
│              Self-healing infrastructure.                               │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │                                                                 │  │
│   │   ┌───────────┐ ┌───────────┐ ┌───────────┐                   │  │
│   │   │ Self-     │ │ One-click │ │ Safety    │                   │  │
│   │   │ diagnosis │ │ approval  │ │ guardrails│                   │  │
│   │   └───────────┘ └───────────┘ └───────────┘                   │  │
│   │   ┌───────────┐ ┌───────────┐ ┌───────────┐                   │  │
│   │   │ Real-time │ │ Transp.   │ │ Multi-    │                   │  │
│   │   │ monitoring│ │ replay    │ │ channel   │                   │  │
│   │   └───────────┘ └───────────┘ └───────────┘                   │  │
│   │                                                                 │  │
│   │   ┌─────────────────────────────────────────────────────────┐ │  │
│   │   │  5min          100+           Auto           99.97%     │ │  │
│   │   │  to first      auto evals     self-healing   uptime     │ │  │
│   │   │  agent                                                   │ │  │
│   │   └─────────────────────────────────────────────────────────┘ │  │
│   │                                                                 │  │
│   │   Works with: OpenAI  Anthropic  Google  + more               │  │
│   │                                                                 │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│         [ Get Early Access ]         [ Explore Features → ]            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### CTA Section

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│  ░░                                                                ░░  │
│  ░░                        [Evolution Icon]                        ░░  │
│  ░░                                                                ░░  │
│  ░░                  Build agents that                             ░░  │
│  ░░                  evolve themselves                             ░░  │
│  ░░                                                                ░░  │
│  ░░       Join the waitlist. Go from idea to self-healing         ░░  │
│  ░░              agent in minutes — with you in control.          ░░  │
│  ░░                                                                ░░  │
│  ░░            Auto              1-click           24/7            ░░  │
│  ░░         self-healing        approval        monitoring         ░░  │
│  ░░                                                                ░░  │
│  ░░     ┌───────────────────────────────────────────────────┐     ░░  │
│  ░░     │  > your@email.com                              [→]│     ░░  │
│  ░░     └───────────────────────────────────────────────────┘     ░░  │
│  ░░                                                                ░░  │
│  ░░                 [ GET EARLY ACCESS ]                           ░░  │
│  ░░                                                                ░░  │
│  ░░      [GitHub]         [Docs]         [Discord]                ░░  │
│  ░░                                                                ░░  │
│  ░░  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐          ░░  │
│  ░░  │✓ User-approved│ │ Free tier   │ │ Open source │          ░░  │
│  ░░  │  changes      │ │ available   │ │ SDK         │          ░░  │
│  ░░  └──────────────┘ └──────────────┘ └──────────────┘          ░░  │
│  ░░                                                                ░░  │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### Footer

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  [Logo]                                              v1.0.0-beta        │
│                                                                         │
│  Product          Resources        Company          Connect             │
│  ────────         ─────────        ────────         ───────             │
│  Features         Documentation    About            Twitter             │
│  Pricing          API Reference    Blog             GitHub              │
│  Changelog        Tutorials        Careers          Discord             │
│  Status           Community        Contact          LinkedIn            │
│                                                                         │
│  ──────────────────────────────────────────────────────────────────    │
│                                                                         │
│  © 2026 Agent Platform             Privacy · Terms · Security          │
│                                                                         │
│  System Status: ● Operational                                          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Messaging Strategy

### Core Messages

| Section | Primary Message | Supporting Message |
|---------|-----------------|-------------------|
| **Hero** | Agents that fix themselves | Self-diagnosing. Self-healing. Self-evolving. Human-approved. |
| **Features** | Intelligence that improves itself | Monitor → Diagnose → Propose → Approve |
| **Demo** | Describe it. We build it. It evolves. | See AI build and heal an agent in real-time |
| **Build Options** | Two interfaces. One intelligence. | Prompts for speed, code for control |
| **How It Works** | From prompt to self-healing agent | Describe → Evaluate → Evolve → Deploy |
| **Platform** | More than an SDK. Self-healing infrastructure. | Everything you need to ship production agents |
| **CTA** | Build agents that evolve themselves | Join the waitlist for early access |

### Tone of Voice

- **Confident** — We know this is the future
- **Technical** — Speak to developers, not marketers
- **Precise** — No fluff, every word matters
- **Forward** — Always looking ahead
- **Human** — Despite AI theme, warm and approachable

### Key Terms

| Use | Don't Use |
|-----|-----------|
| Self-evolving | Auto-improving |
| Self-healing | Auto-fixing |
| Human-approved | Human-in-the-loop |
| Initialize | Sign up |
| Deploy | Launch |
| Platform | Tool/Product |
| Agent | Bot |

### Approval Messaging (Important!)

**Clear Distinction:**
- Sandbox/Dev agents → Can auto-evolve freely
- Production agents → Require human approval

**Example Copy:**
> "When issues arise in production, your agent diagnoses the problem and proposes a fix. You review and approve with one click. Full control, zero surprises."

---

## Technical Requirements

### Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + CSS Variables
- **Animation:** Framer Motion
- **3D (Optional):** Three.js / React Three Fiber
- **Icons:** Lucide React
- **Fonts:** Inter + JetBrains Mono (Google Fonts)
- **Hosting:** Vercel

### Performance Targets

| Metric | Target |
|--------|--------|
| Lighthouse Performance | 95+ |
| First Contentful Paint | < 1.0s |
| Largest Contentful Paint | < 2.0s |
| Time to Interactive | < 2.5s |
| Cumulative Layout Shift | < 0.05 |
| Total Bundle Size | < 200KB (initial) |

### Browser Support

- Chrome 90+
- Firefox 90+
- Safari 14+
- Edge 90+

### Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- Reduced motion support
- High contrast support

### SEO

```html
<title>Agent Platform — Self-Evolving AI Agents</title>
<meta name="description" content="Build AI agents that diagnose issues, propose fixes, and evolve themselves — with human approval. From prototype to production in minutes.">
<meta property="og:title" content="Agent Platform — Agents that fix themselves">
<meta property="og:description" content="Self-evolving AI agents with human oversight. From prompt to production in minutes.">
<meta property="og:image" content="/og-image.png">
```

---

## File Structure

```
website/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── layout/
│   │   │   ├── navbar.tsx
│   │   │   └── footer.tsx
│   │   ├── landing/
│   │   │   ├── hero.tsx
│   │   │   ├── features.tsx
│   │   │   ├── code-preview.tsx
│   │   │   ├── build-options.tsx
│   │   │   ├── how-it-works.tsx
│   │   │   ├── sdk-highlight.tsx
│   │   │   ├── use-cases.tsx
│   │   │   └── cta-section.tsx
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── badge.tsx
│   │       └── ...
│   ├── lib/
│   │   └── utils.ts
│   └── styles/
│       └── design-tokens.css
├── public/
│   ├── fonts/
│   ├── images/
│   └── og-image.png
└── ...
```

---

## Implementation Checklist

### Phase 1: Foundation
- [ ] Set up design tokens (colors, typography, spacing)
- [ ] Create base component library (buttons, cards, inputs)
- [ ] Implement responsive layout system
- [ ] Set up Framer Motion defaults

### Phase 2: Sections
- [ ] Hero section with animations
- [ ] Features section (evolution loop)
- [ ] Code preview / interactive demo
- [ ] Build options section
- [ ] How it works section
- [ ] Platform / SDK section
- [ ] CTA section
- [ ] Footer

### Phase 3: Polish
- [ ] Micro-interactions on all interactive elements
- [ ] Scroll-driven animations
- [ ] Loading states
- [ ] Error states
- [ ] Mobile optimization
- [ ] Performance optimization

### Phase 4: Launch
- [ ] SEO optimization
- [ ] Analytics setup
- [ ] A/B testing setup
- [ ] Final QA
- [ ] Deploy

---

## Success Criteria

The website will be considered successful when:

1. **First Impression:** Visitors say "wow" within 3 seconds
2. **Clarity:** Value proposition understood within 10 seconds
3. **Engagement:** Average time on page > 2 minutes
4. **Conversion:** Waitlist signup rate > 5%
5. **Performance:** Lighthouse score > 95
6. **Memorability:** Visitors remember and talk about it
7. **Industry Recognition:** Featured in "best startup websites" lists

---

*Document created: January 14, 2026*
*Last updated: January 14, 2026*
