// src/utils/openingHoursUtils.ts

export type Weekday = "mon"|"tue"|"wed"|"thu"|"fri"|"sat"|"sun";
export type TimeRange = { open: string; close: string };

export type OpeningHoursSchedule = {
  timezone: string;
  weekly: Record<Weekday, TimeRange[]>;
  // exceptions は “今は使わないが JSONとしては来る” 前提で any 扱いに寄せる
  exceptions?: unknown;
  source?: { type: string; updatedAt: string };
};

export type LibraryStatus = {
  label: string;
  isOpen: boolean;
};

// -------- timezone utilities --------

function getZonedParts(timeZone: string, now: Date) {
  const dtf = new Intl.DateTimeFormat("en-AU", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = dtf.formatToParts(now);
  const get = (type: string) => parts.find(p => p.type === type)?.value;

  const year = Number(get("year"));
  const month = Number(get("month"));
  const day = Number(get("day"));
  const hour = Number(get("hour"));
  const minute = Number(get("minute"));
  const weekdayShort = (get("weekday") ?? "").toLowerCase(); // "mon" 形式に寄せる

  const wkMap: Record<string, Weekday> = {
    mon: "mon", tue: "tue", wed: "wed", thu: "thu", fri: "fri", sat: "sat", sun: "sun",
  };
  const weekday = wkMap[weekdayShort.slice(0,3)] ?? "mon";

  const yyyyMmDd = `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
  const minutes = hour * 60 + minute;

  return { yyyyMmDd, weekday, minutes };
}

function hhmmToMinutes(hhmm: string): number {
  if (hhmm === "24:00") return 24 * 60;
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function minutesToHHMM(mins: number): string {
  const m = Math.max(0, Math.min(1440, mins));
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2,"0")}:${String(mm).padStart(2,"0")}`;
}

function getTodaySlots(schedule: OpeningHoursSchedule, weekday: Weekday): TimeRange[] {
  // ✅ exceptions は今は適用しない（完全無視）
  return schedule.weekly?.[weekday] ?? [];
}

function findNextOpen(
  schedule: OpeningHoursSchedule,
  now: Date,
  startDayOffset: number
): { dayOffset: number; openMinutes: number } | null {
  const MAX_DAYS = 14;

  for (let offset = startDayOffset; offset <= MAX_DAYS; offset++) {
    const future = new Date(now.getTime() + offset * 24 * 60 * 60 * 1000);
    const p = getZonedParts(schedule.timezone, future);
    const slots = getTodaySlots(schedule, p.weekday);

    if (slots.length === 0) continue;

    const openMinutes = Math.min(...slots.map(s => hhmmToMinutes(s.open)));
    return { dayOffset: offset, openMinutes };
  }
  return null;
}

// -------- extra: 今日の open-close 表示 --------

export function getTodayOpenCloseLabelFromScheduleJson(
  openingHoursJson?: string,
  now: Date = new Date()
): string | null {
  if (!openingHoursJson) return null;

  let schedule: OpeningHoursSchedule;
  try {
    schedule = JSON.parse(openingHoursJson);
  } catch {
    return null;
  }

  if (!schedule.timezone || !schedule.weekly) return null;

  const p = getZonedParts(schedule.timezone, now);
  const slots = getTodaySlots(schedule, p.weekday);

  if (slots.length === 0) return "Closed";
    // 複数枠に対応: "Open 10:00–12:00, 13:00–16:00"
    const rangeText = slots.map(s => `${s.open}–${s.close}`).join(", ");
    return `Open ${rangeText}`;
}

// -------- main status --------

export function getLibraryStatusFromScheduleJson(
  openingHoursJson?: string,
  now: Date = import.meta.env.DEV
    ? new Date() //Test "2025-12-22T14:00:00+10:30"
    : new Date()
): LibraryStatus {

  if (!openingHoursJson) return { label: "Hours not available", isOpen: false };

  let schedule: OpeningHoursSchedule;
  try {
    schedule = JSON.parse(openingHoursJson);
  } catch {
    return { label: "Hours unavailable", isOpen: false };
  }

  if (!schedule.timezone || !schedule.weekly) {
    return { label: "Hours unavailable", isOpen: false };
  }

  const p = getZonedParts(schedule.timezone, now);
  const slots = getTodaySlots(schedule, p.weekday);

  // 今日が休館扱い
  // if (slots.length === 0) {
  //   const next = findNextOpen(schedule, now, 1);
  //   if (!next) return { label: "Closed", isOpen: false };
  //   return { label: `Closed — opens ${minutesToHHMM(next.openMinutes)}`, isOpen: false };
  // }

  // スロット内か？
  const openSlot = slots.find(s => {
    const o = hhmmToMinutes(s.open);
    const c = hhmmToMinutes(s.close);
    return p.minutes >= o && p.minutes < c;
  });

  if (openSlot) {
    return { label: `Open — until ${openSlot.close}`, isOpen: true };
  }

  // 閉館中（今日はまだ開くかもしれない）
  const laterToday = slots
    .map(s => hhmmToMinutes(s.open))
    .filter(o => o > p.minutes)
    .sort((a,b) => a-b)[0];

  if (laterToday != null) {
    return { label: `Closed — opens ${minutesToHHMM(laterToday)}`, isOpen: false };
  }

  // 今日もう開かない → 次の日へ
  const next = findNextOpen(schedule, now, 1);
  if (!next) return { label: "Closed", isOpen: false };

  return { label: `Closed — opens ${minutesToHHMM(next.openMinutes)}`, isOpen: false };
}
