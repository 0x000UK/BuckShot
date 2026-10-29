"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { Badge } from "@/types/profile";
import UserBadge from "./BadgeTooltip";
import { BRAND, BRAND_GOLD } from "@/lib/utils";

export interface HoverAuthorData {
    id: string;
    name: string;
    handle?: string;
    avatar?: string | null;
    badges?: Badge[];
    banner?: {
        type?: "image" | "video" | "color";
        image?: string | null;
        video?: string | null;
        color?: string | null;
    } | null;
    background?: string | null;
    about?: string | null;
}

interface UserProfileHoverCardProps {
    author: HoverAuthorData;
    children: React.ReactNode;
    className?: string;
}

export default function UserProfileHoverCard({
    author,
    children,
    className,
}: UserProfileHoverCardProps) {
    const [isOpen, setIsOpen] = useState(false);
    const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
        setIsOpen(true);
    };

    const handleMouseLeave = () => {
        closeTimeoutRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 220);
    };

    const profileUrl = author.id
        ? `/u/${author.id}${author.handle ? `/${author.handle}` : ""}`
        : "#";

    const initials = author.name
        ? author.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()
        : "?";

    const isImageAvatar =
        author.avatar &&
        (author.avatar.startsWith("http") ||
            author.avatar.startsWith("/") ||
            author.avatar.startsWith("data:"));

    return (
        <div
            className={`relative inline-block ${className || ""}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* The Trigger (Avatar or Name) */}
            <Link
                href={profileUrl}
                className="flex items-center gap-2.5 transition-opacity hover:opacity-90 cursor-pointer"
            >
                {children}
            </Link>

            {/* The Floating Mini-Profile Card */}
            {isOpen && (
                <Link 
                    href={profileUrl}
                    className="absolute bottom-full left-0 mb-3 z-99 w-72 md:w-80 animate-in fade-in zoom-in-95 duration-150"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <div
                        className="overflow-hidden rounded-none border border-[#7a6b4f]/35 bg-[#0d0c0a] shadow-[0_12px_40px_rgba(0,0,0,0.9),0_0_20px_rgba(196,169,125,0.08)]"
                    >
                        {/* ── Mini Banner ── */}
                        <div className="relative w-full h-20 bg-[#15120e] overflow-hidden border-b border-[#7a6b4f]/25">
                            {author.banner?.type === "image" && author.banner.image ? (
                                <Image
                                    src={author.banner.image}
                                    alt="banner"
                                    fill
                                    className="object-cover opacity-65"
                                />
                            ) : author.banner?.type === "video" && author.banner.video ? (
                                <video
                                    src={author.banner.video}
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    className="w-full h-full object-cover opacity-60"
                                />
                            ) : (
                                <div
                                    className="w-full h-full"
                                    style={{
                                        background:
                                            author.banner?.color ||
                                            "linear-gradient(135deg, #2b2419 0%, #0d0c0a 100%)",
                                    }}
                                />
                            )}
                            <div className="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-[#0d0c0a]" />
                        </div>

                        <div className="relative px-4 pb-4 pt-0">
                            {/* Avatar */}
                            <div className="relative -mt-8 mb-3 flex items-end justify-between">
                                <div
                                    className="relative w-16 h-16 rounded-full overflow-hidden bg-[#0d0c0a] border-2 shadow-lg block shrink-0"
                                    style={{
                                        borderColor: author.background || BRAND_GOLD,
                                    }}
                                >
                                    {isImageAvatar ? (
                                        <Image
                                            src={author.avatar!}
                                            alt={author.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center font-jk text-xl text-[#c4a97d] bg-[#7a6b4f]/20">
                                            {initials}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="block group">
                                <h4 className="font-jk text-base font-semibold text-white/95 group-hover:text-[#c4a97d] transition-colors truncate">
                                    {author.name}
                                </h4>
                                {author.handle && (
                                    <p className="font-jost text-xs text-[#c4a97d]/75 tracking-wide -mt-0.5 truncate">
                                        @{author.handle}
                                    </p>
                                )}
                            </div>

                            {author.about && (
                                <p className="font-jost text-xs text-white/65 mt-2 line-clamp-2 leading-relaxed">
                                    {author.about}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Bottom arrow pointer */}
                    <div className="w-2.5 h-2.5 bg-[#0d0c0a] border-r border-b border-[#7a6b4f]/35 rotate-45 ml-6 -mt-1.5" />
                </Link>
            )}
        </div>
    );
}
