// src/components/MyLocationOverlay.tsx
import { Circle, CircleMarker } from "react-leaflet";

export type MyLocation = {
  lat: number;
  lng: number;
  accuracy?: number;
  updatedAt: number;
};

export default function MyLocationOverlay({
  myLocation,
  isMobile,
}: {
  myLocation: MyLocation;
  isMobile: boolean;
}) {
  const accuracy =
    typeof myLocation.accuracy === "number" && myLocation.accuracy > 0
      ? myLocation.accuracy
      : null;

  // ✅ 精度が良いと小さすぎるので下限をつける（好みで調整OK）
  const minRadius = isMobile ? 250 : 700;
  const radius = accuracy !== null ? Math.max(accuracy, minRadius) : null;

  return (
    <>
      {radius !== null && (
        <Circle
          center={[myLocation.lat, myLocation.lng]}
          radius={radius}
          pathOptions={{
            color: "#2563eb",
            weight: isMobile ? 3 : 2,     // ✅ 外周を太く
            opacity: 0.9,                 // ✅ 線を濃く
            fillColor: "#3b82f6",
            fillOpacity: 0.12,            // ✅ うっすら塗って見えるように
          }}
        />
      )}

      <CircleMarker
        center={[myLocation.lat, myLocation.lng]}
        radius={isMobile ? 14 : 12}
        pathOptions={{
          color: "#ffffff",
          weight: isMobile ? 5 : 4,
          fillOpacity: 0,
        }}
      />

      <CircleMarker
        center={[myLocation.lat, myLocation.lng]}
        radius={isMobile ? 10 : 8}
        pathOptions={{
          color: "#2563eb",
          weight: 2,
          fillColor: "#3b82f6",
          fillOpacity: 0.95,
        }}
      />
    </>
  );
}
