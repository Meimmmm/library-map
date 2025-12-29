// src/types/library.ts
// メインの Library 型 (フロントで実際に使う“整形後モデル)

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
  openingHoursJson?: string | null; // ★ canonical JSON（文字列で受け取る）

}


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

// // メインの Library 型
// // メインの Library 型（フロント表示用）
// export interface Library {
//   id: number;
//   name: string;

//   // 位置情報
//   lat: number;
//   lng: number;

//   // 住所・エリア情報（APIでは null のことがある）
//   address: string;

//   // 図書館の種別（APIが未整備なら optional にしておく）
//   category?: LibraryCategory;

//   // seed / DB から来るカテゴリ文字列（例: "University Library"）
//   categories?: string | null;

//   // 公式サイトなど
//   websiteUrl?: string | null;
//   websiteUrl2?: string | null;
//   phone?: string | null;

//   // アクセス情報（任意）
//   hasParking?: boolean | null;
//   nearestBusStop?: string | null;
//   walkingMinutesFromBus?: number | null;

//   // 開館時間（未入力の館があるので optional）
//   openingHours?: WeeklyOpeningHours | null;

//   // 開館時間の生JSON（API/DBに保存してるやつ。必要なら保持）
//   openingHoursJson?: string | null;

//   // メモ（seedの Comment 用）
//   comment?: string | null;

//   // Google照合用
//   googlePlaceId?: string | null;
// }

