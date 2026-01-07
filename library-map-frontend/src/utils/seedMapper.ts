// src/utils/seedMapper.ts
import type { SeedLibrary } from "../types/seedLibrary";
import type { ApiLibrary } from "../api/apiLibraries";

export function seedToApiLibrary(
  seed: SeedLibrary,
  index: number
): ApiLibrary {
  return {
    id: index + 1, // Temporary ID (for UI)
    lat: seed.Lat,
    lon: seed.Lon,
    name: seed.Name,
    address: seed.Address,
    websiteUrl: seed.Website ?? null,
    websiteUrl2: seed.Website2 ?? null,
    GooglePlaceId: seed.GooglePlaceId ?? "",
    openingHoursJson: seed.OpeningHours ?? ""
  };
}
