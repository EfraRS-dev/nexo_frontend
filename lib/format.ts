// ── Formato compartido (moneda y fechas) ───────────────────────────────────

export function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Fecha en formato YYYY-MM-DD usando la zona horaria local del navegador.
 * No usar `toISOString()` para "hoy": devuelve la fecha UTC, que en Colombia
 * (UTC-5) apunta al día siguiente desde las 7 p. m.
 */
export function localDateStr(date: Date = new Date()): string {
  // en-CA formatea como YYYY-MM-DD
  return date.toLocaleDateString("en-CA");
}
