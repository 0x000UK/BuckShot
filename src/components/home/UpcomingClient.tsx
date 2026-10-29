"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { BRAND, BRAND_GOLD, BRAND_LIGHT, EASE, GAME_TAGS } from "@/lib/utils";
import type { TaggedGame } from "@/types/game";
import Section from "./Section";

function ReleaseEntry({ item, index }: { item: TaggedGame; index: number }) {
    const flipped = index % 2 === 1;
    const [notified, setNotified] = useState(false);

    const imgUrl : string |null | undefined = item.tagFeatures.find((t)=> t.type === GAME_TAGS.COMING_SOON)?.image
    return (
        <motion.article
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: EASE }}
            className="relative grid grid-cols-1 lg:grid-cols-12 gap-0 group"
            style={{
                border: `1px solid ${BRAND}33`,
                background: "linear-gradient(180deg, #110e0b 0%, #0b0908 100%)",
            }}
        >
            {/* ─── Banner ─── */}
            <div
                className={`relative lg:col-span-7 ${flipped ? "lg:order-2" : ""}`}
                style={{ minHeight: 320 }}
            >
                <div className="absolute inset-0 overflow-hidden">
                    <div
                        className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
                        style={{
                            backgroundImage: `url('${imgUrl}')`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }}
                    />
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background:
                                "linear-gradient(180deg, rgba(11,9,8,0.25) 0%, transparent 30%, rgba(11,9,8,0.6) 100%)",
                        }}
                    />
                    <div
                        className={`absolute inset-y-0 ${
                            flipped ? "left-0" : "right-0"
                        } w-1/3 pointer-events-none hidden lg:block`}
                        style={{
                            background: flipped
                                ? "linear-gradient(90deg, rgba(11,9,8,0.95), transparent)"
                                : "linear-gradient(270deg, rgba(11,9,8,0.95), transparent)",
                        }}
                    />
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background:
                                "radial-gradient(ellipse at center, transparent 50%, rgba(11,9,8,0.55) 100%)",
                        }}
                    />
                    <div className="absolute inset-0 pointer-events-none grain" />
                </div>
            </div>

            <div
                className={`relative lg:col-span-5 p-8 md:p-10 flex flex-col justify-center ${
                    flipped ? "lg:order-1" : ""
                }`}
                style={{
                    borderLeft: flipped ? undefined : `1px solid ${BRAND}22`,
                    borderRight: flipped ? `1px solid ${BRAND}22` : undefined,
                }}
            >
                {/* Title */}
                <h3
                    className="font-jk leading-none tracking-tight mb-2"
                    style={{
                        fontSize: "clamp(26px, 3.2vw, 40px)",
                        color: "#f4efe4",
                        textShadow: "0 4px 30px rgba(0,0,0,0.5)",
                    }}
                >
                    {item.status === "published" ? (
                        <Link href={`/g/${item.id}/${item.slug}`} className="hover:text-[#d9c28a] transition-colors">
                            {item.title}
                        </Link>
                    ) : (
                        <span>{item.title}</span>
                    )}
                </h3>

                {/* Subtitle */}
                {item.subtitle && (
                    <p className="font-jost text-sm mb-1" style={{ color: BRAND_LIGHT }}>
                        {item.subtitle}
                    </p>
                )}

                {/* Blurb */}
                {item.synopsis && (
                    <p
                        className="text-[13px] leading-relaxed my-5 max-w-lg font-jost"
                        style={{ color: "rgba(232, 226, 210, 0.7)" }}
                    >
                        {item.synopsis}
                    </p>
                )}

                <div className="flex items-center justify-end pt-2">
                    <button
                        onClick={() => setNotified((v) => !v)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-[10px] tracking-[0.3em] uppercase transition-colors cursor-pointer rounded-none font-jost hover:border-[#c4a97d] hover:text-[#c4a97d] hover:bg-[#7a6b4f]/15"
                        style={{
                            border: `1px solid ${notified ? BRAND_GOLD : `${BRAND}66`}`,
                            color: notified ? BRAND_GOLD : BRAND_LIGHT,
                            background: notified ? `${BRAND}33` : "transparent",
                        }}
                    >
                        {notified ? "Reminder Set" : "Notify Me"}
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                            <path
                                d="M6 1v6M3 5l3 3 3-3M2 10h8"
                                stroke="currentColor"
                                strokeWidth="1"
                                strokeLinecap="square"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </motion.article>
    );
}

export default function UpcomingReleases({ games }: { games: TaggedGame[] }) {
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (email.trim()) {
            setSubscribed(true);
        }
    };

    if (!games || games.length === 0) return null;

    return (
        <AnimatePresence>
            <Section
                id="upcoming"
                title="Upcoming Releases"
                eyebrow="Coming Soon"
                subtitle="Highly anticipated blockbusters and indie gems arriving soon."
                exploreLink="/t/upcoming"
                exploreLabel="View All Upcoming"
            >
                {/* Entries */}
                <div className="flex flex-col gap-10">
                    {games.map((item, i) => (
                        <ReleaseEntry key={item.id} item={item} index={i} />
                    ))}
                </div>

                {/* Footer dispatch */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: EASE }}
                    className="mt-10 sm:mt-14 relative px-5 sm:px-8 py-6 sm:py-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 w-full"
                    style={{
                        border: `1px solid ${BRAND}44`,
                        background:
                            "linear-gradient(180deg, rgba(122,107,79,0.08) 0%, rgba(11,9,8,0) 100%)",
                    }}
                >
                    <div className="max-w-full">
                        <p
                            className="font-mono text-[10px] tracking-[0.35em] uppercase mb-2"
                            style={{ color: BRAND_GOLD }}
                        >
                            The Dispatch
                        </p>
                        <h4 className="font-jk text-xl sm:text-2xl tracking-tight text-[#f4efe4]">
                            A telegram for every premiere.
                        </h4>
                    </div>

                    {subscribed ? (
                        <div className="w-full sm:w-auto flex items-center justify-center gap-3 px-5 sm:px-6 py-3 border border-[#c4a97d]/40 bg-[#7a6b4f]/15 text-center">
                            <span className="font-jost text-xs tracking-widest uppercase text-[#c4a97d]">
                                Subscribed to Premiere Dispatches ✓
                            </span>
                        </div>
                    ) : (
                        <form
                            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-0 w-full md:w-auto max-w-full"
                            onSubmit={handleSubscribe}
                        >
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your.address@archive.co"
                                suppressHydrationWarning
                                className="w-full sm:w-72 md:w-80 font-jost text-xs sm:text-sm px-4 py-3 outline-none focus:border-[#d9c28a] transition-colors rounded-none flex-1 min-w-0"
                                style={{
                                    background: "rgba(11,9,8,0.7)",
                                    border: `1px solid ${BRAND}66`,
                                    color: "#f4efe4",
                                }}
                            />
                            <button
                                type="submit"
                                className="w-full sm:w-auto px-6 py-3 text-[10px] sm:text-[11px] font-semibold tracking-[0.25em] sm:tracking-[0.3em] uppercase transition-colors cursor-pointer rounded-none font-jost hover:bg-[#d9c28a] hover:text-[#0b0908] shrink-0 text-center"
                                style={{
                                    background: BRAND,
                                    color: "#f4efe4",
                                    border: `1px solid ${BRAND_GOLD}`,
                                }}
                            >
                                Subscribe
                            </button>
                        </form>
                    )}
                </motion.div>
            </Section>
        </AnimatePresence>
    );
}
