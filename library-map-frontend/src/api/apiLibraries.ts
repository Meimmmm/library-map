// src/api/apiLibraries.ts

export type ApiLibrary = {
  id: number;

  name: string;
  lat: number;
  lng: number;

  address?: string | null;
  suburb?: string | null;
  postcode?: string | null;

  category?: string | null;
  websiteUrl?: string | null;

  hasParking?: boolean | null;
  nearestBusStop?: string | null;
  walkingMinutesFromBus?: number | null;

  /**
   * OpenStreetMap opening_hours (raw string)
   * e.g. "Mo,We 09:00-20:00; Tu,Th-Fr 09:00-17:00; PH off"
   */
  openingHoursRaw?: string | null;
  
  osmLastUpdated?: string | null;
};

// A method to access Vite environment variables
// If the environment variable is set, use it. If not, use the localhost URL as the default.
const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5259";

export async function fetchLibraries(): Promise<ApiLibrary[]> {
  const res = await fetch(`${API_BASE}/api/libraries`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch libraries: ${res.status} ${text}`);
  }

  return res.json();
}
