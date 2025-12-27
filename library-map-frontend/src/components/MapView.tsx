// src/components/MapView.tsx
import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { LatLngExpression } from "leaflet";

import type { Library } from "../types/library";
import { createStatusIcon } from "../utils/mapIconUtils";
import { fetchLibraries, type ApiLibrary } from "../api/apiLibraries";
import {
  getLibraryStatusFromScheduleJson,
  // getTodayOpenCloseLabelFromScheduleJson,
} from "../utils/openingHoursUtils";

type TimeMode = "openTime" | "closeTime";

interface MapViewProps {
  timeMode: TimeMode;
}

const ADELAIDE_CENTER: LatLngExpression = [-34.9285, 138.6007];

function toFrontendLibrary(api: ApiLibrary): Library {
  return {
    id: api.id,
    name: api.name,
    lat: api.lat,
    lon: api.lon,
    address: api.address ?? "",

    websiteUrl: api.websiteUrl ?? undefined,
    websiteUrl2: api.websiteUrl2 ?? undefined, // Use B only if A is null or undefined

    openingHoursJson: api.openingHoursJson ?? null,
  };
}

function MapView({ timeMode }: MapViewProps) {
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

  function extractOpenClose(range?: string) {
    if (!range) return { open: null, close: null };
    const [open, close] = range.split("–");
    return { open: open ?? null, close: close ?? null };
  }

  return (
    <MapContainer
      center={ADELAIDE_CENTER}
      zoom={13}
      className="w-full h-full"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {libs.map((lib) => {
        const status = getLibraryStatusFromScheduleJson(lib.openingHoursJson ?? undefined);

        // Marker のラベル（小さい表示）
        // let markerLabel = "Closed";
        // if (timeMode === "openTime") {
        //   markerLabel = status.isOpen ? "Open" : "Closed";
        // } else {
        //   const m = status.label.match(/until\s+(\d{1,2}:\d{2})/i);
        //   markerLabel = m?.[1] ?? (status.isOpen ? "Open" : "Closed");
        // }
        const [, range] = status.label.split(" · ");
        const { open, close } = extractOpenClose(range);

        const markerLabel =
          timeMode === "openTime"
            // ? open ? `from ${open}` : "Closed"
            // : close ? `until ${close}` : "Closed";
            ? open ?? "Closed"
            : close ?? "Closed";

        return (
          <Marker
            key={lib.id}
            position={[lib.lat, lib.lon]}
            icon={createStatusIcon(markerLabel, status.isOpen)}
            zIndexOffset={status.isOpen ? 1000 : 0}
          >
            <Popup>
              <div className="font-bold mb-1">{lib.name}</div>

              {/* Open/Closed (hours)*/}
              {lib.openingHoursJson && (
                <div className="text-xs text-slate-500 mb-2">
                  {status.label}
                </div>
              )}

              {lib.address && (
                <div className="text-[11px] text-slate-500 mb-2">
                  {lib.address}
                </div>
              )}

              <div className="flex flex-col gap-1">
                {lib.websiteUrl && (
                  <a
                    href={lib.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-600 underline"
                  >
                    Website1
                  </a>
                )}

                {lib.websiteUrl2 && (
                  <a
                    href={lib.websiteUrl2}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-600 underline"
                  >
                    Website2
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

export default MapView;
