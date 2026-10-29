import { cache } from "react";
import connectDB from "@/lib/mongodb";
import { sqids } from "@/lib/sqids";
import GameModel from "@/models/game.model";
import CommentModel from "@/models/comments.model";
import type { DiscussionComment } from "@/types/discussion";
import type { Badge } from "@/types/profile";

/**
 * Fetches threaded comments and discussions for a specific game.
 */
export const getGameDiscussions = cache(async (hashId: string): Promise<DiscussionComment[]> => {
    try {
        const decodedArray = sqids.decode(hashId);
        if (decodedArray.length === 0) return [];
        const gameIdNum = decodedArray[0];

        await connectDB();
        const game = await GameModel.findOne({ gameId: gameIdNum }).select("_id gameId").lean();
        if (!game) return [];

        const comments = await CommentModel.find({ gameId: game._id })
            .populate({
                path: "author",
                select: "name handle avatar badges userId banner background about",
            })
            .sort({ pinned: -1, createdAt: -1 })
            .lean();

        return comments.map((c) => {
            const authorDoc = c.author as unknown as {
                name?: string;
                handle?: string;
                avatar?: string | null;
                badges?: Badge[];
                userId?: number;
                banner?: { type?: "image" | "video" | "color"; image?: string; video?: string; color?: string };
                background?: string;
                about?: string;
            };

            const authorInitials = authorDoc?.name
                ? authorDoc.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
                : "?";

            return {
                id: c._id.toString(),
                gameId: hashId,
                parentId: c.parentId ? c.parentId.toString() : null,
                title: c.title || undefined,
                author: {
                    id: authorDoc?.userId ? sqids.encode([authorDoc.userId, 2]) : c._id.toString(),
                    name: authorDoc?.name || "Anonymous User",
                    handle: authorDoc?.handle,
                    avatar: authorDoc?.avatar || authorInitials,
                    banner: authorDoc?.banner || { type: "color" as const, color: "#232323" },
                    background: authorDoc?.background || "#c4a97d",
                    about: authorDoc?.about || "",
                    badges: (authorDoc?.badges || []) as Badge[],
                },
                content: c.content,
                createdAt: c.createdAt ? new Date(c.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                }) : "Recently",
                upvotes: c.upvotes || 0,
                downvotes: c.downvotes || 0,
                totalReplies: c.totalReplies || 0,
                pinned: !!c.pinned,
            };
        });
    } catch (error: unknown) {
        console.error("Failed to fetch game discussions:", error instanceof Error ? error.message : String(error));
        return [];
    }
});
