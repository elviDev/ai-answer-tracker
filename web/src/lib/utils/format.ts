const dateTime = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });
const shortDate = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });
const relative = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

export const formatDateTime = (date: Date) => dateTime.format(date);
export const formatShortDate = (date: Date) => shortDate.format(date);

export function formatPercent(value: number | null | undefined) {
  return value == null ? "–" : `${Math.round(value * 100)}%`;
}

export function formatRelative(date: Date | null, now = Date.now()) {
  if (!date) return "never";
  const seconds = Math.round((date.getTime() - now) / 1000);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
  ];
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit);
  }
  return "just now";
}

export function formatInterval(minutes: number) {
  if (minutes % 1440 === 0) return minutes === 1440 ? "daily" : `every ${minutes / 1440} days`;
  if (minutes % 60 === 0) return minutes === 60 ? "hourly" : `every ${minutes / 60} hours`;
  return `every ${minutes} min`;
}

/** Local calendar day key (YYYY-MM-DD) used to bucket runs per day. */
export function dayKey(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
