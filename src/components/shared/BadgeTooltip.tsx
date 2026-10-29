"use client";

import React, { useState } from "react";
import { BADGE_CONFIG, cn } from "@/lib/utils";
import type { Badge } from "@/types/profile";

export const BADGE_DESCRIPTIONS: Record<
    Badge,
    { title: string; subtitle: string; description: string }
> = {
    admin: {
        title: "System Administrator",
        subtitle: "Verified Platform Staff",
        description:
            "Core team member with comprehensive system management and platform administration authority.",
    },
    moderator: {
        title: "Community Moderator",
        subtitle: "Enforcement & Safety",
        description:
            "Trusted guardian managing community discussions, reviewing flagged content, and maintaining forum rules.",
    },
    veteran: {
        title: "Veteran Member",
        subtitle: "Distinguished Community Pillar",
        description:
            "Longstanding patron recognized for continuous contributions, high standing, and historical loyalty.",
    },
    seeder: {
        title: "Active Seeder",
        subtitle: "High-Bandwidth Distributor",
        description:
            "Dedicated peer sustaining high-speed distribution nodes and keeping rare game archives healthy.",
    },
    repacker: {
        title: "Release Repacker",
        subtitle: "Verified Scene Publisher",
        description:
            "Verified creator producing optimized, lossless release packages and verified installations.",
    },
    cracker: {
        title: "Security Researcher",
        subtitle: "Verified Scene Engineer",
        description:
            "Reverse engineering specialist recognized for DRM research, emulation analysis, and preservation.",
    },
};

interface UserBadgeProps {
    badge: Badge;
    showLabel?: boolean;
    size?: "sm" | "md";
    className?: string;
}

export default function UserBadge({
    badge,
    showLabel = true,
    size = "sm",
    className,
}: UserBadgeProps) {
    const [isHovered, setIsHovered] = useState(false);
    const config = BADGE_CONFIG[badge];
    const info = BADGE_DESCRIPTIONS[badge];

    if (!config || !info) return null;
    const IconComponent = config.icon;

    return (
        <div
            className="relative inline-flex items-center"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <span
                className={cn(
                    "inline-flex items-center gap-1.5 px-2 rounded-none font-jost uppercase tracking-[0.15em] transition-all duration-200 cursor-help select-none",
                    config.className,
                    className
                )}
            >
                <IconComponent className={size === "sm" ? "text-[11px] shrink-0" : "text-xs shrink-0"} />
                {showLabel && <span>{config.label}</span>}
            </span>

            {/* Hover Tooltip */}
            {isHovered && (
                <div
                    role="tooltip"
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-max pointer-events-none animate-in fade-in zoom-in-95 duration-150"
                >
                    <div
                        className="p-3 rounded-none border border-[#7a6b4f]/40 bg-[#0d0c0a] text-left shadow-[0_4px_24px_rgba(0,0,0,0.85),0_0_15px_rgba(196,169,125,0.08)]"
                        style={{ borderLeft: `3px solid ${config.color}` }}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <IconComponent
                                className="text-sm shrink-0"
                                style={{ color: config.color }}
                            />
                            <div className="min-w-0">
                                <p className="font-jk text-[13px] font-semibold text-white tracking-wide leading-tight">
                                    {info.title}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tooltip bottom arrow */}
                    <div className="w-2 h-2 bg-[#0d0c0a] border-r border-b border-[#7a6b4f]/40 rotate-45 mx-auto -mt-1" />
                </div>
            )}
        </div>
    );
}
