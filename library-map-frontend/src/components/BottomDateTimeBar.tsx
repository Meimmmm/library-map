import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
    selectedDate: string; // YYYY-MM-DD
    setSelectedDate: (v: string) => void;

    selectedTime: string; // HH:MM (24h)
    setSelectedTime: (v: string) => void;

    onReset: () => void;
};

function pad2(n: number) {
    return String(n).padStart(2, "0");
}

function fromYmdLocal(ymd: string) {
    const [y, m, d] = ymd.split("-").map(Number);
    return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function buildTimeOptions(stepMinutes = 30) {
    const out: string[] = [];
    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += stepMinutes) out.push(`${pad2(h)}:${pad2(m)}`);
    }
    return out;
}

const TIME_OPTIONS = buildTimeOptions(30);

export default function BottomDateTimeBar({
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    onReset,
}: Props) {
    const dateInputRef = useRef<HTMLInputElement | null>(null);
    const timeWrapRef = useRef<HTMLDivElement | null>(null);
    const listRef = useRef<HTMLDivElement | null>(null);

    const [isTimeOpen, setIsTimeOpen] = useState(false);

    const formattedDate = useMemo(() => {
        const d = fromYmdLocal(selectedDate);
        return new Intl.DateTimeFormat("en-AU", {
            weekday: "short",
            day: "2-digit",
            month: "short",
        }).format(d);
    }, [selectedDate]);

    const openDatePicker = () => {
        const el = dateInputRef.current;
        if (!el) return;
        if (typeof el.showPicker === "function") el.showPicker();
        else {
            el.focus();
            el.click();
        }
    };

    // close time dropdown (outside / ESC)
    useEffect(() => {
        function onDocMouseDown(e: MouseEvent) {
            if (!isTimeOpen) return;
            const wrap = timeWrapRef.current;
            if (!wrap) return;
            if (e.target instanceof Node && !wrap.contains(e.target)) setIsTimeOpen(false);
        }
        function onKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") setIsTimeOpen(false);
        }
        document.addEventListener("mousedown", onDocMouseDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("mousedown", onDocMouseDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [isTimeOpen]);

    // scroll list to selectedTime when opened (Always based on 12:00)
    useEffect(() => {
        if (!isTimeOpen || !listRef.current) return;

        const idx = TIME_OPTIONS.indexOf("12:00");
        if (idx < 0) return;

        listRef.current.scrollTop = idx * 36 - 36 * 3;
    }, [isTimeOpen]);


    return (
        // Add ref here (includes dropdown + bar)
        <div className="relative" ref={timeWrapRef}>
            {/* Time dropdown - Placed outside */}
            {isTimeOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 rounded-2xl border border-slate-300 bg-white shadow-2xl z-[9999] overflow-hidden">
                    <div
                        ref={listRef}
                        className="max-h-64 overflow-auto py-1 bg-white"
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
                                        //   console.log("[BottomDateTimeBar] selectedTime =", t);
                                        setSelectedTime(t);
                                        setIsTimeOpen(false);
                                    }}
                                    className={[
                                        "w-full px-3 py-2 text-left text-base font-medium tabular-nums",
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
                </div>
            )}

            {/* The bar */}
            <div className="flex items-stretch overflow-hidden rounded-2xl border bg-white/95 shadow-lg backdrop-blur">
                {/* Date segment */}
                <button
                    type="button"
                    onClick={openDatePicker}
                    className="relative flex items-center gap-2 px-4 py-3 text-sm text-slate-800"
                    aria-label="Select date"
                >
                    <span aria-hidden>🗓️</span>
                    <span className="font-medium">{formattedDate}</span>

                    <input
                        ref={dateInputRef}
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        aria-label="Select date"
                        className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
                    />
                </button>

                <div className="w-px bg-slate-200/80" />

                {/* Time segment */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setIsTimeOpen((v) => !v)}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-slate-800"
                        aria-label="Select time"
                    >
                        <span aria-hidden>🕒</span>
                        <span className="font-medium tabular-nums">{selectedTime}</span>
                    </button>
                </div>

                <div className="w-px bg-slate-200/80" />

                {/* Reset segment */}
                <button
                    type="button"
                    onClick={() => {
                        setIsTimeOpen(false);
                        onReset();
                    }}
                    className="flex items-center justify-center px-4 py-3 text-slate-700 hover:bg-slate-50"
                    aria-label="Reset to now"
                    title="Reset to now"
                >
                    ↺
                </button>
            </div>
        </div>
    );

}