// src/components/MapView.tsx
import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { LatLngExpression } from "leaflet";

import type { Library } from "../types/library";
import { createStatusIcon } from "../utils/mapIconUtils";
import { fetchLibraries, type ApiLibrary } from "../api/apiLibraries";
import { getLibraryStatusFromOSM } from "../utils/openingHoursUtils";

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
    lng: api.lng,
    address: api.address ?? "",
    suburb: api.suburb ?? "",
    postcode: api.postcode ?? "",
    category: api.category ?? "",
    websiteUrl: api.websiteUrl ?? undefined,
    hasParking: api.hasParking ?? null,
    nearestBusStop: api.nearestBusStop ?? undefined,
    walkingMinutesFromBus: api.walkingMinutesFromBus ?? undefined,

    // ★ OSM opening_hours の“原文”をそのまま使う
    openingHoursRaw: api.openingHoursRaw ?? null,

    // （任意）OSM更新日時を表示したいなら
    osmLastUpdated: api.osmLastUpdated ?? null,
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
        const status = getLibraryStatusFromOSM(lib.openingHoursRaw ?? undefined);

        // Marker のラベル（小さい表示）を timeMode に合わせて作る
        let markerLabel = "Closed";
        if (timeMode === "openTime") {
          markerLabel = status.isOpen ? "Open" : "Closed";
        } else {
          // status.label 例: "Open — until 17:30" / "Closed — opens 09:00"
          // closeTimeは "until HH:mm" が取れたらそれを表示
          const m = status.label.match(/until\s+(\d{1,2}:\d{2})/i);
          markerLabel = m?.[1] ?? (status.isOpen ? "Open" : "Closed");
        }

        const popupLine =
          lib.openingHoursRaw
            ? status.label
            : "Hours not available";

        return (
          <Marker
            key={lib.id}
            position={[lib.lat, lib.lng]}
            icon={createStatusIcon(markerLabel, status.isOpen)}
            zIndexOffset={status.isOpen ? 1000 : 0}
          >
            <Popup>
              <div className="font-bold mb-1">{lib.name}</div>

              <div className="text-xs text-slate-600 mb-1">
                {popupLine}
              </div>

              <div className="text-xs text-slate-500 mb-1">
                {lib.address}
                <br />
                {lib.suburb} {lib.postcode}
              </div>

              {lib.websiteUrl && (
                <a
                  href={lib.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 underline"
                >
                  Website
                </a>
              )}

              {/* (任意) OSM更新日時の表示：古いデータの注意書きに使える */}
              {lib.osmLastUpdated && (
                <div className="mt-2 text-[10px] text-slate-400">
                  OSM updated: {lib.osmLastUpdated}
                </div>
              )}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

export default MapView;
