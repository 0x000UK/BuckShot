import type { GameData } from "@/lib/game";
import type { ProfileData } from "@/types/profile";

/**
 * Standardized typed action envelope for client/server communication.
 */
export type ActionResult<T = void> =
    | { success: true; data: T; error?: never }
    | { success: false; error: string; fieldErrors?: Record<string, string[]>; data?: never };

export interface SaveState {
    errors: {
        message?: string;
        [key: string]: unknown;
    };
    success: boolean | null;
}

export type GameKey = keyof GameData;

export type GameUpdatePayloadItem = {
    id: string;
    keysToValidate: GameKey[];
    data: Partial<GameData>;
};

export type SavePayloadItem = {
    id: string;
    data: GameData;
};

export type UserUpdatePayloadItem = {
    id: string;
    data: Partial<ProfileData>;
};

export interface DownloadClickPayload {
    gameId: string;
    gameTitle: string;
    siteName: string;
    url: string;
    linkType: "official" | "non-official";
    category?: string;
}
