import Image from "next/image";

export interface PresetSite {
    id: string;
    name: string;
    type: "official" | "non-official";
    aliases: string[];
    defaultCategory?: "Repack" | "Direct" | "Torrent" | "Crack Fix" | "Update Patch" | "Other";
    icon: string;
}

export const PRESET_SITES: PresetSite[] = [
    {
        id: "steam",
        name: "Steam",
        type: "official",
        aliases: ["steam", "steampowered", "valve"],
        icon: '/Icons/steam.svg',
    },
    {
        id: "epic",
        name: "Epic Games",
        type: "official",
        aliases: ["epic", "epic games", "epicgames", "epic store"],
        icon: '/Icons/epicgames.svg',
    },
    {
        id: "gog",
        name: "GOG.com",
        type: "official",
        aliases: ["gog", "good old games", "gog.com"],
        icon: '/Icons/gog.svg',
    },
    {
        id: "playstation",
        name: "PlayStation Store",
        type: "official",
        aliases: ["playstation", "psn", "sony", "ps store", "ps5", "ps4"],
        icon: '/Icons/playstation.svg',
    },
    {
        id: "xbox",
        name: "Xbox Store",
        type: "official",
        aliases: ["xbox", "microsoft", "microsoft store", "game pass"],
        icon: '/Icons/cbox.svg',
    },
    {
        id: "humble",
        name: "Humble Store",
        type: "official",
        aliases: ["humble", "humble store"],
        icon: '/Icons/humble.svg',
    },
    {
        id: "gamesplanet",
        name: "Games Planet",
        type: "official",
        aliases: ["gamesplanet", "games planet"],
        icon: "https://consumersiteimages.trustpilot.net/business-units/486544aa000064000502c9f2-198x149-2x.avif"
    },
    {
        id: "greenmangaming",
        name: "GreenManGaming",
        type: "official",
        aliases: [],
        icon: "https://images.greenmangaming.com/static/favicon.ico"
    },
    {
        id: "indiegala",
        name: "IndieGala",
        type: "official",
        aliases: [],
        icon: 'https://www.indiegala.com/favicon.ico',
    },


    // Non-Official Repackers & Mirrors
    {
        id: "fitgirl",
        name: "FitGirl Repacks",
        type: "non-official",
        aliases: ["fitgirl", "fitgirl repacks", "fitgirl-repacks.site"],
        defaultCategory: "Repack",
        icon: 'https://fitgirl-repacks.site/wp-content/uploads/2016/08/icon.jpg',
    },
    {
        id: "dodi",
        name: "DODI Repacks",
        type: "non-official",
        aliases: ["dodi", "dodi repacks", "dodi-repacks.site"],
        defaultCategory: "Repack",
        icon: 'https://dodi-repacks.site/wp-content/uploads/2019/02/cropped-ICON-180x180.png',
    },
    {
        id: "steamrip",
        name: "SteamRIP",
        type: "non-official",
        aliases: ["steamrip", "steamrip.com", "steam-rip"],
        defaultCategory: "Direct",
        icon: 'https://steamrip.com/wp-content/uploads/2021/06/cropped-favicon1-180x180.png',
    },
];

// Matcher function
export function matchPresetSite(nameOrUrl: string): PresetSite | null {
    if (!nameOrUrl) return null;
    const lower = nameOrUrl.toLowerCase().trim();

    for (const preset of PRESET_SITES) {
        if (lower === preset.id.toLowerCase() || lower === preset.name.toLowerCase()) {
            return preset;
        }
        for (const alias of preset.aliases) {
            if (lower.includes(alias.toLowerCase())) {
                return preset;
            }
        }
    }
    return null;
}

// Visual Component
export function DownloadSiteLogo({
    name,
    logoUrl,
    className = "w-6 h-6",
    isOfficial = false,
}: {
    name: string;
    logoUrl?: string | null;
    className?: string;
    isOfficial?: boolean;
}) {
    if (logoUrl && logoUrl.trim() !== "") {
        return (
            <div className={`relative overflow-hidden shrink-0 ${className}`}>
                <Image
                    src={logoUrl}
                    alt={name || "Site Logo"}
                    fill
                    className="object-contain"
                    unoptimized
                />
            </div>
        );
    }

    const matched = matchPresetSite(name);
    if (matched) {
        return <div className={`relative overflow-hidden shrink-0 ${className}`}>
                <Image
                    src={matched.icon}
                    alt={matched.name || "Site Logo"}
                    fill
                    className="object-contain"
                    unoptimized
                />
            </div>;
    }
}
