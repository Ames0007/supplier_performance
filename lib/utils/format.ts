/**
 * Locale-aware formatting. French is the primary locale (UX_FOUNDATIONS);
 * currency defaults to MAD (Moroccan Dirham).
 */
const LOCALE = "fr-FR";

export function formatDate(value: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(LOCALE, options ?? { dateStyle: "medium" }).format(date);
}

export function formatDateTime(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(LOCALE, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(LOCALE, options).format(value);
}

export function formatCurrency(value: number, currency = "MAD"): string {
  return new Intl.NumberFormat(LOCALE, { style: "currency", currency }).format(value);
}
