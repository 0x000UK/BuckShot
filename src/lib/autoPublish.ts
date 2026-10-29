import connectDB from "./mongodb";
import GameModel from "@/models/game.model";
import { GAME_TAGS } from "./constants/tags";
import { revalidatePath } from "next/cache";
import type { TagFeatures } from "@/types/game";

declare global {
    var __publishSchedulerStarted: boolean | undefined;
}

let lastCheckTime = 0;

/**
 * Ensures that at most `maxCount` games have the "new-release" tag.
 * If more than `maxCount` games have the tag, the oldest games
 * (ordered by publishedAt desc, createdAt desc) have the "new-release" tag removed.
 */
export async function pruneNewReleasesTag(maxCount = 20): Promise<number> {
    try {
        await connectDB();
        const gamesWithNewRelease = await GameModel.find({
            tags: GAME_TAGS.NEW_RELEASE,
        })
            .select("_id gameId tags publishedAt createdAt")
            .sort({ publishedAt: -1, createdAt: -1 })
            .lean();

        if (gamesWithNewRelease.length <= maxCount) {
            return 0;
        }

        const overflowGames = gamesWithNewRelease.slice(maxCount);
        const overflowIds = overflowGames.map((g) => g._id);

        const res = await GameModel.updateMany(
            { _id: { $in: overflowIds } },
            { $pull: { tags: GAME_TAGS.NEW_RELEASE } }
        );

        if (res.modifiedCount > 0) {
            console.log(`[AutoPublish] Pruned "${GAME_TAGS.NEW_RELEASE}" tag from ${res.modifiedCount} older game(s).`);
        }
        return res.modifiedCount || 0;
    } catch (err) {
        console.error("[AutoPublish] Failed to prune new-release tags:", err);
        return 0;
    }
}

/**
 * Checks for any draft games that have reached their scheduledPublishAt time
 * and automatically transitions their status to 'published' while updating tags:
 * - Removes 'coming-soon' (upcoming)
 * - Adds 'new-release'
 * - Prunes 'new-release' tag to keep max 20 games
 * - Revalidates paths
 */
export async function checkAndPublishScheduledGames(): Promise<number> {
    try {
        await connectDB();
        const now = new Date();

        const scheduledGames = await GameModel.find({
            status: "draft",
            scheduledPublishAt: { $lte: now },
        });

        if (!scheduledGames || scheduledGames.length === 0) {
            lastCheckTime = Date.now();
            return 0;
        }

        for (const game of scheduledGames) {
            game.status = "published";
            game.publishedAt = now;
            game.scheduledPublishAt = undefined;

            const currentTags: string[] = Array.isArray(game.tags) ? game.tags : [];
            const updatedTags = currentTags.filter((t) => t !== GAME_TAGS.COMING_SOON);
            if (!updatedTags.includes(GAME_TAGS.NEW_RELEASE)) {
                updatedTags.push(GAME_TAGS.NEW_RELEASE);
            }

            const currentTagFeatures : TagFeatures[] = Array.isArray(game.tagFeatures) ? game.tagFeatures : [];
            
            const updatedTagFeatures = currentTagFeatures.map((t : TagFeatures) => {
                if(t.type == GAME_TAGS.COMING_SOON) {
                    return {...t , type : GAME_TAGS.NEW_RELEASE}; //Order of spread op matters
                }
                return t;
            })
            game.tags = updatedTags;
            game.tagFeatures = updatedTagFeatures;
            game.markModified("tags");
            game.markModified("tagFeatures")

            await game.save();
        }

        // Maintain at most 20 games in new-release
        await pruneNewReleasesTag(20);

        // Revalidate Next.js cache so the public store and admin views reflect updates
        try {
            revalidatePath("/a/dashboard/games");
            revalidatePath("/a/dashboard/overview");
            revalidatePath("/a/dashboard/tags");
            revalidatePath("/a/dashboard/tags/new-release");
            revalidatePath("/store");
            revalidatePath("/t/new-release");
            revalidatePath("/");
            for (const g of scheduledGames) {
                if (g.slug) {
                    revalidatePath(`/g/${g.gameId}/${g.slug}`);
                }
            }
        } catch {
            // Revalidation outside request context (e.g. background timer) is caught safely
        }

        lastCheckTime = Date.now();
        //console.log(`[AutoPublish] Successfully published and updated tags for ${scheduledGames.length} scheduled game(s).`);
        return scheduledGames.length;
    } catch (err) {
        //console.error("[AutoPublish] Error checking scheduled games:", err);
        return 0;
    }
}

/**
 * Throttled check that runs during query execution (at most once every 5 seconds)
 */
export async function triggerScheduledPublishCheck(): Promise<void> {
    const now = Date.now();
    if (now - lastCheckTime > 5000) {
        lastCheckTime = now;
        await checkAndPublishScheduledGames();
    }
}

// Start recurring timer in active Node.js server process (checks every 30 seconds)
if (typeof window === "undefined" && !globalThis.__publishSchedulerStarted) {
    globalThis.__publishSchedulerStarted = true;
    setInterval(() => {
        checkAndPublishScheduledGames().catch(() => {});
    }, 300000);
}
