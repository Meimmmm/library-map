// src/components/MapView.tsx
import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { LatLngExpression } from "leaflet";

import type { Library } from "../types/library";
import { createStatusIcon } from "../utils/mapIconUtils";
import { fetchLibraries, type ApiLibrary } from "../api/apiLibraries";
import { getTodayLibraryStatus, getTodayOpenAndCloseTime } from "../utils/openingHoursUtils";
import { getGoogleMapsSearchUrl } from "../utils/mapLinkUtils";

type TimeMode = "openTime" | "closeTime" | "openCloseTime"; //Go types

interface MapViewProps {
  timeMode: TimeMode;
  setTimeMode: (m: TimeMode) => void;
}

const ADELAIDE_CENTER: LatLngExpression = [-34.9285, 138.6007];

const modeLabel: Record<TimeMode, string> = {
  openCloseTime: "Open-Close Time",
  openTime: "Open Time",
  closeTime: "Close Time",
};

function toFrontendLibrary(api: ApiLibrary): Library {
  return {
    id: api.id,
    lat: api.lat,
    lon: api.lon,
    GooglePlaceId: api.GooglePlaceId,

    name: api.name,
    address: api.address ?? "",
    websiteUrl: api.websiteUrl ?? undefined,
    websiteUrl2: api.websiteUrl2 ?? undefined,
    openingHoursJson: api.openingHoursJson ?? null, //
  };
}

const now = import.meta.env.DEV
  // ? new Date("2025-12-29T13:00:00+10:30")  // for testing
  ? new Date()
  : new Date();

function MapView({ timeMode, setTimeMode }: MapViewProps) {
  const [apiLibs, setApiLibs] = useState<ApiLibrary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLibraries()
      .then(setApiLibs)
      .catch((e) => setError(e.message));
  }, []);

  const libs = useMemo(() => apiLibs.map(toFrontendLibrary), [apiLibs]);

  if (error) {
    return <div className="p-4 text-red-600">API Error: {error}</div>;
  }

  return (
    <div className="h-full w-full relative">
      {/* Floating dropdown (mobile-first). If you want to display it on PC, remove sm:hidden */}
      <div className="absolute top-3 right-3 z-[1000]">
        <details className="group relative inline-block">
          <summary className="list-none cursor-pointer select-none rounded-full border bg-white/95 backdrop-blur px-3 py-2 shadow-md inline-flex items-center gap-2 w-max">
            <span className="text-sm font-medium text-slate-800 max-w-[120px] truncate">
              {modeLabel[timeMode]}
            </span>
            <span className="text-slate-500 transition-transform group-open:rotate-180">▾</span>
          </summary>

          {/* Menu should be right-aligned and have a fixed width (if necessary) */}
          <div className="absolute right-0 mt-2 w-40 rounded-2xl border bg-white overflow-hidden shadow-lg">
            {(Object.keys(modeLabel) as TimeMode[]).map((m) => (
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
                {modeLabel[m]}
              </button>
            ))}
          </div>
        </details>
      </div>
      
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

        {libs.map((lib) => {
          const { openTime, closeTime, openCloseTime } = 
            getTodayOpenAndCloseTime(now, lib.openingHoursJson ?? undefined);
          const status = getTodayLibraryStatus(now, lib.openingHoursJson ?? undefined);
          const mapUrl = getGoogleMapsSearchUrl({
            name: lib.name,
            address: lib.address,
          });

          let markerLabel = "Closed";
          if (timeMode === "openTime") markerLabel = openTime ?? "Closed";
          else if (timeMode === "closeTime") markerLabel = closeTime ?? "Closed";
          else markerLabel = openCloseTime ?? "Closed";

          return (
            <Marker
              key={lib.id}
              position={[lib.lat, lib.lon]}
              icon={createStatusIcon(markerLabel, status.isOpen)}
              zIndexOffset={status.isOpen ? 1000 : 0}
            >
              <Popup>
                <div className="font-bold mb-1">{lib.name}</div>

                {lib.openingHoursJson && (
                  <div className="text-xs text-slate-500 mb-2">{status.label}</div>
                )}

                {lib.address && (
                  <div className="text-[11px] text-slate-500 mb-2">{lib.address}</div>
                )}

                {/* links */}
                <div className="flex flex-col gap-1">
                  {lib.websiteUrl && (
                    <a
                      href={lib.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-[11px] text-blue-600 hover:underline"
                    >
                      Library Website
                    </a>
                  )}

                  {lib.websiteUrl2 && (
                    <a
                      href={lib.websiteUrl2}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-[11px] text-blue-600 hover:underline"
                    >
                      Opening Hours Web Page
                    </a>
                  )}

                  {mapUrl && (
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-[11px] text-slate-500 mb-2 hover:underline"
                    >
                      GoogleMap📍
                    </a>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default MapView;
