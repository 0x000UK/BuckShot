import type { GameData } from "@/lib/game";

export type TabKey =
  | "basic"
  | "metadata"
  | "rating"
  | "visuals"
  | "addons"
  | "requirements"
  | "download"
  | "faq";

export interface TabMeta {
  id: TabKey;
  label: string;
  icon: string;
}

export const TABS: TabMeta[] = [
  { id: "basic",        label: "Basic Info",     icon: "01" },
  { id: "metadata",     label: "Metadata",       icon: "02" },
  { id: "rating",       label: "Content Rating", icon: "03" },
  { id: "visuals",      label: "Visuals",        icon: "04" },
  { id: "addons",       label: "Add-ons",        icon: "05" },
  { id: "requirements", label: "Requirements",   icon: "06" },
  { id: "download",     label: "Download Links", icon: "07" },
  { id: "faq",          label: "FAQ",            icon: "08" },
];

// Maps ?tab=1 (1-based) ↔ TabKey
export function tabIndexToKey(index: number): TabKey {
  return TABS[Math.max(0, Math.min(index - 1, TABS.length - 1))]!.id;
}

export function tabKeyToIndex(key: TabKey): number {
  return (TABS.findIndex((t) => t.id === key) ?? 0) + 1;
}

export const TAB_FIELD_MAP: Record<TabKey, (keyof GameData)[]> = {
    basic: ["title", "subtitle", "description", "synopsis", "status", "tags", "score"],
    metadata: ["developer", "publisher", "franchise", "releaseDate", "genres", "version", "platforms"],
    rating: ["ageRating", "age", "descriptors"],
    visuals: ["cover", "banner", "banner2", "logo", "ambientColor", "screenShots"],
    addons: ["dlcs", "bonusContent"],
    requirements: ["requirements"],
    download: ["officialDownloads", "nonOfficialDownloads"],
    faq: ["faqs"],
};
