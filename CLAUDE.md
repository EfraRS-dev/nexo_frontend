# CLAUDE.md — Nexo Frontend

Panel de administración web para la plataforma Nexo (sistema de pedidos por WhatsApp con agente de IA). Consume la API del repo hermano `nexo_backend` (FastAPI).

## ⚠️ Next.js 16 — leer antes de escribir código

Este proyecto usa **Next.js 16** (App Router, React 19). Tiene cambios de ruptura respecto a versiones anteriores: APIs, convenciones y estructura pueden diferir de lo que conoces. **Antes de escribir código de Next, consulta las guías en `node_modules/next/dist/docs/`** y respeta los avisos de deprecación. (Ver `AGENTS.md`.)

## Stack

| | |
| --- | --- |
| Framework | Next.js 16.2 (App Router) |
| Lenguaje | TypeScript 5 (`strict`) |
| UI | React 19 |
| Estilos | Tailwind CSS v4 (PostCSS) |
| Package manager | **pnpm** (workspace) |

## Comandos

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm build    # build producción
pnpm start    # servir build
pnpm lint     # ESLint (eslint-config-next)
```

## Configuración

`.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000   # URL base del backend FastAPI
```

`lib/api.ts` usa `process.env.NEXT_PUBLIC_API_URL` (default `http://localhost:8000`).

## Estructura

```
app/
├── layout.tsx                    # Root layout (fuentes, metadata global)
├── page.tsx                      # redirect → /dashboard
├── globals.css                   # Tailwind base + CSS custom properties
├── (auth)/login/                 # Grupo de rutas público
│   ├── page.tsx
│   └── _components/LoginForm.tsx
└── (admin)/                      # Grupo de rutas protegido (AuthGuard + Sidebar)
    ├── layout.tsx                # Envuelve en <AuthGuard> + <Sidebar>
    ├── _components/AuthGuard.tsx # Redirige a /login si no hay token
    ├── dashboard/                # page.tsx + _components/DashboardClient.tsx
    ├── pedidos/                  # page.tsx + _components/OrdersClient.tsx
    └── menu/                     # page.tsx + _components/MenuClient.tsx
components/Sidebar.tsx            # Navegación del panel
lib/api.ts                       # Cliente HTTP tipado + auth de token
types/index.ts                   # Tipos compartidos (espejo de los modelos del backend)
```

## Patrones clave

- **Route groups**: `(auth)` (público) y `(admin)` (protegido). Cada página server-component delega la lógica interactiva a un `_components/*Client.tsx` (Client Component). Las carpetas `_components/` con guion bajo no generan rutas.
- **Auth**: JWT Bearer guardado en `localStorage` bajo la clave `nexo_token`. Helpers en `lib/api.ts` (`getToken`/`setToken`/`clearToken`). `AuthGuard` protege el grupo `(admin)`; `app/page.tsx` redirige a `/dashboard`.
- **API client** (`lib/api.ts`): `apiFetch<T>` centraliza fetch, inyecta `Authorization: Bearer`, lanza `ApiError(status, message)` en respuestas no-OK y maneja 204. Funciones: `login`, `getPedidos`, `updatePedidoEstado`, `getMenu`, `createMenuItem`, `updateMenuItem`, `deleteMenuItem`, `health`.
- **Tipos** (`types/index.ts`): reflejan los modelos del backend (`Pedido`, `ItemPedido`, `MenuItem`, `Cliente`, enums `EstadoPedido`/`TipoPedido`/`MetodoPago`, `PaginatedResponse<T>`). **Mantener sincronizados** con los modelos ORM del backend al cambiar contratos de la API.
- **Path alias**: `@/*` → raíz del proyecto.
- **Money en COP** (enteros) — coherente con el backend.

## Endpoints del backend que consume

`POST /auth/login`, `GET /admin/pedidos` (paginado, filtros estado/método_pago/fecha), `PATCH /pedidos/{referencia}/estado`, `GET|POST|PATCH|DELETE /admin/menu`, `GET /health`. El backend habilita CORS solo para `http://localhost:3000`.

## Convenciones

- Componentes y código en **inglés**; textos de UI en **español** (público colombiano).
- Usa pnpm (no npm/yarn). Workspace definido en `pnpm-workspace.yaml`.
- Server Components por defecto; marca `"use client"` solo donde haya interactividad/estado.
