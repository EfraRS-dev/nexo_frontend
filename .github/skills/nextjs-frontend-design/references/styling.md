# Styling Guide — Tailwind CSS v4

## Setup in This Project

- **Tailwind CSS v4** via `@tailwindcss/postcss` — no `tailwind.config.js` by default.
- CSS entry point: `app/globals.css`
- Fonts: `Geist Sans` and `Geist Mono` via `next/font/google`, exposed as CSS variables `--font-geist-sans` / `--font-geist-mono`.

---

## Tailwind v4 Key Changes (vs v3)

| Feature | v3 | v4 |
|---|---|---|
| Config file | `tailwind.config.js` | Optional — configure via CSS `@theme` |
| CSS variables | Manual setup | Built-in, first-class |
| `@apply` | Supported | Still supported but prefer utility classes |
| Dark mode | `class` or `media` strategy in config | `@variant dark` in CSS or `dark:` prefix |
| Content detection | Manual `content` array | Automatic — scans all source files |

---

## Design Tokens — Define in `globals.css`

Use `@theme` to define custom design tokens as CSS variables:

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  --color-brand: oklch(55% 0.2 250);
  --color-brand-foreground: oklch(98% 0 0);
  --color-surface: oklch(99% 0 0);
  --color-surface-muted: oklch(95% 0.005 250);
  --color-text: oklch(15% 0 0);

  --radius-card: 0.75rem;
  --spacing-page: 1.5rem;
}
```

Then use them as Tailwind utilities: `bg-brand`, `text-brand-foreground`, `rounded-card`.

---

## Typography

- Use Tailwind's `text-*` scale for font sizes.
- Use `font-sans` / `font-mono` (mapped to Geist via CSS variables in `layout.tsx`).
- Line lengths: prose text should use `max-w-prose` or `max-w-2xl` containers.

```tsx
<h1 className="text-3xl font-bold tracking-tight">Title</h1>
<p className="text-base text-muted-foreground leading-relaxed">Body text</p>
```

---

## Spacing & Layout

- Use Tailwind spacing scale consistently — do not mix arbitrary values with scale values.
- Prefer flexbox and grid over absolute positioning.
- Page-level padding: `px-[--spacing-page]` or a wrapper component.

```tsx
// Consistent page container
<div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
  {children}
</div>
```

---

## Component Styling Patterns

### Variant-based classes with `clsx` / `cva`

Install `clsx` + `class-variance-authority` for multi-variant components:

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";

const button = cva(
  "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2",
  {
    variants: {
      variant: {
        primary: "bg-brand text-brand-foreground hover:bg-brand/90",
        ghost: "hover:bg-surface-muted text-text",
        destructive: "bg-red-500 text-white hover:bg-red-600",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-base",
        lg: "h-12 px-6 text-lg",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {}

export default function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={clsx(button({ variant, size }), className)} {...props} />;
}
```

---

## Responsive Design

Use mobile-first breakpoints. Always design for small screens first.

| Prefix | Breakpoint |
|---|---|
| _(none)_ | 0px+ (mobile) |
| `sm:` | 640px+ |
| `md:` | 768px+ |
| `lg:` | 1024px+ |
| `xl:` | 1280px+ |
| `2xl:` | 1536px+ |

```tsx
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
```

---

## Dark Mode

Tailwind v4 dark mode via `dark:` prefix (uses `prefers-color-scheme` by default):

```tsx
<div className="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-50">
```

To use class-based dark mode, add `@variant dark (&:where(.dark, .dark *))` in `globals.css`.

---

## Accessibility (a11y)

- Every interactive element must be keyboard-accessible.
- Use semantic HTML (`<button>`, `<nav>`, `<main>`, `<article>`, `<section>`).
- Never remove focus outlines — style them instead: `focus-visible:ring-2 focus-visible:ring-brand`.
- Use `aria-label` for icon-only buttons.
- Color contrast must meet WCAG AA (4.5:1 for text).

---

## Anti-patterns

- **Avoid inline styles** — use Tailwind utilities or CSS variables.
- **Avoid arbitrary values `[]`** unless genuinely one-off — add to `@theme` instead.
- **Don't mix styled-components / CSS Modules with Tailwind** — pick one approach and be consistent.
- **Don't use `!important`** via `!` prefix unless absolutely necessary.
