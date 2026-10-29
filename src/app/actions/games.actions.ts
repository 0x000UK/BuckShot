'use server'

import { auth } from "@/auth"
import connectDB from "@/lib/mongodb"
import GameModel from "@/models/game.model"
import GenreModel from "@/models/genre.model"
import CommentModel from "@/models/comments.model"
import DownloadClickModel from "@/models/downloadClick.model"
import UserModel from "@/models/user.model"
import CounterModel from "@/models/counter.model"
import { type GameTag, type Genre, type OfficialDownloadLink, type TagFeatures } from "@/types/game"
import { revalidatePath } from "next/cache"
import z from "zod"
import { sqids } from "@/lib/sqids"
import { GameValidationSchema, GenreValidationSchema, type GameData } from "@/lib/game"
import { toGameDocument } from "@/lib/dbMappings"
import { isUserModerator } from "@/lib/utils"
import { pruneNewReleasesTag } from "@/lib/autoPublish"
import { GAME_TAGS } from "@/lib/constants/tags"
import type { SaveState, SavePayloadItem, GameUpdatePayloadItem } from "./types"

interface ValidationResult {
    isValid: boolean;
    validatedPayloads: Array<{ id: string; data: Partial<GameData> }>;
    errors: Record<string, Record<string, string[]>>;
}

function validateUpdatePayload(payload: GameUpdatePayloadItem[]): ValidationResult {
    const allErrors: Record<string, Record<string, string[]>> = {};
    const validatedPayloads: Array<{ id: string; data: Partial<GameData> }> = [];

    for (const item of payload) {
        const dynamicShape: Record<string, z.ZodTypeAny> = {};
        const itemErrors: string[] = [];
        const filteredData: Record<string, unknown> = {};

        item.keysToValidate.forEach((key) => {
            if (key in GameValidationSchema.shape) {
                dynamicShape[key] = (GameValidationSchema.shape as Record<string, z.ZodTypeAny>)[key];
                filteredData[key] = item.data[key];
            } else {
                itemErrors.push(`Field '${String(key)}' does not exist on Game Schema.`);
            }
        });

        if (itemErrors.length > 0) {
            allErrors[item.id] = { _system: itemErrors };
            continue;
        }

        const runtimeSchema = z.object(dynamicShape);
        const result = runtimeSchema.safeParse(filteredData);

        if (!result.success) {
            const fieldErrors = result.error.flatten().fieldErrors;
            allErrors[item.id] = {};

            Object.entries(fieldErrors).forEach(([field, messages]) => {
                if (Array.isArray(messages)) {
                    allErrors[item.id][field] = messages;
                } else if (messages) {
                    allErrors[item.id][field] = ["Validation failed for this field."];
                }
            });
        } else {
            validatedPayloads.push({
                id: item.id,
                data: result.data as Partial<GameData>
            });
        }
    }

    return {
        isValid: Object.keys(allErrors).length === 0,
        validatedPayloads,
        errors: allErrors
    };
}

export async function reserveGameId(): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
        const session = await auth();
        if (!session || session.user?.role !== 'admin') {
            return { success: false, error: "Unauthorized: Admin privileges required." };
        }

        await connectDB();
        const counter = await CounterModel.findOneAndUpdate(
            { id: 'gameId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        const sqid = sqids.encode([counter.seq, 1]);
        return { success: true, id: sqid };
    } catch (err: unknown) {
        console.error("Failed to reserve game ID:", err);
        return {
            success: false,
            error: err instanceof Error ? err.message : "Failed to reserve game ID",
        };
    }
}

export async function SaveGameData(payload: SavePayloadItem): Promise<SaveState> {
    try {
        // 1. Check user session
        const session = await auth();
    
        if (!session || session.user.role !== 'admin') {
            return { success: false, errors: { message: "User Unauthorized" } };
        }

        // 2. Connect DB first so we can resolve references
        await connectDB();

        // 3. Run the validation check
        const validatedFields = GameValidationSchema.safeParse(payload.data);

        if (!validatedFields.success) {
            return {
                success: false,
                errors: z.treeifyError(validatedFields.error),
            };
        }

        // 4. Decode the official game SQID
        const ids = sqids.decode(payload.id);
        if (!ids || ids.length === 0) {
            return {
                success: false,
                errors: { message: "Invalid or missing Game SQID structure." },
            };
        }

        const numericGameId = ids[0];

        // 5. Get mongoDB compatible Game object 
        const game = toGameDocument(payload.data);

        let gameDoc = await GameModel.findOne({ gameId: numericGameId });
        if (!gameDoc) {
            gameDoc = new GameModel({
                ...game,
                gameId: numericGameId,
            });
        } else {
            gameDoc.set(game);
            gameDoc.gameId = numericGameId;
        }
        await gameDoc.save();

        revalidatePath('/a/dashboard/games');
        return { success: true, errors: {} };
    } catch (error: unknown) {
        console.error('CRITICAL CRASH IN SaveGameData: ', error);
        return {
            success: false,
            errors: {
                message: error instanceof Error ? error.message : 'Failed to save data. Please contact an admin.'
            }
        };
    }
}

export async function SaveGenre(state: SaveState, data: Genre): Promise<SaveState> {
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
        return { success: false, errors: { server: "User Unauthorized" } };
    }

    const validData = GenreValidationSchema.safeParse(data);

    if (!validData.success) {
        return {
            success: false,
            errors: z.treeifyError(validData.error),
        };
    }

    try {
        await connectDB();

        const res = await GenreModel.create(data);
    
        if (!res) {
            return {
                success: false,
                errors: {
                    message: "Error in saving data"
                }
            };
        }

        revalidatePath('/a/dashboard/genre');
        return { success: true, errors: {} };
    } catch (error: unknown) {
        console.error('CRITICAL CRASH IN SaveGenre: ', error);
        return {
            success: false,
            errors: {
                message: error instanceof Error ? error.message : 'Internal Server Error'
            }
        };
    }
}

export async function UpdateGameData(prev: SaveState, payload: GameUpdatePayloadItem[]): Promise<SaveState> {
    try {
        // 1. Session and Authentication Guard
        const session = await auth();
        if (!session || session.user?.role !== 'admin') {
            return { 
                success: false, 
                errors: { message: "User Unauthorized. Administrator privileges required." } 
            };
        }

        // 2. Short-circuit on Empty Payload
        if (!payload || payload.length === 0) {
            return { success: true, errors: {} };
        }

        // 3. Validate data
        const { isValid, validatedPayloads, errors } = validateUpdatePayload(payload);

        if (!isValid) {
            return {
                success: false,
                errors: {
                    message: "Validation failed on some fields.",
                    ...errors
                }
            };
        }

        // 4. Connect Database
        await connectDB();

        // 5. Update in bulk
        const bulkOps = validatedPayloads.map(p => {
            const ids = sqids.decode(p.id);
            if (ids.length === 0) throw new Error("One or more game ids are missing or invalid");
            return {
                updateOne: {
                    filter: { gameId: ids[0] },
                    update: { $set: p.data },
                    runValidators: true
                }
            };
        });

        try {
            await GameModel.bulkWrite(bulkOps, { ordered: false });
        } catch (dbError: unknown) {
            const errObj = dbError as { name?: string; writeErrors?: Array<{ index: number; errmsg?: string }> };
            if (errObj.name === "BulkWriteError" && errObj.writeErrors) {
                const dbTrackedErrors: Record<string, { dbWriteError: string[] }> = {};
                
                errObj.writeErrors.forEach((err) => {
                    const originalOpIndex = err.index;
                    const failedItem = validatedPayloads[originalOpIndex];
                    if (failedItem) {
                        dbTrackedErrors[failedItem.id] = {
                            dbWriteError: [err.errmsg || "Database constraint validation failed."]
                        };
                    }
                });

                return {
                    success: false,
                    errors: {
                        message: "Database insertion constraints failed.",
                        ...dbTrackedErrors
                    }
                };
            }
            throw dbError;
        }

        revalidatePath('/a/dashboard/games');
        revalidatePath('/a/dashboard/tags');
        return { success: true, errors: {} };

    } catch (error: unknown) {
        console.error("CRITICAL CRASH IN UpdateGameData:", error);
        return {
            success: false,
            errors: {
                message: error instanceof Error ? error.message : 'Internal Server Error'
            }
        };
    }
}

export async function deleteGame(
    gameIdHash: string
): Promise<{ success: boolean; error?: string }> {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
        return { success: false, error: "Unauthorized. Admin privileges required." };
    }

    const decoded = sqids.decode(gameIdHash);
    if (decoded.length === 0) {
        return { success: false, error: "Invalid Game ID." };
    }
    const numericGameId = decoded[0];

    try {
        await connectDB();
        const game = await GameModel.findOne({ gameId: numericGameId });
        if (!game) {
            return { success: false, error: "Game not found." };
        }

        // Cascade cleanup related collections
        await Promise.all([
            GameModel.deleteOne({ _id: game._id }),
            CommentModel.deleteMany({ gameId: game._id }),
            DownloadClickModel.deleteMany({ gameId: numericGameId }),
            UserModel.updateMany({ wishlist: game._id }, { $pull: { wishlist: game._id } }),
        ]);

        revalidatePath("/a/dashboard/games");
        revalidatePath("/a/dashboard/overview");
        revalidatePath("/store");
        revalidatePath("/");

        return { success: true };
    } catch (err: unknown) {
        console.error("Failed to delete game:", err);
        return {
            success: false,
            error: err instanceof Error ? err.message : "Failed to delete game.",
        };
    }
}

export async function scheduleGamePublish(
    gameIdHash: string,
    publishAt: string | null
): Promise<{
    success: boolean;
    status?: string;
    publishedAt?: string;
    scheduledPublishAt?: string | null;
    error?: string;
}> {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
        return { success: false, error: "Unauthorized. Admin privileges required." };
    }

    const decoded = sqids.decode(gameIdHash);
    if (decoded.length === 0) {
        return { success: false, error: "Invalid Game ID." };
    }
    const numericGameId = decoded[0];

    try {
        await connectDB();
        const game = await GameModel.findOne({ gameId: numericGameId });
        if (!game) {
            return { success: false, error: "Game not found." };
        }

        // Cancel schedule if cleared
        if (!publishAt || !publishAt.trim()) {
            game.scheduledPublishAt = undefined;
            if (Array.isArray(game.tags)) {
                game.tags = game.tags.filter((t: string) => t !== GAME_TAGS.COMING_SOON);
                game.markModified("tags");
            }
            await game.save();
            revalidatePath("/a/dashboard/games");
            return { success: true, status: game.status, scheduledPublishAt: null };
        }

        const targetDate = new Date(publishAt);
        if (isNaN(targetDate.getTime())) {
            return { success: false, error: "Invalid publication date and time." };
        }

        const now = new Date();
        if (targetDate <= now) {
            // Immediate publish
            game.status = "published";
            game.publishedAt = now;
            game.scheduledPublishAt = undefined;

            // Replace "coming-soon" with "new-release" in both tags and tag features
            const currentTags: string[] = Array.isArray(game.tags) ? game.tags : [];
            const currentTagFeatures : TagFeatures[] = Array.isArray(game.tagFeatures) ? game.tagFeatures : [];

            const updatedTagFeatures = currentTagFeatures.map((t : TagFeatures) => {
                if(t.type == GAME_TAGS.COMING_SOON) {
                    return {...t , type : GAME_TAGS.NEW_RELEASE}; //Order of spread op matters
                }
                return t;
            })
            const updatedTags = currentTags.filter((t) => t !== GAME_TAGS.COMING_SOON);
            if (!updatedTags.includes(GAME_TAGS.NEW_RELEASE)) {
                updatedTags.push(GAME_TAGS.NEW_RELEASE);
            }
            game.tags = updatedTags;
            game.tagFeatures = updatedTagFeatures;
            game.markModified("tags");
            game.markModified("tagFeatures")

            await game.save();
            await pruneNewReleasesTag(20);

            revalidatePath("/a/dashboard/games");
            revalidatePath("/a/dashboard/overview");
            revalidatePath("/store");
            if (game.slug) revalidatePath(`/g/${gameIdHash}/${game.slug}`);

            return {
                success: true,
                status: "published",
                publishedAt: now.toISOString(),
                scheduledPublishAt: null,
            };
        } else {
            // Future scheduled publish
            game.status = "draft";
            game.scheduledPublishAt = targetDate;

            // When scheduling a game, update the game tag to add "upcoming" (coming-soon) and remove "new-release"
            const currentTags: string[] = Array.isArray(game.tags) ? game.tags : [];
            const updatedTags = currentTags.filter((t) => t !== GAME_TAGS.NEW_RELEASE);
            if (!updatedTags.includes(GAME_TAGS.COMING_SOON)) {
                updatedTags.push(GAME_TAGS.COMING_SOON);
            }
            game.tags = updatedTags;
            game.markModified("tags");

            await game.save();

            revalidatePath("/a/dashboard/games");
            revalidatePath("/a/dashboard/overview");

            return {
                success: true,
                status: "draft",
                scheduledPublishAt: targetDate.toISOString(),
            };
        }
    } catch (err: unknown) {
        console.error("Failed to schedule game publish:", err);
        return {
            success: false,
            error: err instanceof Error ? err.message : "Failed to set publish schedule.",
        };
    }
}

export async function saveGameTagFeatureAction(
    gameIdHash: string,
    tag: GameTag,
    features: {
        blurb?: string | null;
        image?: string | null;
        video?: string | null;
    }
): Promise<{ success: boolean; error?: string }> {
    try {
        const session = await auth();
        if (!session || session.user.role !== "admin") {
            return { success: false, error: "Unauthorized. Admin privileges required." };
        }

        const decoded = sqids.decode(gameIdHash);
        if (decoded.length === 0) {
            return { success: false, error: "Invalid Game ID." };
        }

        const numericGameId = decoded[0];
        await connectDB();

        const game = await GameModel.findOne({ gameId: numericGameId });
        if (!game) {
            return { success: false, error: "Game not found in database." };
        }

        // Initialize arrays if missing
        if (!Array.isArray(game.tags)) {
            game.tags = [];
        }
        if (!Array.isArray(game.tagFeatures)) {
            game.tagFeatures = [];
        }

        // Ensure tag is in game.tags
        if (!game.tags.includes(tag)) {
            game.tags.push(tag);
        }

        // Update or insert into tagFeatures
        const existingIdx = game.tagFeatures.findIndex((f: any) => f.type === tag);
        const featurePayload = {
            type: tag,
            blurb: features.blurb?.trim() || undefined,
            image: features.image?.trim() || undefined,
            video: features.video?.trim() || undefined,
        };

        if (existingIdx >= 0) {
            game.tagFeatures[existingIdx] = featurePayload;
        } else {
            game.tagFeatures.push(featurePayload);
        }

        game.markModified("tagFeatures");
        game.markModified("tags");

        await game.save();

        revalidatePath("/a/dashboard/tags");
        revalidatePath(`/a/dashboard/tags/${tag}`);
        revalidatePath("/");
        revalidatePath("/store");
        revalidatePath(`/t/${tag}`);
        if (game.slug) {
            revalidatePath(`/g/${gameIdHash}/${game.slug}`);
        }

        return { success: true };
    } catch (err: unknown) {
        console.error("Failed to save tag feature:", err);
        return {
            success: false,
            error: err instanceof Error ? err.message : "Failed to save tag feature.",
        };
    }
}

export async function removeGameTagFeatureAction(
    gameIdHash: string,
    tag: GameTag
): Promise<{ success: boolean; error?: string }> {
    try {
        const session = await auth();
        if (!session || session.user.role !== "admin") {
            return { success: false, error: "Unauthorized. Admin privileges required." };
        }

        const decoded = sqids.decode(gameIdHash);
        if (decoded.length === 0) {
            return { success: false, error: "Invalid Game ID." };
        }

        const numericGameId = decoded[0];
        await connectDB();

        const game = await GameModel.findOne({ gameId: numericGameId });
        if (!game) {
            return { success: false, error: "Game not found in database." };
        }

        if (Array.isArray(game.tagFeatures)) {
            game.tagFeatures = game.tagFeatures.filter((f: any) => f.type !== tag);
            game.markModified("tagFeatures");
        }
        if (Array.isArray(game.tags)) {
            game.tags = game.tags.filter((t: string) => t !== tag);
            game.markModified("tags");
        }

        await game.save();

        revalidatePath("/a/dashboard/tags");
        revalidatePath(`/a/dashboard/tags/${tag}`);
        revalidatePath("/");
        revalidatePath("/store");
        revalidatePath(`/t/${tag}`);

        return { success: true };
    } catch (err: unknown) {
        console.error("Failed to remove tag feature:", err);
        return {
            success: false,
            error: err instanceof Error ? err.message : "Failed to remove tag feature.",
        };
    }
}

export async function fetchLatestCheapSharkPricesAction(payload: {
    title?: string;
    steamUrlOrAppId?: string;
    existingOfficialDownloads?: OfficialDownloadLink[];
}): Promise<{
    success: boolean;
    officialDownloads: OfficialDownloadLink[];
    error?: string;
    updatedCount: number;
    sourceAppId?: string;
}> {
    const session = await auth();
    if (!session || (session.user.role !== "admin" && !isUserModerator(session.user))) {
        return {
            success: false,
            officialDownloads: payload.existingOfficialDownloads || [],
            error: "Unauthorized. Admin or moderator permissions required.",
            updatedCount: 0,
        };
    }

    const { fetchCrossStorePrices } = await import("@/lib/gameDataService");
    return fetchCrossStorePrices(
        payload.title,
        payload.steamUrlOrAppId,
        payload.existingOfficialDownloads || []
    );
}
