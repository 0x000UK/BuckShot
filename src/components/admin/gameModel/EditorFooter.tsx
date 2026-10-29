"use client";

import { motion } from "motion/react";
import { BRAND, BRAND_LIGHT } from "@/lib/utils";
import type { TabKey, TabMeta } from "./types";

interface EditorFooterProps {
    tabs: TabMeta[];
    activeTab: TabKey;
    tabComplete: Partial<Record<TabKey, boolean>>;
    isEditing: boolean;
    onTabChange: (id: TabKey) => void;
    onSave: () => void;
    error?: string;
    onCancel: () => void;
    onAbort: () => void;
}

export function EditorFooter({
    tabs,
    activeTab,
    tabComplete,
    isEditing,
    onTabChange,
    onSave,
    error,
    onCancel,
    onAbort,
}: EditorFooterProps) {
    return (
        <div
            className="flex items-center justify-between px-6 py-3.5 shrink-0 select-none"
            style={{ borderTop: `1px solid ${BRAND}18`, background: "#050504" }}
        >
            {/* Left Box: Progress dots + Escape Nodes */}
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-1.5">
                    {tabs.map((t) => (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => onTabChange(t.id)}
                            className="transition-all duration-200 cursor-pointer"
                            style={{
                                width: activeTab === t.id ? 16 : 4,
                                height: 3,
                                background:
                                    activeTab === t.id
                                        ? BRAND_LIGHT
                                        : tabComplete[t.id]
                                            ? `${BRAND}80`
                                            : `${BRAND}35`,
                            }}
                        />
                    ))}
                </div>

                {/* Terminating Directives */}
                <div className="flex items-center gap-3 ml-22">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="font-jost text-[10px] px-4 py-2 tracking-[0.12em] border border-[#7a6b4f]/40 uppercase text-white/30 hover:text-[#7a6b4f] hover:border-[#7a6b4f]/80 transition-colors cursor-pointer"
                    >
                        Exit
                    </button>
                    <button
                        type="button"
                        onClick={onAbort}
                        className="font-jost text-[10px] px-4 py-2 tracking-[0.12em] uppercase border border-red-400/40 text-red-500/40 hover:text-red-500 hover:border-red-500 hover:bg-red-400/10 transition-colors cursor-pointer"
                    >
                        Abort
                    </button>
                </div>
            </div>

            {/* Middle Container: Dynamic Notifications */}
            {error && <span className="text-red-500 text-xs font-jost animate-pulse"> {error} </span>}

            {/* Right Box: Final Submit Action (Save Changes / Create Record) */}
            <div className="flex items-center gap-3">
                <motion.button
                    whileHover={{ borderColor: `${BRAND_LIGHT}65`, background: `${BRAND}25` }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={onSave}
                    className="px-6 py-2 font-jost text-[12px] tracking-[0.14em] uppercase border transition-all duration-200 cursor-pointer"
                    style={{
                        borderColor: `${BRAND_LIGHT}45`,
                        color: BRAND_LIGHT,
                        background: `${BRAND}18`,
                    }}
                >
                    {isEditing ? "Save Changes" : "Create Record"}
                </motion.button>
            </div>
        </div>
    );
}
