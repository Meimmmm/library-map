// src/components/HeaderDateTimeChip.tsx
import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  selectedDate: string; // YYYY-MM-DD
  setSelectedDate: (v: string) => void;

  selectedTime: string; // HH:MM (24h)
  setSelectedTime: (v: string) => void;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

// "YYYY-MM-DD" をローカル日付として Date 化（TZズレ回避）
function fromYmdLocal(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

// 30分刻みの候補を作る
function buildTimeOptions(stepMinutes = 30) {
  const out: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += stepMinutes) {
      out.push(`${pad2(h)}:${pad2(m)}`);
    }
  }
  return out;
}

// 任意の "HH:MM" を 30分刻みに丸める（初期値やReset用）
function roundTimeToStep(hhmm: string, stepMinutes = 30) {
  const [h, m] = hhmm.split(":").map(Number);
  const minutes = h * 60 + m;
  const rounded = Math.round(minutes / stepMinutes) * stepMinutes;
  const clamped = ((rounded % (24 * 60)) + (24 * 60)) % (24 * 60); // 0..1439
  const rh = Math.floor(clamped / 60);
  const rm = clamped % 60;
  return `${pad2(rh)}:${pad2(rm)}`;
}

const TIME_OPTIONS = buildTimeOptions(30);

export default function HeaderDateTimeChip({
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
}: Props) {
  const dateRef = useRef<HTMLInputElement | null>(null);
  const timeWrapRef  = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  // Time dropdown (30-min steps)
  const [isTimeOpen, setIsTimeOpen] = useState(false);

  // outside click to close time dropdown
  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!isTimeOpen) return;
      const wrap = timeWrapRef.current;
      if (!wrap) return;
      if (e.target instanceof Node && !wrap.contains(e.target)) setIsTimeOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [isTimeOpen]);

  const formattedDate = useMemo(() => {
    const d = fromYmdLocal(selectedDate);
    // "Wed, 28 Jan"
    return new Intl.DateTimeFormat("en-AU", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    }).format(d);
  }, [selectedDate]);

  const openDatePicker = () => {
    const el = dateRef.current;
    if (!el) return;
    if (typeof el.showPicker === "function") {
      el.showPicker();
    } else {
      el.focus();
      el.click();
    }
  };

  // const openTimePicker = () => {
  //   const el = timeRef.current;
  //   if (!el) return;
  //   if (typeof el.showPicker === "function") {
  //     el.showPicker();
  //   } else {
  //     el.focus();
  //     el.click();
  //   }
  // };

  const resetToNow = () => {
    const now = new Date();
    const ymd = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
    const hhmm = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;

    setSelectedDate(ymd);
    setSelectedTime(roundTimeToStep(hhmm, 30));
    setIsTimeOpen(false);
  };

  // close by outside click / ESC
  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!isTimeOpen) return;
      const wrap = timeWrapRef.current;
      if (!wrap) return;
      if (e.target instanceof Node && !wrap.contains(e.target)) setIsTimeOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (!isTimeOpen) return;
      if (e.key === "Escape") setIsTimeOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isTimeOpen]);

  // when opening, scroll list to current selectedTime
  useEffect(() => {
    if (!isTimeOpen) return;
    const idx = TIME_OPTIONS.indexOf(selectedTime);
    const list = listRef.current;
    if (!list) return;
    if (idx < 0) return;

    // approx: each row 36px
    const rowH = 36;
    list.scrollTop = Math.max(0, idx * rowH - rowH * 3);
  }, [isTimeOpen, selectedTime]);

  return (
    <div className="flex items-center">
      {/* Date chip */}
      <button
        type="button"
        onClick={openDatePicker}
        className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm text-slate-700 shadow-sm hover:bg-slate-50"
        aria-label="Select date"
      >
        <span aria-hidden>🗓️</span>
        <span className="font-medium">{formattedDate}</span>
      </button>

      {/* Time chip + dropdown */}
      <div className="relative -ml-px" ref={timeWrapRef}>
        <button
          type="button"
          onClick={() => setIsTimeOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-2 text-sm text-slate-700 shadow-sm hover:bg-slate-50"
          aria-label="Select time"
        >
          <span aria-hidden>🕒</span>
          <span className="font-medium tabular-nums">{selectedTime}</span>
        </button>

        {isTimeOpen && (
          <div className="absolute right-0 mt-2 w-56 rounded-2xl border bg-white shadow-lg z-[3000] overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b">
              <div className="text-sm font-medium text-slate-800">Time</div>
              <button
                type="button"
                onClick={() => setIsTimeOpen(false)}
                className="text-sm text-slate-600 hover:underline"
              >
                Close
              </button>
            </div>

            {/* Scroll list */}
            <div
              ref={listRef}
              className="max-h-64 overflow-auto py-1"
              role="listbox"
              aria-label="Time options"
            >
              {TIME_OPTIONS.map((t) => {
                const active = t === selectedTime;
                return (
                  <button
                    key={t}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      setSelectedTime(t);
                      setIsTimeOpen(false); // クリック即確定（Setボタン方式にしたければここ外す）
                    }}
                    className={[
                      "w-full px-3 py-2 text-left text-sm tabular-nums",
                      "hover:bg-slate-50",
                      active ? "bg-slate-100 font-semibold text-slate-900" : "text-slate-700",
                    ].join(" ")}
                    style={{ height: 36 }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>

            {/* Optional footer */}
            <div className="px-3 py-2 border-t flex items-center justify-between">
              <div className="text-xs text-slate-500"> </div>
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  const hhmm = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
                  setSelectedTime(roundTimeToStep(hhmm, 30));
                }}
                className="text-xs text-slate-700 hover:underline"
              >
                Now
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reset */}
      <button
        type="button"
        onClick={resetToNow}
        title="Reset to now"
        aria-label="Reset to now"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border bg-white text-slate-600 shadow-sm hover:bg-slate-50 -ml-px"
      >
        ↺
      </button>

      {/* Hidden date input (native calendar) */}
      <input
        ref={dateRef}
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  );
}