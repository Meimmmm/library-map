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

import seedLibraries from "../assets/seed-libraries.json";
import { mapSeedToLibrary } from "../utils/seedMapper";
import type { Library } from "../types/library";

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
  const { libs: apiLibs, isLoading, error } = useLibraries();

  // Transform seed data only once (performance optimization)
  const seedLibs = useMemo<Library[]>(
    () => seedLibraries.map(mapSeedToLibrary),
    []
  );

  // Display library: API after API loading is complete, seed until then
  const libraries = useMemo(() => {
    // API loading or no errors & data available → Use API
    if (!isLoading && !error && apiLibs.length > 0) {
      return apiLibs;
    }
    // Others (initial display, loading, error) → Use seed
    return seedLibs;
  }, [apiLibs, seedLibs, isLoading, error]);

  const selectedDateTime = useMemo(
    () => mergeYmdWithHHmm(selectedDate, selectedTime),
    [selectedDate, selectedTime]
  );

  const isTodaySelected = useMemo(
    () => isSameDay(fromYmdLocal(selectedDate), now),
    [selectedDate, now]
  );

  const isMobile = useMediaQuery("(max-width: 640px)");

  const [myLocation, setMyLocation] = useState<MyLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Error message (map is displayed because fallback to seed has been performed)
  if (error) {
    console.warn("API Error (using seed data):", error);
  }

  return (
    <div className="h-full w-full relative">
      {/* Loading overlay - Displaying seed and waiting for API */}
      {isLoading && (
        <div className="absolute top-3 left-3 z-[1200] rounded-xl border bg-white/95 px-3 py-2 shadow-md text-xs text-slate-600">
          Updating from server...
        </div>
      )}

      {/* API Error notification */}
      {error && (
        <div className="absolute top-3 left-3 z-[1200] rounded-xl border border-amber-200 bg-amber-50/95 px-3 py-2 shadow-md text-xs text-amber-800">
          Using cached data (API unavailable)
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

        {libraries.map((lib) => {
          const times = getTodayOpenAndCloseTime(selectedDateTime, lib.openingHoursJson ?? undefined);
          const status = getTodayLibraryStatus(selectedDateTime, lib.openingHoursJson ?? undefined);
          const markerLabel = getMarkerLabel(timeMode, times);

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
