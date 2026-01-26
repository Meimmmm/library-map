// src/hooks/useLibraries.ts
import { useEffect, useMemo, useState } from "react";
import { fetchLibraries, type ApiLibrary } from "../api/apiLibraries";
import type { Library } from "../types/library";

function toFrontendLibrary(api: ApiLibrary): Library {
  return {
    id: api.id,
    lat: api.lat,
    lon: api.lon,
    GooglePlaceId: api.GooglePlaceId,
    name: api.name,
    address: api.address,
    websiteUrl: api.websiteUrl ?? undefined,
    websiteUrl2: api.websiteUrl2 ?? undefined,
    openingHoursJson: api.openingHoursJson ?? null,
  };
}

export function useLibraries() {
  const [apiLibs, setApiLibs] = useState<ApiLibrary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  console.log("useLibraries: fetching libraries");

  useEffect(() => {
    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

    (async () => {
      setIsLoading(true);
      try {
        if (import.meta.env.DEV) await delay(5_000);
        const data = await fetchLibraries();
        setApiLibs(data);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load libraries");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const libs = useMemo(() => apiLibs.map(toFrontendLibrary), [apiLibs]);
  console.log("useLibraries: fetching libraries done");

  return { libs, isLoading, error };
}
