"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, getRestaurante, updateRestaurante } from "@/lib/api";
import { restauranteCompleto } from "@/lib/restaurante";
import type { Restaurante } from "@/types";
import { PASOS, toForm, toPayload, type RestauranteForm } from "./form";
import { SECTIONS } from "./sections";
import RestauranteWizard from "./RestauranteWizard";

// ── Modo ajustes: todas las secciones apiladas + un botón Guardar ─────────────

function SettingsView({
  restaurante,
  onSaved,
  onReopenWizard,
}: {
  restaurante: Restaurante;
  onSaved: (r: Restaurante) => void;
  onReopenWizard: () => void;
}) {
  const [form, setForm] = useState<RestauranteForm>(() => toForm(restaurante));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);

  const meta = {
    numero_whatsapp: restaurante.numero_whatsapp,
    prefijo: restaurante.prefijo,
  };

  function onChange(patch: Partial<RestauranteForm>) {
    setForm((f) => ({ ...f, ...patch }));
    setGuardado(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombre.trim()) {
      setError("El nombre del restaurante es obligatorio.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const saved = await updateRestaurante(toPayload(form));
      onSaved(saved);
      setGuardado(true);
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-(--color-text-muted)">
          Edita los datos y guarda los cambios.
        </p>
        <button
          type="button"
          onClick={onReopenWizard}
          className="text-xs text-(--color-brand) hover:underline"
        >
          Reabrir asistente guiado
        </button>
      </div>

      {PASOS.map((paso) => {
        const Section = SECTIONS[paso.id];
        return (
          <div
            key={paso.id}
            className="rounded-(--radius-card) border border-(--color-border) bg-(--color-surface-raised) shadow-sm"
          >
            <div className="border-b border-(--color-border) px-5 py-3">
              <h2 className="text-sm font-semibold text-(--color-text)">{paso.titulo}</h2>
              <p className="text-xs text-(--color-text-muted)">{paso.descripcion}</p>
            </div>
            <div className="px-5 py-4">
              <Section form={form} onChange={onChange} meta={meta} />
            </div>
          </div>
        );
      })}

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}
      {guardado && (
        <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Cambios guardados. El agente ya los usa al responder.
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-(--color-brand) px-5 py-2 text-sm font-medium text-(--color-brand-foreground) transition-colors hover:bg-(--color-brand-hover) disabled:opacity-50"
        >
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}

// ── Orquestador ───────────────────────────────────────────────────────────────

export default function RestauranteClient() {
  const [rest, setRest] = useState<Restaurante | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // "auto" decide por completitud; las acciones del usuario fijan el modo.
  const [modo, setModo] = useState<"auto" | "wizard" | "settings">("auto");

  const fetchRest = useCallback(async () => {
    try {
      const r = await getRestaurante();
      setRest(r);
      setError(null);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? `Error ${err.status}: ${err.message}`
          : "No se pudo cargar la información",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRest();
  }, [fetchRest]);

  if (loading) {
    return (
      <div className="rounded-(--radius-card) border border-(--color-border) bg-(--color-surface-raised) px-5 py-10 text-center text-sm text-(--color-text-muted) shadow-sm">
        Cargando información…
      </div>
    );
  }

  if (!rest) {
    return (
      <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
        {error ?? "No se pudo cargar la información"}
      </div>
    );
  }

  const completitud = restauranteCompleto(rest);
  const mostrarWizard =
    modo === "wizard" || (modo === "auto" && !completitud.completo);

  if (mostrarWizard) {
    return (
      <div className="space-y-4">
        {modo === "auto" && (
          <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Vamos a configurar tu restaurante en unos pasos. Esta información es la
            que el agente usa al atender a tus clientes por WhatsApp.
          </div>
        )}
        <RestauranteWizard
          restaurante={rest}
          onSaved={(r) => {
            setRest(r);
            setModo("settings");
          }}
          onCancel={modo === "wizard" ? () => setModo("settings") : undefined}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!completitud.completo && (
        <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Perfil al {completitud.porcentaje}%. Falta: {completitud.faltantes.join(", ")}.
        </div>
      )}
      <SettingsView
        restaurante={rest}
        onSaved={setRest}
        onReopenWizard={() => setModo("wizard")}
      />
    </div>
  );
}
