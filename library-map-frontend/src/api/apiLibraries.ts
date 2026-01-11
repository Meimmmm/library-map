// src/api/apiLibraries.ts
// Type definition and retrieval function for library data retrieved from the API (the backend API response itself)

export type ApiLibrary = {
  id: number;
  lat: number;
  lon: number;
  GooglePlaceId: string;
  categories?: string | null; 

  // visible info
  name: string;
  address: string;
  websiteUrl?: string | null;
  websiteUrl2?: string | null;
  openingHoursJson?: string | null;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5259";

export async function fetchLibraries(): Promise<ApiLibrary[]> {
  const res = await fetch(`${API_BASE}/api/libraries`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch libraries: ${res.status} ${text}`);
  }

  return (await res.json()) as ApiLibrary[];
}
