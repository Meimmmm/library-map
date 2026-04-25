// src/App.tsx
import { useState } from "react";
import MapView from "./components/MapView";
import type { TimeMode } from "./types/timeMode";
import BottomDateTimeBar from "./components/BottomDateTimeBar";
import { toYmdLocal, toHHmmLocal } from "./utils/dateUtils";

function App() {
  // Use this time and date as the basis for "today"
  const now = new Date();

  // These states represent user-selected date/time (not auto-updated "current time").
  // They are initialized once from "now" on first render, and then only updated via setState.
  const [timeMode, setTimeMode] = useState<TimeMode>("openCloseTime");

  // YYYY-MM-DD
  const [selectedDate, setSelectedDate] = useState(() => {
    return toYmdLocal(now);
  });

  // HH:MM
  const [selectedTime, setSelectedTime] = useState(() => {
    return toHHmmLocal(now);
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
        <div className="absolute inset-x-0 bottom-6 z-[1500] flex justify-center px-3">
          <BottomDateTimeBar
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedTime={selectedTime}
            setSelectedTime={setSelectedTime}
            onReset={() => {
              //Reset to current local date and time using a single Date instance
              const now = new Date();
              setSelectedDate(toYmdLocal(now));
              setSelectedTime(toHHmmLocal(now));
            }}
          />
        </div>
      </main>

    </div>
  );
}

export default App;
