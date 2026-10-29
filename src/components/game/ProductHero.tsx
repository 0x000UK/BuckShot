"use client";

import type { GameData } from "@/lib/game";
import { BRAND, BRAND_LIGHT, EASE } from "@/lib/utils";
import { motion } from "motion/react";
import Image from "next/image";

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.75">
            {Array.from({ length: 5 }).map((_, i) => {
                const starFill = Math.max(0, Math.min(1, rating - i));
                
                const fillPercentage = `${(starFill * 100).toFixed(1)}%`;

                const isFullyFilled = starFill === 1;
                const isPartiallyFilled = starFill > 0 && starFill < 1;

                return (
                    <svg
                        key={i}
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        {isPartiallyFilled ? (
                            <defs>
                                <linearGradient id={`fraction-${i}`}>
                                    <stop offset={fillPercentage} stopColor={BRAND_LIGHT} />
                                    <stop offset={fillPercentage} stopColor="transparent" />
                                </linearGradient>
                            </defs>
                        ) : null}
                        <path
                            d="M7 1L8.73 5.02L13 5.53L9.89 8.47L10.9 12.72L7 10.37L3.1 12.72L4.11 8.47L1 5.53L5.27 5.02L7 1Z"
                            fill={
                                isFullyFilled
                                    ? BRAND_LIGHT
                                    : isPartiallyFilled
                                        ? `url(#fraction-${i})`
                                        : "transparent"
                            }
                            stroke={isFullyFilled || isPartiallyFilled ? BRAND_LIGHT : `${BRAND_LIGHT}40`}
                            strokeWidth="1"
                        />
                    </svg>
                );
            })}
        </div>
    );
}

function GenreChip({ label }: { label: string }) {
    return (
        <motion.span
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="inline-flex items-center px-2.5 py-1 text-[9px] sm:text-[10px] tracking-[0.1em] sm:tracking-[0.12em] uppercase font-['Jost'] font-medium border border-[#7a6b4f]/30 text-[#c4a97d]/80 bg-[#7a6b4f]/8 hover:border-[#c4a97d]/50 hover:text-[#c4a97d] hover:bg-[#7a6b4f]/[0.14] transition-all duration-200 cursor-default select-none rounded-none"
        >
            {label}
        </motion.span>
    );
}


export default function ProductHero({ game }: { game: GameData }) {
    return (
        <div
            className="relative w-full overflow-hidden m-auto flex flex-col justify-end min-h-[65vh] sm:min-h-[80vh] md:min-h-screen pt-20 sm:pt-28 md:pt-36"
        >
            <div className="absolute sm:fixed inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
                <Image
                    src={game.banner.url ??""}
                    alt={game.banner.title || "banner"}
                    fill
                    priority
                    className="object-cover object-[center_20%] sm:object-center opacity-75 sm:opacity-88"
                    sizes="100vw"
                    unoptimized
                />
            </div>

            <div
                className="absolute inset-0 z-1 pointer-events-none"
                style={{
                    background: `radial-gradient(ellipse 90% 70% at 20% 100%, ${game.ambientColor} 0%, transparent 75%)`,
                }}
            />

            <div className="absolute sm:fixed inset-0 z-0 bg-linear-to-tr from-ambient/95 via-ambient/55 to-transparent pointer-events-none"/>
            <div className="absolute sm:fixed inset-0 z-0 bg-linear-to-t from-ambient/60 via-ambient/40 to-transparent pointer-events-none"/>
            <div className="absolute sm:fixed inset-0 z-0 bg-ambient/18 pointer-events-none"/>
            
            <div className="relative w-full max-w-7xl mx-auto py-6 sm:py-10 md:py-12 z-3 px-4 sm:px-8 md:px-12 pb-14 sm:pb-24 md:pb-40">
                
                {/* Main Meta Row  */}
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5 sm:gap-7 w-full">

                    {/* Game cover */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55, ease: EASE }}
                        className="relative shrink-0 aspect-3/4 w-28 xs:w-32 sm:w-36 md:w-44 rounded-none"
                    >
                        <div
                            className="absolute inset-0 z-0 blur-xl opacity-50"
                            style={{
                                background: '#0c0c0c',
                                transform: "translateY(15px) scale(1)",
                            }}
                        />
                        <div
                            className="relative w-full h-full border border-[#7a6b4f]/40 overflow-hidden rounded-none"
                        >
                            <Image
                                src={game.cover.url ?? ""}
                                alt={game.cover.title || 'cover'}
                                fill
                                className="object-cover opacity-85"
                                sizes="(max-width: 640px) 140px, (max-width: 1024px) 180px, 240px"
                            />
                            {/* cover sheen */}
                            <div
                                className="absolute inset-0 pointer-events-none"
                                style={{
                                    background:
                                        "linear-gradient(135deg, #c4a97d1a 0%, transparent 60%)",
                                }}
                            />
                        </div>
                    </motion.div>

                    {/*  Meta block */}
                    <div className="flex-1 min-w-0 w-full pb-1 flex flex-col gap-2.5 sm:gap-3">

                        {/* Genre chips */}
                        <motion.div
                            className="flex flex-wrap gap-1.5 sm:gap-2"
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: {},
                                visible: { transition: { staggerChildren: 0.07 } },
                            }}
                        >
                            {(game.genreDetails && game.genreDetails.length > 0
                                ? game.genreDetails.map((g) => ({ key: g.id || g.slug || g.name, label: g.name }))
                                : (game.genres || []).map((g) => ({ key: g, label: g }))
                            ).map((item) => (
                                <GenreChip key={item.key} label={item.label} />
                            ))}
                        </motion.div>

                        {/* Title & Subtitle Group */}
                        <div className="flex flex-col">
                            {/* Title */}
                            <motion.h1
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
                                className="font-jk text-white leading-[1.08] tracking-wide font-semibold text-2xl sm:text-3xl md:text-5xl lg:text-6xl break-words"
                                style={{
                                    textShadow: "0 2px 32px rgba(0,0,0,0.7)",
                                }}
                            >
                                {game.title}
                            </motion.h1>

                            {/* Subtitle */}
                            {game.subtitle && (
                                <motion.h2
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, ease: EASE, delay: 0.14 }}
                                    className="font-jost text-sm sm:text-base md:text-xl lg:text-2xl text-[#c4a97d]/90 font-normal tracking-[0.03em] mt-1 break-words"
                                    style={{ textShadow: "0 2px 20px rgba(0,0,0,0.8)" }}
                                >
                                    {game.subtitle}
                                </motion.h2>
                            )}
                        </div>

                        {/* Publisher · Developer · Year */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.45, ease: EASE, delay: 0.18 }}
                            className="flex flex-wrap items-center gap-2 sm:gap-3 font-jost text-xs sm:text-[14px] tracking-wide text-white/50 mt-0.5"
                        >
                            <span className="text-[#c4a97d]/80 font-medium">
                                {game.publisher}
                            </span>
                            <span className="text-white/20">·</span>
                            <span>{game.developer}</span>
                            <span className="text-white/20">·</span>
                            {/* releaseDate = YYYY-MM-DD */}
                            <span>{game.releaseDate.slice(0,4)}</span> 
                        </motion.div>

                        {/* Rating row */}
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, ease: EASE, delay: 0.24 }}
                            className="flex flex-wrap items-center gap-2 sm:gap-3 mt-0.5"
                        >
                            <StarRating rating={game.score/20} />
                            <span
                                className="font-['Jost'] text-xs sm:text-[13px] font-semibold tabular-nums"
                                style={{ color: BRAND_LIGHT }}
                            >
                                {game.score}
                            </span>
                            <span className="font-['Jost'] text-[11px] sm:text-[12px] text-white/35 tracking-wide">
                                {game.reviewCount} ratings
                            </span>

                            {/* Divider */}
                            <span className="text-white/15 select-none hidden xs:inline">|</span>

                            {/* Platforms */}
                            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                {game.platforms!.map((p) => (
                                    <span
                                        key={p}
                                        className="font-['Jost'] text-[10px] sm:text-[11px] tracking-[0.08em] uppercase text-white/40 border border-[#7a6b4f]/25 px-1.5 py-0.5 rounded-none"
                                    >
                                        {p}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>

                {game.synopsis && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: EASE, delay: 0.3 }}
                        className="flex justify-between items-center mt-5 sm:mt-8 border-t border-[#7a6b4f]/20 pt-4 sm:pt-5"
                    >
                        <p className="font-jost text-xs sm:text-[14px] md:text-[15px] text-white/65 leading-[1.6] max-w-2xl tracking-wide">
                            {game.synopsis}
                        </p>
                    </motion.div>
                )}

            </div>
        </div>
    );
}