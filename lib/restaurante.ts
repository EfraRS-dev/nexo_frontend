import type { Restaurante } from "@/types";

// Campos que cuentan para considerar el perfil "completo". Fuente única usada
// por el wizard de onboarding y por el banner del dashboard.
const CAMPOS: { label: string; lleno: (r: Restaurante) => boolean }[] = [
  { label: "Descripción", lleno: (r) => !!r.descripcion?.trim() },
  { label: "Dirección", lleno: (r) => !!r.direccion?.trim() },
  { label: "Horario", lleno: (r) => !!r.horario?.trim() },
  {
    label: "Teléfono o email",
    lleno: (r) => !!(r.telefono_contacto?.trim() || r.email?.trim()),
  },
  { label: "Zonas de cobertura", lleno: (r) => (r.zonas_cobertura?.length ?? 0) > 0 },
  { label: "Métodos de pago", lleno: (r) => (r.metodos_pago?.length ?? 0) > 0 },
];

export interface Completitud {
  hechos: string[];
  faltantes: string[];
  porcentaje: number;
  completo: boolean;
}

export function restauranteCompleto(r: Restaurante): Completitud {
  const hechos: string[] = [];
  const faltantes: string[] = [];
  for (const c of CAMPOS) {
    (c.lleno(r) ? hechos : faltantes).push(c.label);
  }
  const porcentaje = Math.round((hechos.length / CAMPOS.length) * 100);
  return { hechos, faltantes, porcentaje, completo: faltantes.length === 0 };
}
