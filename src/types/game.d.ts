export type GameStatus = "published" | "draft" | "delisted";
export type GameTag = "new-release" | "trending" | "exclusive" | "early-access" | "featured" | "coming-soon";
export type AgeRating = "E" | "T" | "M" | "AO" | "PEGI 3" | "PEGI 7" | "PEGI 12" | "PEGI 16" | "PEGI 18" | "IARC 3" | "IARC 7" | "IARC 12" | "IARC 16" | "IARC 18" | "Unrated";
export type ContentDescriptor = "Blood and Gore" | "Intense Violence" | "Strong Language" | "Sexual Themes" | "Nudity" | "Use of Drugs" | "In-Game Purchases";
export type Platform = "PC" | "PlayStation 5" | "PlayStation 4" | "Xbox Series X/S" | "Xbox One" | "Nintendo Switch" | "macOS" | "Linux";

export interface SystemSpecs {
  os: string; cpu: string; ram: string; gpu: string; storage: string; directX?: string;
}
export interface DownloadSource {
  id?: string; host: string; url: string[]; bgimg?: string;
}
export interface AdditionalContent {
  id: string; title: string; image: string; imageFile?: ImageFile; type?: string;
}

export interface Category {
  id?: string;
  name: string;
  slug: string;
  gameCount?: number;
  createdAt?: string;
}

export interface ImageFile {
    /** Local object URL for preview */
    previewUrl: string;
    /** Original File object — send to your upload API */
    file?: File;
    /** Unique key */
    id?: string;
}

export interface GameData {
  id?: Key | null | undefined;
  title: string;
  subtitle?: string;
  description?: string;
  status?: GameStatus;
  tags?: GameTag[];
  ratingScore?: number;
  ratingReviewCount?: string;
  // metadata
  developer?: string;
  publisher?: string;
  franchise?: string;
  engine?: string;
  version?: string;
  releaseDate?: string;
  genres?: string[];
  platforms?: Platform[];
  // content rating
  ageRating?: AgeRating | "";
  age?: number;
  descriptors?: ContentDescriptor[];
  // visuals
  coverImageFile?: ImageFile | null;
  bannerImageFile?: ImageFile | null;
  logoUrl?: string;
  ambientColor?: string;
  screenshotFiles?: ImageFile[];
  videoLinks?: string[];
  // add-ons
  dlcs?: AdditionalContent[];
  bonusContent?: AdditionalContent[];
  // requirements (map: platform key → { minimum, recommended })
  requirements?: Record<string, { minimum: SystemSpecs; recommended: SystemSpecs }>;
  // repack
  based_on?: string[];
  game_version?: string;
  repack_size?: string;
  final_size?: string;
  interface_language?: string;
  languages?: string;
  audio?: string;
  subtitle_lang?: string;
  lossless_repack?: string;
  install_time?: string;
  crack?: string;
  greetings?: string[];
  repack_by?: string;
  // download
  downloadBase?: DownloadSource[];
  downloadUpdate?: DownloadSource[];

  //database
  addedAt? : string
  updatedAt? : string
}