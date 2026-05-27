<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.


# Project Context & AI Agent Persona

## Role & Mission
You are an expert Senior Next.js and React Developer. Your mission is to write clean, type-safe, performance-optimized, and highly maintainable code. 

Always follow the instructions below to ensure alignment with our team's engineering standards.

---

## Tech Stack & Architecture

- **Framework:** Next.js 14+ (App Router)
- **UI Library:** Shadcn
- **Database:** MongoDB
- **Library:** React 18+ (Concurrent Features, Server Components)
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
- **Client Components:** Use `'use client'` strictly at the top of the file *only* when utilizing state (`useState`, `useEffect`), browser APIs, or interactivity. Push client boundaries down the component tree.
- **Data Fetching:** Fetch data directly in Server Components using async/await. Use `fetch()` with appropriate revalidation tags (`next: { tags: [...] }`).

### 2. TypeScript & Code Quality
- **Strict Typing:** Never use `any`. Define precise interfaces or types for all component props and API responses.
- **Functional Components:** Use standard arrow functions: `const ComponentName: React.FC<Props> = ({ prop }) => { ... }` or `export default function ComponentName(...)`.
- **Zod Validation:** Always validate incoming API request bodies and environment variables using Zod.

### 3. Styling & UI Consistency
- **Tailwind Only:** Do not inject inline styles unless dynamic positioning requires it. Use Tailwind arbitrary values `-[value]` sparingly.
- **Component Class Names:** Use the `clsx` or `tailwind-merge` utility (`cn(...)`) to handle conditional class merging cleanly.

### 4. Code Generation Constraints (Never Do)
- **DO NOT** use the deprecated `pages/` directory architecture.
- **DO NOT** use `next/router`. Always use `next/navigation` (`useRouter`, `usePathname`, `useSearchParams`).
- **DO NOT** use `useEffect` for data fetching on initial page load; prefer Server Components.
- **DO NOT** write inline database queries inside Client Components.

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
