// src/App.tsx
import { useState } from "react";
import MapView from "./components/MapView";
import type { TimeMode } from "./types/timeMode";
import BottomDateTimeBar from "./components/BottomDateTimeBar";

// import HeaderDateTimeChip from "./components/HeaderDateTimeChip";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function App() {
  // Use this time and date as the basis for "today"
  const now = new Date();

  const [timeMode, setTimeMode] = useState<TimeMode>("openCloseTime");

  // YYYY-MM-DD
  const [selectedDate, setSelectedDate] = useState(() => {
    return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
  });

  // HH:MM
  const [selectedTime, setSelectedTime] = useState(() => {
    return `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
  });

  console.log("selectedDate:" + selectedDate + ", selectedTime:" + selectedTime); // + ", now: " + now

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* header */}
      <header className="px-4 py-3 border-b bg-white flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Title */}
        <div>
          <h1 className="text-xl font-bold text-slate-800">Adelaide Library Map</h1>
          <p className="text-sm text-slate-500">Opening times at a glance</p>
        </div>
      </header>

      {/* main content */}
<main className="flex-1 min-h-0 relative">
  <div className="w-full h-full">
    <MapView
      timeMode={timeMode}
      setTimeMode={setTimeMode}
      selectedDate={selectedDate}
      selectedTime={selectedTime}
      now={now}
    />
  </div>

  {/* Bottom floating bar */}
  <div className="absolute inset-x-0 bottom-8 z-[1500] flex justify-center px-3">
    <BottomDateTimeBar
      selectedDate={selectedDate}
      setSelectedDate={setSelectedDate}
      selectedTime={selectedTime}
      setSelectedTime={setSelectedTime}
      onReset={() => {
        // Use the same "now" reset logic you already have
        const d = new Date();
        const ymd = d.toISOString().split("T")[0];
        const hh = String(d.getHours()).padStart(2, "0");
        const mm = String(d.getMinutes()).padStart(2, "0");
        setSelectedDate(ymd);
        setSelectedTime(`${hh}:${mm}`); // (30分丸めしたいならここで round)
      }}
    />
  </div>
</main>

    </div>
  );
}

export default App;
