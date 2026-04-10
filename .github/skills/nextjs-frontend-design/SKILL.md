---
name: nextjs-frontend-design
description: "Frontend design and Next.js best practices for nexo_frontend. Use when: building UI components, designing pages, adding routes, styling with Tailwind CSS v4, handling data fetching, optimizing performance, working with App Router, Server Components, Client Components, layouts, or any frontend task in this project."
argument-hint: "Describe the UI feature or component to build"
---

# Next.js Frontend Design — nexo_frontend

## Stack

| Layer | Version |
|---|---|
| Next.js | 16.2.3 (App Router) |
| React | 19.2.4 |
| Tailwind CSS | 4.x |
| TypeScript | 5.x |

---

## When to Use This Skill

- Creating or modifying pages, layouts, or components
- Applying Tailwind CSS styles
- Setting up data fetching (Server vs Client Components)
- Adding new routes in the App Router
- Optimizing images, fonts, or rendering
- Reviewing or refactoring frontend code for best practices

---

## Procedure

1. Read the relevant [component patterns](./references/component-patterns.md) to decide Server vs Client
2. Consult [styling guide](./references/styling.md) for Tailwind v4 conventions used in this project
3. Consult [performance guide](./references/performance.md) before shipping any new page
4. Implement changes following the conventions below
5. Run `pnpm lint` and `pnpm build` to validate — fix all errors before finishing

---

## Core Conventions

### File & Folder Structure

```
app/
  layout.tsx          # Root layout — metadata, fonts, global providers
  page.tsx            # Route segment page
  globals.css         # Tailwind base + CSS custom properties
  [feature]/
    page.tsx
    layout.tsx        # Nested layout (optional)
    _components/      # Route-private components (underscore = not a route)
components/           # Shared, reusable components (create at root if needed)
lib/                  # Utilities, API clients, helpers
types/                # Shared TypeScript types/interfaces
```

### Component Types — Decision Rule

```
Is there interactivity (useState, useEffect, event handlers, browser APIs)?
  YES → Client Component  →  add "use client" at the top
  NO  → Server Component  →  no directive needed (default)
```

- **Never** add `"use client"` unnecessarily — it opts the subtree out of server rendering.
- Push `"use client"` as far down the tree as possible (leaf components).
- Data fetching belongs in Server Components — pass data as props to Client Components.

### Naming Conventions

| Item | Convention | Example |
|---|---|---|
| Components | PascalCase | `OrderCard.tsx` |
| Pages / Layouts | lowercase (Next.js convention) | `page.tsx`, `layout.tsx` |
| Utility functions | camelCase | `formatPrice.ts` |
| Types / Interfaces | PascalCase, `I` prefix for interfaces optional | `OrderItem`, `IOrderItem` |
| CSS variables | `--kebab-case` | `--color-primary` |

### TypeScript

- All props must be typed — no implicit `any`.
- Prefer `interface` for component props, `type` for unions/intersections.
- Export prop types when they may be reused.

```tsx
// Good
interface OrderCardProps {
  orderId: string;
  status: "pending" | "confirmed" | "delivered";
}

export default function OrderCard({ orderId, status }: OrderCardProps) { ... }
```

---

## Data Fetching

### Server Components (preferred)

```tsx
// app/orders/page.tsx — fetches directly, no useEffect
export default async function OrdersPage() {
  const orders = await fetchOrders(); // direct async call
  return <OrderList orders={orders} />;
}
```

### Client Components (when needed)

Use `useSWR`, `React Query`, or `fetch` inside `useEffect` only when real-time updates or user-driven fetching is required.

### Route Handlers

Place API routes at `app/api/[route]/route.ts`. Use `NextRequest` / `NextResponse`.

```ts
// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const data = await fetchData();
  return NextResponse.json(data);
}
```

---

## Metadata

Always define metadata per route segment:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Title — Nexo",
  description: "Description for SEO",
};
```

Use `generateMetadata` for dynamic routes.

---

## Quick References

- [Component Patterns](./references/component-patterns.md) — Detailed Server/Client patterns, composition
- [Styling Guide](./references/styling.md) — Tailwind v4 conventions, CSS variables, dark mode
- [Performance Guide](./references/performance.md) — Images, fonts, lazy loading, bundle analysis
