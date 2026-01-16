// src/components/MapView.tsx
import { useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import type { TimeMode } from "../types/timeMode";

import { createStatusIcon } from "../utils/mapIconUtils";
import { getTodayLibraryStatus, getTodayOpenAndCloseTime } from "../utils/openingHoursUtils";
import { isSameDay, mergeYmdWithHHmm, fromYmdLocal } from "../utils/dateUtils";

import LibraryPopup from "./LibraryPopup";
import MyLocationControl from "./MyLocationControl";
import MyLocationOverlay, { type MyLocation } from "./MyLocationOverlay";
import TimeModeDropdown from "./TimeModeDropdown";

import { useLibraries } from "../hooks/useLibraries";
import { useMediaQuery } from "../hooks/useMediaQuery";

interface MapViewProps {
  timeMode: TimeMode;
  setTimeMode: (m: TimeMode) => void;
  selectedDate: string; //read only
  selectedTime: string; //read only
  now: Date; //read only?
}

// Adelaide city center
const ADELAIDE_CENTER: LatLngExpression = [-34.9285, 138.6007];

// Get marker label based on time mode
function getMarkerLabel(
  timeMode: TimeMode,
  t: { openTime: string | null; closeTime: string | null; openCloseTime: string | null }
) {
  if (timeMode === "openTime") return t.openTime ?? "Closed";
  if (timeMode === "closeTime") return t.closeTime ?? "Closed";
  return t.openCloseTime ?? "Closed";
}

function MapView({
  timeMode,
  setTimeMode,
  selectedDate,
  selectedTime,
  now
}: MapViewProps) {
  const { libs, isLoading, error } = useLibraries(); //apiLibs

  // const selectedDateTime = mergeYmdWithHHmm(selectedDate, selectedTime);
  // const isTodaySelected = isSameDay(fromYmdLocal(selectedDate), now);

  // usemenoじゃないとダメ？上じゃダメ？
  const selectedDateTime = useMemo(
    () => mergeYmdWithHHmm(selectedDate, selectedTime),
    [selectedDate, selectedTime]
  );

  const isTodaySelected = useMemo(
    () => isSameDay(fromYmdLocal(selectedDate), now),
    [selectedDate, now]
  );

  const isMobile = useMediaQuery("(max-width: 640px)");

  // const [myLocation, setMyLocation] = useState<{
  //   lat: number;
  //   lng: number;
  //   accuracy?: number;
  //   updatedAt: number;
  // } | null>(null);
  // // const [isLocating, setIsLocating] = useState(false);
  // const [locationError, setLocationError] = useState<string | null>(null);

  const [myLocation, setMyLocation] = useState<MyLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // const libs = useMemo(() => apiLibs.map(toFrontendLibrary), [apiLibs]);

  // // Responsive check
  // const isMobile = window.matchMedia("(max-width: 640px)").matches;


  if (error) {
    return <div className="p-4 text-red-600">API Error: {error}</div>;
  }

  return (
    <div className="h-full w-full relative">

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-[1200] flex items-center justify-center bg-white/40 backdrop-blur-sm">
          <div className="rounded-2xl border bg-white px-4 py-3 shadow-lg text-sm text-slate-700">
            Loading libraries…
          </div>
        </div>
      )}

      {/* Dropdown */}
      <TimeModeDropdown timeMode={timeMode} setTimeMode={setTimeMode} />

      {/* Location error */}
      {locationError && (
        <div className="absolute top-16 right-3 z-[1000] rounded-xl border bg-white/95 px-3 py-2 text-xs text-slate-700 shadow">
          {locationError}
        </div>
      )}

      {/* main area */}
      <MapContainer
        className="w-full h-full"
        center={ADELAIDE_CENTER}
        zoom={13}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MyLocationControl
          onStart={() => setLocationError(null)}
          onSuccess={(lat, lng, accuracy) =>
            setMyLocation({ lat, lng, accuracy, updatedAt: Date.now() })
          }
          onError={(msg) => setLocationError(msg)}
        />

        {myLocation && <MyLocationOverlay myLocation={myLocation} isMobile={isMobile} />}

        {libs.map((lib) => {
          const times = getTodayOpenAndCloseTime(selectedDateTime, lib.openingHoursJson ?? undefined);
          const status = getTodayLibraryStatus(selectedDateTime, lib.openingHoursJson ?? undefined);
          const markerLabel = getMarkerLabel(timeMode, times);

          // const { openTime, closeTime, openCloseTime } =
          //   getTodayOpenAndCloseTime(selectedDateTime, lib.openingHoursJson ?? undefined);
          // const status = getTodayLibraryStatus(selectedDateTime, lib.openingHoursJson ?? undefined);

          return (
            <Marker
              key={lib.id}
              position={[lib.lat, lib.lon]}
              icon={createStatusIcon(markerLabel, status.isOpen, isTodaySelected)}
              zIndexOffset={status.isOpen ? 1000 : 0}
            >
              <Popup>
                <LibraryPopup
                  lib={lib}
                  status={status}
                />
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default MapView;
