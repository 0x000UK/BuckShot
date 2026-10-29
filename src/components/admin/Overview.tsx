"use client";

import { BRAND, BRAND_LIGHT, EASE, cn } from "@/lib/utils";
import type { Genre, GameSummary } from "@/types/game";
import type { AdminOverviewStats, DailyMetricData } from "@/types/faq";
import { AnimatePresence, motion } from "motion/react";
import { GoldBar } from "./ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import LinearVisitorChart from "./LinearVisitorChart";
import Image from "next/image";
import Link from "next/link";

function fmt(n: number) {
    return n.toLocaleString();
}

function SectionSep() {
    return (
        <div
            className="w-full h-px my-5"
            style={{ background: `linear-gradient(90deg, ${BRAND}40, transparent)` }}
        />
    );
}

function StatCard({
    label,
    value,
    sub,
    icon,
}: {
    label: string;
    value: string;
    sub?: string;
    icon: React.ReactNode;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="flex flex-col gap-3 p-5 border"
            style={{ borderColor: `${BRAND}22`, background: "rgba(122,107,79,0.04)" }}
        >
            <div className="flex items-center justify-between">
                <span className="font-jost text-[10px] tracking-[0.16em] uppercase" style={{ color: `${BRAND}80` }}>
                    {label}
                </span>
                <div style={{ color: `${BRAND_LIGHT}55` }}>{icon}</div>
            </div>
            <div>
                <p className="font-jk text-[28px] leading-none text-white/88">{value}</p>
                {sub && (
                    <p className="font-jost text-[11px] mt-1" style={{ color: `${BRAND_LIGHT}55` }}>
                        {sub}
                    </p>
                )}
            </div>
        </motion.div>
    );
}

interface OverviewProps {
    games: GameSummary[];
    categories: Genre[];
    stats?: AdminOverviewStats;
    metrics?: DailyMetricData[];
}

export default function Overview({ games, categories, stats, metrics = [] }: OverviewProps) {
    const totalGames = stats?.totalGames ?? games.length;
    const publishedGames = stats?.publishedGames ?? games.filter((g) => g.status === "published").length;
    const draftGames = stats?.draftGames ?? games.filter((g) => g.status === "draft").length;
    const totalCategories = stats?.totalCategories ?? categories.length;
    const totalUsers = stats?.totalUsers ?? 0;
    const newUsersMonth = stats?.newUsersThisMonth ?? 0;
    const totalDiscussions = stats?.totalDiscussions ?? 0;
    const totalDownloadClicks = stats?.totalDownloadClicks ?? 0;

    const recentlyAdded = [...games]
        .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
        .slice(0, 5);

    return (
        <>
            {/* Topbar Header */}
            <div className="flex items-center justify-start px-6 py-3 gap-2 border-b border-[#7a6b4f]/10 bg-[#090807] shrink-0">
                <span className="text-[#c4a97d]/50">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <rect x="1" y="1" width="5" height="5" stroke="currentColor" strokeWidth="1" />
                        <rect x="8" y="1" width="5" height="5" stroke="currentColor" strokeWidth="1" />
                        <rect x="1" y="8" width="5" height="5" stroke="currentColor" strokeWidth="1" />
                        <rect x="8" y="8" width="5" height="5" stroke="currentColor" strokeWidth="1" />
                    </svg>
                </span>
                <span className="font-jost text-[24px] tracking-[0.14em] uppercase text-white/90">
                    Overview
                </span>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.32, ease: EASE }}
                    className="p-6 flex flex-col gap-6"
                >
                    {/* Real Database Metric Stat Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                        <StatCard
                            label="Total Games"
                            value={String(totalGames)}
                            sub={`${publishedGames} published • ${draftGames} draft`}
                            icon={
                                <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                                    <rect x="1" y="2" width="10" height="12" stroke="currentColor" strokeWidth="1" />
                                </svg>
                            }
                        />
                        <StatCard
                            label="Categories"
                            value={String(totalCategories)}
                            sub="Active genres"
                            icon={
                                <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                                    <path
                                        d="M1 3H13M1 7H9M1 11H11"
                                        stroke="currentColor"
                                        strokeWidth="1"
                                        strokeLinecap="square"
                                    />
                                </svg>
                            }
                        />
                        <StatCard
                            label="Registered Users"
                            value={fmt(totalUsers)}
                            sub={`+${fmt(newUsersMonth)} new this month`}
                            icon={
                                <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                                    <circle cx="7" cy="4" r="3" stroke="currentColor" strokeWidth="1" />
                                    <path
                                        d="M1 13C1 10.2 3.7 8 7 8C10.3 8 13 10.2 13 13"
                                        stroke="currentColor"
                                        strokeWidth="1"
                                    />
                                </svg>
                            }
                        />
                        <StatCard
                            label="Discussions"
                            value={fmt(totalDiscussions)}
                            sub="Community messages"
                            icon={
                                <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                                    <path
                                        d="M12 2H2C1.4 2 1 2.4 1 3V9C1 9.6 1.4 10 2 10H4V13L7 10H12C12.6 10 13 9.6 13 9V3C13 2.4 12.6 2 12 2Z"
                                        stroke="currentColor"
                                        strokeWidth="1"
                                    />
                                </svg>
                            }
                        />
                        <StatCard
                            label="Download Clicks"
                            value={fmt(totalDownloadClicks)}
                            sub="Outbound referrals"
                            icon={
                                <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                                    <path d="M7 1V10M7 10L3 6M7 10L11 6" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
                                    <path d="M1 13H13" stroke="currentColor" strokeWidth="1" />
                                </svg>
                            }
                        />
                    </div>

                    <SectionSep />

                    {/* Linear Visitor & Activity Spline Chart */}
                    <LinearVisitorChart initialMetrics={metrics} />

                    <SectionSep />

                    {/* Top 5 Recently Added Games Table */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <GoldBar className="h-4" />
                                <span
                                    className="font-jost text-[10px] tracking-[0.18em] uppercase"
                                    style={{ color: `${BRAND_LIGHT}70` }}
                                >
                                    Recently Added Titles (Top 5)
                                </span>
                            </div>
                            <Link
                                href="/a/dashboard/games"
                                className="font-jost text-[10px] tracking-widest uppercase text-[#c4a97d]/70 hover:text-[#c4a97d] transition-colors"
                            >
                                View All Games →
                            </Link>
                        </div>

                        <div className="rounded-none border border-[#7a6b4f]/20 bg-[#0d0c0a]/50 overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="font-jost text-[9px] tracking-[0.16em] uppercase text-[#7a6b4f]/80 bg-[#12110e]/60 border-b border-[#7a6b4f]/20">
                                        <TableHead>Game</TableHead>
                                        <TableHead>Publisher</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date Added</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentlyAdded.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 font-jost text-white/40 text-[12px]">
                                                No games added yet.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        recentlyAdded.map((game) => (
                                            <TableRow
                                                key={game.id}
                                                className="group border-b border-[#7a6b4f]/10 hover:bg-[#7a6b4f]/10 transition-colors duration-100"
                                            >
                                                <TableCell className="py-2.5">
                                                    <div className="flex items-center gap-3">
                                                        {game.cover ? (
                                                            <div className="relative w-8 h-10 shrink-0 border border-[#7a6b4f]/30 overflow-hidden bg-black">
                                                                <Image
                                                                    src={game.cover}
                                                                    alt={game.title}
                                                                    fill
                                                                    sizes="32px"
                                                                    className="object-cover"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="w-8 h-10 shrink-0 border border-[#7a6b4f]/20 bg-[#14120e] flex items-center justify-center text-[10px] text-white/30">
                                                                N/A
                                                            </div>
                                                        )}
                                                        <div className="flex flex-col min-w-0 max-w-xs md:max-w-md">
                                                            <span className="font-jost text-[13px] text-white/90 font-medium truncate">
                                                                {game.title}
                                                            </span>
                                                            {game.subtitle && (
                                                                <span className="font-jost text-[10px] text-white/40 truncate">
                                                                    {game.subtitle}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-jost text-[12px] text-white/60">
                                                    {game.publisher || "—"}
                                                </TableCell>
                                                <TableCell>
                                                    <span
                                                        className={cn(
                                                            "inline-flex items-center px-2 py-0.5 font-jost text-[9px] tracking-wider uppercase border",
                                                            game.status === "published"
                                                                ? "border-[#c4a97d]/40 text-[#c4a97d] bg-[#c4a97d]/10"
                                                                : "border-white/10 text-white/40 bg-white/5"
                                                        )}
                                                    >
                                                        {game.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="font-jost text-[11px] text-white/60 whitespace-nowrap">
                                                    {game.createdAt
                                                        ? new Date(game.createdAt).toLocaleDateString(undefined, {
                                                              month: "short",
                                                              day: "numeric",
                                                              year: "numeric",
                                                          })
                                                        : "—"}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Link
                                                        href={`/a/dashboard/games/edit?id=${game.id}&tab=1`}
                                                        className="inline-block px-3 py-1 font-jost text-[9px] tracking-widest uppercase border border-[#7a6b4f]/30 hover:border-[#c4a97d] text-white/60 hover:text-[#c4a97d] transition-colors"
                                                    >
                                                        Edit
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </>
    );
}
