import { cache } from "react";
import connectDB from "@/lib/mongodb";
import { sqids } from "@/lib/sqids";
import UserModel from "@/models/user.model";
import GameModel from "@/models/game.model";
import CommentModel from "@/models/comments.model";
import type { ProfileData, UserSummary } from "@/types/profile";
import type { UserCommentItem, UserLikedItem } from "@/types/discussion";
import { fromUserDocument, summaryFromUserDocument } from "@/lib/dbMappings";
import { auth } from "@/auth";

export type { UserCommentItem, UserLikedItem };

/**
 * Fetches full profile data for a specific user hash.
 */
export const getUserById = cache(async (hashId: string): Promise<ProfileData | null> => {
    try {
        const decodedArray = sqids.decode(hashId);
        if (decodedArray.length === 0) {
            throw new Error("Invalid Hash ID structure");
        }
        const userId = decodedArray[0];

        await connectDB();

        const user = await UserModel.findOne({ userId })
            .populate({
                path: "favoriteGames",
                select: "gameId slug title subtitle visuals.cover",
            })
            .populate({
                path: "library",
                select: "gameId slug title subtitle visuals.cover",
            })
            .populate({
                path: "wishlist",
                select: "gameId slug title subtitle visuals.cover",
            })
            .lean();

        if (!user) {
            throw new Error(`No user found with userId = ${userId}`);
        }

        return fromUserDocument(user);
    } catch (error: unknown) {
        console.error("Failed to fetch User:", error instanceof Error ? error.message : String(error));
        return null;
    }
});

/**
 * Admin query to list all registered users.
 */
export async function getAllUsers(): Promise<UserSummary[]> {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
        return [];
    }

    try {
        await connectDB();
        const users = await UserModel.find({})
            .select("userId handle email createdAt updatedAt badges isBanned banReason warnings")
            .lean();

        if (!users) {
            throw new Error("No user found");
        }

        return users.map(summaryFromUserDocument);
    } catch (error: unknown) {
        console.error("Failed to fetch users:", error instanceof Error ? error.message : String(error));
        return [];
    }
}

/**
 * Checks whether a specific game is in a user's wishlist.
 */
export const isGameInUserWishlist = cache(async (userSqid?: string | null, gameSqid?: string | null): Promise<boolean> => {
    if (!userSqid || !gameSqid) return false;
    try {
        const userIds = sqids.decode(userSqid);
        const gameIds = sqids.decode(gameSqid);
        if (userIds.length === 0 || gameIds.length === 0) return false;

        await connectDB();
        const gameDoc = await GameModel.findOne({ gameId: gameIds[0] }).select("_id").lean();
        if (!gameDoc) return false;

        const user = await UserModel.findOne({
            userId: userIds[0],
            wishlist: gameDoc._id,
        }).select("_id").lean();

        return !!user;
    } catch (error) {
        console.error("Error checking user wishlist:", error);
        return false;
    }
});

/**
 * Fetches recent comments authored by a user.
 */
export const getUserComments = cache(async (userIdHash: string): Promise<UserCommentItem[]> => {
    try {
        const decoded = sqids.decode(userIdHash);
        if (decoded.length === 0) return [];
        const userId = decoded[0];

        await connectDB();
        const user = await UserModel.findOne({ userId }).select("_id").lean();
        if (!user) return [];

        const comments = await CommentModel.find({ author: user._id })
            .populate({
                path: "gameId",
                select: "title slug visuals.cover",
            })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        return comments.map((c: any) => {
            const game = c.gameId as { title?: string; slug?: string } | undefined;
            return {
                id: c._id.toString(),
                targetTitle: game?.title || "Game Discussion",
                targetType: "Discussion",
                commentText: c.content || "",
                timestamp: c.createdAt ? new Date(c.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                }) : "Recently",
                upvotes: c.upvotes || 0,
                gameSlug: game?.slug,
            };
        });
    } catch (error) {
        console.error("Failed to get user comments:", error);
        return [];
    }
});

/**
 * Fetches all games and comments liked by a user.
 */
export const getUserLikedContent = cache(async (userIdHash: string): Promise<UserLikedItem[]> => {
    try {
        const decoded = sqids.decode(userIdHash);
        if (decoded.length === 0) return [];
        const userId = decoded[0];

        await connectDB();
        const user = await UserModel.findOne({ userId })
            .populate({
                path: "likedGames",
                select: "title slug metadata.developer visuals.cover createdAt",
            })
            .populate({
                path: "likedComments",
                populate: { path: "gameId", select: "title" },
            })
            .lean();

        if (!user) return [];

        const likedGames = ((user as any).likedGames || []).map((g: any) => ({
            id: g._id.toString(),
            title: g.title,
            type: "GAME" as const,
            subtitle: "Curated Title",
            authorOrDeveloper: g.metadata?.developer || "Publisher",
            likedAt: g.createdAt ? new Date(g.createdAt).toLocaleDateString() : "Recently",
            coverUrl: g.visuals?.cover || "",
        }));

        const likedComments = ((user as any).likedComments || []).map((c: any) => ({
            id: c._id.toString(),
            title: c.gameId?.title || "Game Discussion",
            type: "COMMENT" as const,
            subtitle: c.content ? (c.content.slice(0, 80) + "...") : "",
            authorOrDeveloper: "Community Reply",
            likedAt: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "Recently",
        }));

        return [...likedGames, ...likedComments];
    } catch (error) {
        console.error("Failed to get user liked content:", error);
        return [];
    }
});
