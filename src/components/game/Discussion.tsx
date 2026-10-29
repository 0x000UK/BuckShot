"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
    BADGE_CONFIG,
    BRAND,
    BRAND_LIGHT,
    BRAND_GOLD,
    cn,
    EASE,
    getPrimaryBadge,
} from "@/lib/utils";
import type { DiscussionComment, VoteState } from "@/types/discussion";
import { PinIcon } from "lucide-react";
import {
    addDiscussionComment,
    voteDiscussionComment,
    togglePinDiscussionPost,
    deleteDiscussionComment,
    warnDiscussionUser,
    banDiscussionUser,
} from "@/app/actions/discussions.actions";
import UserBadge from "@/components/shared/BadgeTooltip";
import UserProfileHoverCard from "@/components/shared/UserProfileHoverCard";
import CommentEditor from "./CommentEditor";
import CommentContentRenderer from "./CommentContentRenderer";
import CommentModerationMenu from "./CommentModerationMenu";
import { toast } from "@/stores/alertStore";

const POSTS_PER_PAGE = 6;
const REPLIES_PER_PAGE = 6;
const MAX_INLINE_DEPTH = 3;

export interface VoteSectionProps {
    upvotes: number;
    downvotes: number;
    commentId: string;
}

function formatCount(n: number): string {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return String(n);
}

function VoteSection({ upvotes, downvotes, commentId }: VoteSectionProps) {
    const [vote, setVote] = useState<VoteState>(null);

    const handleVote = async (dir: "up" | "down") => {
        setVote((prev) => (prev === dir ? null : dir));
        try {
            await voteDiscussionComment(commentId, dir);
        } catch (e) {
            console.error(e);
        }
    };

    const displayUp = upvotes + (vote === "up" ? 1 : 0);
    const displayDown = downvotes + (vote === "down" ? 1 : 0);

    return (
        <div className="flex items-center gap-1">
            {/* Upvote */}
            <motion.button
                whileTap={{ scale: 0.88 }}
                transition={{ duration: 0.15 }}
                onClick={() => handleVote("up")}
                aria-label={`Upvote comment ${commentId}`}
                className={cn(
                    "flex items-center gap-1.5 px-2 py-1 transition-all duration-150 font-jost text-[11px] tracking-wide border rounded-none cursor-pointer",
                    vote === "up"
                        ? "border-[#c4a97d]/40 text-[#c4a97d] bg-[#7a6b4f]/12"
                        : "border-transparent text-white/48 hover:text-white/65 hover:border-[#7a6b4f]/20"
                )}
            >
                <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                    <path
                        d="M6 2L10 7H8V10H4V7H2L6 2Z"
                        fill={vote === "up" ? BRAND_LIGHT : "none"}
                        stroke={vote === "up" ? BRAND_LIGHT : "currentColor"}
                        strokeWidth="1"
                        strokeLinejoin="miter"
                    />
                </svg>
                <span>{formatCount(displayUp)}</span>
            </motion.button>

            {/* Separator */}
            <div className="w-px h-3 bg-white/8" />

            {/* Downvote */}
            <motion.button
                whileTap={{ scale: 0.88 }}
                transition={{ duration: 0.15 }}
                onClick={() => handleVote("down")}
                aria-label={`Downvote comment ${commentId}`}
                className={cn(
                    "flex items-center gap-1.5 px-2 py-1 transition-all duration-150 font-jost text-[11px] tracking-wide border rounded-none cursor-pointer",
                    vote === "down"
                        ? "border-[#7a6b4f]/30 text-[#c4a97d]/60 bg-[#7a6b4f]/8"
                        : "border-transparent text-white/48 hover:text-white/65 hover:border-[#7a6b4f]/20"
                )}
            >
                <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                    <path
                        d="M6 10L2 5H4V2H8V5H10L6 10Z"
                        fill={vote === "down" ? `${BRAND_LIGHT}80` : "none"}
                        stroke={vote === "down" ? `${BRAND_LIGHT}80` : "currentColor"}
                        strokeWidth="1"
                        strokeLinejoin="miter"
                    />
                </svg>
                <span>{formatCount(displayDown)}</span>
            </motion.button>
        </div>
    );
}

function DepthConnector({ depth }: { depth: number }) {
    if (depth === 0) return null;
    return <div className="absolute top-0 bottom-0 left-0 w-px bg-accent/40" />;
}

function LoadMoreBtn({
    count,
    onClick,
    label = "replies",
}: {
    count: number;
    onClick: () => void;
    label?: string;
}) {
    return (
        <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ borderColor: `${BRAND_LIGHT}50` }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15 }}
            onClick={onClick}
            className="flex items-center gap-2 mt-3 px-3 py-1.5 border border-[#7a6b4f]/25 text-[#c4a97d]/65 font-jost text-[10px] tracking-[0.14em] uppercase transition-all duration-150 hover:text-[#c4a97d] rounded-none cursor-pointer"
        >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 5H8M5 2V8" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
            </svg>
            Load {count} more {label}
        </motion.button>
    );
}

interface CommentCardProps {
    comment: DiscussionComment;
    childReplies?: DiscussionComment[];
    repliesMap: Record<string, DiscussionComment[]>;
    depth: number;
    index: number;
    onFocusThread: (comment: DiscussionComment) => void;
    onAddReply: (newReply: DiscussionComment, parentId: string) => void;
    isTopLevel?: boolean;
    gameId?: string | null;
    currentUser?: {
        id?: string;
        handle?: string;
        role?: string;
        badges?: string[];
    } | null;
    onTogglePin: (commentId: string) => Promise<void>;
    onDelete: (commentId: string) => Promise<void>;
    onWarnUser: (targetUserId: string, reason: string) => Promise<void>;
    onBanUser: (targetUserId: string, reason: string) => Promise<void>;
}

function CommentCard({
    comment,
    childReplies = [],
    repliesMap,
    depth,
    index,
    onFocusThread,
    onAddReply,
    isTopLevel = false,
    gameId,
    currentUser,
    onTogglePin,
    onDelete,
    onWarnUser,
    onBanUser,
}: CommentCardProps) {
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [visibleReplies, setVisibleReplies] = useState(REPLIES_PER_PAGE);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);

    const totalRepliesCount = Math.max(comment.totalReplies || 0, childReplies.length);
    const hasReplies = totalRepliesCount > 0;
    const hasMoreReplies = hasReplies && childReplies.length > visibleReplies;
    const hiddenCount = hasReplies ? childReplies.length - visibleReplies : 0;

    const handleToggleExpand = (e?: React.MouseEvent) => {
        if (e) {
            const target = e.target as HTMLElement;
            if (target.closest("button") || target.closest("input") || target.closest("a") || target.closest("[contenteditable]")) {
                return;
            }
        }
        if (hasReplies) {
            setIsExpanded((prev) => !prev);
        }
    };

    const handleReplyClick = () => {
        if (depth >= MAX_INLINE_DEPTH) {
            onFocusThread(comment);
        } else {
            setShowReplyInput((v) => !v);
        }
    };

    const primaryBadge = getPrimaryBadge(comment.author.badges);
    const initials = comment.author.name
        ? comment.author.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()
        : "?";

    const isImageAvatar =
        comment.author.avatar &&
        (comment.author.avatar.startsWith("http") ||
            comment.author.avatar.startsWith("/") ||
            comment.author.avatar.startsWith("data:"));

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE, delay: Math.min(index * 0.04, 0.24) }}
            className={cn("relative", depth > 0 && "pl-5 mt-3")}
        >
            {/* Vertical depth connector */}
            {depth > 0 && <DepthConnector depth={depth} />}

            <div
                onClick={handleToggleExpand}
                className={cn(
                    "group relative transition-colors duration-200 p-2.5 -mx-2 rounded-none",
                    isTopLevel && "border-b border-[#7a6b4f]/16 pb-5 mb-2",
                    isTopLevel && comment.pinned && "border-l-2 border-l-[#c4a97d] bg-[#c4a97d]/[0.02]",
                    !isTopLevel && depth === 1 && "pt-1",
                    hasReplies && "cursor-pointer hover:bg-white/1.5"
                )}
            >
                {/* ── Hover Moderation 3-Dot Menu ── */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150 z-20">
                    <CommentModerationMenu
                        comment={comment}
                        isTopLevel={isTopLevel}
                        currentUser={currentUser}
                        onTogglePin={onTogglePin}
                        onDelete={onDelete}
                        onWarnUser={onWarnUser}
                        onBanUser={onBanUser}
                    />
                </div>

                {/* ── Author Row ── */}
                <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                    <UserProfileHoverCard author={comment.author}>
                        <div
                            className={cn(
                                "relative flex shrink-0 items-center justify-center font-jost font-semibold overflow-hidden transition-all duration-200 hover:scale-105",
                                "bg-[#0d0c0a] border text-[#c4a97d]",
                                depth === 0 ? "w-8 h-8 text-[11px] rounded-none" : "w-6 h-6 text-[9px] rounded-none"
                            )}
                            style={{
                                borderColor: comment.author.background || "#7a6b4f",
                            }}
                        >
                            {isImageAvatar ? (
                                <Image
                                    src={comment.author.avatar!}
                                    alt={comment.author.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <span>{comment.author.avatar || initials}</span>
                            )}
                        </div>
                        <span
                            className="font-jost text-[14px] font-medium text-white/90 hover:text-[#c4a97d] transition-colors"
                            style={{
                                color: primaryBadge ? BADGE_CONFIG[primaryBadge].color : "",
                            }}
                        >
                            {comment.author.name}
                        </span>
                    </UserProfileHoverCard>

                    {/* User Badges with Hover Tooltips */}
                    {comment.author.badges && comment.author.badges.length > 0 && (
                        <div className="flex items-center gap-1">
                            {comment.author.badges.map((b) => (
                                <UserBadge key={b} badge={b} size="sm" showLabel={false} />
                            ))}
                        </div>
                    )}

                    {/* Pinned indicator */}
                    {comment.pinned && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-mono tracking-widest uppercase border border-[#c4a97d]/40 text-[#c4a97d] bg-[#c4a97d]/10" title="Pinned by moderators">
                            <PinIcon size={10} className="text-[#c4a97d]" />
                            PINNED
                        </span>
                    )}

                    {/* Timestamp */}
                    <span className="font-jost text-[11px] text-white/35 ml-1">
                        {comment.createdAt}
                    </span>
                </div>

                {/* Title (top-level posts only) */}
                {comment.title && (
                    <p className="font-jk text-[16px] font-semibold text-white/95 leading-snug mb-1.5">
                        {comment.title}
                    </p>
                )}

                {/* Content with Rich Text and Image Previews */}
                <div className="mb-3">
                    <CommentContentRenderer content={comment.content} />
                </div>

                {/* Action row */}
                <div className="flex items-center gap-3 flex-wrap">
                    <VoteSection
                        upvotes={comment.upvotes}
                        downvotes={comment.downvotes}
                        commentId={comment.id}
                    />

                    <div className="w-px h-3 bg-white/8" />

                    {/* Reply button */}
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleReplyClick}
                        className={cn(
                            "flex items-center gap-1.5 px-2 py-1 font-jost text-[10px] tracking-widest uppercase border transition-all duration-150 rounded-none cursor-pointer",
                            showReplyInput
                                ? "border-[#c4a97d]/40 text-[#c4a97d]"
                                : "border-transparent text-white/40 hover:text-white/70 hover:border-[#7a6b4f]/25"
                        )}
                    >
                        <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                            <path d="M1 2H11V9H7L4 12V9H1V2Z" stroke="currentColor" strokeWidth="1" />
                        </svg>
                        {depth >= MAX_INLINE_DEPTH ? "Open Thread" : "Reply"}
                    </motion.button>

                    {/* Expand/Collapse Toggle Button */}
                    {hasReplies && (
                        <>
                            <div className="w-px h-3 bg-white/8" />
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsExpanded(!isExpanded);
                                }}
                                className="flex items-center gap-1.5 px-2 py-1 font-jost text-[10px] tracking-widest uppercase text-[#c4a97d]/70 hover:text-[#c4a97d] transition-colors rounded-none cursor-pointer"
                            >
                                <svg
                                    width="10"
                                    height="10"
                                    viewBox="0 0 10 10"
                                    fill="none"
                                    className={cn(
                                        "transition-transform duration-300 ease-in-out",
                                        isExpanded ? "rotate-180" : ""
                                    )}
                                >
                                    <path d="M2 3L5 6L8 3" stroke="currentColor" strokeWidth="1" />
                                </svg>
                                {isExpanded ? "Hide Replies" : `Show ${totalRepliesCount} ${totalRepliesCount === 1 ? "Reply" : "Replies"}`}
                            </button>
                        </>
                    )}

                    {/* Focus thread link — visible only at max depth */}
                    {depth === MAX_INLINE_DEPTH && hasReplies && (
                        <button
                            onClick={() => onFocusThread(comment)}
                            className="font-jost text-[10px] tracking-widest uppercase text-[#c4a97d]/50 hover:text-[#c4a97d] transition-colors duration-150 ml-auto cursor-pointer"
                        >
                            View thread →
                        </button>
                    )}
                </div>

                {/* ── Inline Highlighted Reply Editor ── */}
                <AnimatePresence>
                    {showReplyInput && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25, ease: EASE }}
                            className="overflow-hidden mt-3"
                        >
                            <CommentEditor
                                placeholder={`Replying to @${comment.author.handle || comment.author.name}...`}
                                submitLabel="REPLY"
                                compact
                                autoFocus
                                isSubmitting={isSubmittingReply}
                                onCancel={() => setShowReplyInput(false)}
                                onSubmit={async (contentHtml) => {
                                    if (!gameId) return false;
                                    setIsSubmittingReply(true);
                                    try {
                                        const res = await addDiscussionComment({
                                            gameId,
                                            content: contentHtml,
                                            parentId: comment.id,
                                        });
                                        if (res.success && res.comment) {
                                            onAddReply(res.comment, comment.id);
                                            setShowReplyInput(false);
                                            setIsExpanded(true);
                                            return true;
                                        }
                                    } catch (e) {
                                        console.error(e);
                                    } finally {
                                        setIsSubmittingReply(false);
                                    }
                                    return false;
                                }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Nested Replies (Collapsible & Hierarchical) ── */}
            <AnimatePresence initial={false}>
                {isExpanded && childReplies.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.35, ease: EASE }}
                        className={cn("overflow-hidden mt-1", depth === 0 && "ml-1")}
                    >
                        {childReplies.slice(0, visibleReplies).map((reply, i) => (
                            <CommentCard
                                key={reply.id}
                                comment={reply}
                                childReplies={repliesMap[reply.id] || []}
                                repliesMap={repliesMap}
                                depth={depth + 1}
                                index={i}
                                onFocusThread={onFocusThread}
                                onAddReply={onAddReply}
                                gameId={gameId}
                                currentUser={currentUser}
                                onTogglePin={onTogglePin}
                                onDelete={onDelete}
                                onWarnUser={onWarnUser}
                                onBanUser={onBanUser}
                            />
                        ))}

                        {hasMoreReplies && (
                            <div className={cn(depth > 0 && "pl-4 relative")}>
                                {depth > 0 && <DepthConnector depth={depth + 1} />}
                                <LoadMoreBtn
                                    count={hiddenCount}
                                    onClick={() => setVisibleReplies((v) => v + REPLIES_PER_PAGE)}
                                />
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

interface FocusViewProps {
    root: DiscussionComment;
    childReplies: DiscussionComment[];
    repliesMap: Record<string, DiscussionComment[]>;
    gameId?: string | null;
    currentUser?: {
        id?: string;
        handle?: string;
        role?: string;
        badges?: string[];
    } | null;
    onBack: () => void;
    onFocusThread: (comment: DiscussionComment) => void;
    onAddReply: (newReply: DiscussionComment, parentId: string) => void;
    onTogglePin: (commentId: string) => Promise<void>;
    onDelete: (commentId: string) => Promise<void>;
    onWarnUser: (targetUserId: string, reason: string) => Promise<void>;
    onBanUser: (targetUserId: string, reason: string) => Promise<void>;
}

function FocusView({
    root,
    childReplies,
    repliesMap,
    gameId,
    currentUser,
    onBack,
    onFocusThread,
    onAddReply,
    onTogglePin,
    onDelete,
    onWarnUser,
    onBanUser,
}: FocusViewProps) {
    return (
        <motion.div
            key="focus-view"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.38, ease: EASE }}
            className="flex flex-col h-full"
        >
            {/* Back bar */}
            <div className="shrink-0 flex items-center gap-3 mb-4 pb-4 border-b border-[#7a6b4f]/20">
                <motion.button
                    whileHover={{ x: -2 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    onClick={onBack}
                    className="flex items-center gap-2 font-jost text-[10px] tracking-[0.14em] uppercase text-white/40 hover:text-[#c4a97d] transition-colors duration-150 cursor-pointer"
                >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M8 2L4 6L8 10" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
                    </svg>
                    Back to all discussions
                </motion.button>

                <div className="w-px h-3 bg-white/10" />

                <span className="font-jost text-[10px] tracking-widest uppercase text-[#c4a97d]/50">
                    Focused Thread
                </span>
            </div>

            {/* Scrollable thread content */}
            <div
                className="flex-1 overflow-y-auto overscroll-contain pr-1"
                style={{ scrollbarWidth: "thin", scrollbarColor: `${BRAND}30 transparent` }}
            >
                <CommentCard
                    comment={root}
                    childReplies={childReplies}
                    repliesMap={repliesMap}
                    gameId={gameId}
                    depth={0}
                    index={0}
                    onFocusThread={onFocusThread}
                    onAddReply={onAddReply}
                    isTopLevel
                    currentUser={currentUser}
                    onTogglePin={onTogglePin}
                    onDelete={onDelete}
                    onWarnUser={onWarnUser}
                    onBanUser={onBanUser}
                />
            </div>
        </motion.div>
    );
}

interface DiscussionsTabProps {
    gameId?: string | null;
    discussions?: DiscussionComment[];
    currentUser?: {
        id?: string;
        handle?: string;
        role?: string;
        badges?: string[];
    } | null;
    className?: string;
}

export default function DiscussionsTab({
    gameId,
    discussions = [],
    currentUser,
    className,
}: DiscussionsTabProps) {
    const [commentsList, setCommentsList] = useState<DiscussionComment[]>(discussions);
    const [visiblePosts, setVisiblePosts] = useState(POSTS_PER_PAGE);
    const [focusedThread, setFocusedThread] = useState<DiscussionComment | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setCommentsList(discussions);
    }, [discussions]);

    // Segregate root comments (top-level) and build hierarchical map for child replies
    const { rootComments, repliesMap } = useMemo(() => {
        const roots: DiscussionComment[] = [];
        const map: Record<string, DiscussionComment[]> = {};

        for (const c of commentsList) {
            if (!c.parentId) {
                roots.push(c);
            } else {
                if (!map[c.parentId]) {
                    map[c.parentId] = [];
                }
                map[c.parentId].push(c);
            }
        }

        // Pinned discussions sort to the top, then newest first
        roots.sort((a, b) => {
            if (Boolean(a.pinned) !== Boolean(b.pinned)) {
                return a.pinned ? -1 : 1;
            }
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        // Sort child replies by creation date ascending (chronological conversation flow)
        for (const pId in map) {
            map[pId].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        }

        return { rootComments: roots, repliesMap: map };
    }, [commentsList]);

    const hasMorePosts = rootComments.length > visiblePosts;
    const hiddenPostCount = rootComments.length - visiblePosts;

    const handleFocusThread = useCallback((comment: DiscussionComment) => {
        setFocusedThread(comment);
        scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    const handleBack = useCallback(() => {
        setFocusedThread(null);
    }, []);

    const handleAddReply = useCallback((newReply: DiscussionComment, parentId: string) => {
        setCommentsList((prev) => {
            const updated = prev.map((c) => {
                if (c.id === parentId) {
                    return { ...c, totalReplies: (c.totalReplies || 0) + 1 };
                }
                return c;
            });
            return [...updated, newReply];
        });
    }, []);

    const handleTogglePin = useCallback(async (commentId: string) => {
        try {
            const res = await togglePinDiscussionPost(commentId);
            if (res.success) {
                setCommentsList((prev) =>
                    prev.map((c) => (c.id === commentId ? { ...c, pinned: res.pinned ?? !c.pinned } : c))
                );
                toast.success(res.pinned ? "Discussion pinned to top" : "Discussion unpinned");
            } else {
                toast.error("Failed to pin discussion", res.error);
            }
        } catch (e) {
            console.error(e);
            toast.error("Pin action failed");
        }
    }, []);

    const handleDeleteComment = useCallback(async (commentId: string) => {
        try {
            const res = await deleteDiscussionComment(commentId);
            if (res.success) {
                setCommentsList((prev) => {
                    const target = prev.find((c) => c.id === commentId);
                    if (target?.parentId) {
                        return prev
                            .filter((c) => c.id !== commentId)
                            .map((c) =>
                                c.id === target.parentId
                                    ? { ...c, totalReplies: Math.max(0, (c.totalReplies || 1) - 1) }
                                    : c
                            );
                    }
                    return prev.filter((c) => c.id !== commentId && c.parentId !== commentId);
                });
                if (focusedThread?.id === commentId) {
                    setFocusedThread(null);
                }
                toast.success("Comment deleted successfully");
            } else {
                toast.error("Failed to delete comment", res.error);
            }
        } catch (e) {
            console.error(e);
            toast.error("Delete action failed");
        }
    }, [focusedThread]);

    const handleWarnUser = useCallback(async (targetUserId: string, reason: string) => {
        try {
            const res = await warnDiscussionUser({ targetUserId, reason });
            if (res.success) {
                toast.success("Official infraction warning issued");
            } else {
                toast.error("Failed to issue warning", res.error);
            }
        } catch (e) {
            console.error(e);
            toast.error("Warning action failed");
        }
    }, []);

    const handleBanUser = useCallback(async (targetUserId: string, reason: string) => {
        try {
            const res = await banDiscussionUser({ targetUserId, reason });
            if (res.success) {
                toast.success("User banned from discussions");
            } else {
                toast.error("Failed to ban user", res.error);
            }
        } catch (e) {
            console.error(e);
            toast.error("Ban action failed");
        }
    }, []);

    const handlePostComment = async (contentHtml: string): Promise<boolean> => {
        if (!gameId || isSubmitting) return false;
        setIsSubmitting(true);
        setErrorMsg(null);
        try {
            const res = await addDiscussionComment({
                gameId,
                content: contentHtml,
            });
            if (res.success && res.comment) {
                setCommentsList((prev) => [res.comment!, ...prev]);
                return true;
            } else {
                setErrorMsg(res.error || "Failed to post comment. Ensure you are signed in.");
                return false;
            }
        } catch (err: unknown) {
            setErrorMsg(err instanceof Error ? err.message : "Failed to post comment.");
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={cn("px-4 md:px-6 py-8 md:py-12", className)}>
            <div className="w-full max-w-7xl mx-auto">
                {/* ── Highlighted Rich Text Discussion Composer ── */}
                <div className="mb-6">
                    <CommentEditor
                        submitLabel="POST"
                        isSubmitting={isSubmitting}
                        onSubmit={handlePostComment}
                    />
                </div>

                {errorMsg && (
                    <p className="font-jost text-xs text-red-400 bg-red-500/10 border border-red-500/30 p-2.5 mb-4">
                        {errorMsg}
                    </p>
                )}

                {!focusedThread && (
                    <div className="shrink-0 flex items-center justify-between mb-4 mt-6 pb-2 border-b border-[#7a6b4f]/15">
                        <span className="font-jost text-[11px] tracking-[0.16em] uppercase text-[#c4a97d]">
                            {rootComments.length} {rootComments.length === 1 ? "Discussion" : "Discussions"}
                        </span>
                        <span className="font-jost text-[10px] tracking-widest uppercase text-white/40">
                            Community Feed
                        </span>
                    </div>
                )}

                <div
                    ref={scrollRef}
                    className="flex-1 pr-1 min-h-0"
                    style={{ scrollbarWidth: "thin", scrollbarColor: `${BRAND}30 transparent` }}
                >
                    <AnimatePresence mode="wait">
                        {focusedThread ? (
                            <FocusView
                                key="focus"
                                root={focusedThread}
                                childReplies={repliesMap[focusedThread.id] || []}
                                repliesMap={repliesMap}
                                gameId={gameId}
                                currentUser={currentUser}
                                onBack={handleBack}
                                onFocusThread={handleFocusThread}
                                onAddReply={handleAddReply}
                                onTogglePin={handleTogglePin}
                                onDelete={handleDeleteComment}
                                onWarnUser={handleWarnUser}
                                onBanUser={handleBanUser}
                            />
                        ) : (
                            <motion.div
                                key="list"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.3, ease: EASE }}
                            >
                                {rootComments.length === 0 ? (
                                    <div className="text-center py-16 border border-[#7a6b4f]/15 bg-[#0a0908] p-8">
                                        <p className="font-jk text-lg text-white/70 mb-2">No discussions yet</p>
                                        <p className="font-jost text-xs text-white/40 max-w-md mx-auto">
                                            Be the first to share your thoughts, gameplay insights, or technical questions about this title.
                                        </p>
                                    </div>
                                ) : (
                                    rootComments.slice(0, visiblePosts).map((post, i) => (
                                        <CommentCard
                                            key={post.id}
                                            comment={post}
                                            childReplies={repliesMap[post.id] || []}
                                            repliesMap={repliesMap}
                                            gameId={gameId}
                                            depth={0}
                                            index={i}
                                            onFocusThread={handleFocusThread}
                                            onAddReply={handleAddReply}
                                            isTopLevel
                                            currentUser={currentUser}
                                            onTogglePin={handleTogglePin}
                                            onDelete={handleDeleteComment}
                                            onWarnUser={handleWarnUser}
                                            onBanUser={handleBanUser}
                                        />
                                    ))
                                )}

                                {/* Load more top-level posts */}
                                {hasMorePosts && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="py-6 flex justify-center border-t border-[#7a6b4f]/15 mt-4"
                                    >
                                        <motion.button
                                            whileHover={{ borderColor: `${BRAND_LIGHT}45`, color: BRAND_LIGHT }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => setVisiblePosts((v) => v + POSTS_PER_PAGE)}
                                            className="flex items-center gap-2.5 px-6 py-2.5 border border-[#7a6b4f]/30 font-jost text-[10px] tracking-[0.18em] uppercase text-[#c4a97d] hover:bg-[#c4a97d]/10 transition-colors rounded-none cursor-pointer"
                                        >
                                            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                                                <path
                                                    d="M2 5H10M6 1V9"
                                                    stroke="currentColor"
                                                    strokeWidth="1"
                                                    strokeLinecap="square"
                                                />
                                            </svg>
                                            Load {Math.min(hiddenPostCount, POSTS_PER_PAGE)} more discussions
                                        </motion.button>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
