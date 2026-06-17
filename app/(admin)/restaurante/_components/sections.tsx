"use client";

import type { MetodoPago } from "@/types";
import type { PasoId, RestauranteForm } from "./form";

// ── UI compartida ────────────────────────────────────────────────────────────

const INPUT_CLS =
  "h-9 rounded-lg border border-(--color-border) bg-(--color-surface) px-3 text-sm text-(--color-text) outline-none focus:border-(--color-brand)";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-(--color-text)">{label}</label>
      {children}
      {hint && <p className="text-xs text-(--color-text-muted)">{hint}</p>}
    </div>
  );
}

export interface SectionProps {
  form: RestauranteForm;
  onChange: (patch: Partial<RestauranteForm>) => void;
  meta: { numero_whatsapp: string; prefijo: string };
}

// ── Secciones ────────────────────────────────────────────────────────────────

function IdentitySection({ form, onChange, meta }: SectionProps) {
  return (
    <div className="flex flex-col gap-3">
      <Field label="Nombre del restaurante / cocina oculta">
        <input
          required
          value={form.nombre}
          onChange={(e) => onChange({ nombre: e.target.value })}
          placeholder="Kike's Burgers"
          className={INPUT_CLS}
        />
      </Field>
      <Field label="Descripción" hint="Una línea sobre tu propuesta; el agente la usa para presentarse.">
        <textarea
          value={form.descripcion}
          onChange={(e) => onChange({ descripcion: e.target.value })}
          placeholder="Hamburguesas artesanales a la parrilla, hechas al momento."
          rows={3}
          className={INPUT_CLS + " h-auto py-2 resize-y"}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Número de WhatsApp" hint="Asignado por la plataforma">
          <input value={meta.numero_whatsapp} readOnly disabled className={INPUT_CLS + " opacity-60"} />
        </Field>
        <Field label="Prefijo de pedidos" hint="Ej. NEXO-0001">
          <input value={meta.prefijo} readOnly disabled className={INPUT_CLS + " font-mono opacity-60"} />
        </Field>
      </div>
    </div>
  );
}

function ContactSection({ form, onChange }: SectionProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Teléfono de contacto">
          <input
            value={form.telefono_contacto}
            onChange={(e) => onChange({ telefono_contacto: e.target.value })}
            placeholder="+57 300 123 4567"
            className={INPUT_CLS}
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            value={form.email}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="contacto@turestaurante.com"
            className={INPUT_CLS}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Instagram">
          <input
            value={form.instagram}
            onChange={(e) => onChange({ instagram: e.target.value })}
            placeholder="@turestaurante"
            className={INPUT_CLS}
          />
        </Field>
        <Field label="Facebook">
          <input
            value={form.facebook}
            onChange={(e) => onChange({ facebook: e.target.value })}
            placeholder="TuRestaurante"
            className={INPUT_CLS}
          />
        </Field>
      </div>
    </div>
  );
}

function OperacionSection({ form, onChange }: SectionProps) {
  return (
    <div className="flex flex-col gap-3">
      <Field
        label="Horario de atención"
        hint="Texto libre. El agente lo responde tal cual cuando un cliente pregunta."
      >
        <textarea
          value={form.horario}
          onChange={(e) => onChange({ horario: e.target.value })}
          placeholder="Lunes a domingo de 11:00 a.m. a 10:00 p.m."
          rows={2}
          className={INPUT_CLS + " h-auto py-2 resize-y"}
        />
      </Field>
    </div>
  );
}

function CoberturaSection({ form, onChange }: SectionProps) {
  return (
    <div className="flex flex-col gap-3">
      <Field
        label="Zonas de cobertura para domicilio"
        hint="Un barrio por línea. El agente solo acepta domicilios cuya dirección mencione uno de estos barrios."
      >
        <textarea
          value={form.zonas}
          onChange={(e) => onChange({ zonas: e.target.value })}
          placeholder={"el prado\nboston\nvilla country\nbellavista"}
          rows={6}
          className={INPUT_CLS + " h-auto py-2 resize-y"}
        />
      </Field>
    </div>
  );
}

const METODOS: { id: MetodoPago; label: string; desc: string }[] = [
  { id: "online", label: "En línea (Wompi)", desc: "Tarjeta, Nequi, PSE — link de pago en el chat" },
  { id: "caja", label: "En caja", desc: "Pago al recoger (solo para llevar)" },
];

function PagosSection({ form, onChange }: SectionProps) {
  function toggle(m: MetodoPago) {
    const has = form.metodos_pago.includes(m);
    onChange({
      metodos_pago: has
        ? form.metodos_pago.filter((x) => x !== m)
        : [...form.metodos_pago, m],
    });
  }
  return (
    <div className="flex flex-col gap-2">
      {METODOS.map((m) => (
        <label
          key={m.id}
          className="flex cursor-pointer items-start gap-3 rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2.5 transition-colors hover:bg-(--color-surface-muted)/40"
        >
          <input
            type="checkbox"
            checked={form.metodos_pago.includes(m.id)}
            onChange={() => toggle(m.id)}
            className="mt-0.5 h-4 w-4 rounded accent-(--color-brand)"
          />
          <span>
            <span className="block text-sm font-medium text-(--color-text)">{m.label}</span>
            <span className="block text-xs text-(--color-text-muted)">{m.desc}</span>
          </span>
        </label>
      ))}
    </div>
  );
}

export const SECTIONS: Record<PasoId, (props: SectionProps) => React.ReactNode> = {
  identidad: IdentitySection,
  contacto: ContactSection,
  operacion: OperacionSection,
  cobertura: CoberturaSection,
  pagos: PagosSection,
};
