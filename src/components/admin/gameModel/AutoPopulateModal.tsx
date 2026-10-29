"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Loader2, X, ExternalLink } from "lucide-react";
import { BRAND, BRAND_LIGHT, EASE } from "@/lib/utils";
import { fetchGameDataAction } from "@/app/actions/gameFetchActions";
import type { ConsolidatedGameFetchResult } from "@/lib/gameDataService";
import { toast } from "@/stores/alertStore";

interface AutoPopulateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPopulate: (result: NonNullable<ConsolidatedGameFetchResult["data"]>) => void;
}

const POPULAR_EXAMPLES = [
    { title: "Cyberpunk 2077", id: "1091500" },
    { title: "The Witcher 3", id: "292030" },
    { title: "Hogwarts Legacy", id: "990080" },
    { title: "Elden Ring", id: "1245620" },
];

export function AutoPopulateModal({ isOpen, onClose, onPopulate }: AutoPopulateModalProps) {
    const [query, setQuery] = useState("");
    const [currency, setCurrency] = useState("us");
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");

    if (!isOpen) return null;

    const handleFetch = async () => {
        const trimmed = query.trim();
        if (!trimmed) {
            toast.error("Input Required", "Please enter a Steam URL, Game Title, or Steam App ID.");
            return;
        }

        setLoading(true);
        setStatusMessage("Connecting to Steam Store API...");

        try {
            // Update status text slightly for smooth UX feedback
            setTimeout(() => {
                setStatusMessage("Parsing media, rich text descriptions & system specs...");
            }, 600);

            setTimeout(() => {
                setStatusMessage("Fetching live cross-store pricing & editions...");
            }, 1200);

            const res = await fetchGameDataAction(trimmed, currency);

            if (!res.success || !res.data) {
                toast.error("Fetch Failed", res.error || "Could not retrieve data for this title.");
                return;
            }

            toast.success("Game Populated", `Successfully imported "${res.data.title}" metadata and live deals.`);
            onPopulate(res.data);
            onClose();
        } catch (err: unknown) {
            console.error("AutoPopulateModal error:", err);
            toast.error("Unexpected Error", err instanceof Error ? err.message : "Failed to fetch game data.");
        } finally {
            setLoading(false);
            setStatusMessage("");
        }
    };

    return (
        <AnimatePresence>
            <div
                className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                onClick={(e) => {
                    if (e.target === e.currentTarget && !loading) onClose();
                }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 12 }}
                    transition={{ duration: 0.25, ease: EASE }}
                    className="relative w-full max-w-lg bg-[#0d0c0a] border border-[#7a6b4f]/40 p-6 flex flex-col gap-5 shadow-2xl"
                >
                    {/* Top Gold Accent Line */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#c4a97d]/50 to-transparent" />

                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 border border-[#7a6b4f]/40 bg-black/60 flex items-center justify-center text-[#c4a97d]">
                                <Sparkles className="w-4 h-4" />
                            </div>
                            <div>
                                <h3
                                    className="text-[16px] font-medium tracking-wide text-white"
                                    style={{ fontFamily: "'JK', sans-serif" }}
                                >
                                    Auto-Populate Game Record
                                </h3>
                            </div>
                        </div>

                        {!loading && (
                            <button
                                type="button"
                                onClick={onClose}
                                className="text-white/40 hover:text-white transition-colors cursor-pointer p-1"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Instruction & Description */}
                    <p
                        className="text-[12px] leading-relaxed text-white/60"
                        style={{ fontFamily: "'Jost', sans-serif" }}
                    >
                        Paste a Steam store URL (e.g. <span className="text-[#c4a97d]">store.steampowered.com/app/...</span>), enter a Steam App ID, or type the game title.
                    </p>

                    {/* Form Fields */}
                    <div className="flex flex-col gap-3.5">
                        <div className="flex flex-col gap-1.5">
                            <label
                                className="text-[10px] tracking-[0.16em] uppercase text-white/60"
                                style={{ fontFamily: "'Jost', sans-serif" }}
                            >
                                Steam URL / App ID / Game Title
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !loading) {
                                            e.preventDefault();
                                            handleFetch();
                                        }
                                    }}
                                    placeholder="https://store.steampowered.com/app/1091500/Cyberpunk_2077/"
                                    disabled={loading}
                                    className="w-full bg-[#080808] border border-[#7a6b4f]/35 focus:border-[#c4a97d] text-white font-jost text-[13px] px-3.5 py-2.5 outline-none transition-colors placeholder:text-white/20"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Currency Selector */}
                        <div className="flex items-center justify-between gap-4 pt-1">
                            <label
                                className="text-[10px] tracking-[0.16em] uppercase text-white/60"
                                style={{ fontFamily: "'Jost', sans-serif" }}
                            >
                                Pricing Currency
                            </label>
                            <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                disabled={loading}
                                className="bg-[#080808] border border-[#7a6b4f]/35 text-[#c4a97d] font-jost text-[11px] tracking-wider uppercase px-2.5 py-1.5 outline-none cursor-pointer"
                            >
                                <option value="us">USD ($) — Default</option>
                                <option value="in">INR (₹)</option>
                                <option value="de">EUR (€)</option>
                                <option value="uk">GBP (£)</option>
                                <option value="ca">CAD ($)</option>
                                <option value="au">AUD ($)</option>
                            </select>
                        </div>

                        {/* Quick Presets / Examples */}
                        <div className="pt-1">
                            <span
                                className="text-[9px] tracking-[0.16em] uppercase text-white/40 block mb-1.5"
                                style={{ fontFamily: "'Jost', sans-serif" }}
                            >
                                Quick Try Examples:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                                {POPULAR_EXAMPLES.map((ex) => (
                                    <button
                                        key={ex.id}
                                        type="button"
                                        disabled={loading}
                                        onClick={() => setQuery(ex.id)}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 border border-[#7a6b4f]/25 bg-black/40 hover:bg-[#c4a97d]/10 hover:border-[#c4a97d]/60 text-[10px] text-white/60 hover:text-[#c4a97d] transition-all font-jost cursor-pointer"
                                    >
                                        <span>{ex.title}</span>
                                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Status Feedback while loading */}
                    {loading && (
                        <div className="flex items-center gap-2.5 p-3 border border-[#c4a97d]/30 bg-[#c4a97d]/05">
                            <Loader2 className="w-4 h-4 text-[#c4a97d] animate-spin shrink-0" />
                            <span
                                className="text-[11px] text-[#c4a97d] font-jost tracking-wider"
                            >
                                {statusMessage || "Fetching live data..."}
                            </span>
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#7a6b4f]/20">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 font-jost text-[10px] tracking-widest uppercase border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-all duration-150 disabled:opacity-50 cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleFetch}
                            disabled={loading || !query.trim()}
                            className="inline-flex items-center gap-2 px-5 py-2 font-jost text-[10px] tracking-widest uppercase border transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            style={{
                                color: BRAND_LIGHT,
                                borderColor: `${BRAND}70`,
                                background: `${BRAND}30`,
                            }}
                            onMouseOver={(e) => {
                                if (!loading && query.trim()) e.currentTarget.style.background = `${BRAND}50`;
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = `${BRAND}30`;
                            }}
                        >
                            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            <span>{loading ? "Importing..." : "Fetch & Populate"}</span>
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
