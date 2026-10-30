import { Suspense } from "react";
import { getGamesByTag } from "@/lib/queries";
import { GAME_TAGS } from "@/lib/constants/tags";
import type { TaggedGame } from "@/types/game";
import NewReleasesClient from "./NewReleasesClient";
import { SectionSkeleton } from "./Section";

export default function NewReleases({ games }: { games?: TaggedGame[] }) {
    if (games) {
        if (games.length === 0) return null;
        return <NewReleasesClient games={games} />;
    }

    return (
        <Suspense fallback={<NewReleasesSkeleton />}>
            <NewReleasesData />
        </Suspense>
    );
}

async function NewReleasesData() {
    const gamesData = await getGamesByTag(GAME_TAGS.NEW_RELEASE);
    if (!gamesData || gamesData.length === 0) return null;
    return <NewReleasesClient games={gamesData} />;
}

export function NewReleasesSkeleton() {
    return (
        <SectionSkeleton hasEyebrow hasSubtitle hasButton>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                <div className="lg:col-span-7 flex flex-col relative overflow-hidden rounded-none border border-white/5 bg-[#0b0908]">
                    <div className="relative h-80 md:h-90 bg-white/5 animate-pulse">
                        <div className="absolute top-6 left-6 z-10">
                            <div className="w-24 h-6 bg-white/10 rounded-none" />
                        </div>

                        <div className="absolute bottom-0 inset-x-0 p-6 md:p-8 z-10">
                            <div className="w-32 h-4 bg-white/10 rounded-none mb-3" />
                            <div className="w-2/3 h-10 md:h-12 bg-white/10 rounded-none" />
                        </div>
                    </div>

                    <div className="relative p-6 md:p-8 flex-1 flex flex-col justify-between z-20">
                        <div className="flex items-center gap-4 pb-5 mb-5 border-b border-white/5">
                            <div className="w-12 h-4 bg-white/10 rounded-none animate-pulse" />
                            <div className="w-px h-3.5 bg-white/10" />
                            <div className="w-24 h-4 bg-white/10 rounded-none animate-pulse" />
                        </div>

                        <div className="space-y-3 mb-8 max-w-2xl">
                            <div className="w-full h-4 bg-white/10 rounded-none animate-pulse" />
                            <div className="w-5/6 h-4 bg-white/10 rounded-none animate-pulse" />
                            <div className="w-4/6 h-4 bg-white/10 rounded-none animate-pulse" />
                        </div>

                        <div className="flex items-center gap-4 mt-auto pt-4">
                            <div className="w-40 h-12 bg-white/10 rounded-none animate-pulse" />
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-5 h-full flex flex-col rounded-none border border-white/5 bg-[#0b0908]/40 backdrop-blur-sm">
                    <ul className="flex-1 flex flex-col divide-y divide-white/5">
                        {[1, 2, 3, 4].map((i) => (
                            <li key={i} className="relative flex-1 flex flex-col justify-center min-h-25 px-5 md:px-6 py-4">
                                <div className="flex items-center gap-5">
                                    <div className="w-13 h-18 shrink-0 bg-white/10 rounded-none animate-pulse" />

                                    <div className="min-w-0 flex-1 space-y-2">
                                        <div className="w-3/4 h-5 bg-white/10 rounded-none animate-pulse" />
                                        <div className="w-1/3 h-3 bg-white/5 rounded-none animate-pulse" />
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <div className="p-4 border-t border-white/5 flex justify-center">
                        <div className="w-32 h-4 bg-white/10 rounded-none animate-pulse" />
                    </div>
                </div>
            </div>
        </SectionSkeleton>
    );
}
