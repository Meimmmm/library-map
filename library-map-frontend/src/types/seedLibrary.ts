// src/types/seedLibrary.ts
// **Temporary Logic

export type SeedLibrary = {
  OsmType: string;
  OsmId: string;
  Name: string;
  Address: string;
  Lat: number;
  Lon: number;
  Website?: string;
  Website2?: string;
  GooglePlaceId?: string;
  OpeningHours?: string | null;   // Flexible type for opening hours
};
