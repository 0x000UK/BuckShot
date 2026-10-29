export type { GameTag } from "@/lib/constants/tags"
export type GameStatus = "published" | "draft" | "delisted"
export type Platform = "PC" | "PlayStation 5" | "PlayStation 4" | "Xbox Series X/S" | "Xbox One" | "Nintendo Switch" | "macOS" | "Linux"
export type AgeRating = "E" | "T" | "M" | "AO" | "PEGI 3" | "PEGI 7" | "PEGI 12" | "PEGI 16" | "PEGI 18" | "IARC 3" | "IARC 7" | "IARC 12" | "IARC 16" | "IARC 18" | "Unrated"
export type ContentDescriptor = "Blood and Gore" | "Intense Violence" | "Strong Language" | "Sexual Themes" | "Nudity" | "Use of Drugs" | "In-Game Purchases"
export type MediaType = "image" | "video"

export type GameSummary = {
    id: string;
    title: string;
    publisher: string;
    status: GameStatus;
    score: number;
    slug?: string | null | undefined;
    cover?: string | null | undefined;
    subtitle?: string | null | undefined;
    tags?: GameTag[];
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    publishedAt?: string | undefined;
    scheduledPublishAt?: string | undefined;
}

export type GameMeta = {
    id: string;
    slug: string;
    title: string;
    cover: string;
    subtitle?: string | null;
}

export type TaggedGame = {
    id: string;
    slug: string;
    title: string;
    cover: string;
    subtitle?: string | null;
    genres : string[];
    tags : GameTag[];
    tagFeatures : TagFeatures[];
    synopsis: string;
    score : number;
    publisher : string;
    status?: string;
}

export type Genre = {
    id: string;
    name: string;
    slug: string;
    gameCount?: number;
    image?: string | null;
    createdAt?: string;
}

export type TagFeatures = {
    type: GameTag;
    image?: string | null | undefined;
    video?: string | null | undefined;
    blurb?: string | null | undefined;
}

export type MediaItem = {
    id: string;
    type : MediaType
    url?: string | undefined;
    title?: string | undefined;
    file?: File | undefined;
    size?: "def" | "sqr" | "wide" | null | undefined;
}

export type SystemSpecs = {
    os: string;
    cpu: string;
    ram: string;
    gpu: string;
    storage: string;
    architecture?: string | null | undefined;
    directX?: string | null | undefined;
    soundcard?: string | null | undefined;
    network?: string | null | undefined;
    others?: string | null | undefined;
    notes?: string | null | undefined;
}

export type AdditionalContent = {
    id: string;
    title: string;
    image: MediaItem;
    type?: string | null | undefined;
}

export type DownloadCategory = "Repack" | "Direct" | "Torrent" | "Crack Fix" | "Update Patch" | "Other";

export type StorePriceEdition = {
    id?: string;
    edition: string;
    price: string;
    regularPrice?: string | null | undefined;
    discountPercent?: number | null | undefined;
    url?: string | null | undefined;
    isLowestPrice?: boolean | null | undefined;
};

export type OfficialDownloadLink = {
    id: string;
    name: string;
    url: string;
    logo?: string | null | undefined;
    price?: string | null | undefined;
    badge?: string | null | undefined;
    editions?: StorePriceEdition[] | null | undefined;
};

export type NonOfficialDownloadLink = {
    id: string;
    siteName: string;
    url: string[];
    logo?: string | null | undefined;
    category: DownloadCategory;
    fileSize?: string | null | undefined;
    version?: string | null | undefined;
    notes?: string | null | undefined;
};

export type DownloadSource = {
    id: string;
    host: string;
    url: string[];
}
