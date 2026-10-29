"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { EASE } from "@/lib/utils";
import type { MediaItem } from "@/types/game";
import { ExternalLink } from "lucide-react";
import { getVideoMediaDetails } from "@/lib/videoUtils";

interface MediaGalleryProps {
	media: MediaItem[];
	label?: string;
}


function PlayIcon({ size = 40 }: { size?: number }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 40 40"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<circle cx="20" cy="20" r="19" stroke="#c4a97d" strokeWidth="1" strokeOpacity="0.6" />
			<path d="M16 13.5L28 20L16 26.5V13.5Z" fill="#c4a97d" />
		</svg>
	);
}

function ChevronBtn({
	dir,
	onClick,
	disabled,
	size = "sm",
}: {
	dir: "left" | "right";
	onClick: () => void;
	disabled?: boolean;
	size?: "sm" | "md";
}) {
	const dim = size === "md" ? 40 : 32;
	return (
		<motion.button
			onClick={onClick}
			disabled={disabled}
			whileHover={disabled ? {} : { borderColor: "rgba(196,169,125,0.5)" }}
			whileTap={disabled ? {} : { scale: 0.94 }}
			className={`
        shrink-0 flex items-center justify-center border
        bg-black/70 backdrop-blur-sm
        disabled:opacity-20 disabled:cursor-not-allowed
        transition-colors duration-200
      `}
			style={{
				width: dim,
				height: dim,
				borderColor: disabled ? "rgba(122,107,79,0.13)" : "rgba(122,107,79,0.31)",
			}}
			aria-label={dir === "left" ? "Previous" : "Next"}
		>
			<svg
				width={size === "md" ? 18 : 14}
				height={size === "md" ? 18 : 14}
				viewBox="0 0 16 16"
				fill="none"
			>
				{dir === "left" ? (
					<path d="M10 3L5 8L10 13" stroke="#c4a97d" strokeWidth="1.25" strokeLinecap="square" />
				) : (
					<path d="M6 3L11 8L6 13" stroke="#c4a97d" strokeWidth="1.25" strokeLinecap="square" />
				)}
			</svg>
		</motion.button>
	);
}

function ThumbCard({
	item,
	index,
	active,
	expanded,
	onClick,
}: {
	item: MediaItem;
	index: number;
	active: boolean;
	expanded: boolean;
	onClick: () => void;
}) {
	const videoDetails = getVideoMediaDetails(item.url);
	const isVideo = item.type === "video" || videoDetails.isYouTube || videoDetails.isDirectVideo;
	const thumbSrc = videoDetails.isYouTube ? videoDetails.thumbnailUrl : item.url;
	const label = item.title;

	return (
		<motion.div
			layout
			onClick={onClick}
			whileHover={{ transition: { duration: 0.25, ease: EASE } }}
			className={`relative shrink-0 cursor-pointer group overflow-hidden transition-all duration-300 rounded-none border ${
				expanded
					? "w-24 xs:w-28 sm:w-36 md:w-44 aspect-16/10"
					: "w-56 xs:w-64 sm:w-80 md:w-96 lg:w-105 aspect-16/10"
			}`}
			style={{
				borderColor: expanded
					? active
						? "#c4a97d"
						: "rgba(122,107,79,0.35)"
					: "rgba(122,107,79,0.5)",
			}}
		>
			{/* Thumbnail image */}
			{thumbSrc && (
				<Image
					src={thumbSrc}
					alt={label || 'media thumbnail'}
					fill
					className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
					sizes={expanded ? "(max-width: 640px) 120px, 180px" : "(max-width: 640px) 260px, (max-width: 1024px) 380px, 440px"}
					priority={index < 2}
					unoptimized
				/>
			)}

			{/* Dimming overlay */}
			<div
				className="absolute inset-0 transition-opacity duration-200"
				style={{
					background: active ? "rgba(8,8,8,0)" : "rgba(8,8,8,0.45)",
					opacity: 1,
				}}
			/>

			{/* Play icon for videos */}
			{isVideo && (
				<div className="absolute inset-0 flex items-center justify-center backdrop-blur-xs">
					<div className="opacity-80 group-hover:opacity-100 transition-opacity duration-200">
						<PlayIcon size={expanded ? 24 : 36} />
					</div>
				</div>
			)}

			{/* Label on hover */}
			<div className="absolute bottom-0 left-0 right-0 px-2 sm:px-3 py-1.5 sm:py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-linear-to-t from-black/90 to-transparent">
				<p className="text-[10px] sm:text-[11px] tracking-wide truncate text-[#c4a97d]/90 font-jost">
					{label}
				</p>
			</div>
		</motion.div>
	);
}

function MainViewer({ item }: { item: MediaItem }) {
	const videoDetails = getVideoMediaDetails(item.url);
	const isVideo = item.type === "video" || videoDetails.isYouTube || videoDetails.isDirectVideo;

	if (isVideo) {
		if (videoDetails.isYouTube) {
			return (
				<div className="relative w-full h-full max-w-5xl aspect-video max-h-[75vh] mx-auto flex items-center justify-center bg-black border border-[#7a6b4f]/30">
					<iframe
						src={videoDetails.embedUrl}
						title={item.title || "Game Trailer"}
						className="absolute inset-0 w-full h-full border-none"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						referrerPolicy="strict-origin-when-cross-origin"
						allowFullScreen
					/>
				</div>
			);
		}

		return (
			<div className="relative w-full h-full max-w-5xl aspect-video max-h-[75vh] mx-auto flex items-center justify-center bg-black border border-[#7a6b4f]/30">
				<video
					src={item.url}
					controls
					autoPlay
					playsInline
					className="w-full h-full object-contain"
				/>
			</div>
		);
	}

	return (
		<a
			href={item.url}
			target="_blank"
			rel="noopener noreferrer"
			className="relative w-full h-full block cursor-zoom-in group select-none"
			title="Click to open image in new tab"
		>
			{item.url && (
				<Image
					src={item.url}
					alt={item.title || "preview"}
					fill
					className="object-contain transition-transform duration-300 group-hover:scale-[1.01]"
					sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
					priority
					unoptimized
				/>
			)}
			<div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-20 flex items-center gap-1.5 px-2.5 py-1.5 bg-black/80 border border-[#7a6b4f]/40 text-[#c4a97d] font-jost text-[10px] tracking-wider uppercase opacity-80 group-hover:opacity-100 transition-opacity pointer-events-none rounded-none shadow-lg">
				<ExternalLink size={12} />
				<span className="hidden xs:inline">Open Fullscreen</span>
			</div>
		</a>
	);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MediaGallery({
	media,
	label = "Screenshots & Videos",
}: MediaGalleryProps) {
	const [activeIndex, setActiveIndex] = useState(0);
	const [expanded, setExpanded] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const activeItem = media[activeIndex];

	const prev = useCallback(
		() => setActiveIndex((i) => Math.max(0, i - 1)),
		[]
	);
	const next = useCallback(
		() => setActiveIndex((i) => Math.min(media.length - 1, i + 1)),
		[media.length]
	);

	const openExpanded = useCallback((index: number) => {
		setActiveIndex(index);
		setExpanded(true);
	}, []);

	const closeExpanded = useCallback(() => setExpanded(false), []);

	// Keyboard navigation
	useEffect(() => {
		if (!expanded) return;
		const handler = (e: KeyboardEvent) => {
			if (e.key === "ArrowLeft") prev();
			if (e.key === "ArrowRight") next();
			if (e.key === "Escape") closeExpanded();
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [expanded, prev, next, closeExpanded]);

	// Lock body scroll when expanded
	useEffect(() => {
		document.body.style.overflow = expanded ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [expanded]);

	return (
		<>
			<section className="relative w-full mx-auto py-4 sm:py-8">
				<div
					className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 pt-2 px-4 sm:px-8 md:px-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
				>
					{media.map((item, i) => (
						<div key={i} className="shrink-0 drop-shadow-xl hover:drop-shadow-2xl transition-all">
							<ThumbCard
								item={item}
								index={i}
								active={false}
								expanded={false}
								onClick={() => openExpanded(i)}
							/>
						</div>
					))}
				</div>
			</section>

			{/* Expanded lightbox overlay */}
			{mounted &&
				createPortal(
					<AnimatePresence>
						{expanded && (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.3, ease: EASE }}
								className="fixed inset-0 z-100 flex flex-col justify-start bg-black/92 backdrop-blur-2xl overflow-hidden"
							>
								{/* Close button */}
								<motion.button
									onClick={closeExpanded}
									whileHover={{ borderColor: "rgba(196,169,125,0.7)", scale: 1.05 }}
									whileTap={{ scale: 0.93 }}
									className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 flex items-center gap-2 px-3 sm:px-4 py-2 border border-[#7a6b4f]/50 bg-black/80 text-[#c4a97d] font-jost text-[10.5px] tracking-[0.14em] uppercase cursor-pointer rounded-none hover:bg-[#7a6b4f]/20 transition-colors shadow-xl"
									aria-label="Close Preview"
								>
									<svg width="10" height="10" viewBox="0 0 10 10" fill="none">
										<path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="square" />
									</svg>
									<span>Close</span>
								</motion.button>

								{/* Main viewer */}
								<div className="relative w-full flex-1 min-h-0 mx-auto max-w-7xl px-3 sm:px-6 md:px-12 pt-14 sm:pt-16 pb-20 sm:pb-28 flex flex-col items-center justify-center">
									<AnimatePresence mode="wait">
										<motion.div
											key={activeIndex}
											initial={{ opacity: 0, x: 12 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: -12 }}
											transition={{ duration: 0.28, ease: EASE }}
											className="w-full h-full relative"
										>
											<MainViewer item={activeItem} />
										</motion.div>
									</AnimatePresence>

									<AnimatePresence mode="wait">
										<motion.p
											key={activeIndex}
											initial={{ opacity: 0, y: 4 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0 }}
											transition={{ duration: 0.2 }}
											className="font-jost text-[11px] sm:text-xs tracking-[0.08em] text-[#c4a97d]/70 mt-3 text-center truncate max-w-full px-4 shrink-0"
										>
											{activeItem.type === "video" ? `▶  ${activeItem.title}` : activeItem.title}
										</motion.p>
									</AnimatePresence>
								</div>

								{/* Navigation arrows */}
								<div className="absolute top-1/2 -translate-y-1/2 flex justify-between w-full px-2 sm:px-6 md:px-10 pointer-events-none z-30">
									<div className="pointer-events-auto">
										<ChevronBtn dir="left" onClick={prev} disabled={activeIndex === 0} size="md" />
									</div>
									<div className="pointer-events-auto">
										<ChevronBtn dir="right" onClick={next} disabled={activeIndex === media.length - 1} size="md" />
									</div>
								</div>

								{/* Bottom thumbnail strip */}
								<motion.div
									initial="rest"
									animate="rest"
									whileHover="hover"
									variants={{
										rest: { y: "65%" },
										hover: { y: "0%" }
									}}
									transition={{ duration: 0.35, ease: EASE }}
									className="absolute bottom-0 left-0 right-0 w-full px-4 sm:px-6 pb-3 sm:pb-4 flex flex-col z-40 bg-gradient-to-t from-black via-black/80 to-transparent pt-4"
								>
									<div className="mx-auto w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
										<div className="flex gap-2 sm:gap-3 justify-start sm:justify-center">
											{media.map((item, i) => (
												<ThumbCard
													key={i}
													item={item}
													index={i}
													active={i === activeIndex}
													expanded
													onClick={() => setActiveIndex(i)}
												/>
											))}
										</div>
									</div>
								</motion.div>
							</motion.div>
						)}
					</AnimatePresence>,
					document.body
				)}
		</>
	);
}