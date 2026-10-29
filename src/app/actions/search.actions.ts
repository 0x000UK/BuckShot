'use server'

import connectDB from "@/lib/mongodb"
import GameModel, { GameDocument } from "@/models/game.model"
import { metaFromGameDocument } from "@/lib/dbMappings"
import type { GameMeta } from "@/types/game"

export async function debouncedSearch(query: string): Promise<{ games: GameMeta[]; publishers: string[] }> {
    if (!query || query.trim().length < 2) {
        return { games: [], publishers: [] };
    }

    try {
        await connectDB();

        const safeQuery = query.replace(/[.*,+?^${}()|[\]\\]/g, '\\$&');
        const searchRegex = new RegExp(safeQuery, 'i');

        const rawResults = await GameModel.find<GameDocument>({
            status: "published",
            $or: [
                { title: searchRegex },
                { subtitle: searchRegex },
                { 'metadata.publisher': searchRegex }
            ]
        })
        .select("gameId title slug subtitle visuals.coverImage visuals.cover metadata.publisher")
        .limit(8)
        .lean();

        const games: GameMeta[] = [];
        const publishersSet = new Set<string>();

        const lowerQuery = query.toLowerCase();

        rawResults.forEach((game) => {
            if (
                game.title?.toLowerCase().includes(lowerQuery) ||
                game.subtitle?.toLowerCase().includes(lowerQuery)
            ) {
                games.push(metaFromGameDocument(game));
            }
            if (game.metadata?.publisher?.toLowerCase().includes(lowerQuery)) {
                publishersSet.add(game.metadata.publisher);
            }
        });

        return {
            games: games.slice(0, 5),
            publishers: Array.from(publishersSet).slice(0, 3)
        };
    } catch (error: unknown) {
        console.error('Search error:', error);
        return { games: [], publishers: [] };
    }
}
