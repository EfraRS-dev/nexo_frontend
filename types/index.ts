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

// ── Restaurante (tenant) — espejo de RestauranteOut ──────────────────────────

export interface RedesSociales {
  instagram?: string;
  facebook?: string;
}

export interface Restaurante {
  // Asignados por la plataforma (solo lectura en la UI)
  id: string;
  nombre: string;
  numero_whatsapp: string;
  prefijo: string;
  activo: boolean;
  // Campos de config_json (aplanados); null si el tenant no los ha definido
  descripcion: string | null;
  direccion: string | null;
  horario: string | null;
  email: string | null;
  telefono_contacto: string | null;
  redes_sociales: RedesSociales | null;
  metodos_pago: MetodoPago[] | null;
  zonas_cobertura: string[] | null;
}

/** Campos editables vía PATCH /admin/restaurante (cualquier subconjunto). */
export type RestauranteUpdate = Partial<{
  nombre: string;
  descripcion: string | null;
  direccion: string | null;
  horario: string | null;
  email: string | null;
  telefono_contacto: string | null;
  redes_sociales: RedesSociales | null;
  metodos_pago: MetodoPago[] | null;
  zonas_cobertura: string[] | null;
}>;
