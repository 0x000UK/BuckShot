import type { Badge } from "./profile";

export type VoteState = "up" | "down" | null;

export interface DiscussionAuthor {
    id: string;
    name: string;
    handle?: string;
    avatar?: string | null;
    badges: Badge[];
    banner?: {
        type?: "image" | "video" | "color";
        image?: string | null;
        video?: string | null;
        color?: string | null;
    } | null;
    background?: string | null;
    about?: string | null;
}

export interface DiscussionComment {
    id: string;
    gameId: string;
    parentId: string | null;
    title?: string;
    author: DiscussionAuthor;
    content: string;
    createdAt: string;
    upvotes: number;
    downvotes: number;
    totalReplies: number;
    pinned?: boolean;
}

export interface UserCommentItem {
    id: string;
    targetTitle: string;
    targetType: 'Discussion';
    commentText: string;
    timestamp: string;
    upvotes: number;
    gameSlug?: string;
}

export interface UserLikedItem {
    id: string;
    title: string;
    type: 'GAME' | 'COMMENT';
    subtitle: string;
    authorOrDeveloper?: string;
    likedAt: string;
    coverUrl?: string;
}