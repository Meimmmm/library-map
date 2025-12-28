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

function getTodaySlots(schedule: OpeningHoursSchedule, weekday: Weekday): TimeRange[] {
  //  exceptions は今は適用しない（完全無視）
  return schedule.weekly?.[weekday] ?? [];
}


// -------- tiny shared core (最小の共通化) --------

type TodayContext = {
  schedule: OpeningHoursSchedule;
  p: ReturnType<typeof getZonedParts>;
  slots: TimeRange[];
};

function getTodayContext(now: Date, openingHoursJson?: string): TodayContext | null {
  if (!openingHoursJson) return null;

  let schedule: OpeningHoursSchedule; 
  try {
    schedule = JSON.parse(openingHoursJson);  //元データ
  } catch {
    return null;
  }

  if (!schedule.timezone || !schedule.weekly) return null;

  const p = getZonedParts(schedule.timezone, now);
  const slots = getTodaySlots(schedule, p.weekday); // 今日の開館時間帯リスト ex   { open: "10:00", close: "12:00" }, { open: "13:00", close: "16:00" }

  return { schedule, p, slots };
}

// -------- marker用：今日の最初のopen / 最後のclose --------
// open: "10:00",
// close: "18:00",
// openClose: "10:00–18:00"
export function getTodayOpenAndCloseTime(
  now: Date,
  openingHoursJson?: string | undefined,
): { openTime: string | null; closeTime: string | null; openCloseTime: string | null } {

  const ctx = getTodayContext(now, openingHoursJson); //今日の営業時間情報だけを取り出す

  //今日が Closed だったり、JSON が壊れてたら null
  if (!ctx) return { openTime: null, closeTime: null, openCloseTime: null };

  const { slots } = ctx;
  //空配列 = 今日は営業なし かどうか
  if (slots.length === 0) return { openTime: null, closeTime: null, openCloseTime: null };

  const firstOpen = [...slots]  //元の配列を壊さないためのコピー
    .map((s) => s.open)
    .sort((a, b) => hhmmToMinutes(a) - hhmmToMinutes(b))[0];  //分 → 数値にして 時間順にソート[0]一番早い open time

  const lastClose = [...slots]
    .map((s) => s.close)
    .sort((a, b) => hhmmToMinutes(b) - hhmmToMinutes(a))[0];

  return {
    openTime: firstOpen ?? null,
    closeTime: lastClose ?? null,
    openCloseTime: firstOpen && lastClose ? `${firstOpen}–${lastClose}` : null,
  };
}

// -------- main status（Popup / icon色 / zIndexなど） --------
//   label: "Open now · 10:00–18:00",
//   isOpen: true
//   ※slots: [ { open: "10:00", close: "12:00" }, { open: "13:00", close: "16:00" } ]

export function getTodayLibraryStatus(
  now: Date,
  openingHoursJson?: string | undefined,
): LibraryStatus {
  const ctx = getTodayContext(now, openingHoursJson);

  if (!ctx) return { label: "Hours unavailable", isOpen: false };

  const { p, slots } = ctx;

  // 今日スロットなし
  if (slots.length === 0) {
    return { label: "Closed today", isOpen: false };
  }

  const rangeText = slots.map((s) => `${s.open}–${s.close}`).join(", ");

  const isOpenNow = slots.some((s) => {
    const o = hhmmToMinutes(s.open);
    const c = hhmmToMinutes(s.close);
    return p.minutes >= o && p.minutes < c;
  });

  // "mon" -> "Mon"
  const weekdayLabel = p.weekday.charAt(0).toUpperCase() + p.weekday.slice(1);
  const label = isOpenNow ? `Open now · ${weekdayLabel} ${rangeText}` 
                          : `Closed now · ${weekdayLabel} ${rangeText}`;
  return { label, isOpen: isOpenNow };
}


// // -------- extra: 今日の open-close 表示（必要ならUIで使う） --------

// export function getTodayOpenToCloseLabel(
//   now: Date,
//   openingHoursJson?: string | undefined,
// ): string | null {
//   const ctx = getTodayContext(now, openingHoursJson);
//   if (!ctx) return null;

//   const { slots } = ctx;
//   if (slots.length === 0) return "Closed";

//   // 複数枠に対応: "10:00–12:00, 13:00–16:00"
//   return slots.map((s) => `${s.open}–${s.close}`).join(", ");
// }

