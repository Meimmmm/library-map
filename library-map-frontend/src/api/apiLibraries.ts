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

// import type { ApiLibrary } from "../types/library";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5259";

/**
 * Wait the specified number of milliseconds
 */
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * fetchLibraries
* - Maximum 3 retries (exponential backoff)
*   2s → 4s → 8s
* - Assumes App Service wakeup from sleep
 */
export async function fetchLibraries(): Promise<ApiLibrary[]> {
  const delays = [2000, 4000, 8000];
  let lastError: unknown;

  for (let attempt = 0; attempt < delays.length; attempt++) {
    try {
      console.log(`fetchLibraries: attempt ${attempt + 1}`);
      const res = await fetch(`${API_BASE}/api/libraries`);

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to fetch libraries: ${res.status} ${text}`);
      }

      // If successful, return immediately
      return (await res.json()) as ApiLibrary[];
    } catch (err) {
      lastError = err;

      // If it's the last attempt, you'll get out.
      if (attempt === delays.length - 1) {
        break;
      }

      // Wait until next retry (exponential backoff)
      await sleep(delays[attempt]);
    }
  }

  // All retries failed
  throw lastError instanceof Error
    ? lastError
    : new Error("Failed to fetch libraries");
}
