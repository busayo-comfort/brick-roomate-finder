/**
 * Deterministic formatters, shared by every server-rendered screen.
 *
 * `value.toLocaleString()` and `date.toLocaleDateString()` without an explicit
 * locale read the *host* locale: Node's on the server, the browser's on the
 * client. When the two disagree — "₦120,000" vs "₦120 000", "8/16/2026" vs
 * "16/08/2026" — the server HTML and the first client render differ, React
 * reports a hydration mismatch and re-renders that subtree. That re-render is
 * one of the flickers you see on load. Pinning locale *and* time zone makes
 * both sides emit byte-identical strings, so hydration is a no-op.
 *
 * The time zone matters as much as the locale: a UTC midnight move-in date
 * renders as the previous day for any host behind UTC.
 */
const LOCALE = "en-NG";

const numberFormatter = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });

const dateFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** "₦120,000" — `fallback` when the value is missing. */
export function formatNaira(value?: number | null, fallback = "—"): string {
  if (value == null || Number.isNaN(value)) return fallback;
  return `₦${numberFormatter.format(value)}`;
}

/** Compact budget range: "₦80,000 – ₦120,000", or a single bound when only one is set. */
export function formatBudgetRange(
  min?: number | null,
  max?: number | null,
  fallback = "Budget not set",
): string {
  if (min == null && max == null) return fallback;
  if (min != null && max != null) return `${formatNaira(min)} – ${formatNaira(max)}`;
  return min != null ? `From ${formatNaira(min)}` : `Up to ${formatNaira(max)}`;
}

/** "16 Aug 2026" — `fallback` when the value is missing or unparseable. */
export function formatDate(value?: string | Date | null, fallback = "Flexible"): string {
  if (!value) return fallback;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return dateFormatter.format(date);
}
