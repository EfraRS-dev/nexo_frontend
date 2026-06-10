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

// ── Backend API schemas (espejo de PedidoOut/ClienteOut/ItemPedidoOut) ─────

export interface Cliente {
  id: string;
  telefono: string;
  nombre: string | null;
}

export interface Pedido {
  id: string;
  referencia: string;
  estado: EstadoPedido;
  tipo: TipoPedido;
  direccion_entrega: string | null;
  metodo_pago: MetodoPago;
  total: number; // COP
  created_at: string;
  cliente: Cliente;
  items: ItemPedido[];
}

export interface ItemPedido {
  producto_id: string;
  cantidad: number;
  precio_unitario: number; // COP
  modificadores: Record<string, { sin?: string[] }> | null;
  nombre: string | null; // null si el producto fue eliminado del menú
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

export interface OperadorMe {
  email: string;
  restaurante_id: string;
  restaurante_nombre: string;
}
