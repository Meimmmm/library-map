// src/utils/mapLinkUtils.ts
export function getGoogleMapsSearchUrl(params: {
  name?: string | null;
  address?: string | null;
}): string | null {
  const q = [params.name, params.address, "library"]
    .filter(Boolean)
    .join(" ");

  if (!q) return null;

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

//Driving mode is requested, but Google Maps may automatically adjust the route based on accessibility and location constraints.
export function getGoogleMapsDirectionsUrl(params: {
  lat: number;
  lng: number;
  travelMode?: "walking" | "driving" | "transit";
}): string {
  const { lat, lng, travelMode = "driving" } = params;

  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=${travelMode}`;
}

// did not work well with some places
// export function getGoogleMapsUrl(placeId: string): string {
//   return `https://www.google.com/maps/search/?api=1&query=place_id:${placeId}`;
// }


