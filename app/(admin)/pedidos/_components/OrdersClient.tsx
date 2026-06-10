"use client";

import { Fragment, useEffect, useRef, useState, useCallback } from "react";
import { getPedidos, updatePedidoEstado, ApiError } from "@/lib/api";
import { ESTADOS, STATUS_LABELS, STATUS_COLORS } from "@/lib/constants";
import { formatCOP, localDateStr } from "@/lib/format";
import type { EstadoPedido, MetodoPago, Pedido } from "@/types";

// ── StatusBadge ────────────────────────────────────────────────────────────

function StatusBadge({ estado }: { estado: EstadoPedido }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[estado]}`}
    >
      {STATUS_LABELS[estado]}
    </span>
  );
}

// ── StatusSelect ───────────────────────────────────────────────────────────

function StatusSelect({
  referencia,
  current,
  onUpdated,
  onError,
}: {
  referencia: string;
  current: EstadoPedido;
  onUpdated: (referencia: string, estado: EstadoPedido) => void;
  onError: (message: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newEstado = e.target.value as EstadoPedido;
    setLoading(true);
    try {
      await updatePedidoEstado(referencia, newEstado);
      onUpdated(referencia, newEstado);
    } catch (err) {
      onError(
        err instanceof ApiError
          ? `No se pudo actualizar ${referencia}: ${err.message}`
          : `No se pudo actualizar ${referencia}. Revisa tu conexión.`,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <select
      value={current}
      onChange={handleChange}
      disabled={loading}
      className="rounded-lg border border-(--color-border) bg-(--color-surface) px-2 py-1 text-xs text-(--color-text) outline-none transition-colors focus:border-(--color-brand) disabled:opacity-50"
    >
      {ESTADOS.map((e) => (
        <option key={e} value={e}>
          {STATUS_LABELS[e]}
        </option>
      ))}
    </select>
  );
}

// ── Order detail (expanded row) ────────────────────────────────────────────

function OrderDetail({ pedido }: { pedido: Pedido }) {
  return (
    <div className="flex flex-col gap-2 px-5 py-3 text-xs">
      <ul className="flex flex-col gap-1">
        {pedido.items.length === 0 ? (
          <li className="text-(--color-text-muted)">Sin detalle de items</li>
        ) : (
          pedido.items.map((item, idx) => {
            const sinMods = Object.entries(item.modificadores ?? {})
              .filter(([, mod]) => mod.sin?.length)
              .map(([nombre, mod]) => `${nombre}: sin ${mod.sin!.join(", ")}`);
            return (
              <li key={idx} className="text-(--color-text)">
                <span className="font-medium">
                  {item.cantidad} × {item.nombre ?? item.producto_id}
                </span>{" "}
                <span className="text-(--color-text-muted)">
                  · {formatCOP(item.precio_unitario)} c/u
                  {sinMods.length > 0 && ` · ${sinMods.join(" · ")}`}
                </span>
              </li>
            );
          })
        )}
      </ul>
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-(--color-text-muted)">
        {pedido.cliente.telefono && <span>📞 {pedido.cliente.telefono}</span>}
        {pedido.tipo === "domicilio" && (
          <span>📍 {pedido.direccion_entrega ?? "Sin dirección registrada"}</span>
        )}
      </div>
    </div>
  );
}

// ── Filter bar ─────────────────────────────────────────────────────────────

interface Filters {
  estado: EstadoPedido | "todos";
  metodo_pago: MetodoPago | "todos";
  fecha: string;
}

function FilterBar({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={filters.estado}
        onChange={(e) =>
          onChange({ ...filters, estado: e.target.value as Filters["estado"] })
        }
        className="rounded-lg border border-(--color-border) bg-(--color-surface-raised) px-3 py-1.5 text-sm text-(--color-text) outline-none focus:border-(--color-brand)"
      >
        <option value="todos">Todos los estados</option>
        {ESTADOS.map((e) => (
          <option key={e} value={e}>
            {STATUS_LABELS[e]}
          </option>
        ))}
      </select>

      <select
        value={filters.metodo_pago}
        onChange={(e) =>
          onChange({
            ...filters,
            metodo_pago: e.target.value as Filters["metodo_pago"],
          })
        }
        className="rounded-lg border border-(--color-border) bg-(--color-surface-raised) px-3 py-1.5 text-sm text-(--color-text) outline-none focus:border-(--color-brand)"
      >
        <option value="todos">Todos los pagos</option>
        <option value="online">Online</option>
        <option value="caja">Caja</option>
      </select>

      <input
        type="date"
        value={filters.fecha}
        onChange={(e) => onChange({ ...filters, fecha: e.target.value })}
        className="rounded-lg border border-(--color-border) bg-(--color-surface-raised) px-3 py-1.5 text-sm text-(--color-text) outline-none focus:border-(--color-brand)"
      />
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function OrdersClient() {
  const [filters, setFilters] = useState<Filters>({
    estado: "todos",
    metodo_pago: "todos",
    fecha: localDateStr(),
  });
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const PAGE_SIZE = 20;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchOrders = useCallback(async () => {
    // Aborta el fetch anterior: evita que una respuesta vieja pise una nueva
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await getPedidos(
        {
          estado: filters.estado !== "todos" ? filters.estado : undefined,
          metodo_pago:
            filters.metodo_pago !== "todos" ? filters.metodo_pago : undefined,
          fecha: filters.fecha || undefined,
          page,
          page_size: PAGE_SIZE,
        },
        controller.signal,
      );
      setPedidos(res.items);
      setTotal(res.total);
      setError(null);
    } catch (err) {
      if (controller.signal.aborted) return; // petición reemplazada
      if (err instanceof ApiError) {
        setError(`Error ${err.status}: ${err.message}`);
      } else {
        setError("No se pudo conectar con el servidor");
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchOrders();
    // Polling cada 30 s (RF-24); en pausa mientras la pestaña está oculta
    const id = setInterval(() => {
      if (!document.hidden) fetchOrders();
    }, 30_000);
    return () => clearInterval(id);
  }, [fetchOrders]);

  function handleFiltersChange(f: Filters) {
    setFilters(f);
    setPage(1);
  }

  function handleEstadoUpdated(referencia: string, estado: EstadoPedido) {
    setPedidos((prev) =>
      prev.map((p) => (p.referencia === referencia ? { ...p, estado } : p)),
    );
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <FilterBar filters={filters} onChange={handleFiltersChange} />

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="rounded-(--radius-card) border border-(--color-border) bg-(--color-surface-raised) shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-(--color-border) text-left text-xs text-(--color-text-muted)">
                <th className="px-5 py-3 font-medium">Referencia</th>
                <th className="px-5 py-3 font-medium">Cliente</th>
                <th className="px-5 py-3 font-medium">Tipo</th>
                <th className="px-5 py-3 font-medium">Pago</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium">Cambiar estado</th>
                <th className="px-5 py-3 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-10 text-center text-(--color-text-muted)"
                  >
                    Cargando…
                  </td>
                </tr>
              ) : pedidos.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-10 text-center text-(--color-text-muted)"
                  >
                    No hay pedidos
                  </td>
                </tr>
              ) : (
                pedidos.map((p) => (
                  <Fragment key={p.id}>
                    <tr
                      onClick={() =>
                        setExpandedId((prev) => (prev === p.id ? null : p.id))
                      }
                      className="cursor-pointer border-b border-(--color-border)/50 last:border-0 hover:bg-(--color-surface-muted)/50 transition-colors"
                    >
                      <td className="px-5 py-3 font-mono text-xs">
                        <span className="mr-1.5 inline-block text-(--color-text-muted)">
                          {expandedId === p.id ? "▾" : "▸"}
                        </span>
                        {p.referencia}
                      </td>
                      <td className="px-5 py-3 text-(--color-text-muted)">
                        {p.cliente.nombre || p.cliente.telefono || "—"}
                      </td>
                      <td className="px-5 py-3 capitalize">{p.tipo}</td>
                      <td className="px-5 py-3 capitalize">{p.metodo_pago}</td>
                      <td className="px-5 py-3">{formatCOP(p.total)}</td>
                      <td className="px-5 py-3">
                        <StatusBadge estado={p.estado} />
                      </td>
                      <td
                        className="px-5 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <StatusSelect
                          referencia={p.referencia}
                          current={p.estado}
                          onUpdated={handleEstadoUpdated}
                          onError={setError}
                        />
                      </td>
                      <td className="px-5 py-3 text-(--color-text-muted)">
                        {new Date(p.created_at).toLocaleString("es-CO", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                    {expandedId === p.id && (
                      <tr className="border-b border-(--color-border)/50 last:border-0 bg-(--color-surface-muted)/30">
                        <td colSpan={8}>
                          <OrderDetail pedido={p} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-(--color-border) px-5 py-3">
            <span className="text-xs text-(--color-text-muted)">
              {total} pedidos · página {page} de {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-(--color-border) px-3 py-1 text-xs text-(--color-text) transition-colors hover:bg-(--color-surface-muted) disabled:opacity-40"
              >
                ← Anterior
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-(--color-border) px-3 py-1 text-xs text-(--color-text) transition-colors hover:bg-(--color-surface-muted) disabled:opacity-40"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
