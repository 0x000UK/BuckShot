"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAlertStore, type Alert, type AlertType } from "@/stores/alertStore";
import { EASE } from "@/lib/utils";
import {CircleAlert, CircleCheckBig, CircleX, Info} from "lucide-react";

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
        icon: <CircleCheckBig size={20}/>,
    },
    error: {
        borderColor: "rgba(239, 68, 68, 0.2)",
        timerColor: "#ef4444",
        titleColor: "#f87171",
        badgeBg: "rgba(239, 68, 68, 0.1)",
        icon : <CircleX size={20}/>
    },
    warning: {
        borderColor: "rgba(245, 158, 11, 0.2)",
        timerColor: "#f59e0b",
        titleColor: "#fbbf24",
        badgeBg: "rgba(245, 158, 11, 0.1)",
        icon : <CircleAlert size={20}/>
    },
    info: {
        borderColor: "rgba(56, 189, 248, 0.2)",
        timerColor: "#38bdf8",
        titleColor: "#7dd3fc",
        badgeBg: "rgba(56, 189, 248, 0.1)",
        icon : <Info size={20}/>
    },
};

function AlertCard({ alert }: { alert: Alert }) {
    const dismiss = useAlertStore((s: any) => s.dismiss);
    const duration = alert.duration ?? 4000;
    const cfg = CONFIG[alert.type];

    const [paused, setPaused] = useState(false);

    const startTime = useRef<number | null>(null);
    const elapsed = useRef<number>(0);
    const rafId = useRef<number | null>(null);

    const tick = useCallback(() => {
        if (startTime.current === null) return;
        const now = Date.now();
        const delta = now - startTime.current;
        const total = elapsed.current + delta;
        const p = Math.max(0, 1 - total / duration);

        if (p <= 0) {
            dismiss(alert.id);
            return;
        }
        rafId.current = requestAnimationFrame(() => tick());
    }, [alert.id, dismiss, duration]);

    useEffect(() => {
        startTime.current = Date.now();
        rafId.current = requestAnimationFrame(() => tick());
        return () => { if (rafId.current) cancelAnimationFrame(rafId.current); };
    }, [tick]);

    const handleMouseEnter = () => {
        if (rafId.current) cancelAnimationFrame(rafId.current);
        if (startTime.current !== null) {
            elapsed.current += Date.now() - startTime.current;
        }
        setPaused(true);
    };

    const handleMouseLeave = () => {
        startTime.current = Date.now();
        setPaused(false);
        rafId.current = requestAnimationFrame(() => tick());
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
                className="shrink-0 flex justify-center rounded-lg"
                style={{
                    color: cfg.timerColor,

                }}
            >
                {cfg.icon}
            </div>

            {/* Text Copy Context */}
            <div className="flex-1 min-w-0 pr-2">
                <p
                    className="text-[13px] font-semibold tracking-wide leading-tight font-jost"
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