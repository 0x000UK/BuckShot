import {cn, EASE } from "@/lib/utils";
import type { GameData, GameStatus, GameTag } from "@/types/game";
import { motion } from "motion/react";

export type SidebarView = "overview" | "games" | "genre" | "tags" | "users";

export function GoldBar({ className }: { className?: string }) {
	return (
		<div
			className={cn("w-0.5 shrink-0 bg-[#c4a97d]", className)}
		/>
	);
}

export const ALL_TAGS: { id: GameTag; label: string; color: string; bg: string; border: string }[] = [
	{ id: "trending", label: "Trending", color: "#c4a97d", bg: "bg-[#c4a97d]/5", border: "border-[#c4a97d]/20" },
	{ id: "coming-soon", label: "Upcoming", color: "#7a9a6b", bg: "bg-[#7a9a6b]/5", border: "border-[#7a9a6b]/20" },
	{ id: "new-release", label: "New Release", color: "#6b7a9a", bg: "bg-[#6b7a9a]/5", border: "border-[#6b7a9a]/20" },
	{ id: "featured", label: "Featured", color: "#9a8a6b", bg: "bg-[#9a8a6b]/5", border: "border-[#9a8a6b]/20" },
	{ id: "early-access", label: "Early Access", color: "#7a6b9a", bg: "bg-[#7a6b9a]/5", border: "border-[#7a6b9a]/20" },
	{ id: "exclusive", label: "Exclusive", color: "#6b9a8d", bg: "bg-[#6b9a8d]/5", border: "border-[#6b9a8d]/20" },

];

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#080808]/20 backdrop-blur-[5px]">
			<motion.div
				initial={{ opacity: 0, y: 24, scale: 0.98 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				exit={{ opacity: 0, y: 12, scale: 0.98 }}
				transition={{ duration: 0.32, ease: EASE }}
				className="w-full max-w-lg border border-[#7a6b4f]/40 bg-[#0d0c0a] rounded-sm shadow-2xl"
			>
				<div className="flex items-center justify-between px-6 py-4 border-b border-[#7a6b4f]/20">
					<div className="flex items-center gap-3">
						<GoldBar className="h-4" />
						<span className="font-jost text-[11px] tracking-[0.18em] uppercase text-[#c4a97d]/80">
							{title}
						</span>
					</div>
					<button
						onClick={onClose}
						className="w-7 h-7 flex items-center justify-center border border-[#7a6b4f]/30 text-[#c4a97d]/50 hover:text-[#c4a97d] hover:bg-[#7a6b4f]/10 transition-colors duration-150 rounded-sm"
					>
						<svg width="10" height="10" viewBox="0 0 10 10" fill="none">
							<path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
						</svg>
					</button>
				</div>
				<div className="px-6 py-5">{children}</div>
			</motion.div>
		</div>
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

export function TagsView({ games }: { games: GameData[] }) {
	const tagStats = ALL_TAGS.map((t) => ({
		...t, count: games.filter((g) => g.tags?.includes(t.id)).length,
	}));

	return (
		<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
			{tagStats.map((t, i) => (
				<motion.div
					key={t.id}
					initial={{ opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, ease: EASE, delay: i * 0.07 }}
					className={`p-5 border flex flex-col gap-3 rounded-sm ${t.bg} ${t.border}`}
				>
					<div className="flex items-center gap-2">
						<div className="w-2 h-2 rounded-full" style={{ background: t.color }} />
						<span className="font-jost text-[10px] tracking-[0.16em] uppercase" style={{ color: t.color }}>{t.label}</span>
					</div>
					<p className="font-jk text-[32px] leading-none" style={{ color: t.color }}>{t.count}</p>
					<p className="font-jost text-[11px]" style={{ color: `${t.color}80` }}>games tagged</p>
				</motion.div>
			))}
		</div>
	);
}

export function DeleteModal({ title, onClose, onConfirm }: { title: string; onClose: () => void; onConfirm: () => void }) {
	return (
		<Modal title="Confirm Delete" onClose={onClose}>
			<p className="font-jost text-[13px] text-white/45 mb-6">
				Permanently delete <span className="text-white/70 font-medium">{title}</span>? This action cannot be undone.
			</p>
			<div className="flex justify-end gap-3">
				<button
					onClick={onClose}
					className="px-4 py-2 font-jost text-[10px] tracking-[0.14em] uppercase text-white/30 hover:text-white/55 transition-colors duration-150"
				>
					Cancel
				</button>
				<motion.button
					whileTap={{ scale: 0.97 }}
					onClick={() => { onConfirm(); onClose(); }}
					className="px-5 py-2 font-jost text-[10px] tracking-[0.14em] uppercase border border-[#9a6b6b]/50 text-[#dc7878]/85 bg-[#9a6b6b]/10 rounded-sm transition-all duration-200 hover:bg-[#9a6b6b]/20"
				>
					Delete
				</motion.button>
			</div>
		</Modal>
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

export function DeleteBtn({ onClick }: { onClick: () => void }) {
	return (
		<button
			onClick={onClick}
			className="w-7 h-7 flex items-center justify-center border border-[#7a6b4f]/20 text-white/20 rounded-md transition-all duration-150 hover:border-red-900/50 hover:text-red-400/80 hover:bg-red-950/20"
		>
			<svg width="11" height="11" viewBox="0 0 12 12" fill="none">
				<path d="M1 3H11M4 3V1H8V3M5 6V9M7 6V9M2 3L3 11H9L10 3" stroke="currentColor" strokeWidth="1" />
			</svg>
		</button>
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

export function EditBtn({ onClick }: { onClick: () => void }) {
	return (
		<button
			onClick={onClick}
			className="w-7 h-7 flex items-center justify-center border border-[#7a6b4f]/25 text-[#c4a97d]/50 rounded-md transition-all duration-150 hover:border-[#c4a97d]/40 hover:text-[#c4a97d]/80 hover:bg-[#7a6b4f]/10"
		>
			<svg width="11" height="11" viewBox="0 0 12 12" fill="none">
				<path d="M8 1L11 4L4 11H1V8L8 1Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="miter" />
			</svg>
		</button>
	);
}

