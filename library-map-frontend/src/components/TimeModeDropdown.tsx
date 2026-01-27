
import type { TimeMode } from "../types/timeMode";
import { TIME_MODE_LABEL } from "../types/timeMode";

export default function TimeModeDropdown({
  timeMode,
  setTimeMode,
}: {
  timeMode: TimeMode;
  setTimeMode: (m: TimeMode) => void;
}) {
  return (
    // <div className="absolute top-3 right-3 z-[1000]">
      <details className="group relative inline-block">
        <summary className="list-none cursor-pointer select-none rounded-full border bg-white/95 backdrop-blur px-3 py-2 shadow-md inline-flex items-center gap-2 w-max">
          <span className="text-sm font-medium text-slate-800 max-w-[120px] truncate">
            {TIME_MODE_LABEL[timeMode]}
          </span>
          <span className="text-slate-500 transition-transform group-open:rotate-180">▾</span>
        </summary>

        <div className="absolute right-0 mt-2 w-40 rounded-2xl border bg-white overflow-hidden shadow-lg">
          {(Object.keys(TIME_MODE_LABEL) as TimeMode[]).map((m) => (
            <button
              key={m}
              type="button"
              className={
                "w-full px-3 py-2 text-left text-sm " +
                (timeMode === m
                  ? "bg-slate-800 text-white"
                  : "text-slate-700 hover:bg-slate-50")
              }
              onClick={() => setTimeMode(m)}
            >
              {TIME_MODE_LABEL[m]}
            </button>
          ))}
        </div>
      </details>
    // </div>
  );
}
