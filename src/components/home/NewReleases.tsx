"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Bookmark, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type GameRelease = {
    id: number;
    title: string;
    subtitle: string;
    description: string;
    src: string;
    logoSrc?: string;
    genre: string[];
}

const RELEASED_GAMES: GameRelease[] = [
    {
        id: 0,
        title: "Black Myth: Wukong",
        subtitle: "The Destined One Awakens",
        description: "An action RPG rooted in Chinese mythology. You shall set out as the Destined One to venture into the challenges and marvels ahead, to uncover the obscured truth beneath the veil of a glorious legend from the past.",
        src: "/ds2bg1.jpg",
        genre: ["Action", "RPG", "Fantasy"]
    },
    {
        id: 1,
        title: "Cyberpunk 2077: Phantom Liberty",
        subtitle: "Spy-Thriller Expansion",
        description: "Return as cyber-enhanced mercenary V and embark on a high-stakes mission of espionage and intrigue to save the NUSA President inside the deadliest district of Night City.",
        src: "/hero.jpg",
        genre: ["RPG", "Sci-Fi", "Open World"]
    },
    {
        id: 2,
        title: "Ghost of Tsushima",
        subtitle: "Storm of the Ghost",
        description: "In the late 13th century, the Mongol empire has laid waste to entire nations. As one of the last remaining samurai, you must rise from the ashes and forge a new way of warfare to defend your homeland.",
        src: "/sam-lou.jpg",
        genre: ["Action", "Open World", "Historical"]
    },
    {
        id: 3,
        title: "Alan Wake 2",
        subtitle: "The Dark Place Awaits",
        description: "A string of ritualistic murders threatens Bright Falls. Saga Anderson arrives to investigate, while trapped writer Alan Wake writes a dark story to shape reality and escape his endless nightmare.",
        src: "/ds2bg1.jpg",
        genre: ["Horror", "Survival", "Mystery"]
    }
];

const AUTOPLAY_DURATION = 6000;

export default function NewReleases() {
    const [activeIndex, setActiveIndex] = useState<number>(0);
    const [direction, setDirection] = useState<number>(1); // 1 for right, -1 for left
    const activeGame = RELEASED_GAMES[activeIndex];

    useEffect(() => {
        const timer = setInterval(() => {
            setDirection(1);
            setActiveIndex((prevIndex) => (prevIndex + 1) % RELEASED_GAMES.length);
        }, AUTOPLAY_DURATION);

        return () => clearInterval(timer);
    }, [activeIndex]);

    const handleSelectGame = (index: number) => {
        setDirection(index > activeIndex ? 1 : -1);
        setActiveIndex(index);
    };

    // Custom keyframes defined as a CSS string
    const progressKeyframes = `
        @keyframes progressLoader {
            from { height: 0%; }
            to { height: 100%; }
        }`;

    return (
        <div className="w-full max-w-7xl mx-auto px-6 py-16 bg-[#080808]">
            {/* Inject dynamic CSS animation for the filling timer block */}
            <style>{progressKeyframes}</style>

            {/* ── Section Title ── */}
            <div className="flex items-center gap-4 mb-4 sm:mb-6 md:mb-8 border-b border-[#7a6b4f]/15 pb-4 ">
                <div className="w-1 h-6 bg-[#c4a97d]" />
                <h2 className="text-white text-xs sm:text-xl md:text-2xl font-medium tracking-widest uppercase">
                    New Releases
                </h2>
            </div>

            {/* ── Main Interactive Layout Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-auto lg:h-125">
                {/* 1. Left Showcase Block (Spans 2 columns) */}
                <div className="lg:col-span-2 relative overflow-hidden bg-[#0c0a08] border border-[#7a6b4f]/15 flex flex-col justify-end p-8 md:p-12 h-87.5 lg:h-full group">
                    {/* Background Dynamic Image with AnimatePresence for smooth transitions */}
                    <AnimatePresence initial={false} custom={direction}>
                        <motion.div
                            key={activeGame.id}
                            custom={direction}
                            initial={{ x: direction * 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: direction * -50, opacity: 0 }}
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            className="absolute inset-0 z-0"
                        >
                            <Image
                                src={activeGame.src}
                                alt={activeGame.title}
                                fill
                                className="object-cover transition-transform duration-1000 group-hover:scale-[1.02]"
                                priority
                            />
                        </motion.div>
                    </AnimatePresence>

                    {/* Cinematic Dark Gradient Layers */}
                    <div className="absolute inset-0 bg-linear-to-tr from-[#080808]/95 via-[#080808]/60 to-transparent pointer-events-none z-10" />
                    <div className="absolute inset-0 bg-linear-to-t from-[#080808] via-transparent to-transparent pointer-events-none z-10" />

                    {/* Content Block */}
                    <div className="relative z-20 max-w-lg space-y-4">
                        {/* Genres */}
                        <div className="flex flex-wrap gap-2">
                            {activeGame.genre.map((g) => (
                                <span key={g} className="text-[6px] md:text-[9px] tracking-[0.15em] uppercase backdrop-blur-sm text-[#c4a97d] bg-[#7a6b4f]/10 border border-[#7a6b4f]/30 px-2 py-0.5">
                                    {g}
                                </span>
                            ))}
                        </div>

                        {/* Title Headings with AnimatePresence */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeGame.id}
                                initial={{ x: 40, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -40, opacity: 0 }}
                                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                className="space-y-1"
                            >
                                <motion.h3 className="text-white text-xl sm:text-2xl md:text-3xl font-medium tracking-wide uppercase leading-none">
                                    {activeGame.title}
                                </motion.h3>
                                <p className="text-[#c4a97d]/70 text-xs tracking-wider uppercase">
                                    {activeGame.subtitle}
                                </p>
                            </motion.div>
                        </AnimatePresence>

                        {/* Description */}
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={`desc-${activeGame.id}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4, delay: 0.1 }}
                                className="text-white/60 text-[10px] md:text-xs leading-relaxed line-clamp-3"
                            >
                                {activeGame.description}
                            </motion.p>
                        </AnimatePresence>

                        {/* CTA Operations Center */}
                        <div className="flex items-center gap-3 pt-2">
                            {/* <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex items-center gap-2 bg-[#7a6b4f] hover:bg-[#c4a97d] text-white/90 hover:text-[#080808] text-xs font-semibold tracking-widest uppercase px-6 h-11 transition-all duration-300 cursor-pointer"
                            >
                                Explore Now
                                <ArrowRight className="w-4 h-4" />
                            </motion.button> */}
                            <motion.button
                                onClick={()=>{}}
                                disabled = {false}
                                whileHover={{backgroundColor: '#c4a97d' , opacity : 0.9 }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ duration: 0.4, ease: 'easeInOut' }} // Handles the background transition smoothly
                                className="relative flex items-center gap-2 overflow-hidden group/shimmer py-2 px-4 md:py-3 md:px-6 bg-[#7a6b4f] border-none rounded-none text-white/90 text-[11px] font-semibold tracking-[0.22em] uppercase cursor-pointer"
                            >
                                Explor Now
                                <ArrowRight className='w-3 h-3 md:w-4 md:h-4'/>
                                
                                {/* Shimmer sweep */}
                                <span className="absolute inset-0 pointer-events-none bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/shimmer:translate-x-full transition-transform duration-550 ease-in-out" />
                                
                            </motion.button>

                            {/* Save Item Block */}
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-8 h-8 md:w-11 md:h-11 flex items-center justify-center border border-[#7a6b4f]/40 bg-[#080808]/40 backdrop-blur-sm text-white/70 hover:text-[#c4a97d] hover:border-[#c4a97d] transition-all duration-200 cursor-pointer"
                                aria-label="Bookmark"
                            >
                                <Bookmark className="w-3 h-3 md:w-4 md:h-4" />
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* 2. Right Column Side Cards Playlist Layout */}
                <div className="flex flex-col gap-2 justify-between h-full">
                    {RELEASED_GAMES.map((game, idx) => {
                        const isActive = idx === activeIndex;
                        return (
                            <div
                                key={game.id}
                                onClick={() => handleSelectGame(idx)}
                                className={`
                                    relative flex items-center gap-4 p-3 w-full h-28.75
                                    border cursor-pointer select-none transition-all duration-300
                                    ${isActive
                                        ? 'bg-[#7a6b4f]/12 border-[#c4a97d]/50 shadow-[inset_0_0_12px_rgba(196,169,125,0.08)]'
                                        : 'bg-[#080808] border-[#7a6b4f]/15 hover:bg-white/2 hover:border-[#7a6b4f]/40'
                                    }
                                `}
                            >
                                {/* Active Tracker Filling Line */}
                                {isActive && (
                                    <div className="absolute top-0 left-0 bottom-0 w-0.5 bg-[#c4a97d]/20 pointer-events-none">
                                        <div className="w-0.5 bg-[#c4a97d] h-full" 
                                            style={{
                                                animation: `progressLoader ${AUTOPLAY_DURATION}ms linear forwards`
                                            }}
                                        />
                                    </div>
                                )}

                                {/* Compact Preview Image Container */}
                                <div className="relative w-16 h-20 shrink-0 border border-[#7a6b4f]/20 overflow-hidden">
                                    <Image
                                        src={game.src}
                                        alt={game.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>

                                {/* Text Detail Segment */}
                                <div className="flex flex-col gap-1 overflow-hidden pr-2">
                                    <span className="text-[8px] font-semibold tracking-[0.2em] uppercase text-[#c4a97d]/50">
                                        {game.genre[0]}
                                    </span>
                                    <h4 className={`
                                        text-sm uppercase tracking-wide transition-colors line-clamp-2 leading-tight
                                        ${isActive ? 'text-[#c4a97d]' : 'text-white/80'}
                                    `}>
                                        {game.title}
                                    </h4>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}