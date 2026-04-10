# Performance Guide

## Rendering Strategy Checklist

Before shipping a new page, decide the rendering strategy:

| Strategy | When to Use | Next.js API |
|---|---|---|
| **Static (SSG)** | Content doesn't change per request | Default for pages without dynamic data |
| **ISR** | Content changes occasionally | `revalidate` in `fetch` options |
| **Dynamic (SSR)** | Content changes per request (user-specific) | `dynamic = "force-dynamic"` or `cookies()`/`headers()` usage |
| **Client-side** | User-driven interaction, real-time | `"use client"` + `useSWR` / `React Query` |

```tsx
// ISR — revalidate every 60 seconds
async function getMenuItems() {
  const res = await fetch("https://api.example.com/menu", {
    next: { revalidate: 60 },
  });
  return res.json();
}
```

---

## Images

Always use `next/image`. Never use a plain `<img>` tag.

```tsx
import Image from "next/image";

<Image
  src="/logo.png"
  alt="Nexo logo"
  width={200}
  height={50}
  priority          // add for above-the-fold images (LCP)
  className="object-cover"
/>
```

**Rules:**
- Set `priority` on the Largest Contentful Paint (LCP) image (first visible image on page load).
- Always provide `width` and `height` to prevent layout shift.
- Use `fill` + a positioned parent for responsive hero images.
- Remote images require `remotePatterns` in `next.config.ts`.

```ts
// next.config.ts
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "your-cdn.com" },
    ],
  },
};
```

---

## Fonts

Fonts in this project use `next/font/google`. No additional configuration needed.

- `font-display: swap` is applied automatically.
- Font files are self-hosted at build time — no external requests at runtime.
- Do not import Google Fonts via `<link>` tags in `layout.tsx`.

---

## Code Splitting & Lazy Loading

### Dynamic Imports

Use `next/dynamic` to lazy-load heavy Client Components:

```tsx
import dynamic from "next/dynamic";

const HeavyChart = dynamic(() => import("./HeavyChart"), {
  loading: () => <div className="animate-pulse h-64 bg-surface-muted rounded" />,
  ssr: false, // set to false for browser-only components
});
```

**When to use:**
- Modal dialogs not visible on initial load
- Rich text editors
- Charts / data visualizations
- Components > ~50KB that are below the fold

### React `Suspense`

Wrap async Server Components or lazy-loaded components:

```tsx
import { Suspense } from "react";

<Suspense fallback={<OrderListSkeleton />}>
  <OrderList />
</Suspense>
```

---

## Bundle Analysis

Run the built-in bundle analyzer to audit bundle sizes:

```bash
ANALYZE=true pnpm build
```

> Requires `@next/bundle-analyzer`. Add if not present:
> `pnpm add -D @next/bundle-analyzer`

```ts
// next.config.ts
import withBundleAnalyzer from "@next/bundle-analyzer";

export default withBundleAnalyzer({ enabled: process.env.ANALYZE === "true" })({
  /* config */
});
```

---

## Metadata & SEO

- Define `metadata` exports on every `page.tsx`.
- Use `generateMetadata` for dynamic routes.
- Set `<html lang="es">` in root layout (already set for this project).
- Add `robots.ts` and `sitemap.ts` under `app/` for production SEO.

---

## Core Web Vitals Targets

| Metric | Target |
|---|---|
| LCP (Largest Contentful Paint) | < 2.5s |
| FID / INP (Interaction to Next Paint) | < 200ms |
| CLS (Cumulative Layout Shift) | < 0.1 |

**Quick wins:**
- `priority` on hero images → improves LCP
- Fixed `width`/`height` on images → prevents CLS
- Avoid large synchronous JS in Server Components
- Keep Client Component bundles small — use dynamic imports

---

## Anti-patterns

- **`"use client"` at `app/layout.tsx`** — forces entire app client-side; never do this.
- **Fetching in `useEffect` when Server Component would work** — wastes a round-trip.
- **Importing a whole library for one function** — use tree-shakeable imports or inline the logic.
- **No `loading.tsx`** — users see blank screens during server-side data fetching without it.
- **Hardcoded `width: 100%` on `<Image>`** — use `fill` prop + positioned parent instead.
