# Component Patterns

## Server vs Client Components

### Server Component (default)

No directive needed. Can be `async`. Runs only on the server — access DB, env vars, file system directly.

```tsx
// app/menu/page.tsx
export default async function MenuPage() {
  const items = await db.query("SELECT * FROM menu");
  return (
    <main>
      {items.map((item) => (
        <MenuCard key={item.id} item={item} />
      ))}
    </main>
  );
}
```

**Can do:**
- `async/await` at component level
- Direct DB / filesystem access
- Access `headers()`, `cookies()` from `next/headers`
- Import server-only modules

**Cannot do:**
- `useState`, `useReducer`, `useEffect`, `useContext`
- Browser APIs (`window`, `document`)
- Event handlers (`onClick`, `onChange`)

---

### Client Component

Add `"use client"` as the very first line (before imports).

```tsx
"use client";

import { useState } from "react";

interface QuantityPickerProps {
  initial?: number;
  onChange: (qty: number) => void;
}

export default function QuantityPicker({ initial = 1, onChange }: QuantityPickerProps) {
  const [qty, setQty] = useState(initial);

  const increment = () => {
    const next = qty + 1;
    setQty(next);
    onChange(next);
  };

  return (
    <div className="flex items-center gap-2">
      <button onClick={() => { setQty(q => q - 1); onChange(qty - 1); }}>-</button>
      <span>{qty}</span>
      <button onClick={increment}>+</button>
    </div>
  );
}
```

---

## Composition Pattern — "Wrapper Server, Interactive Leaf"

Keep the tree mostly server-rendered. Only the interactive leaf declares `"use client"`.

```
app/orders/page.tsx          ← Server Component (async, fetches data)
  └── OrderList.tsx          ← Server Component (renders list)
        └── OrderCard.tsx    ← Server Component (displays card)
              └── CancelButton.tsx  ← "use client" (handles click)
```

```tsx
// OrderCard.tsx — Server Component
import CancelButton from "./CancelButton";

export default function OrderCard({ order }: { order: Order }) {
  return (
    <article className="rounded-xl border p-4">
      <h2>{order.id}</h2>
      <p>{order.status}</p>
      <CancelButton orderId={order.id} /> {/* only this is a client component */}
    </article>
  );
}
```

---

## Layouts

- `layout.tsx` wraps all child segments.
- Use for: nav bars, sidebars, persistent UI, shared providers.
- Layout does **not** re-render on navigation between child routes.

```tsx
// app/dashboard/layout.tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
```

---

## Loading & Error States

Create `loading.tsx` and `error.tsx` alongside each `page.tsx` automatically enabling React Suspense and Error Boundaries:

```tsx
// app/orders/loading.tsx
export default function Loading() {
  return <div className="animate-pulse">Loading orders…</div>;
}

// app/orders/error.tsx
"use client"; // error boundaries must be client components

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div>
      <p>Something went wrong: {error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

---

## Context / Providers

Wrap providers in a dedicated Client Component so the rest of the tree stays server-rendered:

```tsx
// app/_providers/QueryProvider.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient());
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
```

```tsx
// app/layout.tsx
import QueryProvider from "./_providers/QueryProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
```

---

## Form Actions (Server Actions)

Use Server Actions for mutations instead of custom API routes when possible:

```tsx
// app/orders/actions.ts
"use server";

export async function createOrder(formData: FormData) {
  const item = formData.get("item") as string;
  await db.insert({ item });
  revalidatePath("/orders");
}
```

```tsx
// app/orders/NewOrderForm.tsx
import { createOrder } from "./actions";

export default function NewOrderForm() {
  return (
    <form action={createOrder}>
      <input name="item" required />
      <button type="submit">Add</button>
    </form>
  );
}
```
