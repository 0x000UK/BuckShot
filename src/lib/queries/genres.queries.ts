import mongoose from "mongoose";
import GenreModel from "@/models/genre.model";
import GameModel from "@/models/game.model";
import type { Genre } from "@/types/game";
import connectDB from "@/lib/mongodb";
import { fromGenreDocument } from "@/lib/dbMappings";

/**
 * Fetches all categories/genres with real-time aggregated game counts.
 */
export async function getAllGenre(): Promise<Genre[] | null> {
    try {
        await connectDB();
        const [genres, counts] = await Promise.all([
            GenreModel.find({}).sort({ name: 1 }).lean(),
            GameModel.aggregate<{ _id: mongoose.Types.ObjectId; count: number }>([
                { $match: { status: "published" } },
                { $unwind: "$metadata.genres" },
                { $group: { _id: "$metadata.genres", count: { $sum: 1 } } },
            ]),
        ]);

        if (!genres) {
            throw new Error("No genre found");
        }

        const countMap = new Map<string, number>(
            counts.map((c) => [c._id.toString(), c.count])
        );

        return genres.map((doc) => ({
            ...fromGenreDocument(doc),
            gameCount: countMap.get(doc._id.toString()) || 0,
        }));
    } catch (error: unknown) {
        console.error("Failed to fetch Genres:", error instanceof Error ? error.message : String(error));
        return null;
    }
}
