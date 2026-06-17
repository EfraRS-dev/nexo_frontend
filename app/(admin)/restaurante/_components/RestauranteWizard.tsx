"use client";

import { useState } from "react";
import { ApiError, updateRestaurante } from "@/lib/api";
import type { Restaurante } from "@/types";
import { PASOS, toForm, toPayload, type RestauranteForm } from "./form";
import { SECTIONS } from "./sections";

interface Props {
  restaurante: Restaurante;
  onSaved: (r: Restaurante) => void;
  onCancel?: () => void;
}

export default function RestauranteWizard({ restaurante, onSaved, onCancel }: Props) {
  const [form, setForm] = useState<RestauranteForm>(() => toForm(restaurante));
  const [paso, setPaso] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = PASOS.length;
  const actual = PASOS[paso];
  const esUltimo = paso === total - 1;
  const Section = SECTIONS[actual.id];

  const meta = {
    numero_whatsapp: restaurante.numero_whatsapp,
    prefijo: restaurante.prefijo,
  };

  function onChange(patch: Partial<RestauranteForm>) {
    setForm((f) => ({ ...f, ...patch }));
  }

  function avanzar() {
    if (actual.id === "identidad" && !form.nombre.trim()) {
      setError("El nombre del restaurante es obligatorio.");
      return;
    }
    setError(null);
    setPaso((p) => Math.min(p + 1, total - 1));
  }

  async function finalizar() {
    if (!form.nombre.trim()) {
      setError("El nombre del restaurante es obligatorio.");
      setPaso(0);
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const saved = await updateRestaurante(toPayload(form));
      onSaved(saved);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? `Error ${err.status}: ${err.message}`
          : "No se pudo guardar la información",
      );
    } finally {
      setSaving(false);
    }
  }

  const progreso = Math.round(((paso + 1) / total) * 100);

  return (
    <div className="rounded-(--radius-card) border border-(--color-border) bg-(--color-surface-raised) shadow-sm">
      {/* Encabezado + progreso */}
      <div className="border-b border-(--color-border) px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-(--color-text-muted)">
              Paso {paso + 1} de {total}
            </p>
            <h2 className="mt-0.5 text-base font-semibold text-(--color-text)">
              {actual.titulo}
            </h2>
            <p className="text-sm text-(--color-text-muted)">{actual.descripcion}</p>
          </div>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-(--color-text-muted) transition-colors hover:text-(--color-text)"
            >
              Salir del asistente
            </button>
          )}
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-(--color-surface-muted)">
          <div
            className="h-full rounded-full bg-(--color-brand) transition-all"
            style={{ width: `${progreso}%` }}
          />
        </div>
      </div>

      {/* Sección actual */}
      <div className="px-6 py-5">
        <Section form={form} onChange={onChange} meta={meta} />

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>

      {/* Navegación */}
      <div className="flex items-center justify-between border-t border-(--color-border) px-6 py-4">
        <button
          type="button"
          onClick={() => setPaso((p) => Math.max(p - 1, 0))}
          disabled={paso === 0 || saving}
          className="rounded-lg border border-(--color-border) px-4 py-2 text-sm text-(--color-text) transition-colors hover:bg-(--color-surface-muted) disabled:opacity-40"
        >
          Atrás
        </button>

        {esUltimo ? (
          <button
            type="button"
            onClick={finalizar}
            disabled={saving}
            className="rounded-lg bg-(--color-brand) px-4 py-2 text-sm font-medium text-(--color-brand-foreground) transition-colors hover:bg-(--color-brand-hover) disabled:opacity-50"
          >
            {saving ? "Guardando…" : "Finalizar y guardar"}
          </button>
        ) : (
          <button
            type="button"
            onClick={avanzar}
            disabled={saving}
            className="rounded-lg bg-(--color-brand) px-4 py-2 text-sm font-medium text-(--color-brand-foreground) transition-colors hover:bg-(--color-brand-hover) disabled:opacity-50"
          >
            Siguiente
          </button>
        )}
      </div>
    </div>
  );
}
