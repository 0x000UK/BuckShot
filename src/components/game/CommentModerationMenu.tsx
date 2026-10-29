"use client";

import React, { useState, useRef, useEffect } from "react";
import {
    MoreVertical,
    Pin,
    PinOff,
    Trash2,
    AlertTriangle,
    ShieldAlert,
    Copy,
    Check,
    X,
} from "lucide-react";
import { BRAND, BRAND_GOLD, cn, isUserModerator } from "@/lib/utils";
import type { DiscussionComment } from "@/types/discussion";

interface CommentModerationMenuProps {
    comment: DiscussionComment;
    isTopLevel?: boolean;
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

export default function CommentModerationMenu({
    comment,
    isTopLevel = false,
    currentUser,
    onTogglePin,
    onDelete,
    onWarnUser,
    onBanUser,
}: CommentModerationMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showWarnModal, setShowWarnModal] = useState(false);
    const [warnReason, setWarnReason] = useState("");
    const [showBanModal, setShowBanModal] = useState(false);
    const [banReason, setBanReason] = useState("");
    const [isActionPending, setIsActionPending] = useState(false);

    const menuRef = useRef<HTMLDivElement>(null);

    const isMod = isUserModerator(currentUser);
    const isAuthor =
        Boolean(currentUser?.id && comment.author?.id && currentUser.id === comment.author.id) ||
        Boolean(currentUser?.handle && comment.author?.handle && currentUser.handle === comment.author.handle);
    const canModerateUser = isMod && !isAuthor;

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const handleCopyLink = () => {
        if (typeof window !== "undefined") {
            const url = `${window.location.origin}${window.location.pathname}#comment-${comment.id}`;
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            setIsOpen(false);
        }
    };

    const handleConfirmDelete = async () => {
        setIsActionPending(true);
        try {
            await onDelete(comment.id);
            setShowDeleteModal(false);
            setIsOpen(false);
        } finally {
            setIsActionPending(false);
        }
    };

    const handleConfirmWarn = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!warnReason.trim()) return;
        setIsActionPending(true);
        try {
            await onWarnUser(comment.author.id, warnReason.trim());
            setShowWarnModal(false);
            setWarnReason("");
            setIsOpen(false);
        } finally {
            setIsActionPending(false);
        }
    };

    const handleConfirmBan = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsActionPending(true);
        try {
            await onBanUser(comment.author.id, banReason.trim() || "Violation of community forum rules");
            setShowBanModal(false);
            setBanReason("");
            setIsOpen(false);
        } finally {
            setIsActionPending(false);
        }
    };

    return (
        <div ref={menuRef} className="relative inline-block text-left">
            {/* ── Vertical 3-Dot Hover Trigger Button ── */}
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen((prev) => !prev);
                }}
                title="Options"
                className={cn(
                    "p-1.5 rounded-none border transition-all duration-150 cursor-pointer",
                    isOpen
                        ? "border-[#c4a97d] bg-[#c4a97d]/15 text-[#c4a97d] opacity-100"
                        : "border-transparent hover:border-[#7a6b4f]/40 hover:bg-[#7a6b4f]/15 text-white/40 hover:text-[#c4a97d]"
                )}
            >
                <MoreVertical className="w-4 h-4" />
            </button>

            {/* ── Dropdown Popover Menu ── */}
            {isOpen && (
                <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-full mt-1.5 z-50 w-52 rounded-none border border-[#7a6b4f]/40 bg-[#0d0c0a] py-1 shadow-[0_8px_30px_rgba(0,0,0,0.9),0_0_20px_rgba(196,169,125,0.08)] animate-in fade-in zoom-in-95 duration-150"
                >
                    {/* Header Label */}
                    <div className="px-3 py-1.5 border-b border-white/5 flex items-center justify-between">
                        <span className="font-mono text-[9px] tracking-widest uppercase text-[#c4a97d]">
                            {isMod ? "Moderation" : "Options"}
                        </span>
                        {isMod && (
                            <span className="px-1 py-0.5 text-[8px] font-mono tracking-wider uppercase border border-[#c4a97d]/40 text-[#c4a97d] bg-[#7a6b4f]/10">
                                Mod
                            </span>
                        )}
                    </div>

                    {/* Copy Link Action */}
                    <button
                        type="button"
                        onClick={handleCopyLink}
                        className="w-full text-left px-3.5 py-2 font-jost text-[11px] font-medium tracking-wide uppercase text-white/70 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2.5 cursor-pointer"
                    >
                        {copied ? (
                            <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Link Copied!</span>
                            </>
                        ) : (
                            <>
                                <Copy className="w-3.5 h-3.5 text-white/40" />
                                <span>Copy Link</span>
                            </>
                        )}
                    </button>

                    {/* Pin / Unpin Action (Posts only!) */}
                    {isMod && isTopLevel && (
                        <button
                            type="button"
                            onClick={async () => {
                                setIsActionPending(true);
                                try {
                                    await onTogglePin(comment.id);
                                    setIsOpen(false);
                                } finally {
                                    setIsActionPending(false);
                                }
                            }}
                            disabled={isActionPending}
                            className="w-full text-left px-3.5 py-2 font-jost text-[11px] font-medium tracking-wide uppercase text-[#c4a97d] hover:bg-[#c4a97d]/10 transition-colors flex items-center gap-2.5 cursor-pointer disabled:opacity-50"
                        >
                            {comment.pinned ? (
                                <>
                                    <PinOff className="w-3.5 h-3.5" />
                                    <span>Unpin Post</span>
                                </>
                            ) : (
                                <>
                                    <Pin className="w-3.5 h-3.5" />
                                    <span>Pin to Top</span>
                                </>
                            )}
                        </button>
                    )}

                    {/* User Moderation Actions (Warn & Ban) */}
                    {canModerateUser && (
                        <>
                            <div className="my-1 border-t border-white/5" />
                            <button
                                type="button"
                                onClick={() => {
                                    setShowWarnModal(true);
                                    setIsOpen(false);
                                }}
                                className="w-full text-left px-3.5 py-2 font-jost text-[11px] font-medium tracking-wide uppercase text-amber-400/90 hover:text-amber-300 hover:bg-amber-500/10 transition-colors flex items-center gap-2.5 cursor-pointer"
                            >
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                                <span>Issue Warning</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowBanModal(true);
                                    setIsOpen(false);
                                }}
                                className="w-full text-left px-3.5 py-2 font-jost text-[11px] font-medium tracking-wide uppercase text-red-400/90 hover:text-red-300 hover:bg-red-500/10 transition-colors flex items-center gap-2.5 cursor-pointer"
                            >
                                <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                                <span>Ban User</span>
                            </button>
                        </>
                    )}

                    {/* Delete Action (Author or Moderator) */}
                    {(isMod || isAuthor) && (
                        <>
                            <div className="my-1 border-t border-white/5" />
                            <button
                                type="button"
                                onClick={() => {
                                    setShowDeleteModal(true);
                                    setIsOpen(false);
                                }}
                                className="w-full text-left px-3.5 py-2 font-jost text-[11px] font-medium tracking-wide uppercase text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors flex items-center gap-2.5 cursor-pointer"
                            >
                                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                <span>{isTopLevel ? "Delete Post" : "Delete Reply"}</span>
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* ── Delete Confirmation Modal ── */}
            {showDeleteModal && (
                <div
                    onClick={(e) => e.stopPropagation()}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
                >
                    <div className="w-full max-w-md p-6 bg-[#0d0c0a] border border-red-500/30 rounded-none shadow-2xl">
                        <div className="flex items-center gap-3 mb-3 text-red-400">
                            <Trash2 className="w-5 h-5" />
                            <h3 className="font-jk text-lg font-semibold text-white">
                                {isTopLevel ? "Delete Discussion Post?" : "Delete Reply?"}
                            </h3>
                        </div>
                        <p className="font-jost text-xs leading-relaxed text-white/70 mb-5">
                            {isTopLevel
                                ? "This action will permanently delete this discussion and all nested replies. This action cannot be undone."
                                : "This action will permanently remove this reply from the discussion thread."}
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowDeleteModal(false)}
                                disabled={isActionPending}
                                className="px-4 py-2 font-jost text-xs uppercase tracking-widest text-white/50 hover:text-white border border-white/10"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDelete}
                                disabled={isActionPending}
                                className="px-5 py-2 font-jost text-xs font-bold uppercase tracking-widest bg-red-600 hover:bg-red-500 text-white border border-red-400 transition-colors disabled:opacity-50"
                            >
                                {isActionPending ? "Deleting..." : "Confirm Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Issue Warning Modal ── */}
            {showWarnModal && (
                <div
                    onClick={(e) => e.stopPropagation()}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
                >
                    <div className="w-full max-w-md p-6 bg-[#0d0c0a] border border-amber-500/40 rounded-none shadow-2xl">
                        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                            <div className="flex items-center gap-2 text-amber-400">
                                <AlertTriangle className="w-5 h-5" />
                                <h3 className="font-jk text-lg font-semibold text-white">
                                    Issue Warning to @{comment.author.handle || comment.author.name}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowWarnModal(false)}
                                className="text-white/40 hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleConfirmWarn}>
                            <p className="font-jost text-xs text-white/70 mb-3">
                                Provide an official infraction reason. This will be permanently recorded on their account profile.
                            </p>

                            {/* Preset Buttons */}
                            <div className="flex flex-wrap gap-1.5 mb-3">
                                {[
                                    "Spam / Commercial Promotion",
                                    "Harassment / Toxicity",
                                    "Spoilers without tags",
                                    "Misleading information",
                                ].map((preset) => (
                                    <button
                                        type="button"
                                        key={preset}
                                        onClick={() => setWarnReason(preset)}
                                        className="px-2 py-1 text-[9px] font-jost uppercase tracking-wider border border-[#7a6b4f]/30 hover:border-[#c4a97d] text-white/60 hover:text-[#c4a97d] bg-[#7a6b4f]/10"
                                    >
                                        {preset}
                                    </button>
                                ))}
                            </div>

                            <textarea
                                required
                                rows={3}
                                value={warnReason}
                                onChange={(e) => setWarnReason(e.target.value)}
                                placeholder="Specify violation reason..."
                                className="w-full p-2.5 font-jost text-xs text-white bg-black/60 border border-[#7a6b4f]/40 outline-none focus:border-[#c4a97d] mb-4 resize-none"
                            />

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowWarnModal(false)}
                                    className="px-4 py-2 font-jost text-xs uppercase tracking-widest text-white/50 hover:text-white border border-white/10"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isActionPending || !warnReason.trim()}
                                    className="px-5 py-2 font-jost text-xs font-bold uppercase tracking-widest bg-amber-600 hover:bg-amber-500 text-black border border-amber-400 transition-colors disabled:opacity-40"
                                >
                                    {isActionPending ? "Issuing..." : "Issue Warning"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Ban User Modal ── */}
            {showBanModal && (
                <div
                    onClick={(e) => e.stopPropagation()}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
                >
                    <div className="w-full max-w-md p-6 bg-[#0d0c0a] border border-red-600/50 rounded-none shadow-2xl">
                        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                            <div className="flex items-center gap-2 text-red-400">
                                <ShieldAlert className="w-5 h-5" />
                                <h3 className="font-jk text-lg font-semibold text-white">
                                    Ban @{comment.author.handle || comment.author.name}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowBanModal(false)}
                                className="text-white/40 hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleConfirmBan}>
                            <p className="font-jost text-xs leading-relaxed text-white/70 mb-4">
                                Banning will immediately block this user from creating discussions, replying, or commenting across the platform.
                            </p>

                            <input
                                type="text"
                                value={banReason}
                                onChange={(e) => setBanReason(e.target.value)}
                                placeholder="Ban reason (e.g., Repeated harassment, piracy violation)"
                                className="w-full p-2.5 font-jost text-xs text-white bg-black/60 border border-red-500/40 outline-none focus:border-red-400 mb-5"
                            />

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowBanModal(false)}
                                    className="px-4 py-2 font-jost text-xs uppercase tracking-widest text-white/50 hover:text-white border border-white/10"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isActionPending}
                                    className="px-5 py-2 font-jost text-xs font-bold uppercase tracking-widest bg-red-700 hover:bg-red-600 text-white border border-red-500 transition-colors disabled:opacity-40"
                                >
                                    {isActionPending ? "Banning..." : "Confirm Forum Ban"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
