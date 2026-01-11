// src/types/library.ts
// Main Library type (the "remodeled model" actually used on the front end)

export interface Library {
  id: number;
  lat: number;
  lon: number;
  GooglePlaceId: string;
  categories?: string;

  name: string;
  address: string;
  websiteUrl?: string;
  websiteUrl2?: string;
  openingHoursJson?: string | null;

}


