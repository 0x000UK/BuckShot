/**
 * Canonical Game Tags.
 * The database string values are the absolute source of truth in MongoDB.
 */
export const GAME_TAGS = {
    NEW_RELEASE: "new-release",
    TRENDING: "trending",
    EXCLUSIVE: "exclusive",
    EARLY_ACCESS: "early-access",
    FEATURED: "featured",
    COMING_SOON: "coming-soon",
    RECENTLY_UPDATED: "recently-updated",
} as const;

export type GameTag = (typeof GAME_TAGS)[keyof typeof GAME_TAGS];

export const ALL_GAME_TAG_VALUES: [GameTag, ...GameTag[]] = [
    GAME_TAGS.NEW_RELEASE,
    GAME_TAGS.TRENDING,
    GAME_TAGS.EXCLUSIVE,
    GAME_TAGS.EARLY_ACCESS,
    GAME_TAGS.FEATURED,
    GAME_TAGS.COMING_SOON,
    GAME_TAGS.RECENTLY_UPDATED,
];

/**
 * Admin tag features that can have highlights / blurbs / visual media configured.
 */
export const ADMIN_FEATURED_TAGS: GameTag[] = [
    GAME_TAGS.EXCLUSIVE,
    GAME_TAGS.FEATURED,
    GAME_TAGS.COMING_SOON,
    GAME_TAGS.NEW_RELEASE,
    GAME_TAGS.RECENTLY_UPDATED,
];

export interface TagMetaConfig {
    id: GameTag;
    label: string;
    routeSlug: string;
    badge: string;
    title: string;
    subtitle: string;
    color: string;
    bg: string;
    border: string;
}

export const TAG_CONFIGS: Record<GameTag, TagMetaConfig> = {
    [GAME_TAGS.TRENDING]: {
        id: GAME_TAGS.TRENDING,
        label: "Trending",
        routeSlug: "trending",
        badge: "Top Charts",
        title: "Trending Now",
        subtitle: "The most played, highly active titles across the community right now.",
        color: "#c4a97d",
        bg: "bg-[#c4a97d]/5",
        border: "border-[#c4a97d]/20",
    },
    [GAME_TAGS.COMING_SOON]: {
        id: GAME_TAGS.COMING_SOON,
        label: "Upcoming",
        routeSlug: "coming-soon",
        badge: "Coming Soon",
        title: "Upcoming Releases",
        subtitle: "Highly anticipated blockbusters and indie gems arriving soon.",
        color: "#7a9a6b",
        bg: "bg-[#7a9a6b]/5",
        border: "border-[#7a9a6b]/20",
    },
    [GAME_TAGS.NEW_RELEASE]: {
        id: GAME_TAGS.NEW_RELEASE,
        label: "New Release",
        routeSlug: "new-release",
        badge: "Fresh Builds",
        title: "New Releases",
        subtitle: "Fresh builds, day-one launches, and the latest additions to the catalog.",
        color: "#6b7a9a",
        bg: "bg-[#6b7a9a]/5",
        border: "border-[#6b7a9a]/20",
    },
    [GAME_TAGS.FEATURED]: {
        id: GAME_TAGS.FEATURED,
        label: "Featured",
        routeSlug: "featured",
        badge: "Staff Picks",
        title: "Featured Spotlight",
        subtitle: "Hand-picked editorial showcases and essential playthroughs.",
        color: "#9a8a6b",
        bg: "bg-[#9a8a6b]/5",
        border: "border-[#9a8a6b]/20",
    },
    [GAME_TAGS.EARLY_ACCESS]: {
        id: GAME_TAGS.EARLY_ACCESS,
        label: "Early Access",
        routeSlug: "early-access",
        badge: "Early Access",
        title: "Early Access",
        subtitle: "In-development projects open for community testing and feedback.",
        color: "#7a6b9a",
        bg: "bg-[#7a6b9a]/5",
        border: "border-[#7a6b9a]/20",
    },
    [GAME_TAGS.EXCLUSIVE]: {
        id: GAME_TAGS.EXCLUSIVE,
        label: "Exclusive",
        routeSlug: "exclusive",
        badge: "Exclusives",
        title: "Store Exclusives",
        subtitle: "Masterpieces and premiere releases you can't experience anywhere else.",
        color: "#6b9a8d",
        bg: "bg-[#6b9a8d]/5",
        border: "border-[#6b9a8d]/20",
    },
    [GAME_TAGS.RECENTLY_UPDATED]: {
        id: GAME_TAGS.RECENTLY_UPDATED,
        label: "Recently Updated",
        routeSlug: "recently-updated",
        badge: "Latest Patches",
        title: "Recently Updated",
        subtitle: "Games that received new content, patches, or version updates recently.",
        color: "#9a7b6b",
        bg: "bg-[#9a7b6b]/5",
        border: "border-[#9a7b6b]/20",
    },
};

export const ALL_TAGS: TagMetaConfig[] = [
    TAG_CONFIGS[GAME_TAGS.TRENDING],
    TAG_CONFIGS[GAME_TAGS.COMING_SOON],
    TAG_CONFIGS[GAME_TAGS.NEW_RELEASE],
    TAG_CONFIGS[GAME_TAGS.FEATURED],
    TAG_CONFIGS[GAME_TAGS.EARLY_ACCESS],
    TAG_CONFIGS[GAME_TAGS.EXCLUSIVE],
    TAG_CONFIGS[GAME_TAGS.RECENTLY_UPDATED],
];

export const ALL_TAGS_OPTIONS: { value: GameTag; label: string }[] = ALL_TAGS.map((t) => ({
    value: t.id,
    label: t.label,
}));

/**
 * Resolves any route slug or alias to the canonical database GameTag.
 * Handles aliases such as "upcoming" -> "coming-soon" and "new-releases" -> "new-release".
 */
export function resolveTagSlug(slug: string): GameTag | null {
    if (!slug) return null;
    const s = slug.toLowerCase().trim();
    if (s === "upcoming" || s === GAME_TAGS.COMING_SOON) return GAME_TAGS.COMING_SOON;
    if (s === "new-releases" || s === GAME_TAGS.NEW_RELEASE) return GAME_TAGS.NEW_RELEASE;
    if (s === GAME_TAGS.TRENDING) return GAME_TAGS.TRENDING;
    if (s === GAME_TAGS.FEATURED) return GAME_TAGS.FEATURED;
    if (s === GAME_TAGS.EXCLUSIVE) return GAME_TAGS.EXCLUSIVE;
    if (s === GAME_TAGS.EARLY_ACCESS) return GAME_TAGS.EARLY_ACCESS;
    if (s === "recently-updated" || s === GAME_TAGS.RECENTLY_UPDATED) return GAME_TAGS.RECENTLY_UPDATED;
    return null;
}

export function isGameTag(val: unknown): val is GameTag {
    return typeof val === "string" && ALL_GAME_TAG_VALUES.includes(val as GameTag);
}
