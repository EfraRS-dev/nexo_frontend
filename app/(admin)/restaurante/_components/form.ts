import type { MetodoPago, RedesSociales, Restaurante, RestauranteUpdate } from "@/types";

// Copia de trabajo editable: todo en strings para los inputs controlados.
export interface RestauranteForm {
  nombre: string;
  descripcion: string;
  direccion: string;
  horario: string;
  telefono_contacto: string;
  email: string;
  instagram: string;
  facebook: string;
  zonas: string; // textarea: una zona por línea
  metodos_pago: MetodoPago[];
}

/** Construye la copia editable a partir del restaurante del backend. */
export function toForm(r: Restaurante): RestauranteForm {
  return {
    nombre: r.nombre ?? "",
    descripcion: r.descripcion ?? "",
    direccion: r.direccion ?? "",
    horario: r.horario ?? "",
    telefono_contacto: r.telefono_contacto ?? "",
    email: r.email ?? "",
    instagram: r.redes_sociales?.instagram ?? "",
    facebook: r.redes_sociales?.facebook ?? "",
    zonas: (r.zonas_cobertura ?? []).join("\n"),
    metodos_pago: r.metodos_pago ?? [],
  };
}

/** Arma el payload del PATCH: campos vacíos → null (los limpia en el backend). */
export function toPayload(form: RestauranteForm): RestauranteUpdate {
  const zonas = form.zonas
    .split(/[\n,]/)
    .map((z) => z.trim().toLowerCase())
    .filter(Boolean);

  const redes: RedesSociales = {};
  if (form.instagram.trim()) redes.instagram = form.instagram.trim();
  if (form.facebook.trim()) redes.facebook = form.facebook.trim();

  return {
    nombre: form.nombre.trim(),
    descripcion: form.descripcion.trim() || null,
    direccion: form.direccion.trim() || null,
    horario: form.horario.trim() || null,
    telefono_contacto: form.telefono_contacto.trim() || null,
    email: form.email.trim() || null,
    redes_sociales: Object.keys(redes).length ? redes : null,
    metodos_pago: form.metodos_pago.length ? form.metodos_pago : null,
    zonas_cobertura: zonas.length ? zonas : null,
  };
}

export type PasoId = "identidad" | "contacto" | "operacion" | "cobertura" | "pagos";

export const PASOS: { id: PasoId; titulo: string; descripcion: string }[] = [
  { id: "identidad", titulo: "Identidad", descripcion: "Nombre y de qué va tu cocina" },
  { id: "contacto", titulo: "Contacto", descripcion: "Cómo te ubican tus clientes" },
  { id: "operacion", titulo: "Operación", descripcion: "Tu horario de atención" },
  { id: "cobertura", titulo: "Cobertura", descripcion: "Barrios a los que llevas domicilio" },
  { id: "pagos", titulo: "Pagos", descripcion: "Cómo aceptas el pago" },
];
