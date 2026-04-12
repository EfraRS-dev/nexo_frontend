import type {
  LoginRequest,
  LoginResponse,
  MenuItem,
  MetodoPago,
  PaginatedResponse,
  Pedido,
  EstadoPedido,
} from "@/types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ── Token helpers (browser-only) ──────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("nexo_token");
}

export function setToken(token: string): void {
  localStorage.setItem("nexo_token", token);
}

export function clearToken(): void {
  localStorage.removeItem("nexo_token");
}

// ── Base fetch ─────────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const resolvedToken = token ?? getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (resolvedToken) {
    headers["Authorization"] = `Bearer ${resolvedToken}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new ApiError(res.status, text);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ── Auth ───────────────────────────────────────────────────────────────────

export async function login(body: LoginRequest): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// ── Admin — Pedidos ────────────────────────────────────────────────────────

export interface GetPedidosParams {
  estado?: EstadoPedido | "todos";
  metodo_pago?: MetodoPago | "todos";
  fecha?: string;
  page?: number;
  page_size?: number;
}

export async function getPedidos(
  params: GetPedidosParams = {},
): Promise<PaginatedResponse<Pedido>> {
  const qs = new URLSearchParams();
  if (params.estado && params.estado !== "todos") qs.set("estado", params.estado);
  if (params.metodo_pago && params.metodo_pago !== "todos")
    qs.set("metodo_pago", params.metodo_pago);
  if (params.fecha) qs.set("fecha", params.fecha);
  if (params.page) qs.set("page", String(params.page));
  if (params.page_size) qs.set("page_size", String(params.page_size));

  const query = qs.toString() ? `?${qs.toString()}` : "";
  return apiFetch<PaginatedResponse<Pedido>>(`/admin/pedidos${query}`);
}

export async function updatePedidoEstado(
  referencia: string,
  estado: EstadoPedido,
): Promise<{ referencia: string; estado: EstadoPedido }> {
  return apiFetch(`/pedidos/${referencia}/estado`, {
    method: "PATCH",
    body: JSON.stringify({ estado }),
  });
}

// ── Admin — Menú ───────────────────────────────────────────────────────────

export async function getMenu(): Promise<MenuItem[]> {
  return apiFetch<MenuItem[]>("/admin/menu");
}

export async function createMenuItem(
  data: Omit<MenuItem, "id" | "restaurante_id">,
): Promise<MenuItem> {
  return apiFetch<MenuItem>("/admin/menu", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateMenuItem(
  id: string,
  data: Partial<Omit<MenuItem, "id" | "restaurante_id">>,
): Promise<MenuItem> {
  return apiFetch<MenuItem>(`/admin/menu/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteMenuItem(id: string): Promise<void> {
  return apiFetch<void>(`/admin/menu/${id}`, { method: "DELETE" });
}

// ── Health ─────────────────────────────────────────────────────────────────

export async function health(): Promise<{ status: string }> {
  return apiFetch<{ status: string }>("/health");
}
