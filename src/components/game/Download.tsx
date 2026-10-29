"use client";

import type { OfficialDownloadLink, NonOfficialDownloadLink, DownloadSource } from "@/types/game";
import { motion } from "motion/react";
import SectionHeader from "../SectionHeader";
import { BRAND, BRAND_LIGHT, cn, EASE } from "@/lib/utils";
import { DownloadSiteLogo } from "@/lib/downloadLogos";

interface DownloadTabProps {
    gameId: string;
    gameTitle: string;
    official?: OfficialDownloadLink[] | null;
    nonOfficial?: NonOfficialDownloadLink[] | null;
    base?: DownloadSource[] | null;
    update?: DownloadSource[] | null;
    className?: string;
}

function trackClick(
    gameId: string,
    gameTitle: string,
    siteName: string,
    url: string,
    linkType: "official" | "non-official",
    category?: string
) {
    if (typeof window === "undefined") return;

    try {
        const payload = JSON.stringify({
            gameId,
            gameTitle,
            siteName,
            url,
            linkType,
            category,
        });

        if (navigator.sendBeacon) {
            const blob = new Blob([payload], { type: "application/json" });
            navigator.sendBeacon("/api/track/download", blob);
        } else {
            fetch("/api/track/download", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: payload,
                keepalive: true,
            }).catch(() => {});
        }
    } catch {
        // Silently catch beacon errors to avoid interrupting user navigation
    }
}

/**
 * Editorial Price Comparison Table for Official Authorized Storefronts
 */
function OfficialPriceComparisonTable({
    officialLinks,
    gameId,
    gameTitle,
}: {
    officialLinks: OfficialDownloadLink[];
    gameId: string;
    gameTitle: string;
}) {
    // Flatten stores and editions into rows
    interface TableRow {
        storeId: string;
        storeName: string;
        storeLogo?: string | null;
        storeBadge?: string | null;
        storeUrl: string;
        editionName: string;
        retailPrice?: string | null;
        currentPrice: string;
        discountPercent?: number | null;
        url: string;
        isLowestPrice?: boolean;
        isFirstOfStore: boolean;
        storeTotalEditions: number;
    }

    const rows: TableRow[] = [];

    for (const store of officialLinks) {
        const editions = store.editions && store.editions.length > 0
            ? store.editions
            : [
                  {
                      edition: "Standard Edition",
                      price: store.price || "Check Store",
                      regularPrice: null,
                      discountPercent: null,
                      url: store.url,
                      isLowestPrice: false,
                  },
              ];

        editions.forEach((ed, idx) => {
            rows.push({
                storeId: store.id || store.name,
                storeName: store.name,
                storeLogo: store.logo,
                storeBadge: store.badge,
                storeUrl: store.url,
                editionName: ed.edition || "Standard Edition",
                retailPrice: ed.regularPrice,
                currentPrice: ed.price,
                discountPercent: ed.discountPercent,
                url: ed.url || store.url,
                isLowestPrice: Boolean(ed.isLowestPrice),
                isFirstOfStore: idx === 0,
                storeTotalEditions: editions.length,
            });
        });
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="relative border border-[#7a6b4f]/25 bg-[#0a0a0a] overflow-hidden"
        >
            {/* Top gold accent line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#c4a97d]/40 to-transparent z-10" />

            {/* Desktop / Tablet Comparison Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr
                            className="border-b border-[#7a6b4f]/25 bg-[#0e0d0b]"
                            style={{ fontFamily: "'Jost', sans-serif" }}
                        >
                            <th className="py-3.5 px-6 text-[10px] tracking-[0.18em] uppercase text-[#c4a97d]/90 font-medium w-[26%]">
                                Platform
                            </th>
                            <th className="py-3.5 px-4 text-[10px] tracking-[0.18em] uppercase text-[#c4a97d]/90 font-medium w-[24%]">
                                Edition
                            </th>
                            <th className="py-3.5 px-4 text-[10px] tracking-[0.18em] uppercase text-[#c4a97d]/90 font-medium w-[14%]">
                                Retail
                            </th>
                            <th className="py-3.5 px-4 text-[10px] tracking-[0.18em] uppercase text-[#c4a97d]/90 font-medium w-[12%]">
                                Discount
                            </th>
                            <th className="py-3.5 px-4 text-[10px] tracking-[0.18em] uppercase text-[#c4a97d]/90 font-medium w-[14%]">
                                Current Price
                            </th>
                            <th className="py-3.5 px-6 text-[10px] tracking-[0.18em] uppercase text-[#c4a97d]/90 font-medium text-right w-[10%]">
                                Link
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#7a6b4f]/15">
                        {rows.map((row, idx) => (
                            <tr
                                key={`${row.storeId}_${row.editionName}_${idx}`}
                                className={cn(
                                    "transition-colors duration-200 group",
                                    row.isLowestPrice
                                        ? "bg-[#c4a97d]/04 hover:bg-[#c4a97d]/08"
                                        : "hover:bg-white/2"
                                )}
                            >
                                {/* Store / Platform Cell (Rendered on first row of store group) */}
                                {row.isFirstOfStore ? (
                                    <td
                                        rowSpan={row.storeTotalEditions}
                                        className="py-4 px-6 align-middle border-r border-[#7a6b4f]/15 bg-[#090908]/50"
                                    >
                                        <div className="flex items-center gap-3.5">
                                            <div className="bg-black/60 flex items-center justify-center shrink-0">
                                                <DownloadSiteLogo
                                                    name={row.storeName}
                                                    logoUrl={row.storeLogo}
                                                    className="w-10 h-10"
                                                    isOfficial
                                                />
                                            </div>
                                            <div>
                                                <h4
                                                    className="text-[15px] font-medium text-white tracking-wide leading-snug"
                                                    style={{ fontFamily: "'JK', sans-serif" }}
                                                >
                                                    {row.storeName}
                                                </h4>
                                                {row.storeBadge ? (
                                                    <span
                                                        className="inline-block mt-0.5 px-1.5 py-0.2 text-[8px] tracking-[0.14em] uppercase"
                                                        style={{
                                                            fontFamily: "'Jost', sans-serif",
                                                            background: `${BRAND}20`,
                                                            border: `1px solid ${BRAND}45`,
                                                            color: BRAND_LIGHT,
                                                        }}
                                                    >
                                                        {row.storeBadge}
                                                    </span>
                                                ) : (
                                                    <span
                                                        className="text-[9px] tracking-[0.14em] uppercase text-white/40 block mt-0.5"
                                                        style={{ fontFamily: "'Jost', sans-serif" }}
                                                    >
                                                        Authorized
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                ) : null}

                                {/* Edition Title */}
                                <td className="py-4 px-4 align-middle">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="text-[13px] text-white/90 font-medium"
                                            style={{ fontFamily: "'Jost', sans-serif" }}
                                        >
                                            {row.editionName}
                                        </span>
                                        {row.isLowestPrice && (
                                            <span
                                                className="px-1.5 py-0.5 text-[8px] font-jost tracking-widest uppercase border border-[#c4a97d]/60 bg-[#c4a97d]/15 text-[#c4a97d] shrink-0"
                                            >
                                                Best Deal
                                            </span>
                                        )}
                                    </div>
                                </td>

                                {/* Retail Price */}
                                <td className="py-4 px-4 align-middle">
                                    <span
                                        className={cn(
                                            "text-[12px] tracking-wide",
                                            row.retailPrice ? "line-through text-white/35" : "text-white/20"
                                        )}
                                        style={{ fontFamily: "'Jost', sans-serif" }}
                                    >
                                        {row.retailPrice || "—"}
                                    </span>
                                </td>

                                {/* Discount Percentage */}
                                <td className="py-4 px-4 align-middle">
                                    {row.discountPercent && row.discountPercent > 0 ? (
                                        <span
                                            className="inline-flex items-center px-2 py-0.5 text-[10px] tracking-wider uppercase border border-[#c4a97d]/40 bg-[#c4a97d]/10 text-[#c4a97d] font-medium"
                                            style={{ fontFamily: "'Jost', sans-serif" }}
                                        >
                                            -{row.discountPercent}%
                                        </span>
                                    ) : (
                                        <span
                                            className="text-[11px] text-white/25"
                                            style={{ fontFamily: "'Jost', sans-serif" }}
                                        >
                                            —
                                        </span>
                                    )}
                                </td>

                                {/* Current Sale Price */}
                                <td className="py-4 px-4 align-middle">
                                    <span
                                        className={cn(
                                            "text-[14px] font-medium tracking-wide",
                                            row.isLowestPrice ? "text-[#c4a97d]" : "text-white"
                                        )}
                                        style={{ fontFamily: "'Jost', sans-serif" }}
                                    >
                                        {row.currentPrice}
                                    </span>
                                </td>

                                {/* Outbound Store Link */}
                                <td className="py-4 px-6 align-middle text-right">
                                    <a
                                        href={row.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() =>
                                            trackClick(
                                                gameId,
                                                gameTitle,
                                                row.storeName,
                                                row.url,
                                                "official",
                                                row.editionName
                                            )
                                        }
                                        className="group/btn inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#7a6b4f]/40 bg-transparent hover:bg-[#c4a97d]/10 hover:border-[#c4a97d] transition-all duration-200"
                                        style={{ fontFamily: "'Jost', sans-serif" }}
                                    >
                                        <span className="text-[10px] tracking-[0.14em] uppercase text-white/80 group-hover/btn:text-[#c4a97d] transition-colors whitespace-nowrap">
                                           Visit
                                        </span>
                                        <span className="text-[11px] text-[#c4a97d] group-hover/btn:translate-x-0.5 transition-transform duration-200">
                                            ↗
                                        </span>
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Adaptive Card-Table View (< md) */}
            <div className="md:hidden divide-y divide-[#7a6b4f]/20">
                {officialLinks.map((store, sIdx) => {
                    const editions = store.editions && store.editions.length > 0
                        ? store.editions
                        : [
                              {
                                  edition: "Standard Edition",
                                  price: store.price || "Check Store",
                                  regularPrice: null,
                                  discountPercent: null,
                                  url: store.url,
                                  isLowestPrice: false,
                              },
                          ];

                    return (
                        <div key={store.id || store.name + sIdx} className="p-4 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 border border-[#7a6b4f]/30 bg-black/60 flex items-center justify-center p-1.5 shrink-0">
                                        <DownloadSiteLogo
                                            name={store.name}
                                            logoUrl={store.logo}
                                            className="w-4 h-4"
                                            isOfficial
                                        />
                                    </div>
                                    <h4
                                        className="text-[15px] font-medium text-white"
                                        style={{ fontFamily: "'JK', sans-serif" }}
                                    >
                                        {store.name}
                                    </h4>
                                </div>

                                {store.badge && (
                                    <span
                                        className="px-2 py-0.5 text-[8px] tracking-[0.12em] uppercase"
                                        style={{
                                            fontFamily: "'Jost', sans-serif",
                                            background: `${BRAND}20`,
                                            border: `1px solid ${BRAND}45`,
                                            color: BRAND_LIGHT,
                                        }}
                                    >
                                        {store.badge}
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-col gap-2 pt-1">
                                {editions.map((ed, eIdx) => (
                                    <div
                                        key={eIdx}
                                        className="flex items-center justify-between p-2.5 bg-black/40 border border-[#7a6b4f]/20"
                                    >
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-1.5">
                                                <span
                                                    className="text-[12px] text-white/90 font-medium"
                                                    style={{ fontFamily: "'Jost', sans-serif" }}
                                                >
                                                    {ed.edition}
                                                </span>
                                                {ed.isLowestPrice && (
                                                    <span className="px-1 text-[7px] font-jost tracking-wider uppercase border border-[#c4a97d]/60 bg-[#c4a97d]/15 text-[#c4a97d]">
                                                        Best Deal
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span
                                                    className="text-[13px] font-semibold text-[#c4a97d]"
                                                    style={{ fontFamily: "'Jost', sans-serif" }}
                                                >
                                                    {ed.price}
                                                </span>
                                                {ed.regularPrice && (
                                                    <span
                                                        className="text-[11px] line-through text-white/35"
                                                        style={{ fontFamily: "'Jost', sans-serif" }}
                                                    >
                                                        {ed.regularPrice}
                                                    </span>
                                                )}
                                                {ed.discountPercent && ed.discountPercent > 0 ? (
                                                    <span className="text-[9px] px-1 border border-[#c4a97d]/40 text-[#c4a97d]">
                                                        -{ed.discountPercent}%
                                                    </span>
                                                ) : null}
                                            </div>
                                        </div>

                                        <a
                                            href={ed.url || store.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={() =>
                                                trackClick(
                                                    gameId,
                                                    gameTitle,
                                                    store.name,
                                                    ed.url || store.url,
                                                    "official",
                                                    ed.edition
                                                )
                                            }
                                            className="px-2.5 py-1.5 border border-[#7a6b4f]/40 hover:border-[#c4a97d] bg-[#c4a97d]/05 text-[10px] uppercase tracking-wider text-white hover:text-[#c4a97d] font-jost flex items-center gap-1 transition-colors"
                                        >
                                            <span>Get</span>
                                            <span>↗</span>
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}

function NonOfficialCard({
    item,
    index,
    gameId,
    gameTitle,
}: {
    item: NonOfficialDownloadLink;
    index: number;
    gameId: string;
    gameTitle: string;
}) {
    const urls = Array.isArray(item.url) ? item.url : [item.url];

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: EASE, delay: index * 0.06 }}
            className="relative flex flex-col justify-between border border-[#7a6b4f]/25 bg-[#0a0a0a] p-6 hover:border-[#c4a97d]/40 transition-colors duration-300"
        >
            <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#7a6b4f]/30 to-transparent" />

            <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 flex items-center justify-center shrink-0">
                            <DownloadSiteLogo name={item.siteName} logoUrl={item.logo} className="w-10 h-10" />
                        </div>
                        <div>
                            <span
                                className="text-[9px] tracking-[0.16em] uppercase block mb-0.5"
                                style={{ fontFamily: "'Jost',sans-serif", color: `${BRAND_LIGHT}70` }}
                            >
                                Community Source
                            </span>
                            <h3
                                className="text-[18px] leading-tight text-white font-medium"
                                style={{ fontFamily: "'JK',sans-serif" }}
                            >
                                {item.siteName}
                            </h3>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 justify-end">
                        {item.category && (
                            <span
                                className="px-2 py-0.5 text-[9px] tracking-[0.12em] uppercase"
                                style={{
                                    fontFamily: "'Jost',sans-serif",
                                    background: `${BRAND}20`,
                                    border: `1px solid ${BRAND}40`,
                                    color: BRAND_LIGHT,
                                }}
                            >
                                {item.category}
                            </span>
                        )}
                        {item.fileSize && (
                            <span
                                className="px-2 py-0.5 text-[9px] tracking-[0.1em] text-white/60 bg-white/5 border border-white/10"
                                style={{ fontFamily: "'Jost',sans-serif" }}
                            >
                                {item.fileSize}
                            </span>
                        )}
                    </div>
                </div>

                {item.notes && (
                    <p
                        className="text-[12px] text-white/50 leading-relaxed mt-1"
                        style={{ fontFamily: "'Jost',sans-serif" }}
                    >
                        {item.notes}
                    </p>
                )}
            </div>

            {/* Links grid */}
            <div className="mt-6 pt-4 border-t border-[#7a6b4f]/20">
                <p
                    className="text-[9px] tracking-[0.16em] uppercase text-white/35 mb-2.5"
                    style={{ fontFamily: "'Jost',sans-serif" }}
                >
                    Download Anchors ({urls.length})
                </p>

                <div className="flex flex-wrap gap-2">
                    {urls.map((linkUrl, i) => (
                        <a
                            key={i}
                            href={linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackClick(gameId, gameTitle, item.siteName, linkUrl, "non-official", item.category)}
                            className="group inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#7a6b4f]/35 hover:border-[#c4a97d] bg-black/40 hover:bg-[#c4a97d]/10 transition-all duration-200"
                            style={{ fontFamily: "'Jost',sans-serif" }}
                        >
                            <span className="text-[11px] tracking-[0.1em] uppercase text-white/70 group-hover:text-[#c4a97d] transition-colors">
                                {urls.length > 1 ? `Part ${i + 1}` : "Direct Download"}
                            </span>
                            <span className="text-[10px] text-[#c4a97d] group-hover:translate-x-0.5 transition-transform">
                                ↗
                            </span>
                        </a>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

export default function DownloadTab({
    gameId,
    gameTitle,
    official = [],
    nonOfficial = [],
    base = [],
    update = [],
    className,
}: DownloadTabProps) {
    // Backwards compatibility fallback if nonOfficial is empty but legacy base/update exist
    let resolvedNonOfficial = nonOfficial ? [...nonOfficial] : [];
    if (resolvedNonOfficial.length === 0) {
        if (base && base.length > 0) {
            resolvedNonOfficial = resolvedNonOfficial.concat(
                base.map((b, i) => ({
                    id: `leg_base_${i}`,
                    siteName: b.host,
                    url: b.url,
                    category: "Direct" as const,
                }))
            );
        }
        if (update && update.length > 0) {
            resolvedNonOfficial = resolvedNonOfficial.concat(
                update.map((u, i) => ({
                    id: `leg_up_${i}`,
                    siteName: u.host,
                    url: u.url,
                    category: "Crack Fix" as const,
                }))
            );
        }
    }

    const officialLinks = official || [];
    const hasOfficial = officialLinks.length > 0;
    const hasNonOfficial = resolvedNonOfficial.length > 0;

    return (
        <div className={cn("px-4 py-12", className)}>
            <div className="w-full max-w-7xl mx-auto flex flex-col gap-14">
                
                {/* ── Section 1: Official Storefront Price Comparison Table ── */}
                <div>
                    <div className="flex flex-col items-start justify-between mb-8">
                        <SectionHeader title="Official  Store  Releases" />
                        <p
                            className="text-[14px] mt-1"
                            style={{ fontFamily: "'Jost',sans-serif", color: "rgba(255,255,255,0.4)" }}
                        >
                            Compare real-time prices, package editions, and store discounts across verified platforms.
                        </p>
                    </div>

                    {hasOfficial ? (
                        <OfficialPriceComparisonTable
                            officialLinks={officialLinks}
                            gameId={gameId}
                            gameTitle={gameTitle}
                        />
                    ) : (
                        <div
                            className="border border-[#7a6b4f]/15 bg-[#0a0a0a]/60 p-6 text-center text-white/35 text-[12px]"
                            style={{ fontFamily: "'Jost',sans-serif" }}
                        >
                            No official store links or pricing listed for this title.
                        </div>
                    )}
                </div>

                {/* ── Section 2: Community Repacks & Third-Party Mirrors ── */}
                <div>
                    <div className="flex flex-col items-start justify-between mb-8">
                        <SectionHeader title="Community Repacks & Third-Party Mirrors" />
                        <p
                            className="text-[14px] mt-1"
                            style={{ fontFamily: "'Jost',sans-serif", color: "rgba(255,255,255,0.35)" }}
                        >
                            Direct mirrors, torrents, and repacks provided by verified release groups. All external clicks are verified.
                        </p>
                    </div>

                    {hasNonOfficial ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {resolvedNonOfficial.map((item, i) => (
                                <NonOfficialCard
                                    key={item.id || item.siteName + i}
                                    item={item}
                                    index={i}
                                    gameId={gameId}
                                    gameTitle={gameTitle}
                                />
                            ))}
                        </div>
                    ) : (
                        <div
                            className="border border-[#7a6b4f]/15 bg-[#0a0a0a]/60 p-6 text-center text-white/35 text-[12px]"
                            style={{ fontFamily: "'Jost',sans-serif" }}
                        >
                            No community mirrors or download sources listed for this title.
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
