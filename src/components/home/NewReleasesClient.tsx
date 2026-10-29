"use client";

import Image from 'next/image';
import { useState, useEffect, useCallback, useMemo } from "react";
import { BRAND, BRAND_GOLD, BRAND_LIGHT, EASE, GAME_TAGS } from "@/lib/utils";
import type { TaggedGame } from "@/types/game";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import Section from "./Section";

const AUTO_INTERVAL = 4500;

export default function NewReleasesClient({ games }: { games: TaggedGame[] }) {
    const [activeIndex, setActiveIndex] = useState<number>(0);
    const [paused, setPaused] = useState(false);

    const displayed = games && games.length > 0 ? (games[activeIndex] || games[0]) : undefined;

    const advance = useCallback(() => {
        if (!games || games.length === 0) return;
        setActiveIndex((prev) => (prev + 1) % Math.min(games.length, 4));
    }, [games]);

    // Auto-advance timer
    useEffect(() => {
        if (paused || !displayed) return;
        const t = setTimeout(advance, AUTO_INTERVAL);
        return () => clearTimeout(t);
    }, [activeIndex, paused, advance, displayed]);

    if (!games || games.length === 0 || !displayed) return null;

    const imageUrl = useMemo(() => {
        const featureTag = displayed.tagFeatures?.find(t => t.type === GAME_TAGS.NEW_RELEASE);
        return featureTag?.image || displayed.cover;
    }, [displayed]);

    return (
        <AnimatePresence>
            <Section
                id="new-releases"
                title="New Releases"
                eyebrow="Catalog Additions"
                subtitle="Fresh builds, day-one launches, and the latest additions to the catalog."
                exploreLink="/t/new-release"
                exploreLabel="View All Releases"
            >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                    {/* Spotlight Feature ─── */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: EASE }}
                        className="lg:col-span-7 flex flex-col relative overflow-hidden rounded-none"
                        style={{
                            border: `1px solid ${BRAND}44`,
                            background: "linear-gradient(180deg, #110e0b 0%, #0b0908 100%)",
                        }}
                    >
                        <div className="relative h-80 md:h-90 overflow-hidden bg-black">
                            <AnimatePresence mode="sync">
                            <motion.div
                                key={displayed.id}
                                className="absolute inset-0 overflow-hidden"
                                initial={{ opacity: 0, scale: 1.05 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.8, ease: EASE }}
                            >
                                <Image
                                    src={imageUrl}
                                    alt="Game background"
                                    fill
                                    sizes="50vw"
                                    className="object-cover object-center"
                                />
                            </motion.div>
                        </AnimatePresence>

                            <div
                                className="absolute inset-0 pointer-events-none"
                                style={{
                                    background:
                                        "linear-gradient(180deg, rgba(11,9,8,0.3) 0%, transparent 40%, rgba(11,9,8,0.95) 100%)",
                                }}
                            />
                            <div
                                className="absolute inset-0 pointer-events-none"
                                style={{
                                    background:
                                        "radial-gradient(ellipse at center, transparent 40%, rgba(11,9,8,0.6) 100%)",
                                }}
                            />
                            <div className="absolute inset-0 pointer-events-none grain opacity-40" />

                            <div className="absolute bottom-0 inset-x-0 px-4 z-1">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={`title-${displayed.id}`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.45, ease: EASE }}
                                    >
                                        {displayed.subtitle && (
                                            <p className="font-jost text-md mb-1.5" style={{ color: BRAND_LIGHT }}>
                                                {displayed.subtitle}
                                            </p>
                                        )}
                                        <h3
                                            className="font-jk leading-[1.1] tracking-tight"
                                            style={{
                                                fontSize: "clamp(22px, 4vw, 36px)",
                                                color: "#f4efe4",
                                                textShadow: "0 4px 20px rgba(0,0,0,0.8)",
                                            }}
                                        >
                                            {displayed.title}
                                        </h3>
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>

                        <div className="relative p-4 md:p-6 flex-1 flex flex-col justify-between z-1">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={`info-${displayed.id}`}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.4, ease: EASE }}
                                >
                                    <div
                                        className="flex items-center justify-between flex-wrap mb-2"
                                        style={{ borderBottom: `1px solid ${BRAND}33` }}
                                    />

                                    {displayed.synopsis && (
                                        <p
                                            className="text-[13px] leading-relaxed mb-6 max-w-2xl font-jost"
                                            style={{ color: "rgba(232, 226, 210, 0.75)" }}
                                        >
                                            {displayed.synopsis}
                                        </p>
                                    )}
                                </motion.div>
                            </AnimatePresence>

                            {/*TODO change the design of this CTA button */}
                            <div className="flex items-center gap-4 flex-wrap mt-auto pt-4">
                                <Link
                                    href={`/g/${displayed.id}/${displayed.slug}`}
                                    className="inline-flex items-center gap-2 px-6 py-3.5 text-[10px] font-bold tracking-[0.25em] uppercase transition-colors cursor-pointer rounded-none hover:bg-[#d9c28a] hover:text-[#0b0908]"
                                    style={{ background: BRAND, color: "#f4efe4", border: `1px solid ${BRAND_GOLD}` }}
                                >
                                    Explore Title
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                        <path d="M3 2L9 6L3 10V2Z" fill="currentColor" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
                        className="lg:col-span-5 h-full flex flex-col rounded-none"
                        style={{
                            border: `1px solid ${BRAND}33`,
                            background: "rgba(11,9,8,0.4)",
                            backdropFilter: "blur(10px)",
                        }}
                    >
                        <ul className="flex-1 flex flex-col divide-y" style={{ borderColor: `${BRAND}22` }}>
                            {games.slice(0, 5).map((r, i) => {
                                const isActive = activeIndex === i;
                                return (
                                    <motion.li
                                        key={r.id || i}
                                        initial={{ opacity: 0, x: 16 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, ease: EASE, delay: 0.1 + i * 0.06 }}
                                        className="group relative cursor-pointer flex-1 flex flex-col justify-center max-h-28"
                                        onClick={() => {
                                            setActiveIndex(i);
                                            setPaused(false);
                                        }}
                                        onMouseEnter={() => setPaused(true)}
                                        onMouseLeave={() => setPaused(false)}
                                    >
                                        {/* Active row gradient highlight */}
                                        <motion.div
                                            className="absolute inset-0 pointer-events-none"
                                            animate={{
                                                background: isActive
                                                    ? `linear-gradient(90deg, #7a6b4f22 0%, #7a6b4f00 100%)`
                                                    : `linear-gradient(90deg, ${BRAND}00 0%, ${BRAND}00 100%)`,
                                            }}
                                            transition={{ duration: 0.4 }}
                                        />

                                        <div className="relative px-4 md:px-6 lg:px-8 py-4 flex items-center gap-5">
                                            {/* Mini Image */}
                                            <div
                                                className="relative h-18 w-14 shrink-0 overflow-hidden rounded-none md:h-20 md:w-16 transition-colors duration-300"
                                                style={{ borderColor: isActive ? BRAND_GOLD : `${BRAND}44`, borderStyle: 'solid', borderWidth: '1px' }}
                                            >
                                                <div className="absolute inset-0 overflow-hidden group">
                                                    <Image
                                                        src={r.cover}
                                                        alt="Thumbnail cover"
                                                        fill
                                                        sizes="(max-width: 768px) 56px, 64px"
                                                        className="object-cover object-center transition-transform duration-700 ease-out will-change-transform group-hover:scale-110"
                                                    />
                                                </div>

                                                {/* Grain Overlay */}
                                                <div className="absolute inset-0 grain opacity-35 pointer-events-none" />

                                                {/* Gradient Overlay */}
                                                <div className="absolute inset-0 bg-linear-to-b from-transparent via-[rgba(11,9,8,0.12)] via-40% to-[rgba(11,9,8,0.8)] to-100% pointer-events-none" />
                                            </div>

                                            {/* Title and meta */}
                                            <div className="min-w-0 flex-1">
                                                <h4
                                                    className="font-jk text-[17px] leading-tight truncate transition-colors duration-300"
                                                    style={{ color: isActive ? BRAND_GOLD : "#e8e2d2" }}
                                                >
                                                    {r.title}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span
                                                        className="font-mono text-[9px] tracking-[0.2em] uppercase truncate transition-colors duration-300"
                                                        style={{ color: isActive ? `${BRAND_LIGHT}aa` : `${BRAND_LIGHT}55` }}
                                                    >
                                                        {r.publisher}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <motion.span
                                            className="absolute left-0 top-0 bottom-0 w-0.75"
                                            animate={{ scaleY: isActive ? 1 : 0, opacity: isActive ? 1 : 0 }}
                                            style={{ background: BRAND_GOLD, originY: 0 }}
                                            transition={{ duration: 0.35, ease: EASE }}
                                        />
                                    </motion.li>
                                );
                            })}
                        </ul>
                    </motion.div>
                </div>
            </Section>
        </AnimatePresence>
    );
}
