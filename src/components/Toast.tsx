"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAlertStore, type Alert, type AlertType } from "@/stores/alertStore";
import { EASE } from "@/utils";

const CONFIG: Record<
    AlertType,
    { 
        icon: React.ReactNode; 
        borderColor: string; 
        timerColor: string; 
        titleColor: string;
        badgeBg: string;
    }
> = {
    success: {
        borderColor: "rgba(34, 197, 94, 0.2)",
        timerColor: "#22c55e",
        titleColor: "#4ade80",
        badgeBg: "rgba(34, 197, 94, 0.1)",
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
            </svg>
        ),
    },
    error: {
        borderColor: "rgba(239, 68, 68, 0.2)",
        timerColor: "#ef4444",
        titleColor: "#f87171",
        badgeBg: "rgba(239, 68, 68, 0.1)",
        icon: (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
        ),
    },
    warning: {
        borderColor: "rgba(245, 158, 11, 0.2)",
        timerColor: "#f59e0b",
        titleColor: "#fbbf24",
        badgeBg: "rgba(245, 158, 11, 0.1)",
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
        ),
    },
    info: {
        borderColor: "rgba(56, 189, 248, 0.2)",
        timerColor: "#38bdf8",
        titleColor: "#7dd3fc",
        badgeBg: "rgba(56, 189, 248, 0.1)",
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
        ),
    },
};

function AlertCard({ alert }: { alert: Alert }) {
    const dismiss = useAlertStore((s: any) => s.dismiss);
    const duration = alert.duration ?? 4000;
    const cfg = CONFIG[alert.type];

    const [progress, setProgress] = useState(1); // 1 → 0
    const [paused, setPaused] = useState(false);

    const startTime = useRef<number>(Date.now());
    const elapsed = useRef<number>(0);
    const rafId = useRef<number | null>(null);

    const tick = useCallback(() => {
        const now = Date.now();
        const delta = now - startTime.current;
        const total = elapsed.current + delta;
        const p = Math.max(0, 1 - total / duration);
        setProgress(p);

        if (p <= 0) {
            dismiss(alert.id);
            return;
        }
        rafId.current = requestAnimationFrame(tick);
    }, [alert.id, dismiss, duration]);

    useEffect(() => {
        rafId.current = requestAnimationFrame(tick);
        return () => { if (rafId.current) cancelAnimationFrame(rafId.current); };
    }, [tick]);

    const handleMouseEnter = () => {
        if (rafId.current) cancelAnimationFrame(rafId.current);
        elapsed.current += Date.now() - startTime.current;
        setPaused(true);
    };

    const handleMouseLeave = () => {
        startTime.current = Date.now();
        setPaused(false);
        rafId.current = requestAnimationFrame(tick);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{
                opacity: 0,
                scale: 0.95,
                transition: { duration: 0.18, ease: EASE },
            }}
            transition={{ duration: 0.28, ease: EASE }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="relative flex items-start gap-3 w-90 overflow-hidden select-none rounded-xl shadow-2xl backdrop-blur-md"
            style={{
                background: "rgba(10, 10, 10, 0.85)",
                border: `1px solid ${cfg.borderColor}`,
                padding: "16px 14px 16px 16px",
                opacity: paused ? 0.95 : 1,
            }}
        >
            {/* Status Type Icon */}
            <div
                className="shrink-0 flex items-center justify-center w-7 h-7 rounded-lg transition-transform duration-300"
                style={{
                    color: cfg.timerColor,
                    backgroundColor: cfg.badgeBg,
                    transform: paused ? "scale(1.05)" : "scale(1)"
                }}
            >
                {cfg.icon}
            </div>

            {/* Text Copy Context */}
            <div className="flex-1 min-w-0 pr-2 pt-0.5">
                <p
                    className="text-[13px] font-semibold tracking-wide leading-tight font-sans"
                    style={{ color: cfg.titleColor }}
                >
                    {alert.title}
                </p>
                {alert.body && (
                    <p className="text-[12px] mt-1.5 leading-relaxed text-zinc-400 font-sans">
                        {alert.body}
                    </p>
                )}
            </div>

            {/* Close Cross Trigger */}
            <button
                type="button"
                onClick={() => dismiss(alert.id)}
                className="shrink-0 flex items-center justify-center w-6 h-6 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-all duration-150 mt-0.5"
                aria-label="Dismiss"
            >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </button>

            {/*Linear Countdown Tracker */}
            <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-white/3">
                <div
                    className="h-full rounded-r-full"
                    style={{
                        width: `${progress * 100}%`,
                        background: cfg.timerColor,
                        boxShadow: `0 0 8px ${cfg.timerColor}`,
                        transition: paused ? "none" : "width 16ms linear",
                    }}
                />
            </div>
        </motion.div>
    );
}

export function AlertStack() {
    const alerts = useAlertStore((s: any) => s.alerts);

    return (
        <div
            className="fixed bottom-6 right-6 z-100 flex flex-col gap-3.5 pointer-events-none"
            aria-live="polite"
            aria-atomic="false"
        >
            <AnimatePresence mode="popLayout" initial={false}>
                {alerts.map((alert: any) => (
                    <motion.div 
                        key={alert.id} 
                        layout 
                        className="pointer-events-auto"
                    >
                        <AlertCard alert={alert} />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}