import type { EstadoPedido } from "@/types";

// ── Estados de pedido (espejo del enum EstadoPedido del backend) ───────────

export const ESTADOS: EstadoPedido[] = [
  "pendiente",
  "confirmado",
  "pagado",
  "preparando",
  "en_camino",
  "entregado",
];

export const STATUS_LABELS: Record<EstadoPedido, string> = {
  pendiente: "Pendiente",
  confirmado: "Confirmado",
  pagado: "Pagado",
  preparando: "Preparando",
  en_camino: "En camino",
  entregado: "Entregado",
};

export const STATUS_COLORS: Record<EstadoPedido, string> = {
  pendiente: "bg-yellow-100 text-yellow-800",
  confirmado: "bg-blue-100 text-blue-800",
  pagado: "bg-emerald-100 text-emerald-800",
  preparando: "bg-orange-100 text-orange-800",
  en_camino: "bg-purple-100 text-purple-800",
  entregado: "bg-green-100 text-green-800",
};
