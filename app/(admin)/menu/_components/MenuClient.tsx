"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getMenu,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  ApiError,
} from "@/lib/api";
import type { MenuItem } from "@/types";

// ── Helpers ────────────────────────────────────────────────────────────────

function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
}

// ── Item modal (create / edit) ────────────────────────────────────────────

interface ItemModalProps {
  item: Partial<MenuItem> | null; // null = create mode
  onClose: () => void;
  onSaved: (item: MenuItem) => void;
}

function ItemModal({ item, onClose, onSaved }: ItemModalProps) {
  const isEdit = Boolean(item?.id);
  const [form, setForm] = useState({
    nombre: item?.nombre ?? "",
    slug: item?.slug ?? "",
    precio: item?.precio ?? 0,
    categoria: item?.categoria ?? "",
    disponible: item?.disponible ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        nombre: form.nombre,
        slug: form.slug,
        precio: Number(form.precio),
        categoria: form.categoria || null,
        disponible: form.disponible,
      };

      const saved = isEdit
        ? await updateMenuItem(item!.id!, payload)
        : await createMenuItem(payload);

      onSaved(saved);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`Error ${err.status}: ${err.message}`);
      } else {
        setError("No se pudo guardar el ítem");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-(--radius-card) border border-(--color-border) bg-(--color-surface-raised) p-6 shadow-xl">
        <h2 className="mb-4 text-base font-semibold text-(--color-text)">
          {isEdit ? "Editar ítem" : "Nuevo ítem"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-(--color-text)">
              Nombre
            </label>
            <input
              required
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="h-9 rounded-lg border border-(--color-border) bg-(--color-surface) px-3 text-sm text-(--color-text) outline-none focus:border-(--color-brand)"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-(--color-text)">
              Slug (identificador único)
            </label>
            <input
              required
              value={form.slug}
              onChange={(e) =>
                setForm({
                  ...form,
                  slug: e.target.value
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/[^a-z0-9-]/g, ""),
                })
              }
              className="h-9 rounded-lg border border-(--color-border) bg-(--color-surface) px-3 text-sm font-mono text-(--color-text) outline-none focus:border-(--color-brand)"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-(--color-text)">
                Precio (COP)
              </label>
              <input
                type="number"
                required
                min={0}
                value={form.precio}
                onChange={(e) =>
                  setForm({ ...form, precio: Number(e.target.value) })
                }
                className="h-9 rounded-lg border border-(--color-border) bg-(--color-surface) px-3 text-sm text-(--color-text) outline-none focus:border-(--color-brand)"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-(--color-text)">
                Categoría
              </label>
              <input
                value={form.categoria}
                onChange={(e) =>
                  setForm({ ...form, categoria: e.target.value })
                }
                placeholder="Hamburguesas…"
                className="h-9 rounded-lg border border-(--color-border) bg-(--color-surface) px-3 text-sm text-(--color-text) outline-none focus:border-(--color-brand)"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.disponible}
              onChange={(e) =>
                setForm({ ...form, disponible: e.target.checked })
              }
              className="h-4 w-4 rounded accent-(--color-brand)"
            />
            <span className="text-sm text-(--color-text)">Disponible</span>
          </label>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="mt-1 flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-(--color-border) px-4 py-2 text-sm text-(--color-text) transition-colors hover:bg-(--color-surface-muted)"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-(--color-brand) px-4 py-2 text-sm font-medium text-(--color-brand-foreground) transition-colors hover:bg-(--color-brand-hover) disabled:opacity-50"
            >
              {loading ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main menu client ───────────────────────────────────────────────────────

export default function MenuClient() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalItem, setModalItem] = useState<Partial<MenuItem> | null | undefined>(undefined);
  // undefined = modal closed, null = create mode, object = edit mode

  const fetchMenu = useCallback(async () => {
    try {
      const data = await getMenu();
      setItems(data);
      setError(null);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`Error ${err.status}: ${err.message}`);
      } else {
        setError("No se pudo cargar el menú");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  async function handleToggleDisponible(item: MenuItem) {
    try {
      const updated = await updateMenuItem(item.id, {
        disponible: !item.disponible,
      });
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    } catch {
      // silently fail
    }
  }

  async function handleDelete(item: MenuItem) {
    if (!confirm(`¿Eliminar "${item.nombre}"?`)) return;
    try {
      await deleteMenuItem(item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch {
      // silently fail
    }
  }

  function handleSaved(saved: MenuItem) {
    setItems((prev) => {
      const exists = prev.find((i) => i.id === saved.id);
      return exists
        ? prev.map((i) => (i.id === saved.id ? saved : i))
        : [saved, ...prev];
    });
    setModalItem(undefined);
  }

  // Group by category
  const categories = Array.from(
    new Set(items.map((i) => i.categoria ?? "Sin categoría")),
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-(--color-text-muted)">
          {items.length} productos
        </p>
        <button
          onClick={() => setModalItem(null)}
          className="rounded-lg bg-(--color-brand) px-4 py-2 text-sm font-medium text-(--color-brand-foreground) transition-colors hover:bg-(--color-brand-hover)"
        >
          + Nuevo ítem
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Menu table */}
      {loading ? (
        <div className="rounded-(--radius-card) border border-(--color-border) bg-(--color-surface-raised) px-5 py-10 text-center text-sm text-(--color-text-muted) shadow-sm">
          Cargando menú…
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-(--radius-card) border border-(--color-border) bg-(--color-surface-raised) px-5 py-10 text-center text-sm text-(--color-text-muted) shadow-sm">
          No hay ítems en el menú
        </div>
      ) : (
        categories.map((cat) => {
          const catItems = items.filter(
            (i) => (i.categoria ?? "Sin categoría") === cat,
          );
          return (
            <div
              key={cat}
              className="rounded-(--radius-card) border border-(--color-border) bg-(--color-surface-raised) shadow-sm overflow-hidden"
            >
              <div className="border-b border-(--color-border) bg-(--color-surface-muted)/50 px-5 py-2">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-(--color-text-muted)">
                  {cat}
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-(--color-border) text-left text-xs text-(--color-text-muted)">
                      <th className="px-5 py-2 font-medium">Nombre</th>
                      <th className="px-5 py-2 font-medium">Slug</th>
                      <th className="px-5 py-2 font-medium">Precio</th>
                      <th className="px-5 py-2 font-medium">Disponible</th>
                      <th className="px-5 py-2 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {catItems.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-(--color-border)/50 last:border-0 hover:bg-(--color-surface-muted)/40"
                      >
                        <td className="px-5 py-2.5 font-medium text-(--color-text)">
                          {item.nombre}
                        </td>
                        <td className="px-5 py-2.5 font-mono text-xs text-(--color-text-muted)">
                          {item.slug}
                        </td>
                        <td className="px-5 py-2.5">{formatCOP(item.precio)}</td>
                        <td className="px-5 py-2.5">
                          <button
                            onClick={() => handleToggleDisponible(item)}
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                              item.disponible
                                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${item.disponible ? "bg-emerald-500" : "bg-zinc-400"}`}
                            />
                            {item.disponible ? "Disponible" : "Agotado"}
                          </button>
                        </td>
                        <td className="px-5 py-2.5">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setModalItem(item)}
                              className="rounded px-2 py-1 text-xs text-(--color-brand) hover:bg-(--color-brand)/10 transition-colors"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(item)}
                              className="rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50 transition-colors"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
      )}

      {/* Modal */}
      {modalItem !== undefined && (
        <ItemModal
          item={modalItem}
          onClose={() => setModalItem(undefined)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
