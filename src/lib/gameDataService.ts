import { htmlToJSONRoot } from "./htmlToJson";
import type { OfficialDownloadLink, StorePriceEdition } from "@/types/game";
import type { JSONRoot } from "./game";
import { uid } from "./utils";

export interface ParsedSystemSpecs {
    architecture?: string;
    os: string;
    cpu: string;
    ram: string;
    gpu: string;
    storage: string;
    directX?: string;
    soundcard?: string;
    network?: string;
    notes?: string;
}

export interface ConsolidatedGameFetchResult {
    success: boolean;
    error?: string;
    sourceAppId?: string;
    data?: {
        title: string;
        synopsis: string;
        description: JSONRoot;
        edition?: JSONRoot;
        developer: string;
        publisher: string;
        releaseDate: string;
        genres: string[];
        platforms: ("PC" | "PlayStation 5" | "PlayStation 4" | "Xbox Series X/S" | "Xbox One" | "Nintendo Switch" | "macOS" | "Linux")[];
        score?: number;
        age: number;
        ageRating: "E" | "T" | "M" | "AO" | "PEGI 3" | "PEGI 7" | "PEGI 12" | "PEGI 16" | "PEGI 18" | "IARC 3" | "IARC 7" | "IARC 12" | "IARC 16" | "IARC 18" | "Unrated";
        descriptors: ("Blood and Gore" | "Intense Violence" | "Strong Language" | "Sexual Themes" | "Nudity" | "Use of Drugs" | "In-Game Purchases")[];
        coverUrl: string;
        bannerUrl: string;
        screenshots: { type: "image" | "video"; url: string; title: string }[];
        requirements: {
            PC: {
                minimum: ParsedSystemSpecs;
                recommended: ParsedSystemSpecs;
            };
        };
        officialDownloads: OfficialDownloadLink[];
    };
}

const CHEAPSHARK_STORE_MAP: Record<string, { name: string; logo: string; badge?: string }> = {
    "1": { name: "Steam", logo: "/Icons/steam.svg" },
    "2": { name: "GamersGate", logo: "" },
    "3": { name: "GreenManGaming", logo: "" },
    "7": { name: "GOG.com", logo: "/Icons/gog.svg", badge: "DRM-Free" },
    "11": { name: "Humble Store", logo: "", badge: "Charity Partner" },
    "25": { name: "Epic Games", logo: "/Icons/epicgames.svg" },
    "27": { name: "Gamesplanet", logo: "" },
    "30": { name: "IndieGala", logo: "" },
    "35": { name: "DreamGame", logo: "" },
};

/**
 * Extracts Steam App ID from a URL, slug, or raw ID
 */
export function extractSteamAppId(input: string): string | null {
    if (!input || typeof input !== "string") return null;
    const trimmed = input.trim();

    // Check if it's already just digits
    if (/^\d+$/.test(trimmed)) {
        return trimmed;
    }

    // Check if it's a Steam store URL
    const match = trimmed.match(/store\.steampowered\.com\/app\/(\d+)/i);
    if (match && match[1]) {
        return match[1];
    }

    return null;
}

/**
 * Searches Steam for an App ID if only title is provided
 */
export async function searchSteamAppId(title: string): Promise<string | null> {
    try {
        const url = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(title)}&l=english&cc=US`;
        const res = await fetch(url, {
            headers: { "User-Agent": "GamesStore/1.0 (web)" },
            next: { revalidate: 3600 },
        });

        if (!res.ok) return null;
        const data = await res.json();

        if (data.items && Array.isArray(data.items) && data.items.length > 0) {
            return String(data.items[0].id);
        }
    } catch (err) {
        console.error("Steam search error:", err);
    }
    return null;
}

function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

/**
 * Parses Steam's raw HTML requirements block into structured specs
 */
export function parseSystemRequirements(htmlText: string): ParsedSystemSpecs {
    const defaultSpecs: ParsedSystemSpecs = {
        os: "Windows 10 64-bit",
        cpu: "Intel Core i5 / AMD Ryzen 5",
        ram: "8 GB RAM",
        gpu: "NVIDIA GeForce GTX 1060 / AMD Radeon RX 580",
        storage: "50 GB available space",
        directX: "Version 11",
        soundcard: "DirectX Compatible",
        notes: "",
    };

    if (!htmlText || typeof htmlText !== "string") return defaultSpecs;

    const findField = (regex: RegExp): string | null => {
        const match = htmlText.match(regex);
        return match && match[1] ? stripHtml(match[1]) : null;
    };

    const os = findField(/<strong>OS(?:\*|:)?<\/strong>\s*([^<]+)/i) || findField(/OS:\s*([^<]+)/i);
    const cpu = findField(/<strong>(?:Processor|CPU):?<\/strong>\s*([^<]+)/i) || findField(/(?:Processor|CPU):\s*([^<]+)/i);
    const ram = findField(/<strong>(?:Memory|RAM):?<\/strong>\s*([^<]+)/i) || findField(/(?:Memory|RAM):\s*([^<]+)/i);
    const gpu = findField(/<strong>(?:Graphics|GPU|Video Card):?<\/strong>\s*([^<]+)/i) || findField(/(?:Graphics|GPU):\s*([^<]+)/i);
    const directX = findField(/<strong>DirectX:?<\/strong>\s*([^<]+)/i) || findField(/DirectX:\s*([^<]+)/i);
    const storage = findField(/<strong>(?:Storage|Hard Drive):?<\/strong>\s*([^<]+)/i) || findField(/(?:Storage|Hard Drive):\s*([^<]+)/i);
    const notes = findField(/<strong>Additional Notes:?<\/strong>\s*([^<]+)/i) || findField(/Additional Notes:\s*([^<]+)/i);

    return {
        os: os || defaultSpecs.os,
        cpu: cpu || defaultSpecs.cpu,
        ram: ram || defaultSpecs.ram,
        gpu: gpu || defaultSpecs.gpu,
        storage: storage || defaultSpecs.storage,
        directX: directX || defaultSpecs.directX,
        notes: notes || defaultSpecs.notes,
    };
}

/**
 * Fetches cross-store deals from CheapShark API using Steam App ID
 */
export async function fetchCheapSharkDeals(steamAppId: string): Promise<Record<string, { price: string; retailPrice?: string; discountPercent: number; dealUrl: string }>> {
    const dealsByStore: Record<string, { price: string; retailPrice?: string; discountPercent: number; dealUrl: string }> = {};

    try {
        const lookupRes = await fetch(`https://www.cheapshark.com/api/1.0/games?steamAppID=${steamAppId}`, {
            headers: { "User-Agent": "GamesStore/1.0" },
            next: { revalidate: 3600 },
        });

        if (!lookupRes.ok) return dealsByStore;
        const lookupData = await lookupRes.json();

        if (!Array.isArray(lookupData) || lookupData.length === 0 || !lookupData[0].gameID) {
            return dealsByStore;
        }

        const gameId = lookupData[0].gameID;

        const dealsRes = await fetch(`https://www.cheapshark.com/api/1.0/games?id=${gameId}`, {
            headers: { "User-Agent": "GamesStore/1.0" },
            next: { revalidate: 3600 },
        });

        if (!dealsRes.ok) return dealsByStore;
        const dealsData = await dealsRes.json();

        if (Array.isArray(dealsData.deals)) {
            for (const d of dealsData.deals) {
                const storeId = String(d.storeID);
                const storeInfo = CHEAPSHARK_STORE_MAP[storeId];
                if (storeInfo) {
                    const priceNum = parseFloat(d.price);
                    const retailNum = parseFloat(d.retailPrice || d.price);
                    const savingsNum = Math.round(parseFloat(d.savings || "0"));

                    dealsByStore[storeInfo.name] = {
                        price: `$${priceNum.toFixed(2)}`,
                        retailPrice: retailNum > priceNum ? `$${retailNum.toFixed(2)}` : undefined,
                        discountPercent: savingsNum,
                        dealUrl: `https://www.cheapshark.com/redirect?dealID=${d.dealID}`,
                    };
                }
            }
        }
    } catch (err) {
        console.error("CheapShark fetch error:", err);
    }

    return dealsByStore;
}

/**
 * Core service to fetch, parse, and assemble complete game data and pricing
 */
export async function getConsolidatedGameData(
    inputQuery: string,
    currencyCode = "us"
): Promise<ConsolidatedGameFetchResult> {
    try {
        // 1. Resolve Steam App ID
        let appId = extractSteamAppId(inputQuery);
        if (!appId) {
            appId = await searchSteamAppId(inputQuery);
        }

        if (!appId) {
            return {
                success: false,
                error: `Could not resolve Steam App ID for "${inputQuery}". Please enter a valid Steam URL or Title.`,
            };
        }

        // 2. Fetch App Details from Steam Store API
        const steamRes = await fetch(
            `https://store.steampowered.com/api/appdetails?appids=${appId}&cc=${encodeURIComponent(currencyCode)}&l=english`,
            {
                headers: { "User-Agent": "GamesStore/1.0" },
                next: { revalidate: 3600 },
            }
        );

        if (!steamRes.ok) {
            return {
                success: false,
                error: `Steam API responded with HTTP ${steamRes.status}`,
            };
        }

        const steamJson = await steamRes.json();
        const appPayload = steamJson[appId];

        if (!appPayload || !appPayload.success || !appPayload.data) {
            return {
                success: false,
                error: "Game not found on Steam or restricted in this region.",
            };
        }

        const data = appPayload.data;

        // 3. Parse Rich Text Descriptions to JSONRoot AST
        const descriptionAst = htmlToJSONRoot(data.detailed_description || data.about_the_game || data.short_description || "");
        
        // Build Edition Summary AST if available
        let editionAst: JSONRoot | undefined;
        if (data.legal_notice || (data.package_groups && data.package_groups.length > 0)) {
            const packageSubs: { option_text?: string }[] = data.package_groups?.[0]?.subs || [];
            const packageLines = packageSubs
                .filter((s) => Boolean(s.option_text))
                .map((s) => `<li><strong>${stripHtml(s.option_text || "")}</strong></li>`)
                .join("");
            if (packageLines) {
                editionAst = htmlToJSONRoot(`<h3>Included Digital Editions</h3><ul>${packageLines}</ul>`);
            }
        }

        // 4. Parse Package Editions & Steam Pricing
        const steamEditions: StorePriceEdition[] = [];
        const packageSubs: { option_text?: string; percent_savings?: number; packageid?: number | string; is_free_license?: boolean; price_in_cents_with_discount?: number }[] = data.package_groups?.[0]?.subs || [];

        if (packageSubs.length > 0) {
            for (let i = 0; i < packageSubs.length; i++) {
                const sub = packageSubs[i];
                const rawOption = sub.option_text || "";

                // Parse edition title from option_text (e.g. "Cyberpunk 2077 - $59.99" or "Cyberpunk 2077: Ultimate Edition - $89.98")
                let editionName = `Edition ${i + 1}`;
                const titleParts = rawOption.split("-");
                if (titleParts.length > 1) {
                    editionName = stripHtml(titleParts[0]).trim();
                } else if (i === 0) {
                    editionName = "Standard Edition";
                }

                // Parse prices
                let regularPrice: string | undefined;
                let currentPrice = "$59.99";
                const discountPercent = sub.percent_savings || 0;

                const originalPriceMatch = rawOption.match(/discount_original_price[^>]*>([^<]+)/i);
                if (originalPriceMatch) {
                    regularPrice = originalPriceMatch[1].trim();
                }

                const priceMatches = rawOption.match(/(\$[0-9,.]+)/g);
                if (priceMatches && priceMatches.length > 0) {
                    currentPrice = priceMatches[priceMatches.length - 1];
                    if (!regularPrice && priceMatches.length > 1) {
                        regularPrice = priceMatches[0];
                    }
                } else if (sub.is_free_license || sub.price_in_cents_with_discount === 0) {
                    currentPrice = "Free";
                }

                steamEditions.push({
                    edition: editionName,
                    price: currentPrice,
                    regularPrice: regularPrice || undefined,
                    discountPercent: discountPercent > 0 ? discountPercent : undefined,
                    url: `https://store.steampowered.com/sub/${sub.packageid}/`,
                    isLowestPrice: false,
                });
            }
        } else if (data.price_overview) {
            const po = data.price_overview;
            steamEditions.push({
                edition: "Standard Edition",
                price: po.final_formatted || `$${(po.final / 100).toFixed(2)}`,
                regularPrice: po.discount_percent > 0 ? (po.initial_formatted || `$${(po.initial / 100).toFixed(2)}`) : undefined,
                discountPercent: po.discount_percent > 0 ? po.discount_percent : undefined,
                url: `https://store.steampowered.com/app/${appId}/`,
                isLowestPrice: false,
            });
        } else if (data.is_free) {
            steamEditions.push({
                edition: "Standard Edition",
                price: "Free to Play",
                discountPercent: 0,
                url: `https://store.steampowered.com/app/${appId}/`,
                isLowestPrice: false,
            });
        }

        // 5. Query Multi-Store Deals via CheapShark
        const multiStoreDeals = await fetchCheapSharkDeals(appId);

        // 6. Assemble Official Store Downloads Array with Editions
        const officialDownloads: OfficialDownloadLink[] = [];

        // Add Steam
        officialDownloads.push({
            id: `off_steam_${appId}`,
            name: "Steam",
            url: `https://store.steampowered.com/app/${appId}/`,
            logo: "/Icons/steam.svg",
            badge: "Authorized",
            editions: steamEditions,
        });

        // Add other stores from CheapShark (Epic, GOG, Humble, etc.)
        for (const [storeName, deal] of Object.entries(multiStoreDeals)) {
            if (storeName === "Steam") continue; // already added with rich package editions

            const storeConfig = Object.values(CHEAPSHARK_STORE_MAP).find((s) => s.name === storeName);
            const defaultEdition = steamEditions[0]?.edition || "Standard Edition";

            officialDownloads.push({
                id: `off_${storeName.toLowerCase().replace(/[^a-z0-9]/g, "")}_${appId}`,
                name: storeName,
                url: deal.dealUrl,
                logo: storeConfig?.logo || "",
                badge: storeConfig?.badge || "Authorized",
                editions: [
                    {
                        edition: defaultEdition,
                        price: deal.price,
                        regularPrice: deal.retailPrice,
                        discountPercent: deal.discountPercent > 0 ? deal.discountPercent : undefined,
                        url: deal.dealUrl,
                        isLowestPrice: false,
                    },
                ],
            });
        }

        // 7. Calculate and flag lowest price across all stores and editions
        let minPriceValue = Infinity;
        let lowestStoreIndex = -1;
        let lowestEditionIndex = -1;

        officialDownloads.forEach((store, sIdx) => {
            store.editions?.forEach((ed, eIdx) => {
                const num = parseFloat(ed.price.replace(/[^0-9.]/g, ""));
                if (!isNaN(num) && num < minPriceValue) {
                    minPriceValue = num;
                    lowestStoreIndex = sIdx;
                    lowestEditionIndex = eIdx;
                }
            });
        });

        if (lowestStoreIndex !== -1 && lowestEditionIndex !== -1 && minPriceValue < Infinity) {
            officialDownloads[lowestStoreIndex].editions![lowestEditionIndex].isLowestPrice = true;
        }

        // 8. Visuals, Screenshots & Trailers
        const screenshots: { type: "image" | "video"; url: string; title: string }[] = [];

        if (Array.isArray(data.movies)) {
            for (const mov of data.movies) {
                const vidSrc = mov.mp4?.max || mov.webm?.max || mov.mp4?.["480"] || "";
                if (vidSrc) {
                    screenshots.push({
                        type: "video",
                        url: vidSrc,
                        title: mov.name || "Official Trailer",
                    });
                }
            }
        }

        if (Array.isArray(data.screenshots)) {
            for (const ss of data.screenshots) {
                if (ss.path_full) {
                    screenshots.push({
                        type: "image",
                        url: ss.path_full,
                        title: `${data.name} Screenshot`,
                    });
                }
            }
        }

        // 9. System Requirements
        const minSpecs = parseSystemRequirements(data.pc_requirements?.minimum || "");
        const recSpecs = parseSystemRequirements(data.pc_requirements?.recommended || "");

        // 10. Platform detection
        const platforms: ("PC" | "PlayStation 5" | "PlayStation 4" | "Xbox Series X/S" | "Xbox One" | "Nintendo Switch" | "macOS" | "Linux")[] = ["PC"];
        if (data.platforms?.mac) platforms.push("macOS");
        if (data.platforms?.linux) platforms.push("Linux");

        // 11. Release Date formatting (YYYY-MM-DD)
        let formattedDate = new Date().toISOString().split("T")[0];
        if (data.release_date?.date) {
            const parsedD = new Date(data.release_date.date);
            if (!isNaN(parsedD.getTime())) {
                formattedDate = parsedD.toISOString().split("T")[0];
            }
        }

        return {
            success: true,
            sourceAppId: appId,
            data: {
                title: data.name || "",
                synopsis: stripHtml(data.short_description || ""),
                description: descriptionAst,
                edition: editionAst,
                developer: Array.isArray(data.developers) ? data.developers.join(", ") : "Unknown Developer",
                publisher: Array.isArray(data.publishers) ? data.publishers.join(", ") : "Unknown Publisher",
                releaseDate: formattedDate,
                genres: Array.isArray(data.genres)
                    ? data.genres.map((g: { description?: string }) => g.description || "").filter(Boolean)
                    : [],
                platforms,
                score: data.metacritic?.score || 85,
                age: parseInt(data.required_age, 10) || 18,
                ageRating: "M",
                descriptors: ["Intense Violence", "Strong Language"],
                coverUrl: data.header_image || "",
                bannerUrl: data.background_raw || data.background || data.header_image || "",
                screenshots,
                requirements: {
                    PC: {
                        minimum: minSpecs,
                        recommended: recSpecs,
                    },
                },
                officialDownloads,
            },
        };
    } catch (err: unknown) {
        console.error("Critical error in getConsolidatedGameData:", err);
        return {
            success: false,
            error: err instanceof Error ? err.message : "Failed to fetch consolidated game data",
        };
    }
}

/**
 * Fetches cross-store prices from CheapShark and Steam for an existing game,
 * updating and enriching the officialDownloads array.
 */
export async function fetchCrossStorePrices(
    title?: string,
    steamUrlOrAppId?: string,
    existingOfficialDownloads: OfficialDownloadLink[] = []
): Promise<{
    success: boolean;
    officialDownloads: OfficialDownloadLink[];
    error?: string;
    updatedCount: number;
    sourceAppId?: string;
}> {
    try {
        let appId = steamUrlOrAppId ? extractSteamAppId(steamUrlOrAppId) : null;
        let cheapSharkGameId: string | null = null;

        // Try to find Steam App ID from existing downloads if not provided
        if (!appId && existingOfficialDownloads.length > 0) {
            const steamLink = existingOfficialDownloads.find(
                (d) =>
                    d.name.toLowerCase().includes("steam") ||
                    d.url.includes("store.steampowered.com/app/")
            );
            if (steamLink) {
                appId = extractSteamAppId(steamLink.url);
            }
        }

        // Search CheapShark by Steam App ID
        if (appId) {
            const lookupRes = await fetch(
                `https://www.cheapshark.com/api/1.0/games?steamAppID=${appId}`,
                {
                    headers: {
                        "User-Agent":
                            "GamesStorePlatform/1.0 (admin@gamesstore.local)",
                    },
                    next: { revalidate: 0 },
                }
            );
            if (lookupRes.ok) {
                const lookupData = await lookupRes.json();
                if (
                    Array.isArray(lookupData) &&
                    lookupData.length > 0 &&
                    lookupData[0].gameID
                ) {
                    cheapSharkGameId = lookupData[0].gameID;
                }
            }
        }

        // If no CheapShark gameID yet and title is provided, search CheapShark by title
        if (!cheapSharkGameId && title && title.trim()) {
            const searchRes = await fetch(
                `https://www.cheapshark.com/api/1.0/games?title=${encodeURIComponent(
                    title.trim()
                )}&limit=5`,
                {
                    headers: {
                        "User-Agent":
                            "GamesStorePlatform/1.0 (admin@gamesstore.local)",
                    },
                    next: { revalidate: 0 },
                }
            );
            if (searchRes.ok) {
                const searchData = await searchRes.json();
                if (Array.isArray(searchData) && searchData.length > 0) {
                    cheapSharkGameId = searchData[0].gameID;
                    if (!appId && searchData[0].steamAppID) {
                        appId = searchData[0].steamAppID;
                    }
                }
            }
        }

        // If still no appId, try searching Steam by title
        if (!appId && title && title.trim()) {
            appId = await searchSteamAppId(title.trim());
        }

        if (!cheapSharkGameId && !appId) {
            return {
                success: false,
                officialDownloads: existingOfficialDownloads,
                error: `Could not locate game deals on CheapShark or Steam for "${
                    title || steamUrlOrAppId || "unknown"
                }"`,
                updatedCount: 0,
            };
        }

        // Fetch CheapShark deals if we have gameID or appId
        const multiStoreDeals: Record<
            string,
            {
                price: string;
                retailPrice?: string;
                discountPercent: number;
                dealUrl: string;
            }
        > = {};

        if (cheapSharkGameId) {
            const dealsRes = await fetch(
                `https://www.cheapshark.com/api/1.0/games?id=${cheapSharkGameId}`,
                {
                    headers: {
                        "User-Agent":
                            "GamesStorePlatform/1.0 (admin@gamesstore.local)",
                    },
                    next: { revalidate: 0 },
                }
            );
            if (dealsRes.ok) {
                const dealsData = await dealsRes.json();
                if (Array.isArray(dealsData.deals)) {
                    for (const d of dealsData.deals) {
                        const storeId = String(d.storeID);
                        const storeInfo = CHEAPSHARK_STORE_MAP[storeId];
                        if (storeInfo) {
                            const priceNum = parseFloat(d.price);
                            const retailNum = parseFloat(
                                d.retailPrice || d.price
                            );
                            const savingsNum = Math.round(
                                parseFloat(d.savings || "0")
                            );

                            multiStoreDeals[storeInfo.name] = {
                                price: `$${priceNum.toFixed(2)}`,
                                retailPrice:
                                    retailNum > priceNum
                                        ? `$${retailNum.toFixed(2)}`
                                        : undefined,
                                discountPercent: savingsNum,
                                dealUrl: `https://www.cheapshark.com/redirect?dealID=${d.dealID}`,
                            };
                        }
                    }
                }
            }
        } else if (appId) {
            const fallbackDeals = await fetchCheapSharkDeals(appId);
            Object.assign(multiStoreDeals, fallbackDeals);
        }

        // If we have an appId, also fetch fresh Steam package pricing
        let freshSteamPrice: {
            price: string;
            regularPrice?: string;
            discountPercent?: number;
        } | null = null;

        if (appId) {
            try {
                const steamRes = await fetch(
                    `https://store.steampowered.com/api/appdetails?appids=${appId}&cc=us&l=english`,
                    {
                        headers: {
                            "User-Agent":
                                "GamesStorePlatform/1.0 (admin@gamesstore.local)",
                        },
                        next: { revalidate: 0 },
                    }
                );
                if (steamRes.ok) {
                    const steamJson = await steamRes.json();
                    const appPayload = steamJson[appId];
                    if (appPayload?.success && appPayload.data) {
                        const data = appPayload.data;
                        if (data.is_free) {
                            freshSteamPrice = {
                                price: "Free to Play",
                                discountPercent: 0,
                            };
                        } else if (data.price_overview) {
                            const po = data.price_overview;
                            freshSteamPrice = {
                                price:
                                    po.final_formatted ||
                                    `$${(po.final / 100).toFixed(2)}`,
                                regularPrice:
                                    po.discount_percent > 0
                                        ? po.initial_formatted ||
                                          `$${(po.initial / 100).toFixed(2)}`
                                        : undefined,
                                discountPercent:
                                    po.discount_percent > 0
                                        ? po.discount_percent
                                        : undefined,
                            };
                        }
                    }
                }
            } catch (e) {
                console.error("Steam price fetch failed:", e);
            }
        }

        // Clone existing downloads to preserve non-CheapShark entries
        const updatedDownloads: OfficialDownloadLink[] =
            existingOfficialDownloads.map((d) => ({
                ...d,
                editions: d.editions
                    ? d.editions.map((e) => ({ ...e }))
                    : undefined,
            }));

        let updatedCount = 0;

        // 1. Update or Add Steam
        if (appId || freshSteamPrice || multiStoreDeals["Steam"]) {
            const steamIndex = updatedDownloads.findIndex(
                (d) => d.name.toLowerCase() === "steam"
            );
            const steamPrice =
                freshSteamPrice?.price ||
                multiStoreDeals["Steam"]?.price ||
                "$59.99";
            const regularPrice =
                freshSteamPrice?.regularPrice ||
                multiStoreDeals["Steam"]?.retailPrice;
            const discount =
                freshSteamPrice?.discountPercent ??
                multiStoreDeals["Steam"]?.discountPercent ??
                0;
            const steamUrl = appId
                ? `https://store.steampowered.com/app/${appId}/`
                : multiStoreDeals["Steam"]?.dealUrl || "";

            if (steamIndex !== -1) {
                const s = updatedDownloads[steamIndex];
                s.url = s.url || steamUrl;
                s.price = steamPrice;
                if (!s.editions || s.editions.length === 0) {
                    s.editions = [
                        {
                            edition: "Standard Edition",
                            price: steamPrice,
                            regularPrice,
                            discountPercent: discount,
                            url: steamUrl,
                            isLowestPrice: false,
                        },
                    ];
                } else {
                    s.editions[0].price = steamPrice;
                    s.editions[0].regularPrice = regularPrice;
                    s.editions[0].discountPercent = discount;
                }
                updatedCount++;
            } else {
                updatedDownloads.unshift({
                    id: `off_steam_${appId || uid()}`,
                    name: "Steam",
                    url: steamUrl,
                    logo: "/Icons/steam.svg",
                    badge: "Authorized",
                    price: steamPrice,
                    editions: [
                        {
                            edition: "Standard Edition",
                            price: steamPrice,
                            regularPrice,
                            discountPercent: discount,
                            url: steamUrl,
                            isLowestPrice: false,
                        },
                    ],
                });
                updatedCount++;
            }
        }

        // 2. Update or Add other stores from CheapShark deals
        for (const [storeName, deal] of Object.entries(multiStoreDeals)) {
            if (storeName === "Steam") continue;

            const existingIndex = updatedDownloads.findIndex(
                (d) => d.name.toLowerCase() === storeName.toLowerCase()
            );
            const storeConfig = Object.values(CHEAPSHARK_STORE_MAP).find(
                (s) => s.name.toLowerCase() === storeName.toLowerCase()
            );

            if (existingIndex !== -1) {
                const st = updatedDownloads[existingIndex];
                st.price = deal.price;
                st.url = deal.dealUrl || st.url;
                if (!st.editions || st.editions.length === 0) {
                    st.editions = [
                        {
                            edition: "Standard Edition",
                            price: deal.price,
                            regularPrice: deal.retailPrice,
                            discountPercent:
                                deal.discountPercent > 0
                                    ? deal.discountPercent
                                    : undefined,
                            url: deal.dealUrl,
                            isLowestPrice: false,
                        },
                    ];
                } else {
                    st.editions[0].price = deal.price;
                    st.editions[0].regularPrice = deal.retailPrice;
                    st.editions[0].discountPercent =
                        deal.discountPercent > 0
                            ? deal.discountPercent
                            : undefined;
                    st.editions[0].url = deal.dealUrl || st.editions[0].url;
                }
                updatedCount++;
            } else {
                updatedDownloads.push({
                    id: `off_${storeName
                        .toLowerCase()
                        .replace(/[^a-z0-9]/g, "")}_${uid()}`,
                    name: storeName,
                    url: deal.dealUrl,
                    logo: storeConfig?.logo || "",
                    badge: storeConfig?.badge || "Authorized",
                    price: deal.price,
                    editions: [
                        {
                            edition: "Standard Edition",
                            price: deal.price,
                            regularPrice: deal.retailPrice,
                            discountPercent:
                                deal.discountPercent > 0
                                    ? deal.discountPercent
                                    : undefined,
                            url: deal.dealUrl,
                            isLowestPrice: false,
                        },
                    ],
                });
                updatedCount++;
            }
        }

        // 3. Recalculate lowest price flag
        let minPriceValue = Infinity;
        let lowestStoreIndex = -1;
        let lowestEditionIndex = -1;

        updatedDownloads.forEach((store, sIdx) => {
            store.editions?.forEach((ed, eIdx) => {
                ed.isLowestPrice = false;
                const num = parseFloat(ed.price.replace(/[^0-9.]/g, ""));
                if (!isNaN(num) && num < minPriceValue) {
                    minPriceValue = num;
                    lowestStoreIndex = sIdx;
                    lowestEditionIndex = eIdx;
                }
            });
        });

        if (
            lowestStoreIndex !== -1 &&
            lowestEditionIndex !== -1 &&
            minPriceValue < Infinity
        ) {
            updatedDownloads[lowestStoreIndex].editions![
                lowestEditionIndex
            ].isLowestPrice = true;
        }

        return {
            success: true,
            officialDownloads: updatedDownloads,
            updatedCount,
            sourceAppId: appId || undefined,
        };
    } catch (err: unknown) {
        console.error("fetchCrossStorePrices error:", err);
        return {
            success: false,
            officialDownloads: existingOfficialDownloads,
            error:
                err instanceof Error
                    ? err.message
                    : "Failed to fetch prices from CheapShark",
            updatedCount: 0,
        };
    }
}
