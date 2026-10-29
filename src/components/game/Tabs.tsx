"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import DetailsTab from "./Details";
import DownloadTab from "./Download";
import DiscussionsTab from "./Discussion";
import FaqTab from "./Faq";
import { BRAND, BRAND_LIGHT, EASE } from "@/lib/utils";
import AddOnsTab from "./AddOns";
import type { GameData } from "@/lib/game";
import type { DiscussionComment } from "@/types/discussion";
import type { GameFaq } from "@/types/faq";

type TabId = "details" | "download" | "discussions" | "faq" | "addon";


const TABS: { id: TabId; label: string }[] = [
	{ id: "details", label: "Details" },
	{ id: "download", label: "Download" },
	{ id: "discussions", label: "Discussions" },
	{ id: 'faq', label: 'FAQ' },
	{ id : 'addon', label : 'Add Ons'}
];


interface TabSectionProps {
	game: GameData;
	discussions?: DiscussionComment[];
	faqs?: GameFaq[];
	currentUser?: {
		id?: string;
		handle?: string;
		role?: string;
		badges?: string[];
	} | null;
	inWishlist?: boolean;
}

export default function TabSection({ game, discussions = [], faqs, currentUser, inWishlist }: TabSectionProps) {
	const [activeTab, setActiveTab] = useState<TabId>("details");

	const rawFaqs = faqs || game.faqs;
	const faqItems = rawFaqs && rawFaqs.length > 0 ? rawFaqs.map((f, idx) => ({
		id: `faq-${idx}`,
		question: f.title,
		answer: f.body,
		category: f.category || "General",
	})) : undefined;

	return (
		<section
			className="relative w-full"
		>
			{/* Top separator */}
			<div
				className="w-full h-px"
				style={{ background: `linear-gradient(90deg, transparent, ${BRAND}35, transparent)` }}
			/>

			<div
				className="sticky top-0 z-3 flex items-center justify-start sm:justify-center overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-4 sm:px-8 md:px-14 lg:px-20 bg-ambient backdrop-blur-md"
				style={{ borderBottom: `1px solid ${BRAND}22` }}
			>
				{TABS.map((tab) => {
					const active = tab.id === activeTab;
					return (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className="relative flex items-center 
								py-3.5 sm:py-4 md:py-5 mr-5 sm:mr-7 md:mr-8 
								transition-colors duration-200 
								font-jost text-xs sm:text-[13px] md:text-[14px] uppercase
								tracking-[0.12em] sm:tracking-[0.16em]
								bg-none border-none cursor-pointer shrink-0 whitespace-nowrap
                				"
							style={{
								color: active ? BRAND_LIGHT : "rgba(255,255,255,0.62)",
							}}
						>
							{tab.label}

							{/* Animated underline */}
							{active && (
								<motion.div
									layoutId="tab-indicator"
									className="absolute bottom-0 left-0 right-0 h-px"
									style={{ background: `linear-gradient(90deg, ${BRAND}, ${BRAND_LIGHT}, ${BRAND})` }}
									transition={{ duration: 0.35, ease: EASE }}
								/>
							)}
						</button>
					);
				})}
			</div>

			<div className="relative">
				<AnimatePresence mode="wait">
					<motion.div
						key={activeTab}
						initial={{ opacity: 0, y: 18 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.38, ease: EASE }}
					>
						{activeTab === "details" && (
							<DetailsTab
								game={game}
								currentUser={currentUser}
								initialInWishlist={inWishlist}
								className="bg-[#080808]"
							/>
						)}
						{activeTab === "download" && (
							<DownloadTab
								gameId={game.id || ""}
								gameTitle={game.title}
								official={game.officialDownloads}
								nonOfficial={game.nonOfficialDownloads}
								className="bg-[#080808]"
							/>
						)}
						{activeTab === "discussions" && <DiscussionsTab gameId={game.id} discussions={discussions} currentUser={currentUser} className="bg-[#080808]"/>}
						{activeTab === "faq" && <FaqTab items={faqItems} className="bg-[#080808]"/>}
						{activeTab === "addon" && <AddOnsTab game={game} />}
					</motion.div>
				</AnimatePresence>
			</div>
		</section>
	);
}
