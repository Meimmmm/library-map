// src/api/apiLibraries.ts
// APIから取得する図書館データの型定義と取得関数(バックエンド API のレスポンスそのもの)

export type ApiLibrary = {
  id: number;
  lat: number;
  lon: number;
  categories?: string | null; 

  // visible info
  name: string;
  address?: string | null;
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
