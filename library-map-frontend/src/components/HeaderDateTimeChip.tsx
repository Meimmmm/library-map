// // src/components/HeaderDateTimeChip.tsx
// import { useEffect, useMemo, useRef, useState } from "react";

// type Props = {
//   selectedDate: string; // YYYY-MM-DD
//   setSelectedDate: (v: string) => void;

//   selectedTime: string; // HH:MM (24h)
//   setSelectedTime: (v: string) => void;
// };

// // Pad number to two digits (e.g. 3 -> "03")
// function pad2(n: number) {
//   return String(n).padStart(2, "0");
// }

// // Convert "YYYY-MM-DD" string to a local Date object (avoids timezone shift issues)
// function fromYmdLocal(ymd: string) {
//   const [y, m, d] = ymd.split("-").map(Number);
//   return new Date(y, (m ?? 1) - 1, d ?? 1);
// }

// // Build time options with fixed minute steps (default: 30 minutes)
// function buildTimeOptions(stepMinutes = 30) {
//   const out: string[] = [];
//   for (let h = 0; h < 24; h++) {
//     for (let m = 0; m < 60; m += stepMinutes) {
//       out.push(`${pad2(h)}:${pad2(m)}`);
//     }
//   }
//   return out;
// }

// // Round an arbitrary "HH:MM" time to the nearest step (used for initial/reset values)
// function roundTimeToStep(hhmm: string, stepMinutes = 30) {
//   const [h, m] = hhmm.split(":").map(Number);
//   const minutes = h * 60 + m;
//   const rounded = Math.round(minutes / stepMinutes) * stepMinutes;
//   const clamped = ((rounded % (24 * 60)) + (24 * 60)) % (24 * 60); // 0..1439
//   const rh = Math.floor(clamped / 60);
//   const rm = clamped % 60;
//   return `${pad2(rh)}:${pad2(rm)}`;
// }

// const TIME_OPTIONS = buildTimeOptions(30);

// export default function HeaderDateTimeChip({
//   selectedDate,
//   setSelectedDate,
//   selectedTime,
//   setSelectedTime,
// }: Props) {
//   const dateRef = useRef<HTMLInputElement | null>(null);
//   const timeWrapRef = useRef<HTMLDivElement | null>(null);
//   const listRef = useRef<HTMLDivElement | null>(null);

//   // Whether the custom time dropdown is open
//   const [isTimeOpen, setIsTimeOpen] = useState(false);

//   // Detect touch-capable devices (iOS / Android)
//   const isTouch =
//     typeof window !== "undefined" &&
//     ("ontouchstart" in window || navigator.maxTouchPoints > 0);

//   // Format date label like "Wed, 28 Jan"
//   const formattedDate = useMemo(() => {
//     const d = fromYmdLocal(selectedDate);
//     return new Intl.DateTimeFormat("en-AU", {
//       weekday: "short",
//       day: "2-digit",
//       month: "short",
//     }).format(d);
//   }, [selectedDate]);

//   // Open native date picker (PC browsers only)
//   const openDatePicker = () => {
//     const el = dateRef.current;
//     if (!el) return;
//     if (typeof el.showPicker === "function") el.showPicker();
//     else {
//       el.focus();
//       el.click();
//     }
//   };

//   // Reset date and time to "now"
//   const resetToNow = () => {
//     const now = new Date();
//     const ymd = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(
//       now.getDate()
//     )}`;
//     const hhmm = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;

//     setSelectedDate(ymd);
//     setSelectedTime(roundTimeToStep(hhmm, 30));
//     setIsTimeOpen(false);
//   };

//   // Close time dropdown on outside click or ESC key
//   useEffect(() => {
//     function onDocMouseDown(e: MouseEvent) {
//       if (!isTimeOpen) return;
//       const wrap = timeWrapRef.current;
//       if (!wrap) return;
//       if (e.target instanceof Node && !wrap.contains(e.target)) {
//         setIsTimeOpen(false);
//       }
//     }
//     function onKeyDown(e: KeyboardEvent) {
//       if (e.key === "Escape") setIsTimeOpen(false);
//     }
//     document.addEventListener("mousedown", onDocMouseDown);
//     document.addEventListener("keydown", onKeyDown);
//     return () => {
//       document.removeEventListener("mousedown", onDocMouseDown);
//       document.removeEventListener("keydown", onKeyDown);
//     };
//   }, [isTimeOpen]);

//   // When opening the dropdown, scroll to the currently selected time
//   useEffect(() => {
//     if (!isTimeOpen) return;
//     const idx = TIME_OPTIONS.indexOf(selectedTime);
//     if (idx < 0 || !listRef.current) return;
//     listRef.current.scrollTop = Math.max(0, idx * 36 - 36 * 3);
//   }, [isTimeOpen, selectedTime]);

//   return (
//     <div className="flex items-center">
//       {/* Date chip */}
//       <div className="relative">
//         <button
//           type="button"
//           onClick={() => {
//             if (!isTouch) openDatePicker(); // PC only
//           }}
//           className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm text-slate-700 shadow-sm hover:bg-slate-50"
//           aria-label="Select date"
//         >
//           <span aria-hidden>🗓️</span>
//           <span className="font-medium">{formattedDate}</span>
//         </button>

//         {/* Mobile: transparent input overlay to trigger native date picker */}
//         {isTouch && (
//           <input
//             type="date"
//             value={selectedDate}
//             onChange={(e) => setSelectedDate(e.target.value)}
//             aria-label="Select date"
//             className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
//           />
//         )}
//       </div>

//       {/* Time chip + custom dropdown */}
//       <div className="relative -ml-px" ref={timeWrapRef}>
//         <button
//           type="button"
//           onClick={() => setIsTimeOpen((v) => !v)}
//           className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-2 text-sm text-slate-700 shadow-sm hover:bg-slate-50"
//         >
//           <span aria-hidden>🕒</span>
//           <span className="font-medium tabular-nums">{selectedTime}</span>
//         </button>

//         {isTimeOpen && (
//           <div className="absolute right-0 mt-2 w-56 rounded-2xl border bg-white shadow-lg z-[3000] overflow-hidden">
//             <div className="max-h-64 overflow-auto py-1" ref={listRef}>
//               {TIME_OPTIONS.map((t) => {
//                 const active = t === selectedTime;
//                 return (
//                   <button
//                     key={t}
//                     type="button"
//                     onClick={() => {
//                       setSelectedTime(t);
//                       setIsTimeOpen(false);
//                     }}
//                     className={[
//                       "w-full px-3 py-2 text-left text-sm tabular-nums",
//                       active
//                         ? "bg-slate-100 font-semibold text-slate-900"
//                         : "text-slate-700 hover:bg-slate-50",
//                     ].join(" ")}
//                     style={{ height: 36 }}
//                   >
//                     {t}
//                   </button>
//                 );
//               })}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Reset button */}
//       <button
//         type="button"
//         onClick={resetToNow}
//         title="Reset to now"
//         aria-label="Reset to now"
//         className="inline-flex h-10 w-10 items-center justify-center rounded-full border bg-white text-slate-600 shadow-sm hover:bg-slate-50 -ml-px"
//       >
//         ↺
//       </button>

//       {/* PC-only hidden date input */}
//       {!isTouch && (
//         <input
//           ref={dateRef}
//           type="date"
//           value={selectedDate}
//           onChange={(e) => setSelectedDate(e.target.value)}
//           className="sr-only"
//           tabIndex={-1}
//           aria-hidden="true"
//         />
//       )}
//     </div>
//   );
// }
