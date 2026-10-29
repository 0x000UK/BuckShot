import { cache } from "react";
import mongoose from "mongoose";
import GameModel from "@/models/game.model";
import GenreModel from "@/models/genre.model";
import type { GameSummary, GameMeta, GameTag, TaggedGame } from "@/types/game";
import type { GameData } from "@/lib/game";
import connectDB from "@/lib/mongodb";
import { sqids } from "@/lib/sqids";
import { auth } from "@/auth";
import { triggerScheduledPublishCheck } from "@/lib/autoPublish";
import { GAME_TAGS } from "@/lib/constants/tags";
import {
    fromGameDocument,
    metaFromGameDocument,
    summaryFromGameDocument,
    taggedGameFromGameDocument,
} from "@/lib/dbMappings";

export interface FetchGamesParams {
    sort?: string;
    ord?: string;
    count?: number;
    start?: number;
    filter?: Record<string, unknown>;
}

const SORT_FIELD_MAP: Record<string, string> = {
    releaseDate: "createdAt",
    title: "title",
};

function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Fetches lightweight summaries of all games (used by admin dashboard).
 */
export async function getAllGamesSummary(
    params: FetchGamesParams = {}
): Promise<{ games: GameSummary[]; totalCount: number }> {
    try {
        await connectDB();
        await triggerScheduledPublishCheck();

        const {
            sort: rawSort,
            ord: rawOrd,
            count = 40,
            start = 0,
            filter: rawFilter,
        } = params;

        const filter = rawFilter && typeof rawFilter === "object" ? rawFilter : {};

        let sortObj: Record<string, 1 | -1> | undefined = undefined;
        if (rawSort && SORT_FIELD_MAP[rawSort]) {
            const sortField = SORT_FIELD_MAP[rawSort];
            const ord: 1 | -1 = rawOrd === "desc" ? -1 : 1;
            sortObj = { [sortField]: ord };
        }

        let query = GameModel.find(filter)
            .select(
                "gameId title subtitle slug visuals.cover status metadata.publisher createdAt updatedAt publishedAt scheduledPublishAt rating.score tags"
            )
            .skip(start)
            .limit(count);

        if (sortObj) {
            query = query.sort(sortObj);
        }

        const [games, totalCount] = await Promise.all([
            query.lean(),
            GameModel.countDocuments(filter),
        ]);

        const gameSummaries = games.length > 0 ? games.map(summaryFromGameDocument) : [];

        return { games: gameSummaries, totalCount };
    } catch (error: unknown) {
        console.error("Failed to fetch games summary:", error instanceof Error ? error.message : String(error));
        return { games: [], totalCount: 0 };
    }
}

/**
 * Fetches public card metadata for published games (used by store/collection).
 */
export async function getAllGamesMeta(
    params: FetchGamesParams = {}
): Promise<{ games: GameMeta[]; totalCount: number }> {
    try {
        await connectDB();
        await triggerScheduledPublishCheck();

        const {
            sort: rawSort,
            ord: rawOrd,
            count = 40,
            start = 0,
            filter: rawFilter,
        } = params;

        const filter: Record<string, unknown> = rawFilter && typeof rawFilter === "object" ? { ...rawFilter } : {};
        if (!filter.status) {
            filter.status = "published";
        }

        let sortObj: Record<string, 1 | -1> | undefined = undefined;
        if (rawSort && SORT_FIELD_MAP[rawSort]) {
            const sortField = SORT_FIELD_MAP[rawSort];
            const ord: 1 | -1 = rawOrd === "desc" ? -1 : 1;
            sortObj = { [sortField]: ord };
        }

        let query = GameModel.find(filter)
            .select("title subtitle visuals.cover slug gameId")
            .skip(start)
            .limit(count);

        if (sortObj) {
            query = query.sort(sortObj);
        }

        const [games, totalCount] = await Promise.all([
            query.lean(),
            GameModel.countDocuments(filter),
        ]);

        const gamesMeta = games.length > 0 ? games.map(metaFromGameDocument) : [];

        return { games: gamesMeta, totalCount };
    } catch (error: unknown) {
        console.error("Failed to fetch games meta:", error instanceof Error ? error.message : String(error));
        return { games: [], totalCount: 0 };
    }
}

/**
 * Distinct publisher and platform values for the public store filter sidebar.
 */
export async function getStoreFilterOptions(): Promise<{
    publishers: string[];
    platforms: string[];
}> {
    try {
        await connectDB();
        const [publishers, platforms] = await Promise.all([
            GameModel.distinct("metadata.publisher", { status: "published" }),
            GameModel.distinct("metadata.platforms", { status: "published" }),
        ]);
        return {
            publishers: (publishers || []).filter(Boolean),
            platforms: (platforms || []).filter(Boolean),
        };
    } catch (error) {
        console.error("Failed to get store filter options:", error);
        return { publishers: [], platforms: [] };
    }
}

/**
 * Admin view to list all games that have any tag assigned.
 */
export async function getAllTaggedGames(): Promise<TaggedGame[]> {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
        return [];
    }

    try {
        await connectDB();
        const games = await GameModel.find({
            tags: {
                $exists: true,
                $not: { $size: 0 },
            },
        })
            .select("gameId title subtitle slug synopsis visuals.cover metadata.publisher metadata.genres rating.score tags tagFeatures")
            .lean();

        if (!games) {
            return [];
        }

        return games.map((g) => taggedGameFromGameDocument(g));
    } catch (error: unknown) {
        console.error("Failed to fetch tagged games:", error instanceof Error ? error.message : String(error));
        return [];
    }
}

/**
 * Admin view of games matching a specific tag (includes drafts and active tag features).
 */
export async function getAdminGamesByTag(tag: GameTag): Promise<TaggedGame[]> {
    try {
        await connectDB();
        await triggerScheduledPublishCheck();
        const games = await GameModel.find({
            $or: [{ tags: tag }, { "tagFeatures.type": tag }],
        })
            .select("gameId title subtitle slug synopsis visuals.cover metadata.publisher metadata.genres rating.score tags tagFeatures status")
            .populate({
                path: "metadata.genres",
                select: "name",
            })
            .lean();

        return games.map((g) => taggedGameFromGameDocument(g, tag));
    } catch (error) {
        console.error(`Failed to fetch admin games for tag ${tag}:`, error);
        return [];
    }
}

/**
 * Minimal title/id/cover list of all games for select dropdowns.
 */
export async function getAllGamesForSelect(): Promise<{ id: string; title: string; cover?: string }[]> {
    try {
        await connectDB();
        await triggerScheduledPublishCheck();
        const games = await GameModel.find({})
            .select("gameId title visuals.cover")
            .sort({ title: 1 })
            .lean();

        return games.map((g) => ({
            id: sqids.encode([g.gameId, 1]),
            title: g.title,
            cover: g.visuals?.cover?.url || "",
        }));
    } catch (error) {
        console.error("Failed to fetch games for select:", error);
        return [];
    }
}

/**
 * Public per-request cached fetch of games with a specific tag (only published).
 */
export const getGamesByTag = cache(async (tag: GameTag, limit?: number): Promise<TaggedGame[]> => {
    try {
        await connectDB();
        await triggerScheduledPublishCheck();

        let query = GameModel.find({ tags: tag, status: "published" })
            .select("gameId title subtitle slug synopsis visuals.cover metadata.publisher metadata.genres rating.score tags tagFeatures")
            .populate({
                path: "metadata.genres",
                select: "name",
            });

        if (limit) query = query.limit(limit);

        const games = await query.lean();
        if (!games || games.length === 0) {
            return [];
        }

        return games.map((g) => taggedGameFromGameDocument(g, tag));
    } catch (error: unknown) {
        console.error(`Failed to fetch games by tag: ${tag}`, error instanceof Error ? error.message : String(error));
        return [];
    }
});

/**
 * Public per-request cached fetch of coming-soon tagged games.
 * Returns both draft and published games that have the coming-soon tag,
 * so upcoming entries added as drafts are still visible in the home page.
 * Individual game pages are still protected (only published games accessible).
 */
export const getComingSoonGames = cache(async (limit?: number): Promise<TaggedGame[]> => {
    try {
        await connectDB();
        await triggerScheduledPublishCheck();

        let query = GameModel.find({
            tags: GAME_TAGS.COMING_SOON,
            status: { $in: ["draft", "published"] },
        })
            .select("gameId title subtitle slug synopsis visuals.cover metadata.publisher metadata.genres rating.score tags tagFeatures status")
            .populate({
                path: "metadata.genres",
                select: "name",
            });

        if (limit) query = query.limit(limit);

        const games = await query.lean();
        if (!games || games.length === 0) {
            return [];
        }

        return games.map((g) => taggedGameFromGameDocument(g, GAME_TAGS.COMING_SOON));
    } catch (error: unknown) {
        console.error(`Failed to fetch coming-soon games`, error instanceof Error ? error.message : String(error));
        return [];
    }
});

/**
 * Public per-request cached fetch of a single full game document by its hash ID.
 */
export const getGameById = cache(async (hashId: string): Promise<GameData | null> => {
    try {
        const decodedArray = sqids.decode(hashId);
        if (decodedArray.length === 0) {
            throw new Error("Invalid Hash ID structure");
        }
        const gameid = decodedArray[0];

        await connectDB();
        await triggerScheduledPublishCheck();
        const game = await GameModel.findOne({ gameId: gameid })
            .populate({
                path: "metadata.genres",
                select: "_id name slug",
            })
            .lean();

        if (!game) {
            throw new Error(`No item found with gameId = ${gameid}`);
        }

        if (game.status !== "published") {
            const session = await auth();
            if (!session || session.user.role !== "admin") {
                return null;
            }
        }

        return fromGameDocument(game);
    } catch (error: unknown) {
        console.error("Failed to fetch gameData:", error instanceof Error ? error.message : String(error));
        return null;
    }
});

/**
 * Public per-request cached fetch of other games from the same publisher.
 */
export const getGamesByPublisher = cache(
    async (
        publisher?: string | null,
        excludeGameSqid?: string | null,
        limit: number = 10
    ): Promise<GameMeta[]> => {
        if (!publisher || !publisher.trim()) return [];

        try {
            await connectDB();
            const filter: Record<string, unknown> = {
                "metadata.publisher": { $regex: new RegExp(`^${escapeRegex(publisher.trim())}$`, "i") },
                status: "published",
            };

            if (excludeGameSqid) {
                const decoded = sqids.decode(excludeGameSqid);
                if (decoded.length > 0) {
                    filter.gameId = { $ne: decoded[0] };
                }
            }

            const games = await GameModel.find(filter)
                .select("title subtitle visuals.cover slug gameId")
                .sort({ publishedAt: -1, createdAt: -1 })
                .limit(limit)
                .lean();

            return games.map(metaFromGameDocument);
        } catch (error: unknown) {
            console.error("Failed to fetch games by publisher:", error instanceof Error ? error.message : String(error));
            return [];
        }
    }
);

/**
 * Public per-request cached fetch of games with similar genres.
 */
export const getSimilarGamesByGenre = cache(
    async (
        genreIds?: (string | mongoose.Types.ObjectId)[] | null,
        excludeGameSqid?: string | null,
        limit: number = 10
    ): Promise<GameMeta[]> => {
        if (!genreIds || genreIds.length === 0) return [];

        try {
            await connectDB();

            const objectIds: mongoose.Types.ObjectId[] = [];
            const namesOrSlugs: string[] = [];

            for (const g of genreIds) {
                if (typeof g === "string") {
                    if (mongoose.Types.ObjectId.isValid(g)) {
                        objectIds.push(new mongoose.Types.ObjectId(g));
                    } else if (g.trim()) {
                        namesOrSlugs.push(g.trim());
                    }
                } else if (g instanceof mongoose.Types.ObjectId) {
                    objectIds.push(g);
                }
            }

            if (namesOrSlugs.length > 0) {
                const matchedGenres = await GenreModel.find({
                    $or: [
                        { name: { $in: namesOrSlugs } },
                        { slug: { $in: namesOrSlugs } },
                    ],
                })
                    .select("_id")
                    .lean();

                for (const mg of matchedGenres) {
                    objectIds.push(mg._id as mongoose.Types.ObjectId);
                }
            }

            if (objectIds.length === 0) return [];

            const filter: Record<string, unknown> = {
                "metadata.genres": { $in: objectIds },
                status: "published",
            };

            if (excludeGameSqid) {
                const decoded = sqids.decode(excludeGameSqid);
                if (decoded.length > 0) {
                    filter.gameId = { $ne: decoded[0] };
                }
            }

            const games = await GameModel.find(filter)
                .select("title subtitle visuals.cover slug gameId")
                .sort({ publishedAt: -1, createdAt: -1 })
                .limit(limit)
                .lean();

            return games.map(metaFromGameDocument);
        } catch (error: unknown) {
            console.error("Failed to fetch similar games by genre:", error instanceof Error ? error.message : String(error));
            return [];
        }
    }
);

/**
 * Per-request cached FAQ items for a game.
 */
export const getGameFaqs = cache(async (gameIdentifier: string) => {
    try {
        const decoded = sqids.decode(gameIdentifier);
        if (!decoded || decoded.length < 1) return [];

        await connectDB();

        const game = await GameModel.findOne({gameId : decoded[0]}).select("faqs").lean();
        return (game?.faqs || []).map((f: any) => ({
            title: f.title,
            body: f.body,
            category: f.category || "General",
        }));
    } catch {
        return [];
    }
});
