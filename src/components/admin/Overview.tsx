'use client'
import { BRAND, BRAND_LIGHT, cn, EASE } from "@/lib/utils";
import type { Genre, GameData, GameTag, GameSummary} from "@/types/game";
import { AnimatePresence, motion } from "motion/react";
import { GoldBar, TagPill } from "./ui";
import { CinematicCard } from "../premiumCard";

const ALL_TAGS: { id: GameTag; label: string; color: string }[] = [
	{ id: "trending", label: "Trending", color: "#c4a97d" },
	{ id: "coming-soon", label: "Upcoming", color: "#7a9a6b" },
	{ id: "new-release", label: "New Release", color: "#6b7a9a" },
	{ id: "featured", label: "Featured", color: "#9a8a6b" },
	{ id: "early-access", label: "Early Access", color: "#7a6b9a" },
	{ id: "exclusive", label: "Exclusive", color: "#856b9a" }
];

function fmt(n: number) { return n.toLocaleString(); }

const STATS_USERS = 142_380;

function SectionSep() {
	return (
		<div className="w-full h-px my-5"
			style={{ background: `linear-gradient(90deg,${BRAND}40,transparent)` }} />
	);
}

function StatCard({ label, value, sub, icon }: { label: string; value: string; sub?: string; icon: React.ReactNode }) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 14 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.35, ease: EASE }}
			className="flex flex-col gap-3 p-5 border"
			style={{ borderColor: `${BRAND}22`, background: "rgba(122,107,79,0.04)" }}
		>
			<div className="flex items-center justify-between">
				<span className="font-jost text-[10px] tracking-[0.16em] uppercase" style={{ color: `${BRAND}80` }}>{label}</span>
				<div style={{ color: `${BRAND_LIGHT}55` }}>{icon}</div>
			</div>
			<div>
				<p className="font-jk text-[28px] leading-none text-white/88">{value}</p>
				{sub && <p className="font-jost text-[11px] mt-1" style={{ color: `${BRAND_LIGHT}55` }}>{sub}</p>}
			</div>
		</motion.div>
	);
}




export default function Overview({ games, categories }: { games: GameSummary[]; categories: Genre[] }) {
	const published = games.filter((g) => g.status === "published").length;
	const genres = new Set(games.map((g) => g.genres)).size;

	return (
		<>
		<div className="flex items-center justify-start px-6 py-3 gap-2 border-b border-[#7a6b4f]/10 bg-[#090807] shrink-0">
			<span className="text-[#c4a97d]/50">
				<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" stroke="currentColor" strokeWidth="1"/><rect x="8" y="1" width="5" height="5" stroke="currentColor" strokeWidth="1"/><rect x="1" y="8" width="5" height="5" stroke="currentColor" strokeWidth="1"/><rect x="8" y="8" width="5" height="5" stroke="currentColor" strokeWidth="1"/></svg>
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
            >
				<div className="flex flex-col gap-6">
			{/* Stat cards */}
			<div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
				<StatCard label="Total Games" value={String(games.length)} sub={`${published} published`}
					icon={<svg width="16" height="16" viewBox="0 0 14 14" fill="none"><rect x="1" y="2" width="10" height="12" stroke="currentColor" strokeWidth="1" /></svg>} />
				<StatCard label="Categories" value={String(categories.length)} sub={`${genres} genres`}
					icon={<svg width="16" height="16" viewBox="0 0 14 14" fill="none"><path d="M1 3H13M1 7H9M1 11H11" stroke="currentColor" strokeWidth="1" strokeLinecap="square" /></svg>} />
				<StatCard label="Registered Users" value={fmt(STATS_USERS)} sub="+2.4K this month"
					icon={<svg width="16" height="16" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="4" r="3" stroke="currentColor" strokeWidth="1" /><path d="M1 13C1 10.2 3.7 8 7 8C10.3 8 13 10.2 13 13" stroke="currentColor" strokeWidth="1" /></svg>} />
			</div>

			<SectionSep />

			{/* Recent games */}
			<div>
				<div className="flex items-center gap-3 mb-4">
					<GoldBar className="h-4" />
					<span className="font-jost text-[10px] tracking-[0.18em] uppercase" style={{ color: `${BRAND_LIGHT}70` }}>
						Recently Added
					</span>
				</div>
				{/* <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
					{[...games].sort((a, b) => b.createdAt!.localeCompare(a.createdAt!)).slice(0, 4).map((game, i) => (
						<CinematicCard key={game.id} game={game} index={i}/>
					))}
				</div> */}
			</div>

			<SectionSep />

			{/* Tag distribution */}
			<div>
				<div className="flex items-center gap-3 mb-4">
					<GoldBar className="h-4" />
					<span className="font-jost text-[10px] tracking-[0.18em] uppercase" style={{ color: `${BRAND_LIGHT}70` }}>
						Tag Distribution
					</span>
				</div>
				<div className="flex flex-col gap-2">
					{ALL_TAGS.map((t) => {
						const count = games.filter((g) => g.tags!.includes(t.id)).length;
						const pct = games.length > 0 ? (count / games.length) * 100 : 0;
						return (
							<div key={t.id} className="flex items-center gap-3">
								<span className="font-jost text-[10px] tracking-widest uppercase w-24 shrink-0" style={{ color: `${t.color}80` }}>{t.label}</span>
								<div className="flex-1 h-1.5 relative" style={{ background: `${BRAND}18` }}>
									<motion.div
										initial={{ width: 0 }} animate={{ width: `${pct}%` }}
										transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
										className="absolute inset-y-0 left-0"
										style={{ background: t.color }} />
								</div>
								<span className="font-jost text-[11px] w-6 text-right" style={{ color: `${BRAND_LIGHT}55` }}>{count}</span>
							</div>
						);
					})}
				</div>
			</div>
		</div>
		</motion.div>
		</AnimatePresence>
		</>
	);
}