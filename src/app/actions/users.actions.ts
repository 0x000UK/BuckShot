'use server'

import { auth } from "@/auth"
import connectDB from "@/lib/mongodb"
import UserModel from "@/models/user.model"
import CommentModel from "@/models/comments.model"
import { revalidatePath } from "next/cache"
import { sqids } from "@/lib/sqids"
import { usernameRegex, emailRegex } from "@/lib/utils"
import type { ProfileSettings, SocialLink } from "@/types/profile"
import type { SaveState, UserUpdatePayloadItem } from "./types"

export async function UpdateUserData(prev: SaveState, payload: UserUpdatePayloadItem): Promise<SaveState> {
    const session = await auth();
    if (!session || session.user?.role !== 'admin') {
        return { 
            success: false, 
            errors: { message: "User Unauthorized. Administrator privileges required." } 
        };
    }

    if (!payload || !payload.data || Object.keys(payload.data).length === 0) {
        return { success: true, errors: {} };
    }

    const ids = sqids.decode(payload.id);
    if (ids.length === 0) {
        return { success: false, errors: { message: "User ID is missing or invalid" } };
    }

    try {
        await connectDB();

        const res = await UserModel.updateOne(
            { userId: ids[0] },
            { $set: payload.data }
        );

        if (res.matchedCount === 0) {
            return { success: false, errors: { message: "User not found or failed to update data" } };
        }

        revalidatePath('/a/dashboard/users');
        return { success: true, errors: {} };
    } catch (error: unknown) {
        console.error("CRITICAL ERROR IN UpdateUserData: ", error);
        return { 
            success: false, 
            errors: { 
                message: error instanceof Error ? error.message : "Internal Server Error" 
            } 
        };
    }
}

export async function deleteUserAccount(
    userId: string
): Promise<{ success: boolean; error?: string }> {
    const session = await auth();
    if (!session || session.user?.role !== "admin") {
        return { success: false, error: "Unauthorized. Administrator privileges required." };
    }

    try {
        await connectDB();
        const decoded = sqids.decode(userId);
        if (decoded.length === 0) return { success: false, error: "Invalid user ID" };

        const user = await UserModel.findOneAndDelete({ userId: decoded[0] });
        if (!user) return { success: false, error: "User not found" };

        revalidatePath("/a/dashboard/users");
        return { success: true };
    } catch (err: unknown) {
        console.error("Failed to delete user account:", err);
        return { success: false, error: err instanceof Error ? err.message : "Failed to delete user." };
    }
}

export async function updateUserProfileMedia(payload: {
    avatar?: string;
    banner?: {
        type: 'image' | 'video' | 'color';
        image?: string | null;
        video?: string | null;
        color?: string | null;
    };
}): Promise<{ success: boolean; errors?: { message?: string } }> {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
        return { success: false, errors: { message: "Unauthorized. Please log in." } };
    }

    const ids = sqids.decode(session.user.id);
    if (ids.length === 0) {
        return { success: false, errors: { message: "Invalid user session identification." } };
    }
    const userId = ids[0];

    try {
        await connectDB();
        const updateFields: Record<string, unknown> = {};

        if (typeof payload.avatar !== "undefined") {
            updateFields.avatar = payload.avatar;
        }

        if (payload.banner) {
            updateFields.banner = {
                type: payload.banner.type || "image",
                image: payload.banner.image ?? null,
                video: payload.banner.video ?? null,
                color: payload.banner.color ?? "#232323",
            };
        }

        if (Object.keys(updateFields).length === 0) {
            return { success: true };
        }

        const res = await UserModel.updateOne(
            { userId },
            { $set: updateFields }
        );

        if (res.matchedCount === 0) {
            return { success: false, errors: { message: "User account not found." } };
        }

        revalidatePath(`/u/${session.user.id}`);
        if (session.user.handle) {
            revalidatePath(`/u/${session.user.id}/${session.user.handle}`);
        }
        revalidatePath('/(user)/u/[id]/[[...handle]]', 'page');

        return { success: true };
    } catch (error: unknown) {
        console.error("Failed to update user profile media:", error);
        return {
            success: false,
            errors: { message: error instanceof Error ? error.message : "Failed to update profile media." }
        };
    }
}

export async function updateUserBio(about: string): Promise<{ success: boolean; error?: string }> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized. Please log in." };
    }
    const ids = sqids.decode(session.user.id);
    if (ids.length === 0) return { success: false, error: "Invalid user session." };

    try {
        await connectDB();
        await UserModel.updateOne(
            { userId: ids[0] },
            { $set: { about: about.trim() } }
        );

        revalidatePath(`/u/${session.user.id}`);
        if (session.user.handle) {
            revalidatePath(`/u/${session.user.id}/${session.user.handle}`);
        }
        revalidatePath('/(user)/u/[id]/[[...handle]]', 'page');

        return { success: true };
    } catch (err: unknown) {
        console.error("Failed to update bio:", err);
        return { success: false, error: err instanceof Error ? err.message : "Failed to update bio." };
    }
}

export async function updateUserSettings(settings: Partial<ProfileSettings>): Promise<{ success: boolean; error?: string }> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized. Please log in." };
    }
    const ids = sqids.decode(session.user.id);
    if (ids.length === 0) return { success: false, error: "Invalid user session." };

    try {
        await connectDB();
        const setPayload: Record<string, unknown> = {};
        for (const [key, val] of Object.entries(settings)) {
            if (typeof val !== "undefined") {
                setPayload[`settings.${key}`] = val;
            }
        }

        if (Object.keys(setPayload).length > 0) {
            await UserModel.updateOne(
                { userId: ids[0] },
                { $set: setPayload }
            );
        }

        revalidatePath(`/u/${session.user.id}`);
        if (session.user.handle) {
            revalidatePath(`/u/${session.user.id}/${session.user.handle}`);
        }
        revalidatePath('/(user)/u/[id]/[[...handle]]', 'page');

        return { success: true };
    } catch (err: unknown) {
        console.error("Failed to update settings:", err);
        return { success: false, error: err instanceof Error ? err.message : "Failed to update settings." };
    }
}

export async function updateAccountDetails(payload: {
    name?: string;
    handle?: string;
    email?: string;
}): Promise<{ success: boolean; error?: string; updatedUser?: { name: string; handle: string; email: string } }> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized. Please log in." };
    }
    const ids = sqids.decode(session.user.id);
    if (ids.length === 0) return { success: false, error: "Invalid user session." };
    const userId = ids[0];

    try {
        await connectDB();
        const updateFields: Record<string, unknown> = {};

        if (typeof payload.name === "string" && payload.name.trim()) {
            updateFields.name = payload.name.trim();
        }

        if (typeof payload.handle === "string") {
            const cleanHandle = payload.handle.trim().toLowerCase();
            if (!usernameRegex.test(cleanHandle)) {
                return { success: false, error: "Username must be 3-15 characters and contain only letters, numbers, or underscores." };
            }
            // Check uniqueness
            const existing = await UserModel.findOne({ handle: cleanHandle, userId: { $ne: userId } });
            if (existing) {
                return { success: false, error: "This handle is already taken." };
            }
            updateFields.handle = cleanHandle;
        }

        if (typeof payload.email === "string") {
            const cleanEmail = payload.email.trim().toLowerCase();
            if (!emailRegex.test(cleanEmail)) {
                return { success: false, error: "Invalid email format." };
            }
            // Check uniqueness
            const existing = await UserModel.findOne({ email: cleanEmail, userId: { $ne: userId } });
            if (existing) {
                return { success: false, error: "This email address is already in use." };
            }
            updateFields.email = cleanEmail;
        }

        if (Object.keys(updateFields).length === 0) {
            return { success: true };
        }

        const updatedDoc = await UserModel.findOneAndUpdate(
            { userId },
            { $set: updateFields },
            { new: true }
        ).lean();

        if (!updatedDoc) {
            return { success: false, error: "User account not found." };
        }

        revalidatePath(`/u/${session.user.id}`);
        if (updatedDoc.handle) {
            revalidatePath(`/u/${session.user.id}/${updatedDoc.handle}`);
        }
        revalidatePath('/(user)/u/[id]/[[...handle]]', 'page');

        return {
            success: true,
            updatedUser: {
                name: updatedDoc.name,
                handle: updatedDoc.handle,
                email: updatedDoc.email,
            }
        };
    } catch (err: unknown) {
        console.error("Failed to update account details:", err);
        return { success: false, error: err instanceof Error ? err.message : "Failed to update account." };
    }
}

export async function updateUserSocials(socials: SocialLink[]): Promise<{ success: boolean; error?: string }> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized. Please log in." };
    }
    const ids = sqids.decode(session.user.id);
    if (ids.length === 0) return { success: false, error: "Invalid user session." };

    try {
        await connectDB();
        await UserModel.updateOne(
            { userId: ids[0] },
            { $set: { socials } }
        );

        revalidatePath(`/u/${session.user.id}`);
        if (session.user.handle) {
            revalidatePath(`/u/${session.user.id}/${session.user.handle}`);
        }
        revalidatePath('/(user)/u/[id]/[[...handle]]', 'page');

        return { success: true };
    } catch (err: unknown) {
        console.error("Failed to update socials:", err);
        return { success: false, error: err instanceof Error ? err.message : "Failed to update socials." };
    }
}

export async function deleteUserComment(commentId: string): Promise<{ success: boolean; error?: string }> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized." };
    }
    const ids = sqids.decode(session.user.id);
    if (ids.length === 0) return { success: false, error: "Invalid user session." };

    try {
        await connectDB();
        const user = await UserModel.findOne({ userId: ids[0] }).select("_id role").lean();
        if (!user) return { success: false, error: "User not found." };

        const comment = await CommentModel.findById(commentId);
        if (!comment) return { success: false, error: "Comment not found." };

        const isAuthor = comment.author.toString() === user._id.toString();
        const isAdmin = user.role === "admin";

        if (!isAuthor && !isAdmin) {
            return { success: false, error: "You are not authorized to delete this comment." };
        }

        await CommentModel.findByIdAndDelete(commentId);
        revalidatePath(`/u/${session.user.id}`);
        return { success: true };
    } catch (err: unknown) {
        console.error("Failed to delete comment:", err);
        return { success: false, error: err instanceof Error ? err.message : "Failed to delete comment." };
    }
}
