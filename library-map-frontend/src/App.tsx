// src/App.tsx
import { useState } from "react";
import MapView from "./components/MapView";

type TimeMode = "openTime" | "closeTime";

function App() {
  const [timeMode, setTimeMode] = useState<TimeMode>("openTime");

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="px-4 py-3 border-b bg-white flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            Adelaide Library Map
          </h1>
          <p className="text-sm text-slate-500">
            Library map showing opening times at a glance
          </p>
        </div>

        {/* 🔁 「開館時間 / 閉館時間」トグル */}
        <div className="inline-flex rounded-full border bg-slate-100 overflow-hidden text-xs">
          <button
            className={
              "px-3 py-1 " +
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
              "px-3 py-1 " +
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
