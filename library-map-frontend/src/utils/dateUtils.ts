// src/utils/dateUtils.ts

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
