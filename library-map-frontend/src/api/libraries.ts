//Define the JSON format (data structure) returned by the API in TypeScript
export type Library = { 
  name: string;
  lat: number;
  lng: number;
  address: string;
  suburb: string;
  postcode: string;
  category: string;
  websiteUrl?: string | null;
  hasParking?: boolean | null;
  nearestBusStop?: string | null;
  walkingMinutesFromBus?: number | null;
  openingHoursJson?: string | null;
};

//A method to access Vite environment variables
//If the environment variable is set, use it. If not, use the localhost URL as the default.
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5259";

export async function fetchLibraries(): Promise<Library[]> {
  const res = await fetch(`${API_BASE}/api/libraries`);
  if (!res.ok) {    
    const text = await res.text();
    throw new Error(`Failed to fetch libraries: ${res.status} ${text}`);
  }
  return res.json();
}
