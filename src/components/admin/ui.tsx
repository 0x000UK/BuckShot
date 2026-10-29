import { ALL_TAGS, BRAND, BRAND_LIGHT, cn } from "@/lib/utils";
import type { GameStatus, GameTag } from "@/types/game";
import { motion  } from "motion/react";

export type SidebarView = "overview" | "games" | "genre" | "tags" | "users";

export function GoldBar({ className }: { className?: string }) {
	return (
		<div
			className={cn("w-0.5 shrink-0 bg-[#c4a97d]", className)}
		/>
	);
}

export function Modal({
    title,
    message,
    destructive = false,
    loading = false,
    cancelText,
    onCancel,
    confirmText,
    onConfirm,
    children,
}: {
    title: string;
    message?: string;
    destructive?: boolean;
    loading?: boolean;
    cancelText: string;
    onCancel: () => void;
    confirmText: string;
    onConfirm: () => void;
    children?: React.ReactNode;
}) {
    const glowColor = destructive ? "#dc2626" : BRAND_LIGHT;
    const glowMidColor = destructive ? "#ff6b6b" : "#fff0bf";
    // The "resting" border colour — always lit, even while the comet travels
    const litColor = destructive ? "rgba(220,38,38,0.35)" : `${BRAND}30`;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        >
            <motion.div
                initial={{ scale: 0.96, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.96, y: 10 }}
                className="relative w-full max-w-md p-6 bg-[#0d0c0b] flex flex-col gap-4 shadow-2xl"
            >
                {/* Base border - always lit, never glowing */}
                <div
                    className="absolute inset-0 border pointer-events-none transition-colors duration-300"
                    style={{ borderColor: litColor }}
                />

                {loading && (
                    <div
                        className="comet-ring absolute inset-0 pointer-events-none"
                        style={
                            {
                                background: `conic-gradient(from var(--angle), ${glowMidColor} 0%, transparent var(--arc-w), transparent calc(100% - var(--arc-w)), ${glowMidColor} 100%)`,
                                WebkitMask:
                                    "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                                WebkitMaskComposite: "xor",
                                maskComposite: "exclude",
                                padding: "1.5px",
                                filter: `drop-shadow(0 0 6px ${glowColor}) drop-shadow(0 0 12px ${glowColor})`,
                            } as React.CSSProperties
                        }
                    />
                )}

                {/* Content stays above the border overlay */}
                <div className="relative z-10">
                    <h3 className="font-jost text-[12px] tracking-[0.2em] uppercase text-white/90">
                        {title}
                    </h3>

                    {children ?? (
                        <p className="font-jost text-[12px] text-[#d1d0c5]/60 leading-relaxed min-h-10 mt-4">
                            {message}
                        </p>
                    )}

                    <div className="flex items-center justify-end gap-3 mt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={loading}
                            className="px-4 py-1.5 font-jost text-[10px] tracking-widest uppercase border border-white/10 text-white/40 hover:text-white/70 hover:bg-white/5 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {cancelText}
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={loading}
                            className="px-5 py-1.5 font-jost text-[10px] tracking-widest uppercase text-white border transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                background: destructive ? "#dc262633" : `${BRAND}15`,
                                borderColor: destructive ? "#dc2626" : BRAND_LIGHT,
                            }}
                        >
                            {loading ? "Processing..." : confirmText}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

export function ActionBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
	return (
		<motion.button
			whileHover={{ borderColor: "rgba(196, 169, 125, 0.55)", color: "#ffffffb6" }}
			whileTap={{ scale: 0.97 }}
			transition={{ duration: 0.15 }}
			onClick={onClick}
			className="flex items-center gap-2 px-4 py-2 font-jost text-[10px] tracking-[0.14em] uppercase border border-[#7a6b4f]/40 text-[#c4a97d]/75 bg-[#7a6b4f]/10"
		>
			<svg width="10" height="10" viewBox="0 0 10 10" fill="none">
				<path d="M5 1V9M1 5H9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
			</svg>
			{children}
		</motion.button>
	);
}

export function DeleteBtn({ onClick }: { onClick: () => void }) {
	return (
		<motion.button
			whileHover={{ borderColor: "rgba(239, 68, 68, 0.55)", color: "#f87171" }}
			whileTap={{ scale: 0.95 }}
			transition={{ duration: 0.15 }}
			onClick={onClick}
			className="p-1.5 text-white/30 hover:text-red-400 border border-transparent hover:border-red-500/30 hover:bg-red-500/10 transition-colors cursor-pointer"
			aria-label="Delete"
		>
			<svg width="12" height="12" viewBox="0 0 12 12" fill="none">
				<path d="M2 3H10M4.5 3V2C4.5 1.5 5 1 5.5 1H6.5C7 1 7.5 1.5 7.5 2V3M9 3V10C9 10.5 8.5 11 8 11H4C3.5 11 3 10.5 3 10V3" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
			</svg>
		</motion.button>
	);
}

export function StatusBadge({ status }: { status: GameStatus }) {
	const map = {
		published: { label: "Published", classes: "text-[#6b9a6b] bg-[#6b9a6b]/10 border-[#6b9a6b]/30" },
		draft: { label: "Draft", classes: "text-[#9a9a6b] bg-[#9a9a6b]/10 border-[#9a9a6b]/30" },
		delisted: { label: "Delisted", classes: "text-[#9a6b6b] bg-[#9a6b6b]/10 border-[#9a6b6b]/30" },
	};
	const s = map[status];
	return (
		<span className={`px-2 py-0.5 font-jost text-[9px] tracking-[0.12em] uppercase border rounded-sm ${s.classes}`}>
			{s.label}
		</span>
	);
}

export function tagMeta(id: GameTag) { return ALL_TAGS.find((t) => t.id === id)!; }

export function TagPill({ tag }: { tag: GameTag }) {
	const m = tagMeta(tag);
	return (
		<span className="px-1.5 py-px font-jost text-[8px] tracking-widest uppercase border"
			style={{ color: m.color, borderColor: `${m.color}40`, background: `${m.color}14` }}>
			{m.label}
		</span>
	);
}

