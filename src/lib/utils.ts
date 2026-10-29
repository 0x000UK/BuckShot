import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { IconType } from "react-icons";
import { FaBoxesStacked, FaGavel, FaMedal, FaSeedling, FaShieldHalved, FaUnlockKeyhole } from "react-icons/fa6";
import type { Badge } from "@/types/profile";
import type { GameStatus, GameTag } from "@/types/game";
export { sqids } from "./sqids";

export const BRAND = "#7a6b4f";
export const BRAND_LIGHT = "#a8946d";
export const BRAND_GOLD = "#d9c28a";
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const usernameRegex = /^[a-z0-9_]{3,15}$/;
export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const BADGE_CONFIG: Record<Badge, { label: string; icon: IconType; className: string, color: string }> = {
    admin: {
        label: 'Admin',
        icon: FaShieldHalved,
        className: 'text-red-400',
        color: "#F87171"
    },
    moderator: {
        label: 'Moderator',
        icon: FaGavel,
        color: "#34D399",
        className: 'text-emerald-400',
    },
    veteran: {
        label: 'Veteran',
        icon: FaMedal,
        color: "#c4a97d",
        className: 'text-[#c4a97d]',
    },
    seeder: {
        label: 'Seeder',
        icon: FaSeedling,
        color: "#22D3EE",
        className: 'text-cyan-400',
    },
    repacker: {
        label: 'Repacker',
        icon: FaBoxesStacked,
        color: "#A78BFA",
        className: 'text-violet-400',
    },
    cracker: {
        label: 'Cracker',
        icon: FaUnlockKeyhole,
        color: "#FB923C",
        className: 'text-orange-400',
    },
};

const BADGE_PRIORITY: Badge[] = [
    "admin",
    "moderator",
    "cracker",
    "repacker",
    "seeder",
    "veteran",
];

export {
    GAME_TAGS,
    ALL_TAGS,
    ALL_TAGS_OPTIONS,
    ADMIN_FEATURED_TAGS,
    TAG_CONFIGS,
    resolveTagSlug,
    isGameTag,
} from "./constants/tags";

export const ALL_STATUS_OPTIONS: { value: GameStatus, label: string }[] = [
    { value: 'published', label: "Published" },
    { value: 'draft', label: "Draft" },
    { value: 'delisted', label: "Delisted" }
];

export const ALL_BADGE_OPTIONS: { value: Badge, label: string }[] = [
    { value: "admin", label: "Admin" },
    { value: "moderator", label: "Moderator" },
    { value: "cracker", label: "Cracker" },
    { value: "repacker", label: "Repacker" },
    { value: "seeder", label: "Seeder" },
    { value: "veteran", label: "Veteran" },
];

/**
 * Gets the highest priority badge from a user's badge list.
 * @param userBadges - Array of badges the user owns
 * @returns The highest priority Badge, or null if the array is empty
 */
export function getPrimaryBadge(userBadges: Badge[]): Badge | null {
    if (!userBadges || userBadges.length === 0) return null;
    return BADGE_PRIORITY.find(badge => userBadges.includes(badge)) ?? null;
}

export function slugify(...args: string[]): string {
    const slugifiedParts = args.map((str) => {
        if (!str) return '';
        return str
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-');
    });

    return slugifiedParts.filter(Boolean).join('-');
}

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function validateEmail(email: string): boolean {
    return emailRegex.test(email);
}

export function validateHandle(handle: string): boolean {
    return usernameRegex.test(handle);
}

export function uid(length = 12): string {
    const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const arr = new Uint8Array(length);
    crypto.getRandomValues(arr);
    return Array.from(arr, (byte) => alphabet[byte % alphabet.length]).join('');
}

export function mongoId(): string {
    const timestamp = Math.floor(new Date().getTime() / 1000).toString(16);
    const randomHex = 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () =>
        Math.floor(Math.random() * 16).toString(16)
    );
    return timestamp + randomHex;
}

export function hexToRgba(hex: string, alpha: number): string {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function isUserModerator(user?: { role?: string; badges?: string[] } | null): boolean {
    if (!user) return false;
    if (user.role === 'admin' || user.role === 'moderator') return true;
    if (Array.isArray(user.badges) && (user.badges.includes('admin') || user.badges.includes('moderator'))) return true;
    return false;
}
