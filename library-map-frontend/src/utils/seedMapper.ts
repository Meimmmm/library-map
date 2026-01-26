// src/utils/seedMapper.ts
// Map raw seed data to Library type for initial loading
import type { Library } from "../types/library";

type RawSeedLibrary = {
  Name?: unknown;
  Address?: unknown;
  Lat?: unknown;
  Lon?: unknown;
  GooglePlaceId?: unknown;
  Categories?: unknown;
  Website?: unknown;
  Website2?: unknown;
  OpeningHours?: unknown;
};

export function mapSeedToLibrary(raw: RawSeedLibrary, index: number): Library {
  return {
    id: index,
    name: typeof raw.Name === "string" ? raw.Name : "",
    address: typeof raw.Address === "string" ? raw.Address : "",
    lat: typeof raw.Lat === "number" ? raw.Lat : Number(raw.Lat),
    lon: typeof raw.Lon === "number" ? raw.Lon : Number(raw.Lon),
    GooglePlaceId: typeof raw.GooglePlaceId === "string" ? raw.GooglePlaceId : "",
    categories: typeof raw.Categories === "string" ? raw.Categories : undefined,
    websiteUrl: typeof raw.Website === "string" ? raw.Website : undefined,
    websiteUrl2: typeof raw.Website2 === "string" ? raw.Website2 : undefined,
    openingHoursJson:
      raw.OpeningHours != null ? JSON.stringify(raw.OpeningHours) : null,
  };
}
