"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { EASE } from "@/lib/utils";
import Section from "./Section";

const GENRES = [
    {
        id: "action",
        name: "Action",
        count: 1248,
        span: "col-span-4 sm:col-span-2 row-span-1",
        image: "/images/genres/action.png",
    },
    {
        id: "rpg",
        name: "RPG",
        count: 934,
        span: "col-span-4 sm:col-span-1 row-span-1",
        image: "/images/genres/rpg.jpg",
    },
    {
        id: "strategy",
        name: "Strategy",
        count: 612,
        span: "col-span-4 sm:col-span-1 row-span-1",
        image: "/images/genres/strategy.png",
    },
    {
        id: "shooter",
        name: "Shooter",
        count: 889,
        span: "col-span-4 sm:col-span-1 row-span-1",
        image: "/images/genres/shooter.jpg",
    },
    {
        id: "horror",
        name: "Horror",
        count: 421,
        span: "col-span-4 sm:col-span-2 row-span-1",
        image: "/images/genres/horror.jpg",
    },
    {
        id: "sports",
        name: "Sports",
        count: 378,
        span: "col-span-4 sm:col-span-1 row-span-2",
        image: "/images/genres/sports.jpg",
    },
    {
        id: "adventure",
        name: "Adventure",
        count: 756,
        span: "col-span-2 sm:col-span-2 row-span-1",
        image: "/images/genres/adventure.png",
    },
    {
        id: "racing",
        name: "Racing",
        count: 12,
        span: "col-span-2 sm:col-span-1 row-span-1",
        image: "/images/genres/racing.jpg",
    },
];

export default function GenresSection() {
    return (
        <AnimatePresence>
            <Section
                id="genres"
                title="Popular Genres"
                eyebrow="Curated Archives"
                subtitle="Explore catalog archives spanning high-octane action to immersive tactical simulations."
                exploreLink="/store"
                exploreLabel="Browse Categories"
            >
                {/* ── Bento grid ── */}
                <div className="grid grid-cols-4 auto-rows-[160px] gap-2.5">
                    {GENRES.map((genre, i) => (
                        <GenreCard key={genre.id} {...genre} delay={i * 0.06} />
                    ))}
                </div>
            </Section>
        </AnimatePresence>
    );
}

function GenreCard({
    id,
    name,
    count,
    image,
    span,
    delay = 0,
}: {
    id: string;
    name: string;
    count: number;
    image: string;
    span: string;
    delay: number;
}) {
    return (
        <motion.div
            className={span}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay, ease: EASE }}
        >
            <Link href={`/c/${id}`} className="block h-full no-underline">
                <div className="relative h-full overflow-hidden group cursor-pointer border border-[#7a6b4f]/20 bg-[#0a0a0a]">
                    {/* Background Image with slight zoom on hover */}
                    <div className="absolute inset-0 flex justify-end">
                        <Image
                            width={1000}
                            height={700}
                            src={image}
                            alt={name}
                            unoptimized
                            className="object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                        />
                    </div>

                    {/* Animated golden border on hover */}
                    <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-50 transition-opacity duration-300 border border-[#c4a97d] shadow-[0_0_20px_rgba(196,169,125,0.12),inset_0_0_20px_rgba(196,169,125,0.04)]" />

                    {/* Top accent sliver */}
                    <div className="absolute top-0 left-0 right-0 h-px pointer-events-none opacity-0 group-hover:opacity-90 transition-opacity duration-300 bg-linear-to-r from-transparent via-[#c4a97d] to-transparent" />

                    {/* Dark gradient wash from bottom */}
                    <div className="absolute inset-0 pointer-events-none bg-linear-to-tr from-black/90 to-transparent" />

                    {/* Accent color wash from bottom on hover */}
                    <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-linear-to-tr from-[#c4a97d]/15 to-transparent" />

                    {/* Content — bottom-left */}
                    <div className="absolute bottom-0 left-0 p-4">
                        <div className="font-jk uppercase text-[18px] tracking-[0.22em] text-white/70 leading-none mb-1 group-hover:text-white transition-colors duration-300">
                            {name}
                        </div>

                        <div className="font-jost text-[9px] font-normal tracking-[0.18em] uppercase text-[#c4a97d] opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                            {count.toLocaleString()} games
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
