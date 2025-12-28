// // src/utils/timeUtils.ts
// import type { Library, Weekday } from "../types/library";

// const WEEKDAYS: Weekday[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

// /**
//  * 今日の曜日キー（"mon" など）を返す
//  */
// export function getTodayKey(date: Date = new Date()): Weekday {
//   const jsDay = date.getDay(); // 0: Sun, 1: Mon, ...
//   // JS: 0=Sun → WEEKDAYS[6] が "sun"
//   return WEEKDAYS[(jsDay + 6) % 7];
// }

// /**
//  * "HH:mm" を現在日付の Date に変換
//  */
// function parseTimeToDate(base: Date, hhmm: string): Date {
//   const [h, m] = hhmm.split(":").map(Number);
//   const d = new Date(base);
//   d.setHours(h, m, 0, 0);
//   return d;
// }

// export type LibraryStatus = {
//   label: string;   // 表示用ラベル（例: "Open — until 17:30"）
//   isOpen: boolean; // true なら開館中
// };

// /**
//  * 図書館が「今開いているか」を判定して、表示用ラベルを返す
//  */
// export function getLibraryTodayStatus(
//   lib: Library,
//   now: Date = new Date()
// ): LibraryStatus {
//   const key = getTodayKey(now);
//   const todayHours = lib.openingHours[key];

//   if (!todayHours) {
//     return { label: "Closed", isOpen: false };
//   }

//   const openTime = parseTimeToDate(now, todayHours.open);
//   const closeTime = parseTimeToDate(now, todayHours.close);

//   if (now >= openTime && now <= closeTime) {
//     return {
//       label: `Open — until ${todayHours.close}`,
//       isOpen: true,
//     };
//   }

//   if (now < openTime) {
//     return {
//       label: `Closed — opens ${todayHours.open}`,
//       isOpen: false,
//     };
//   }

//   // now > closeTime
//   return {
//     label: "Closed",
//     isOpen: false,
//   };
// }
