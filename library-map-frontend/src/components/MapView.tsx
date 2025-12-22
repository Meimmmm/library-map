// src/components/MapView.tsx
import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { LatLngExpression } from "leaflet";

import type { Library, Weekday } from "../types/library";
import { getLibraryTodayStatus, getTodayKey } from "../utils/timeUtils";
import { createStatusIcon } from "../utils/mapIconUtils";
import { fetchLibraries, type ApiLibrary } from "../api/libraries";
////import libraries from "../mock/libraries.json";

type TimeMode = "openTime" | "closeTime";

interface MapViewProps {
  timeMode: TimeMode;
}

const ADELAIDE_CENTER: LatLngExpression = [-34.9285, 138.6007];

function toFrontendLibrary(api: ApiLibrary): Library {
  // openingHoursJson（文字列）→ openingHours（オブジェクト）に変換
  let openingHours: Library["openingHours"] = {
    mon: null, tue: null, wed: null, thu: null, fri: null, sat: null, sun: null,
  };

  if (api.openingHoursJson) {
    try {
      openingHours = JSON.parse(api.openingHoursJson);
    } catch {
      // JSON壊れてても落ちないように（全部Closed扱い）
    }
  }

  return {
    id: api.id,
    name: api.name,
    lat: api.lat,
    lng: api.lng,
    address: api.address,
    suburb: api.suburb,
    postcode: api.postcode,
    category: api.category,
    websiteUrl: api.websiteUrl ?? undefined,
    hasParking: api.hasParking ?? null,
    nearestBusStop: api.nearestBusStop ?? undefined,
    walkingMinutesFromBus: api.walkingMinutesFromBus ?? undefined,
    openingHours,
  };
}

function MapView({ timeMode }: MapViewProps) {
  const [apiLibs, setApiLibs] = useState<ApiLibrary[]>([]); // Raw data from API
  const [error, setError] = useState<string | null>(null);

  const todayKey: Weekday = getTodayKey();

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
        const status = getLibraryTodayStatus(lib);
        const today = lib.openingHours[todayKey];

        let label = "Closed";
        if (today) { //今日の営業時間データがある場合
          label = timeMode === "openTime" ? today.open : today.close;
        }

        const todayRangeText = today ? `${today.open} - ${today.close}` : "Closed today";

        return (
          <Marker
            key={lib.id}
            position={[lib.lat, lib.lng]}
            icon={createStatusIcon(label, status.isOpen)}
            zIndexOffset={status.isOpen ? 1000 : 0}
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
