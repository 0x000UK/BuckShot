"use client";

import { BRAND, BRAND_LIGHT } from "@/lib/utils";
import type { TabKey, TabMeta } from "./types";

interface EditorSidebarProps {
    tabs: TabMeta[];
    activeTab: TabKey;
    tabComplete: Partial<Record<TabKey, boolean>>;
    tabDirty: Record<TabKey, boolean>;
    tabErrors: Record<TabKey, boolean>;
    onTabChange: (id: TabKey) => void;
    isEditing: boolean;
}

export function EditorSidebar({
    tabs,
    activeTab,
    tabComplete,
    tabDirty,
    tabErrors,
    onTabChange,
    isEditing,
}: EditorSidebarProps) {
    return (
        <div className="relative shrink-0 h-full w-14 md:w-56 z-40"
            style={{
                    borderRight: `1px solid ${BRAND}30`, 
                }}
        >
            <div
                className="absolute md:static inset-y-0 left-0 flex flex-col py-3 gap-2 overflow-x-hidden overflow-y-auto w-14 hover:w-56 md:w-56 transition-[width] duration-300 group shadow-2xl md:shadow-none bg-[#0b0a09]"
                style={{
                    borderRight: `1px solid ${BRAND}30`, 
                    backgroundImage: `linear-gradient(${BRAND}02, ${BRAND}02)`
                }}
            >
                {/* TABS */}
                {tabs.map((tab) => {
                    const active = tab.id === activeTab;
                    const hasError = tabErrors[tab.id];
                    
                    const showSuccessDot = isEditing
                        ? !!(tabComplete[tab.id] && tabDirty[tab.id])
                        : !!tabComplete[tab.id];

                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => onTabChange(tab.id)}
                            className="relative flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-150"
                            style={{
                                background: active ? `${BRAND}16` : "transparent",
                                border: `1px solid ${active ? `${BRAND}30` : "transparent"}`,
                                color: active ? BRAND_LIGHT : hasError ? "#ef4444" : "rgba(255,255,255,0.28)",
                            }}
                        >
                            {active && (
                                <div
                                    className="absolute left-0 top-1.5 bottom-1.5 w-0.5"
                                    style={{ background: `${BRAND_LIGHT}` }}
                                />
                            )}

                            {/* Icon (Always visible) */}
                            <span
                                className="font-jost text-[14px] leading-none shrink-0 flex items-center justify-center w-6"
                                style={{ 
                                    color: active 
                                        ? `${BRAND_LIGHT}70` 
                                        : hasError 
                                            ? "#ef4444b0" 
                                            : `${BRAND}60` 
                                }}
                            >
                                {tab.icon}
                            </span>

                            {/* Label Text (Hidden when collapsed) */}
                            <span className="font-jost text-[11px] tracking-widest uppercase leading-tight whitespace-nowrap opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity duration-300">
                                {tab.label}
                            </span>

                            {/* Status Dots (Hidden when collapsed so they don't break layout) */}
                            <div className="ml-auto shrink-0 opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity duration-300 flex items-center">
                                {hasError ? (
                                    <div className="w-2 h-2 rounded-none bg-red-500/80" />
                                ) : showSuccessDot ? (
                                    <div
                                        className="w-1.5 h-1.5 shrink-0"
                                        style={{ background: `${BRAND_LIGHT}` }}
                                    />
                                ) : null}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}