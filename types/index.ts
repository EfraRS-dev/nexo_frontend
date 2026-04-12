// ── Enums matching backend models ─────────────────────────────────────────

export type EstadoPedido =
  | "pendiente"
  | "confirmado"
  | "pagado"
  | "preparando"
  | "en_camino"
  | "entregado";

export type TipoPedido = "llevar" | "domicilio";

export type MetodoPago = "online" | "caja";

// ── Backend models ─────────────────────────────────────────────────────────

export interface Cliente {
  id: string;
  telefono: string;
  nombre: string | null;
  direccion: string | null;
  created_at: string;
}

export interface Pedido {
  id: string;
  cliente_id: string;
  restaurante_id: string;
  referencia: string;
  estado: EstadoPedido;
  tipo: TipoPedido;
  direccion_entrega: string | null;
  metodo_pago: MetodoPago;
  total: number; // COP
  created_at: string;
  // Populated by backend join (admin endpoint)
  cliente?: Cliente;
  items?: ItemPedido[];
}

export interface ItemPedido {
  id: string;
  pedido_id: string;
  producto_id: string;
  cantidad: number;
  modificadores: Record<string, { sin?: string[] }> | null;
  precio_unitario: number; // COP
  // Populated by backend join
  nombre?: string;
}

export interface MenuItem {
  id: string;
  restaurante_id: string;
  slug: string;
  nombre: string;
  precio: number; // COP
  categoria: string | null;
  disponible: boolean;
}

// ── API pagination ─────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

// ── Auth ───────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

// ── Filters ───────────────────────────────────────────────────────────────

export interface PedidoFilters {
  estado?: EstadoPedido | "todos";
  metodo_pago?: MetodoPago | "todos";
  fecha?: string; // ISO date string YYYY-MM-DD
  page?: number;
  page_size?: number;
}
