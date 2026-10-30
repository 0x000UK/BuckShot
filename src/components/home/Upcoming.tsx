import { Suspense } from "react";
import { getComingSoonGames } from "@/lib/queries";
import type { TaggedGame } from "@/types/game";
import UpcomingReleases from "./UpcomingClient";
import { BRAND, BRAND_GOLD } from "@/lib/utils";
import { SectionSkeleton } from "./Section";

export default function Upcoming({ games }: { games?: TaggedGame[] }) {
    if (games) {
        if (games.length === 0) return null;
        return <UpcomingReleases games={games} />;
    }

    return (
        <Suspense fallback={<UpcomingSkeleton />}>
            <UpcomingData />
        </Suspense>
    );
}

async function UpcomingData() {
    const gamesData = await getComingSoonGames();
    if (!gamesData || gamesData.length === 0) return null;
    return <UpcomingReleases games={gamesData} />;
}

function ReleaseEntrySkeleton({ index }: { index: number }) {
    const flipped = index % 2 === 1;

    return (
        <div
            className="relative grid grid-cols-1 lg:grid-cols-12 gap-0"
            style={{
                border: `1px solid ${BRAND}33`,
                background: "linear-gradient(180deg, #110e0b 0%, #0b0908 100%)",
            }}
        >
            <div
                className={`relative lg:col-span-7 bg-white/5 animate-pulse ${
                    flipped ? "lg:order-2" : ""
                }`}
                style={{ minHeight: 320 }}
            >
                <div className="absolute inset-0 pointer-events-none grain opacity-10" />
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
                <div className="h-10 w-3/4 bg-white/10 rounded-none animate-pulse mb-3" />
                <div className="h-4 w-1/3 bg-white/5 rounded-none animate-pulse mb-1" />

                <div className="space-y-2.5 my-6 max-w-lg">
                    <div className="h-3.5 w-full bg-white/5 rounded-none animate-pulse" />
                    <div className="h-3.5 w-full bg-white/5 rounded-none animate-pulse" />
                    <div className="h-3.5 w-4/5 bg-white/5 rounded-none animate-pulse" />
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                    <div className="h-12 w-36 bg-white/10 rounded-none animate-pulse" />
                    <div className="h-12 w-28 bg-white/5 rounded-none animate-pulse" />
                </div>
            </div>
        </div>
    );
}

export function UpcomingSkeleton() {
    return (
        <SectionSkeleton hasEyebrow hasSubtitle hasButton>
            <div className="space-y-12">
                {[0, 1, 2].map((i) => (
                    <ReleaseEntrySkeleton key={i} index={i} />
                ))}
            </div>

            <div
                className="mt-16 p-8 md:p-12 text-center relative overflow-hidden"
                style={{
                    border: `1px solid ${BRAND_GOLD}33`,
                    background: "linear-gradient(180deg, #110e0b 0%, #080808 100%)",
                }}
            >
                <div className="w-48 h-3 bg-white/10 mx-auto rounded-none animate-pulse mb-3" />
                <div className="w-80 h-8 bg-white/10 mx-auto rounded-none animate-pulse mb-4" />
                <div className="w-96 max-w-full h-4 bg-white/5 mx-auto rounded-none animate-pulse mb-8" />

                <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                    <div className="h-12 flex-1 bg-white/5 rounded-none animate-pulse" />
                    <div className="h-12 w-32 bg-white/10 rounded-none animate-pulse" />
                </div>
            </div>
        </SectionSkeleton>
    );
}
