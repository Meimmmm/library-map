// src/App.tsx
import { useState } from "react";
import MapView from "./components/MapView";

type TimeMode = "openTime" | "closeTime" | "openCloseTime";

function App() {
  const [timeMode, setTimeMode] = useState<TimeMode>("openCloseTime");

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <header className="px-4 py-3 border-b bg-white flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            Adelaide Library Map
          </h1>
          <p className="text-sm text-slate-500">
            Library map showing opening times at a glance
          </p>
        </div>
      </header>

      <main className="flex-1 min-h-0">
        <div className="w-full h-full">
          <MapView timeMode={timeMode} setTimeMode={setTimeMode} />
        </div>
      </main>
    </div>
  );
}

export default App;
