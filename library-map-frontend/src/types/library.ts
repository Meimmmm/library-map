// src/types/library.ts

// 曜日キー（内部的に使う用）
export type Weekday =
  | "mon"
  | "tue"
  | "wed"
  | "thu"
  | "fri"
  | "sat"
  | "sun";

// 1日の開館時間（休館日の場合は null にする）
export type OpeningHours = {
  /** 開館時刻 "09:00" のような24時間表記 */
  open: string;
  /** 閉館時刻 "17:30" のような24時間表記 */
  close: string;
};

// 1週間分の開館時間
export type WeeklyOpeningHours = {
  mon: OpeningHours | null;
  tue: OpeningHours | null;
  wed: OpeningHours | null;
  thu: OpeningHours | null;
  fri: OpeningHours | null;
  sat: OpeningHours | null;
  sun: OpeningHours | null;
};

// 図書館の種類（必要に応じて増やしてOK）
export type LibraryCategory = "public" | "university" | "state" | "other";

// メインの Library 型
export interface Library {
  id: number;
  name: string;

  // 位置情報
  lat: number;
  lng: number;

  // 住所・エリア情報
  address: string;
  suburb: string;
  postcode: string;

  // 図書館の種別
  category: LibraryCategory;

  // 公式サイトなど
  websiteUrl?: string;
  phone?: string;

  // アクセス情報（任意）
  hasParking?: boolean;
  nearestBusStop?: string;
  walkingMinutesFromBus?: number | null;

  // 開館時間
  openingHours: WeeklyOpeningHours;
}
