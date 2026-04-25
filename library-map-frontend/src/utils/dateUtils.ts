// src/utils/dateUtils.ts

// Get today's date in YYYY-MM-DD format (local)
export function toYmdLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function toHHmmLocal(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// Is it the same calendar day?
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// Convert YYYY-MM-DD to Date as local date
export function fromYmdLocal(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

// YYYY-MM-DD + HH:MM → Date
export function mergeYmdWithHHmm(
  ymd: string,
  timeHHmm: string
): Date {
  const base = fromYmdLocal(ymd);
  const [hh, mm] = timeHHmm.split(":").map(Number);

  return new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate(),
    hh ?? 0,
    mm ?? 0,
    0,
    0
  );
}
