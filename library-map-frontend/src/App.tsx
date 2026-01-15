// src/App.tsx
import { useState } from "react";
import MapView from "./components/MapView";
import type { TimeMode } from "./types/timeMode";
import HeaderDateTimeChip from "./components/HeaderDateTimeChip";

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

        {/* Right: single pill date button + hidden input */}
        <HeaderDateTimeChip
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
        />
      </header>

      {/* main content */}
      <main className="flex-1 min-h-0">
        <div className="w-full h-full">
          <MapView
            timeMode={timeMode}
            setTimeMode={setTimeMode}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            now={now}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
