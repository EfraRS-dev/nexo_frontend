"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getPedidos, getRestaurante, ApiError } from "@/lib/api";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/constants";
import { formatCOP, localDateStr } from "@/lib/format";
import { restauranteCompleto } from "@/lib/restaurante";
import type { Pedido } from "@/types";

// ── KPI card ──────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="rounded-(--radius-card) border border-(--color-border) bg-(--color-surface-raised) p-5 shadow-sm">
      <p className="text-sm text-(--color-text-muted)">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${color}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-(--color-text-muted)">{sub}</p>}
    </div>
  );
}

// ── Main dashboard component ──────────────────────────────────────────────

export default function DashboardClient() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [totalHoy, setTotalHoy] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [perfil, setPerfil] = useState<{ porcentaje: number; faltantes: string[] } | null>(null);

  const todayStr = localDateStr();

  const fetchData = useCallback(async () => {
    try {
      const res = await getPedidos({ fecha: todayStr, page_size: 100 });
      setPedidos(res.items);
      setTotalHoy(res.total);
      setError(null);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`Error ${err.status}: ${err.message}`);
      } else {
        setError("No se pudo conectar con el servidor");
      }
    } finally {
      setLoading(false);
    }
  }, [todayStr]);

  useEffect(() => {
    fetchData();
    // Polling cada 30 s (RF-24); en pausa mientras la pestaña está oculta
    const id = setInterval(() => {
      if (!document.hidden) fetchData();
    }, 30_000);
    return () => clearInterval(id);
  }, [fetchData]);

  // Nudge de perfil incompleto (una sola vez; degrada en silencio si falla)
  useEffect(() => {
    let activo = true;
    getRestaurante()
      .then((r) => {
        if (!activo) return;
        const c = restauranteCompleto(r);
        setPerfil(c.completo ? null : { porcentaje: c.porcentaje, faltantes: c.faltantes });
      })
      .catch(() => {
        /* sin banner si no se pudo cargar */
      });
    return () => {
      activo = false;
    };
  }, []);

  // ── KPIs ────────────────────────────────────────────────────────────────
  // Nota: salvo totalHoy (que usa res.total), los KPIs se derivan de los
  // primeros 100 pedidos del día (page_size máx. del backend).
  const ingresoHoy = pedidos
    .filter((p) => p.metodo_pago === "online" && p.estado !== "pendiente")
    .reduce((acc, p) => acc + p.total, 0);
  const pendientes = pedidos.filter(
    (p) => p.estado === "pendiente" || p.estado === "confirmado",
  ).length;
  const enCamino = pedidos.filter((p) => p.estado === "en_camino").length;

  const recientes = [...pedidos]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-(--color-text)">Dashboard</h1>
        <p className="text-sm text-(--color-text-muted)">
          Resumen del día ·{" "}
          {new Date().toLocaleDateString("es-CO", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Nudge de perfil incompleto */}
      {perfil && (
        <Link
          href="/restaurante"
          className="flex items-center justify-between gap-3 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 transition-colors hover:bg-amber-100"
        >
          <span>
            Completa la información de tu restaurante ({perfil.porcentaje}%) — falta:{" "}
            {perfil.faltantes.join(", ")}.
          </span>
          <span className="shrink-0 font-medium">Completar →</span>
        </Link>
      )}

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Pedidos hoy"
          value={loading ? "—" : totalHoy}
          color="text-(--color-text)"
        />
        <KpiCard
          label="Ingresos online"
          value={loading ? "—" : formatCOP(ingresoHoy)}
          sub="pedidos pagados"
          color="text-(--color-brand)"
        />
        <KpiCard
          label="Por atender"
          value={loading ? "—" : pendientes}
          sub="pendientes + confirmados"
          color="text-yellow-600"
        />
        <KpiCard
          label="En camino"
          value={loading ? "—" : enCamino}
          color="text-purple-600"
        />
      </div>

      {/* Recent orders */}
      <div className="rounded-(--radius-card) border border-(--color-border) bg-(--color-surface-raised) shadow-sm">
        <div className="flex items-center justify-between border-b border-(--color-border) px-5 py-3">
          <h2 className="text-sm font-semibold text-(--color-text)">
            Pedidos recientes
          </h2>
          <Link
            href="/pedidos"
            className="text-xs text-(--color-brand) hover:underline"
          >
            Ver todos →
          </Link>
        </div>

        {loading ? (
          <div className="px-5 py-8 text-center text-sm text-(--color-text-muted)">
            Cargando…
          </div>
        ) : recientes.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-(--color-text-muted)">
            Sin pedidos hoy
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-(--color-border) text-left text-xs text-(--color-text-muted)">
                  <th className="px-5 py-2 font-medium">Referencia</th>
                  <th className="px-5 py-2 font-medium">Tipo</th>
                  <th className="px-5 py-2 font-medium">Pago</th>
                  <th className="px-5 py-2 font-medium">Total</th>
                  <th className="px-5 py-2 font-medium">Estado</th>
                  <th className="px-5 py-2 font-medium">Hora</th>
                </tr>
              </thead>
              <tbody>
                {recientes.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-(--color-border)/50 last:border-0 hover:bg-(--color-surface-muted)/50"
                  >
                    <td className="px-5 py-2.5 font-mono text-xs">
                      {p.referencia}
                    </td>
                    <td className="px-5 py-2.5 capitalize">{p.tipo}</td>
                    <td className="px-5 py-2.5 capitalize">{p.metodo_pago}</td>
                    <td className="px-5 py-2.5">{formatCOP(p.total)}</td>
                    <td className="px-5 py-2.5">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[p.estado]}`}
                      >
                        {STATUS_LABELS[p.estado]}
                      </span>
                    </td>
                    <td className="px-5 py-2.5 text-(--color-text-muted)">
                      {new Date(p.created_at).toLocaleTimeString("es-CO", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
