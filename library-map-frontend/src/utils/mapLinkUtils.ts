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

// did not work well with some places
// export function getGoogleMapsUrl(placeId: string): string {
//   return `https://www.google.com/maps/search/?api=1&query=place_id:${placeId}`;
// }
