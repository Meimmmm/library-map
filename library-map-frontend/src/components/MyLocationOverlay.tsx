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
  return (
    <>
      {typeof myLocation.accuracy === "number" && myLocation.accuracy > 0 && (
        <Circle center={[myLocation.lat, myLocation.lng]} radius={myLocation.accuracy} />
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
