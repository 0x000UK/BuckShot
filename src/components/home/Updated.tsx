import { Suspense } from "react";
import Link from "next/link";
import { getGamesByTag } from "@/lib/queries";
import { GAME_TAGS } from "@/lib/constants/tags";
import { BRAND, BRAND_GOLD, BRAND_LIGHT } from "@/lib/utils";
import type { TaggedGame } from "@/types/game";
import Section, { SectionSkeleton } from "./Section";

export default function Updated({ games }: { games?: TaggedGame[] }) {
    if (games) {
        const displayedGames = games.slice(0, 6);
        if (displayedGames.length === 0) return null;
        return <UpdatedContent games={displayedGames} />;
    }

    return (
        <Suspense fallback={<UpdatedSkeleton />}>
            <UpdatedData />
        </Suspense>
    );
}

async function UpdatedData() {
    const gamesData = await getGamesByTag(GAME_TAGS.RECENTLY_UPDATED);
    if (!gamesData || gamesData.length === 0) return null;

    const displayedGames = gamesData.slice(0, 6);
    if (displayedGames.length === 0) return null;

    return <UpdatedContent games={displayedGames} />;
}

function UpdatedContent({ games }: { games: TaggedGame[] }) {
    return (
        <Section
            id="updates"
            title="Latest Updates"
            eyebrow="Live Service & Patches"
            subtitle="Track major version leaps, mechanical overhauls, and newly issued content drops across your tracked library."
            exploreLink="/t/recently-updated"
            exploreLabel="Explore All Updates"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
                {games.map((item, index) => (
                    <UpdateCard key={item.id} item={item} index={index} />
                ))}
            </div>
        </Section>
    );
}

function UpdateCard({ item }: { item: TaggedGame; index: number }) {
    const patchVersion = item.score ? (item.score / 20).toFixed(1) : "1.4";

    return (
        <div className="transition-transform duration-200 hover:-translate-y-1">
            <Link
                href={`/g/${item.id}/${item.slug}`}
                className="group relative overflow-hidden flex items-center gap-5 p-4 rounded-none block transition-colors duration-300"
                style={{
                    border: `1px solid ${BRAND}33`,
                    background: "linear-gradient(180deg, #110e0b 0%, #0b0908 100%)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                }}
            >
                {/* Hover Outline */}
                <div className="absolute inset-0 border border-transparent group-hover:border-[#c4a97d]/40 transition-colors duration-300 rounded-none pointer-events-none" />

                {/* Left Gold Accent Indicator Line */}
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-transparent group-hover:bg-[#d9c28a] transition-colors duration-300" />

                {/* Thumbnail Image block */}
                <div
                    className="relative w-16 md:w-20 h-20 md:h-24 shrink-0 overflow-hidden rounded-none border border-white/5"
                    style={{ borderColor: `${BRAND}44` }}
                >
                    <div
                        className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
                        style={{
                            backgroundImage: `url('${item.cover}')`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }}
                    />
                    <div className="absolute inset-0 grain opacity-35" />
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background:
                                "linear-gradient(180deg, transparent 0%, rgba(11,9,8,0.12) 40%, rgba(11,9,8,0.85) 100%)",
                        }}
                    />
                </div>

                {/* Metadata & Title */}
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                        {item.genres?.[0] && (
                            <span
                                className="font-mono text-[9px] tracking-[0.25em] uppercase"
                                style={{ color: BRAND_GOLD }}
                            >
                                {item.genres[0]}
                            </span>
                        )}
                        <span className="w-1 h-1 bg-white/20 rounded-none" />
                        <span
                            className="font-mono text-[9px] tracking-[0.2em] uppercase px-1.5 py-0.5 border border-[#7a6b4f]/40 bg-[#7a6b4f]/10"
                            style={{ color: BRAND_LIGHT }}
                        >
                            v{patchVersion} Patch
                        </span>
                    </div>

                    <h4 className="font-jk text-base md:text-lg text-[#f4efe4] group-hover:text-white transition-colors truncate">
                        {item.title}
                    </h4>

                    {item.subtitle && (
                        <p className="font-jost text-xs text-white/50 mt-1 line-clamp-1">
                            {item.subtitle}
                        </p>
                    )}
                </div>
            </Link>
        </div>
    );
}

export function UpdatedSkeleton() {
    return (
        <SectionSkeleton hasEyebrow hasSubtitle hasButton>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                        key={i}
                        className="flex items-center gap-5 p-4 rounded-none border border-white/5 bg-[#110e0b] animate-pulse"
                    >
                        <div className="w-16 md:w-20 h-20 md:h-24 shrink-0 bg-white/10 rounded-none" />

                        <div className="min-w-0 flex-1 space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-16 bg-white/10 rounded-none" />
                                <div className="h-3 w-20 bg-white/5 rounded-none" />
                            </div>
                            <div className="h-5 w-3/4 bg-white/10 rounded-none" />
                            <div className="h-3 w-1/2 bg-white/5 rounded-none" />
                        </div>
                    </div>
                ))}
            </div>
        </SectionSkeleton>
    );
}
