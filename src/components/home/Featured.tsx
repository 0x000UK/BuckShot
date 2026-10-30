import { Suspense } from "react";
import { getGamesByTag } from "@/lib/queries";
import { GAME_TAGS } from "@/lib/constants/tags";
import type { TaggedGame } from "@/types/game";
import { ChevronLeft } from "lucide-react";
import FeaturedSpotlight from "./FeaturedClient";

export default function Featured({ games }: { games?: TaggedGame[] }) {
    if (games) {
        if (games.length === 0) return null;
        return <FeaturedSpotlight games={games} />;
    }

    return (
        <Suspense fallback={<FeaturedSpotlightSkeleton />}>
            <FeaturedData />
        </Suspense>
    );
}

async function FeaturedData() {
    const gamesData = await getGamesByTag(GAME_TAGS.FEATURED);
    if (!gamesData || gamesData.length === 0) return null;
    return <FeaturedSpotlight games={gamesData} />;
}

export function FeaturedSpotlightSkeleton() {
    return (
        <section className="relative w-full overflow-hidden pt-12 pb-18 sm:pt-16 sm:pb-24 font-sans text-white bg-[#0b0908]">
             <div className="absolute inset-0 bg-radial from-[#7a6b4f]/10 via-transparent to-[#080808] pointer-events-none" />

             <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 mb-6 sm:mb-10 max-w-7xl mx-auto">
                    <div className="w-56 sm:w-96 h-10 sm:h-14 bg-white/10 rounded-none animate-pulse mb-3 sm:mb-4" />
                    <div className="w-64 sm:w-md h-4 sm:h-5 bg-white/5 rounded-none animate-pulse" />
             </div>

             <div className="relative z-20 w-full flex justify-center items-center py-4 sm:py-6">
                  <div
                       className="absolute left-2 sm:left-4 md:left-8 lg:left-12 z-30 w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 flex items-center justify-center rounded-none shadow-xl bg-white/5 animate-pulse"
                  >
                       <ChevronLeft className="w-5 h-5 text-white/20" />
                  </div>

                  <div className="w-full max-w-7xl mx-auto overflow-visible relative h-[380px] sm:h-[420px] md:h-[460px]">
                       <div className="flex items-center justify-center gap-4 sm:gap-6 h-full px-4">
                            {/* Central large active card skeleton */}
                            <div className="relative shrink-0 w-full max-w-[800px] h-full rounded-none overflow-hidden shadow-2xl bg-[#110e0b] border border-[#7a6b4f]/20">
                                <div className="absolute top-6 left-6 sm:top-8 sm:left-8 z-10">
                                    <div className="w-20 sm:w-24 h-5 sm:h-6 bg-white/10 rounded-none animate-pulse" />
                                </div>
                                
                                <div className="relative z-10 w-full md:w-3/5 h-full p-6 sm:p-8 md:p-10 flex flex-col justify-end md:justify-center text-white">
                                    <div className="mb-2 sm:mb-4 h-6 invisible" />
                                    <div className="space-y-2 sm:space-y-3 mb-4">
                                        <div className="w-full h-8 sm:h-10 bg-white/10 rounded-none animate-pulse" />
                                        <div className="w-2/3 h-8 sm:h-10 bg-white/10 rounded-none animate-pulse" />
                                    </div>
                                    <div className="space-y-1.5 mb-6">
                                        <div className="w-full h-3 bg-white/5 rounded-none animate-pulse" />
                                        <div className="w-4/5 h-3 bg-white/5 rounded-none animate-pulse" />
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-32 h-10 bg-white/10 rounded-none animate-pulse" />
                                        <div className="w-24 h-10 bg-white/5 rounded-none animate-pulse" />
                                    </div>
                                </div>
                            </div>
                       </div>
                  </div>
             </div>
        </section>
    );
}
