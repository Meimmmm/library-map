// src/App.tsx
import { useState } from "react";
import MapView from "./components/MapView";

type TimeMode = "openTime" | "closeTime" | "openCloseTime";

function App() {
  const [timeMode, setTimeMode] = useState<TimeMode>("openTime");

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="px-4 py-3 border-b bg-white flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            Adelaide Library Map
          </h1>
          <p className="text-sm text-slate-500">
            Library map showing opening times at a glance
          </p>
        </div>

        {/* 🔁 開館時間トグル */}
        <div className="inline-flex flex-col sm:flex-row rounded-xl border bg-slate-100 overflow-hidden text-xs w-full sm:w-auto">
          <button
            className={
              "px-3 py-2 text-left sm:text-center " +
              (timeMode === "openCloseTime"
                ? "bg-slate-800 text-white"
                : "text-slate-700")
            }
            onClick={() => setTimeMode("openCloseTime")}
          >
            Opening Closing hours
          </button>

          <button
            className={
              "px-3 py-2 text-left sm:text-center " +
              (timeMode === "openTime"
                ? "bg-slate-800 text-white"
                : "text-slate-700")
            }
            onClick={() => setTimeMode("openTime")}
          >
            Opening hours
          </button>

          <button
            className={
              "px-3 py-2 text-left sm:text-center " +
              (timeMode === "closeTime"
                ? "bg-slate-800 text-white"
                : "text-slate-700")
            }
            onClick={() => setTimeMode("closeTime")}
          >
            Closing hours
          </button>

        </div>
      </header>

      <main className="p-4">
        <div className="w-full h-[84vh] rounded-xl border border-slate-300 bg-white overflow-hidden">
          {/* ← 選択中の timeMode を MapView に渡す */}
          <MapView timeMode={timeMode} />
        </div>
      </main>
    </div>
  );
}

export default App;
