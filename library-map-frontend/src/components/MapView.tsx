// src/components/MapView.tsx
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { LatLngExpression } from "leaflet";

import libraries from "../mock/libraries.json";
import type { Library, Weekday } from "../types/library";
import { getLibraryTodayStatus, getTodayKey } from "../utils/timeUtils";
import { createStatusIcon } from "../utils/mapIconUtils";

type TimeMode = "openTime" | "closeTime";

interface MapViewProps {
  timeMode: TimeMode;
}

const ADELAIDE_CENTER: LatLngExpression = [-34.9285, 138.6007];

function MapView({ timeMode }: MapViewProps) {
  const libs = libraries as Library[];
  const todayKey: Weekday = getTodayKey();

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
        const status = getLibraryTodayStatus(lib);
        const today = lib.openingHours[todayKey];

        let label = "Closed";
        if (today) {
          label = timeMode === "openTime" ? today.open : today.close;
        }

        // Popup 用：開館時間の範囲（例: "10:00 - 16:00"）
        const todayRangeText = today
            ? `${today.open} - ${today.close}`
            : "Closed today";

        return (
          <Marker
            key={lib.id}
            position={[lib.lat, lib.lng]}
            icon={createStatusIcon(label, status.isOpen)}
            zIndexOffset={status.isOpen ? 1000 : 0}   // 開館中の図書館を手前に表示
          >
            <Popup>
              <div className="font-bold mb-1">{lib.name}</div>

              <div className="text-xs text-slate-600 mb-1">
                {status.isOpen ? "Open now" : "Closed"} ・ {todayRangeText}
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
                  className="text-xs text-blue-600 underline"
                >
                  Website
                </a>
              )}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

export default MapView;
