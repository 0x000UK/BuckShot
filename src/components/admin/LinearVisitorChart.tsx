"use client";

import { useMemo, useState } from "react";
import type { DailyMetricData } from "@/types/faq";
import { BRAND, BRAND_LIGHT, cn } from "@/lib/utils";
import { motion } from "motion/react";
import { GoldBar } from "./ui";

interface LinearVisitorChartProps {
    initialMetrics: DailyMetricData[];
    className?: string;
}

type MetricMode = "visitors" | "discussions" | "both";
type RangeDays = 7 | 14 | 30;

function formatShortDate(dateStr: string) {
    try {
        const parts = dateStr.split("-");
        if (parts.length === 3) {
            const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
            return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
        }
        return dateStr;
    } catch {
        return dateStr;
    }
}

export default function LinearVisitorChart({ initialMetrics, className }: LinearVisitorChartProps) {
    const [range, setRange] = useState<RangeDays>(14);
    const [mode, setMode] = useState<MetricMode>("visitors");
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

    // Filter metrics according to selected range
    const filteredMetrics = useMemo(() => {
        if (!initialMetrics || initialMetrics.length === 0) return [];
        return initialMetrics.slice(-range);
    }, [initialMetrics, range]);

    // Canvas & SVG coordinates calculation
    const width = 800;
    const height = 220;
    const paddingX = 40;
    const paddingY = 30;

    const chartWidth = width - paddingX * 2;
    const chartHeight = height - paddingY * 2;

    const { pointsVisits, pointsUniques, pointsDiscussions, maxVal, totalVisits, totalUniques, totalDiscussions } = useMemo(() => {
        if (filteredMetrics.length === 0) {
            return {
                pointsVisits: [],
                pointsUniques: [],
                pointsDiscussions: [],
                maxVal: 10,
                totalVisits: 0,
                totalUniques: 0,
                totalDiscussions: 0,
            };
        }

        let maxV = 1;
        let tVisits = 0;
        let tUniques = 0;
        let tDisc = 0;

        filteredMetrics.forEach((m) => {
            tVisits += m.visits;
            tUniques += m.uniqueVisitors;
            tDisc += m.discussions;
            if (m.visits > maxV) maxV = m.visits;
            if (m.discussions > maxV && (mode === "discussions" || mode === "both")) maxV = m.discussions;
        });

        // Add 15% headroom for top aesthetics
        const ceiling = Math.ceil(maxV * 1.15);

        const stepX = filteredMetrics.length > 1 ? chartWidth / (filteredMetrics.length - 1) : chartWidth;

        const pVisits = filteredMetrics.map((m, idx) => ({
            x: paddingX + idx * stepX,
            y: paddingY + chartHeight - (m.visits / ceiling) * chartHeight,
            val: m.visits,
            date: m.date,
        }));

        const pUniques = filteredMetrics.map((m, idx) => ({
            x: paddingX + idx * stepX,
            y: paddingY + chartHeight - (m.uniqueVisitors / ceiling) * chartHeight,
            val: m.uniqueVisitors,
            date: m.date,
        }));

        const pDisc = filteredMetrics.map((m, idx) => ({
            x: paddingX + idx * stepX,
            y: paddingY + chartHeight - (m.discussions / ceiling) * chartHeight,
            val: m.discussions,
            date: m.date,
        }));

        return {
            pointsVisits: pVisits,
            pointsUniques: pUniques,
            pointsDiscussions: pDisc,
            maxVal: ceiling,
            totalVisits: tVisits,
            totalUniques: tUniques,
            totalDiscussions: tDisc,
        };
    }, [filteredMetrics, chartWidth, chartHeight, mode]);

    // Build smooth cubic bezier SVG path
    const buildSmoothPath = (pts: Array<{ x: number; y: number }>) => {
        if (pts.length === 0) return "";
        if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

        let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
        for (let i = 0; i < pts.length - 1; i++) {
            const p0 = pts[i === 0 ? 0 : i - 1];
            const p1 = pts[i];
            const p2 = pts[i + 1];
            const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];

            const cp1x = p1.x + (p2.x - p0.x) * 0.16;
            const cp1y = p1.y + (p2.y - p0.y) * 0.16;
            const cp2x = p2.x - (p3.x - p1.x) * 0.16;
            const cp2y = p2.y - (p3.y - p1.y) * 0.16;

            d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
        }
        return d;
    };

    const pathVisits = useMemo(() => buildSmoothPath(pointsVisits), [pointsVisits]);
    const pathUniques = useMemo(() => buildSmoothPath(pointsUniques), [pointsUniques]);
    const pathDiscussions = useMemo(() => buildSmoothPath(pointsDiscussions), [pointsDiscussions]);

    // Area path for gradient fill
    const areaVisits = useMemo(() => {
        if (pointsVisits.length === 0) return "";
        const base = paddingY + chartHeight;
        const first = pointsVisits[0];
        const last = pointsVisits[pointsVisits.length - 1];
        return `${pathVisits} L ${last.x.toFixed(1)} ${base} L ${first.x.toFixed(1)} ${base} Z`;
    }, [pathVisits, pointsVisits, chartHeight]);

    const areaDiscussions = useMemo(() => {
        if (pointsDiscussions.length === 0) return "";
        const base = paddingY + chartHeight;
        const first = pointsDiscussions[0];
        const last = pointsDiscussions[pointsDiscussions.length - 1];
        return `${pathDiscussions} L ${last.x.toFixed(1)} ${base} L ${first.x.toFixed(1)} ${base} Z`;
    }, [pathDiscussions, pointsDiscussions, chartHeight]);

    const activeHoverItem = hoveredIdx !== null && filteredMetrics[hoveredIdx] ? filteredMetrics[hoveredIdx] : null;

    return (
        <div className={cn("border border-[#7a6b4f]/20 bg-[#0d0c0a]/60 p-5 flex flex-col gap-5", className)}>
            {/* Header Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#7a6b4f]/15 pb-4">
                <div className="flex items-center gap-3">
                    <GoldBar className="h-4" />
                    <div>
                        <h4 className="font-jost text-[12px] tracking-[0.18em] uppercase text-white/90">
                            Site Activity & Traffic
                        </h4>
                        <p className="font-jost text-[11px] text-[#c4a97d]/60 mt-0.5">
                            {mode === "visitors" && "Daily unique visitors and total page impressions"}
                            {mode === "discussions" && "Community discussion velocity and chat messages"}
                            {mode === "both" && "Correlated site traffic and community discussion volume"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Metric Mode Selectors */}
                    <div className="inline-flex border border-[#7a6b4f]/30 p-0.5">
                        <button
                            type="button"
                            onClick={() => setMode("visitors")}
                            className={cn(
                                "px-3 py-1 font-jost text-[10px] tracking-widest uppercase transition-colors",
                                mode === "visitors" ? "bg-[#c4a97d] text-black font-semibold" : "text-white/50 hover:text-white"
                            )}
                        >
                            Visitors
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode("discussions")}
                            className={cn(
                                "px-3 py-1 font-jost text-[10px] tracking-widest uppercase transition-colors",
                                mode === "discussions" ? "bg-[#c4a97d] text-black font-semibold" : "text-white/50 hover:text-white"
                            )}
                        >
                            Discussions
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode("both")}
                            className={cn(
                                "px-3 py-1 font-jost text-[10px] tracking-widest uppercase transition-colors",
                                mode === "both" ? "bg-[#c4a97d] text-black font-semibold" : "text-white/50 hover:text-white"
                            )}
                        >
                            Combined
                        </button>
                    </div>

                    {/* Range Selectors */}
                    <div className="inline-flex border border-[#7a6b4f]/30 p-0.5">
                        {([7, 14, 30] as RangeDays[]).map((r) => (
                            <button
                                key={r}
                                type="button"
                                onClick={() => setRange(r)}
                                className={cn(
                                    "px-2.5 py-1 font-jost text-[10px] tracking-wider transition-colors",
                                    range === r ? "bg-[#7a6b4f]/40 text-[#c4a97d]" : "text-white/40 hover:text-white/70"
                                )}
                            >
                                {r}D
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Stat Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-1 border-b border-[#7a6b4f]/10">
                <div>
                    <span className="font-jost text-[9px] uppercase tracking-wider text-[#7a6b4f]/80">Total Visits ({range}D)</span>
                    <p className="font-jk text-[18px] text-white/90 leading-tight mt-0.5">{totalVisits.toLocaleString()}</p>
                </div>
                <div>
                    <span className="font-jost text-[9px] uppercase tracking-wider text-[#7a6b4f]/80">Unique Visitors</span>
                    <p className="font-jk text-[18px] text-[#c4a97d] leading-tight mt-0.5">{totalUniques.toLocaleString()}</p>
                </div>
                <div>
                    <span className="font-jost text-[9px] uppercase tracking-wider text-[#7a6b4f]/80">Avg Daily Traffic</span>
                    <p className="font-jk text-[18px] text-white/80 leading-tight mt-0.5">
                        {filteredMetrics.length > 0 ? Math.round(totalVisits / filteredMetrics.length).toLocaleString() : 0}
                    </p>
                </div>
                <div>
                    <span className="font-jost text-[9px] uppercase tracking-wider text-[#7a6b4f]/80">Discussions Posted</span>
                    <p className="font-jk text-[18px] text-[#9a8a6b] leading-tight mt-0.5">{totalDiscussions.toLocaleString()}</p>
                </div>
            </div>

            {/* SVG Chart Container */}
            <div className="relative w-full overflow-hidden select-none">
                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="w-full h-48 sm:h-56 md:h-64 overflow-visible"
                    onMouseLeave={() => setHoveredIdx(null)}
                >
                    <defs>
                        {/* Gold Gradient for Visits */}
                        <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#c4a97d" stopOpacity="0.28" />
                            <stop offset="100%" stopColor="#c4a97d" stopOpacity="0.0" />
                        </linearGradient>

                        {/* Bronze Gradient for Discussions */}
                        <linearGradient id="bronzeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#9a8a6b" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#9a8a6b" stopOpacity="0.0" />
                        </linearGradient>

                        {/* Subtle Drop Shadow Glow */}
                        <filter id="goldGlow" x="-10%" y="-10%" width="120%" height="120%">
                            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#c4a97d" floodOpacity="0.35" />
                        </filter>
                    </defs>

                    {/* Horizontal Ambient Grid Lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                        const y = paddingY + chartHeight * ratio;
                        const labelVal = Math.round(maxVal * (1 - ratio));
                        return (
                            <g key={ratio}>
                                <line
                                    x1={paddingX}
                                    y1={y}
                                    x2={width - paddingX}
                                    y2={y}
                                    stroke="rgba(122, 107, 79, 0.15)"
                                    strokeDasharray="3 3"
                                />
                                <text
                                    x={paddingX - 8}
                                    y={y + 3}
                                    textAnchor="end"
                                    className="font-jost text-[9px] fill-[#7a6b4f]/60 select-none"
                                >
                                    {labelVal}
                                </text>
                            </g>
                        );
                    })}

                    {/* Gradient Fills */}
                    {(mode === "visitors" || mode === "both") && areaVisits && (
                        <path d={areaVisits} fill="url(#goldGradient)" />
                    )}
                    {(mode === "discussions" || mode === "both") && areaDiscussions && (
                        <path d={areaDiscussions} fill="url(#bronzeGradient)" />
                    )}

                    {/* Uniques Line (Subtle dashed gold line) */}
                    {(mode === "visitors" || mode === "both") && pathUniques && (
                        <path
                            d={pathUniques}
                            fill="none"
                            stroke="#c4a97d"
                            strokeWidth="1.2"
                            strokeDasharray="4 4"
                            strokeOpacity="0.5"
                        />
                    )}

                    {/* Main Visits Spline (Bold glowing solid gold line) */}
                    {(mode === "visitors" || mode === "both") && pathVisits && (
                        <path
                            d={pathVisits}
                            fill="none"
                            stroke="#c4a97d"
                            strokeWidth="2.2"
                            filter="url(#goldGlow)"
                        />
                    )}

                    {/* Discussions Spline */}
                    {(mode === "discussions" || mode === "both") && pathDiscussions && (
                        <path
                            d={pathDiscussions}
                            fill="none"
                            stroke="#856b9a"
                            strokeWidth="2"
                        />
                    )}

                    {/* Interactive Points & Hit Areas */}
                    {pointsVisits.map((p, idx) => {
                        const isHovered = hoveredIdx === idx;
                        return (
                            <g key={idx}>
                                {/* Vertical Guideline on Hover */}
                                {isHovered && (
                                    <line
                                        x1={p.x}
                                        y1={paddingY}
                                        x2={p.x}
                                        y2={paddingY + chartHeight}
                                        stroke="#c4a97d"
                                        strokeWidth="1"
                                        strokeDasharray="2 2"
                                        strokeOpacity="0.75"
                                    />
                                )}

                                {/* Dot for Visits */}
                                {(mode === "visitors" || mode === "both") && (
                                    <circle
                                        cx={p.x}
                                        cy={p.y}
                                        r={isHovered ? 5 : 3}
                                        fill="#c4a97d"
                                        stroke="#080808"
                                        strokeWidth="2"
                                        className="transition-all duration-150"
                                    />
                                )}

                                {/* Dot for Discussions */}
                                {(mode === "discussions" || mode === "both") && pointsDiscussions[idx] && (
                                    <circle
                                        cx={pointsDiscussions[idx].x}
                                        cy={pointsDiscussions[idx].y}
                                        r={isHovered ? 4.5 : 2.5}
                                        fill="#856b9a"
                                        stroke="#080808"
                                        strokeWidth="1.5"
                                        className="transition-all duration-150"
                                    />
                                )}

                                {/* X-Axis Date Label */}
                                {(range <= 14 || idx % 2 === 0 || idx === pointsVisits.length - 1) && (
                                    <text
                                        x={p.x}
                                        y={paddingY + chartHeight + 16}
                                        textAnchor="middle"
                                        className={cn(
                                            "font-jost text-[9px] transition-colors select-none",
                                            isHovered ? "fill-[#c4a97d] font-semibold" : "fill-white/40"
                                        )}
                                    >
                                        {formatShortDate(p.date)}
                                    </text>
                                )}

                                {/* Transparent Mouse Hit Bar */}
                                <rect
                                    x={p.x - chartWidth / (filteredMetrics.length * 2)}
                                    y={paddingY}
                                    width={chartWidth / filteredMetrics.length}
                                    height={chartHeight + 20}
                                    fill="transparent"
                                    className="cursor-pointer"
                                    onMouseEnter={() => setHoveredIdx(idx)}
                                />
                            </g>
                        );
                    })}
                </svg>

                {/* Floating Tooltip Box */}
                {hoveredIdx !== null && activeHoverItem && pointsVisits[hoveredIdx] && (
                    <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute pointer-events-none z-20 px-3 py-2 bg-[#080808]/95 border border-[#c4a97d]/40 shadow-2xl backdrop-blur-md"
                        style={{
                            left: `${Math.min(Math.max(10, (pointsVisits[hoveredIdx].x / width) * 100), 85)}%`,
                            top: "10px",
                        }}
                    >
                        <p className="font-jost text-[10px] tracking-wider uppercase text-[#c4a97d] font-medium border-b border-[#7a6b4f]/25 pb-1">
                            {formatShortDate(activeHoverItem.date)}
                        </p>
                        <div className="flex flex-col gap-1 mt-1.5 font-jost text-[11px]">
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-white/60">Total Views:</span>
                                <span className="text-white font-medium">{activeHoverItem.visits.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-[#c4a97d]/80">Unique Visitors:</span>
                                <span className="text-[#c4a97d] font-medium">{activeHoverItem.uniqueVisitors.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-[#856b9a]">Discussions:</span>
                                <span className="text-white font-medium">{activeHoverItem.discussions.toLocaleString()}</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Legend Footer */}
            <div className="flex flex-wrap items-center justify-end gap-6 pt-2 border-t border-[#7a6b4f]/10 font-jost text-[10px] tracking-wider text-white/50">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-0.5 bg-[#c4a97d]" />
                    <span>Page Impressions</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-0.5 bg-[#c4a97d] border-b border-dashed border-[#c4a97d]" />
                    <span>Unique Visitors</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-0.5 bg-[#856b9a]" />
                    <span>Discussions / Chat</span>
                </div>
            </div>
        </div>
    );
}
