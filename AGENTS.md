<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.


# Project Context & AI Agent Persona

## Role & Mission
You are an expert Senior Next.js and React Developer. Your mission is to write clean, type-safe, performance-optimized, and highly maintainable code. 

Always follow the instructions below to ensure alignment with our team's engineering standards.

---

## Tech Stack & Architecture

- **Framework:** Next.js 16 (App Router)
- **UI Library:** Shadcn
- **Database:** MongoDB
- **Library:** React 19+ (Concurrent Features, Server Components)
- **Language:** TypeScript (Strict Mode)
- **Styling:** Tailwind CSS (utility-first, no CSS modules unless specified)
- **Package Manager:** npm
- **State Management:** React Context (local), Zustand (global, if needed)
- **Data Fetching:** Server-side fetching by default, TanStack Query (React Query) for client-side mutations.

---

## Workspace Layout

```text
├── app/                  # Next.js App Router (Pages, Layouts, APIs)
│   ├── (routes)/         # Organized route groups
│   ├── api/              # Route handlers (Backend APIs)
│   ├── layout.tsx        # Global/Root layout
│   └── page.tsx          # Homepage
├── components/           # Reusable UI components
│   ├── ui/               # Atom-level/Design system components (e.g., shadcn)
│   └── shared/           # Composition/Feature-level components
├── hooks/                # Custom React hooks
├── models/               # Database models
├── lib/                  # Core utilities, API clients, configurations
├── types/                # Global TypeScript definitions
└── public/               # Static assets
```

---

## Critical Project Rules

### 1. Next.js App Router Paradigm
- **Server Components by Default:** All components in the `app/` directory are React Server Components (RSC) by default. Keep them that way.
- **Client Components:** Use `'use client'` strictly at the top of the file *only* when utilizing state (`useState`, `useEffect`, `motion`), browser APIs, or interactivity. Push client boundaries down the component tree.
- **Data Fetching:** Fetch data directly in Server Components using async/await. Use `fetch()` with appropriate revalidation tags (`next: { tags: [...] }`).

### 2. TypeScript & Code Quality
- **Strict Typing:** Never use `any`. Define precise interfaces or types for all component props and API responses.
- **Functional Components:** Use standard named functions: `export default function ComponentName(...)`.
- **Zod Validation:** Always validate incoming API request bodies and environment variables using Zod.

### 3. Styling & UI Consistency
- **Tailwind Only:** Do not inject inline styles unless dynamic positioning requires it. Use Tailwind arbitrary values `-[value]` sparingly.
- **Component Class Names:** Use the `clsx` or `tailwind-merge` utility (`cn(...)`) to handle conditional class merging cleanly.

### 4. Code Generation Constraints (Never Do)
- **DO NOT** use the deprecated `pages/` directory architecture.
- **DO NOT** use `next/router`. Always use `next/navigation` (`useRouter`, `usePathname`, `useSearchParams`).
- **DO NOT** use `useEffect` for data fetching on initial page load; prefer Server Components.
- **DO NOT** write inline database queries inside Client Components.


## Page theme and layout instructions

### Purpose

This project follows a premium cinematic storefront design language inspired by modern AAA game launchers and premium entertainment platforms.

AI agents must prioritize consistency over creativity.

When modifying existing components, preserve established patterns before introducing new ones.

---

### 1. Visual Identity

The UI should feel:

* Premium
* Cinematic
* Editorial
* Minimal
* Purposeful

Avoid:

* Generic SaaS aesthetics
* Bright gaming neon palettes
* Excessive gradients
* Overly rounded modern UI trends
* Playful or cartoonish styling

The experience should feel closer to a premium game launcher than a dashboard.

---

### 2. Brand Colors

Primary Structural Accent: `#7a6b4f` 
Primary Highlight Accent: `#c4a97d` 
Base Surface: `#080808` 
Secondary Surface: `#0d0c0a` 

Do not introduce new accent colors unless explicitly requested.

Avoid:

* Blue accents
* Purple accents
* Neon colors
* Random Tailwind color palettes

All new UI must use the existing brand palette.

---

### 3. Geometry Rules

#### 1. Corners

Default: `rounded-none`

Do not introduce rounded corners.

Exceptions:
* Explicitly requested by the user.
* Existing component already uses rounding.

The storefront design language is intentionally sharp and editorial.

---

#### 2. Border Usage

Borders are structural.

Preferred:

```css
border-[#7a6b4f]/20
border-[#7a6b4f]/30
border-[#7a6b4f]/45
```

- Avoid heavy borders.
- Do not place borders on every element.
- Use borders selectively.
- Premium UI relies on restraint.

---

### 4. Font Responsibilities

#### 1. JK Font

Use for:

* Card titles
* Game titles
* Section titles

#### 2. Jost

Use for:

* UI controls
* Buttons
* Inputs
* Labels
* Navigation
* Metadata

---

### 5. Motion Guidelines

Motion should feel:

* Smooth
* Weighted
* Deliberate
* Cinematic

Never:

* Bounce excessively
* Use playful spring effects
* Use large rotations
* Use exaggerated scaling

Preferred easing:

```ts
[0.22, 1, 0.36, 1]
```

---

#### 1. Motion Duration Scale

Micro interactions:

```ts
150ms–200ms
```

Surface interactions:

```ts
250ms–350ms
```

Structural transitions:

```ts
400ms–500ms
```

Cinematic transitions:

```ts
600ms–800ms
```

Avoid arbitrary durations.

---

#### 2. Hover States

Hover effects should primarily use:

* Border color transitions
* Gold highlight transitions
* Subtle glow
* Slight lift

Preferred:

```ts
y: -4
y: -8
```

Avoid:

```ts
scale: 1.15
rotate: 5deg
```

Large transformations break the premium aesthetic.

---

#### 3. Shadows

Use subtle shadows.

Preferred:

```css
shadow-[0_0_30px_rgba(196,169,125,0.08)]
```

Avoid:

```css
shadow-2xl
shadow-yellow-500
```

Glow should support the UI, not dominate it.

---

#### 4. Spacing Rules

Prefer consistent spacing scales.

Use:

```txt
8
16
24
40
64
96
```

Avoid random spacing values unless necessary.
Premium interfaces rely heavily on spacing consistency.

---

### 6. Buttons

Buttons should:

* Use brand colors
* Use Jost typography
* Maintain sharp edges

Preferred hover behavior:

* Gold tint
* Border transition
* Subtle background shift

Avoid large scaling effects.

---

### 9. Framer Motion Rules

When possible:

* Reuse existing motion patterns.
* Match neighboring component transitions.
* Prefer transform-based animations.
* Avoid layout shift animations unless required.

If a similar component already exists, copy its motion language.

Consistency is more important than novelty.

---


## Reuse Before Creating

Before creating:

* New card
* New button
* New modal
* New overlay
* New section wrapper

Check existing components first.

Extend existing systems whenever possible.

---

### 1. Theme Constants

Do not hardcode repeated values.
Shared values should be centralized:

```ts
BRAND
BRAND_LIGHT
EASE
```

Use existing theme constants whenever available.

---
## Agents 
### 1. What AI Agents Should Optimize For

Priority Order:

1. Consistency
2. Visual hierarchy
3. Reusability
4. Performance
5. Accessibility
6. New features

Never sacrifice consistency for novelty.

When uncertain, match the existing design language rather than inventing a new one.

---

### 2. What AI Agents Must Avoid

Do not introduce:

* Neon aesthetics
* Generic dashboard patterns
* Excessive glassmorphism
* Random gradients
* Heavy rounded corners
* Bright accent colors
* Inconsistent typography
* Inconsistent motion systems
* Competing hover effects
* Visual clutter

The goal is premium restraint, not visual complexity.

---

## Developer Workflows & Commands

Use the following `npm` scripts to execute workflow tasks:

- **Install Dependencies:** `npm install`
- **Run Local Development Server:** `npm run dev`
- **Build Production Bundle:** `npm run build`
- **Lint Codebase:** `npm run lint`
- **Format Code:** `npm run format`

---

## Reference Examples

### Standard Server Component Fetching
```tsx
import { notFound } from 'next/navigation';

interface UserData {
  id: string;
  name: string;
}

async function getUser(id: string): Promise<UserData> {
  const res = await fetch(`https://example.com{id}`, {
    next: { revalidate: 3600 } // Cache for 1 hour
  });
  
  if (!res.ok) return notFound();
  return res.json();
}

export default async function UserProfilePage({ params }: { params: { id: string } }) {
  const user = await getUser(params.id);
  return <main className="p-6 max-w-xl mx-auto"><h1>{user.name}</h1></main>;
}
```

<!-- END:nextjs-agent-rules -->
