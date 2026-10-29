'use server'

import { auth } from "@/auth"
import connectDB from "@/lib/mongodb"
import GameModel from "@/models/game.model"
import UserModel from "@/models/user.model"
import MetricModel from "@/models/metric.model"
import { revalidatePath } from "next/cache"
import { sqids } from "@/lib/sqids"
import mongoose from "mongoose"

export async function toggleWishlist(gameIdHash: string): Promise<{ success: boolean; inWishlist: boolean; error?: string }> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, inWishlist: false, error: "Please sign in to manage your wishlist." };
    }

    const userIds = sqids.decode(session.user.id);
    if (userIds.length === 0) return { success: false, inWishlist: false, error: "Invalid user identification." };

    const gameIds = sqids.decode(gameIdHash);
    if (gameIds.length === 0) return { success: false, inWishlist: false, error: "Invalid game ID." };

    try {
        await connectDB();
        const gameDoc = await GameModel.findOne({ gameId: gameIds[0] }).select("_id").lean();
        if (!gameDoc) {
            return { success: false, inWishlist: false, error: "Game not found." };
        }

        const userDoc = await UserModel.findOne({ userId: userIds[0] }).select("wishlist");
        if (!userDoc) {
            return { success: false, inWishlist: false, error: "User account not found." };
        }

        const alreadyInWishlist = userDoc.wishlist.some(
            (id: mongoose.Types.ObjectId) => id.toString() === gameDoc._id.toString()
        );

        if (alreadyInWishlist) {
            await UserModel.updateOne(
                { userId: userIds[0] },
                { $pull: { wishlist: gameDoc._id } }
            );
            revalidatePath(`/u/${session.user.id}`);
            revalidatePath("/store");
            return { success: true, inWishlist: false };
        } else {
            await UserModel.updateOne(
                { userId: userIds[0] },
                { $addToSet: { wishlist: gameDoc._id } }
            );
            const todayStr = new Date().toISOString().split("T")[0];
            await MetricModel.findOneAndUpdate(
                { date: todayStr },
                { $inc: { wishlistAdds: 1 } },
                { upsert: true }
            ).catch(() => {});
            revalidatePath(`/u/${session.user.id}`);
            revalidatePath("/store");
            return { success: true, inWishlist: true };
        }
    } catch (error) {
        console.error("Failed to toggle wishlist:", error);
        return { success: false, inWishlist: false, error: "Could not update wishlist." };
    }
}
