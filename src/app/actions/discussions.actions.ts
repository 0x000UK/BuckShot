'use server'

import { auth } from "@/auth"
import connectDB from "@/lib/mongodb"
import GameModel from "@/models/game.model"
import UserModel from "@/models/user.model"
import CommentModel from "@/models/comments.model"
import MetricModel from "@/models/metric.model"
import { revalidatePath } from "next/cache"
import { sqids } from "@/lib/sqids"
import mongoose from "mongoose"
import type { DiscussionComment } from "@/types/discussion"
import { isUserModerator } from "@/lib/utils"

export async function addDiscussionComment(payload: {
    gameId: string;
    content: string;
    title?: string;
    parentId?: string | null;
}): Promise<{ success: boolean; error?: string; comment?: DiscussionComment }> {
    const session = await auth();
    if (!session || !session.user) {
        return { success: false, error: "Please sign in to join the discussion." };
    }

    if (!payload.content || payload.content.trim().length === 0) {
        return { success: false, error: "Comment content cannot be empty." };
    }

    try {
        const decodedArray = sqids.decode(payload.gameId);
        if (decodedArray.length === 0) {
            return { success: false, error: "Invalid game ID." };
        }
        const gameIdNum = decodedArray[0];

        await connectDB();
        const [game, user] = await Promise.all([
            GameModel.findOne({ gameId: gameIdNum }).select('_id slug gameId'),
            UserModel.findOne({ handle: session.user.handle }).select('_id name handle avatar badges userId banner background about isBanned banReason')
        ]);

        if (!game) return { success: false, error: "Game not found." };
        if (!user) return { success: false, error: "User account not found." };
        if (user.isBanned) {
            return {
                success: false,
                error: user.banReason
                    ? `Your account is suspended from discussions: ${user.banReason}`
                    : "Your account is currently suspended from participating in discussions.",
            };
        }

        const newComment = await CommentModel.create({
            gameId: game._id,
            author: user._id,
            parentId: payload.parentId ? new mongoose.Types.ObjectId(payload.parentId) : null,
            title: payload.title?.trim() || undefined,
            content: payload.content.trim(),
            upvotes: 0,
            downvotes: 0,
            totalReplies: 0,
            pinned: false,
        });

        if (payload.parentId) {
            await CommentModel.findByIdAndUpdate(payload.parentId, {
                $inc: { totalReplies: 1 }
            });
        }

        const todayStr = new Date().toISOString().split("T")[0];
        await MetricModel.findOneAndUpdate(
            { date: todayStr },
            { $inc: { discussions: 1 } },
            { upsert: true }
        ).catch(() => {});

        revalidatePath(`/g/${payload.gameId}`);
        if (game.slug) {
            revalidatePath(`/g/${payload.gameId}/${game.slug}`);
        }

        const authorInitials = user.name
            ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
            : '?';

        return {
            success: true,
            comment: {
                id: newComment._id.toString(),
                gameId: payload.gameId,
                parentId: payload.parentId || null,
                title: newComment.title,
                author: {
                    id: user.userId ? sqids.encode([user.userId, 2]) : user._id.toString(),
                    name: user.name,
                    handle: user.handle,
                    avatar: user.avatar || authorInitials,
                    banner: user.banner || { type: 'color' as const, color: '#232323' },
                    background: user.background || '#c4a97d',
                    about: user.about || '',
                    badges: user.badges || [],
                },
                content: newComment.content,
                createdAt: 'Just now',
                upvotes: 0,
                downvotes: 0,
                totalReplies: 0,
                pinned: false,
            }
        };
    } catch (err: unknown) {
        console.error("Failed to add comment:", err);
        return { success: false, error: err instanceof Error ? err.message : "Failed to post comment." };
    }
}

export async function voteDiscussionComment(commentId: string, dir: 'up' | 'down'): Promise<{ success: boolean }> {
    try {
        await connectDB();
        const update = dir === 'up' ? { $inc: { upvotes: 1 } } : { $inc: { downvotes: 1 } };
        await CommentModel.findByIdAndUpdate(commentId, update);
        return { success: true };
    } catch (err: unknown) {
        console.error("Failed to vote comment:", err);
        return { success: false };
    }
}

export async function togglePinDiscussionPost(
    commentId: string
): Promise<{ success: boolean; pinned?: boolean; error?: string }> {
    const session = await auth();
    if (!session || !isUserModerator(session.user)) {
        return { success: false, error: "Unauthorized. Moderator privileges required." };
    }

    try {
        await connectDB();
        const comment = await CommentModel.findById(commentId);
        if (!comment) return { success: false, error: "Comment not found." };
        if (comment.parentId) {
            return { success: false, error: "Only top-level discussion posts can be pinned." };
        }

        const newPinned = !comment.pinned;
        comment.pinned = newPinned;
        await comment.save();

        const game = await GameModel.findById(comment.gameId).select("gameId slug");
        if (game) {
            const hashId = sqids.encode([game.gameId, 2]);
            revalidatePath(`/g/${hashId}`);
            if (game.slug) revalidatePath(`/g/${hashId}/${game.slug}`);
        }

        return { success: true, pinned: newPinned };
    } catch (err: unknown) {
        console.error("Failed to toggle pin on discussion post:", err);
        return { success: false, error: err instanceof Error ? err.message : "Failed to toggle pin." };
    }
}

export async function deleteDiscussionComment(
    commentId: string
): Promise<{ success: boolean; error?: string }> {
    const session = await auth();
    if (!session || !session.user) {
        return { success: false, error: "Please sign in to perform this action." };
    }

    try {
        await connectDB();
        const comment = await CommentModel.findById(commentId);
        if (!comment) return { success: false, error: "Comment not found." };

        const currentUser = await UserModel.findOne({ handle: session.user.handle }).select(
            "_id role badges"
        );
        if (!currentUser) return { success: false, error: "User account not found." };

        const isMod = isUserModerator({ role: currentUser.role, badges: currentUser.badges });
        const isAuthor = comment.author.equals(currentUser._id);

        if (!isMod && !isAuthor) {
            return { success: false, error: "Unauthorized to delete this comment." };
        }

        // If it's a child reply, decrement totalReplies on the parent
        if (comment.parentId) {
            await CommentModel.findByIdAndUpdate(comment.parentId, {
                $inc: { totalReplies: -1 },
            });
        } else {
            // Cascade delete child replies
            await CommentModel.deleteMany({ parentId: comment._id });
        }

        await CommentModel.findByIdAndDelete(commentId);

        const game = await GameModel.findById(comment.gameId).select("gameId slug");
        if (game) {
            const hashId = sqids.encode([game.gameId, 2]);
            revalidatePath(`/g/${hashId}`);
            if (game.slug) revalidatePath(`/g/${hashId}/${game.slug}`);
        }

        return { success: true };
    } catch (err: unknown) {
        console.error("Failed to delete comment:", err);
        return { success: false, error: err instanceof Error ? err.message : "Failed to delete comment." };
    }
}

export async function warnDiscussionUser({
    targetUserId,
    reason,
}: {
    targetUserId: string;
    reason: string;
}): Promise<{ success: boolean; warningCount?: number; error?: string }> {
    const session = await auth();
    if (!session || !isUserModerator(session.user)) {
        return { success: false, error: "Unauthorized. Moderator privileges required." };
    }

    if (!reason || !reason.trim()) {
        return { success: false, error: "Warning reason is required." };
    }

    try {
        await connectDB();
        const decoded = sqids.decode(targetUserId);
        const issuer = await UserModel.findOne({ handle: session.user.handle }).select("_id");
        if (!issuer) return { success: false, error: "Moderator account not found." };

        let user;
        if (decoded.length > 0) {
            user = await UserModel.findOne({ userId: decoded[0] });
        }
        if (!user && mongoose.Types.ObjectId.isValid(targetUserId)) {
            user = await UserModel.findById(targetUserId);
        }
        if (!user) return { success: false, error: "Target user not found." };

        user.warnings = user.warnings || [];
        user.warnings.push({
            reason: reason.trim(),
            issuedBy: issuer._id,
            createdAt: new Date(),
        });
        await user.save();

        return { success: true, warningCount: user.warnings.length };
    } catch (err: unknown) {
        console.error("Failed to issue warning:", err);
        return { success: false, error: err instanceof Error ? err.message : "Failed to issue warning." };
    }
}

export async function banDiscussionUser({
    targetUserId,
    reason,
}: {
    targetUserId: string;
    reason: string;
}): Promise<{ success: boolean; error?: string }> {
    const session = await auth();
    if (!session || !isUserModerator(session.user)) {
        return { success: false, error: "Unauthorized. Moderator privileges required." };
    }

    try {
        await connectDB();
        const decoded = sqids.decode(targetUserId);

        let user;
        if (decoded.length > 0) {
            user = await UserModel.findOne({ userId: decoded[0] });
        }
        if (!user && mongoose.Types.ObjectId.isValid(targetUserId)) {
            user = await UserModel.findById(targetUserId);
        }
        if (!user) return { success: false, error: "Target user not found." };

        user.isBanned = true;
        user.banReason = reason.trim() || "Violation of community forum standards";
        user.bannedAt = new Date();
        await user.save();

        return { success: true };
    } catch (err: unknown) {
        console.error("Failed to ban user:", err);
        return { success: false, error: err instanceof Error ? err.message : "Failed to ban user." };
    }
}
