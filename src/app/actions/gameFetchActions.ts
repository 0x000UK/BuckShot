"use server";

import { auth } from "@/auth";
import { getConsolidatedGameData, type ConsolidatedGameFetchResult } from "@/lib/gameDataService";

export async function fetchGameDataAction(
    query: string,
    currencyCode = "us"
): Promise<ConsolidatedGameFetchResult> {
    try {
        const session = await auth();
        if (!session || session.user?.role !== "admin") {
            return {
                success: false,
                error: "Unauthorized: Admin privileges required.",
            };
        }

        if (!query || !query.trim()) {
            return {
                success: false,
                error: "Please provide a valid game title or Steam store URL.",
            };
        }

        return await getConsolidatedGameData(query.trim(), currencyCode);
    } catch (err: unknown) {
        console.error("fetchGameDataAction error:", err);
        return {
            success: false,
            error: err instanceof Error ? err.message : "Internal Server Error while fetching game data.",
        };
    }
}
