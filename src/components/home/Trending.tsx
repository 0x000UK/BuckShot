import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { getGamesByTag } from "@/lib/queries";
import { GAME_TAGS } from "@/lib/constants/tags";
import { BRAND, BRAND_GOLD } from "@/lib/utils";
import Section, { SectionSkeleton } from "./Section";

export default function Trending() {
    return (
        <Suspense fallback={<TrendingSkeleton />}>
            <TrendingData />
        </Suspense>
    );
}

async function TrendingData() {
    const gamesData = await getGamesByTag(GAME_TAGS.TRENDING);
    if (!gamesData || gamesData.length === 0) return null;

    const games = gamesData.slice(0, 6);
    if (games.length === 0) return null;

    return (
        <Section
            id="trending"
            title="Trending Now"
            eyebrow="Community Charts"
            subtitle="The most played, highly active titles across the community right now."
            exploreLink="/t/trending"
            exploreLabel="Explore All"
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                {games.map((game, i) => (
                    <div key={game.id} className="transition-transform duration-200 hover:-translate-y-1">
                        <Link
                            href={`/g/${game.id}/${game.slug}`}
                            className="group relative flex items-center p-4 rounded-none transition-colors duration-300 h-[140px] block"
                            style={{
                                background: "linear-gradient(90deg, rgba(17,14,11,0.6) 0%, rgba(11,9,8,0) 100%)",
                                border: `1px solid ${BRAND}22`,
                            }}
                        >
                            {/* Hover Outline */}
                            <div className="absolute inset-0 border border-transparent group-hover:border-[#c4a97d]/40 transition-colors duration-300 rounded-none pointer-events-none" />

                            {/* Rank Number */}
                            <div className="w-16 md:w-20 shrink-0 flex justify-center items-center">
                                <span className="font-jost text-3xl md:text-4xl font-light text-white/20 group-hover:text-[#c4a97d] transition-colors duration-300">
                                    {i + 1}
                                </span>
                            </div>

                            {/* Thumbnail */}
                            <div className="relative w-20 h-28 md:w-24 shrink-0 rounded-none overflow-hidden border border-white/5">
                                <Image
                                    src={game.cover}
                                    alt={game.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            </div>

                            {/* Info */}
                            <div className="ml-6 flex flex-col justify-center pr-4 flex-1 min-w-0">
                                <span
                                    className="font-mono text-[10px] tracking-[0.2em] uppercase mb-1 truncate"
                                    style={{ color: BRAND_GOLD }}
                                >
                                    {game.genres?.[0]}
                                </span>
                                <h4 className="font-jk text-lg md:text-xl text-[#f4efe4] group-hover:text-white transition-colors line-clamp-2">
                                    {game.title}
                                </h4>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </Section>
    );
}

export function TrendingSkeleton() {
    return (
        <SectionSkeleton hasEyebrow hasSubtitle hasButton>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="relative flex items-center p-4 rounded-none h-[140px] bg-white/[0.01] border border-white/5 animate-pulse"
                    >
                        {/* Rank Number Placeholder */}
                        <div className="w-16 md:w-20 shrink-0 flex justify-center items-center">
                            <div className="h-8 w-8 bg-white/5 rounded-none" />
                        </div>

                        {/* Thumbnail Placeholder */}
                        <div className="relative w-20 h-28 md:w-24 shrink-0 rounded-none bg-white/5 border border-white/5" />

                        {/* Info Placeholders */}
                        <div className="ml-6 flex flex-col justify-center flex-1 space-y-3 pr-4">
                            <div className="h-3 w-16 bg-white/10 rounded-none" />
                            <div className="space-y-2 w-full">
                                <div className="h-6 w-3/4 bg-white/5 rounded-none" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </SectionSkeleton>
    );
}
