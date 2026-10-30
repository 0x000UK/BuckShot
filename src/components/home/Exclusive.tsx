import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getGamesByTag } from "@/lib/queries";
import { GAME_TAGS } from "@/lib/constants/tags";
import type { TaggedGame } from "@/types/game";

export default function Exclusive({ games }: { games?: TaggedGame[] }) {
    if (games) {
        if (games.length === 0) return null;
        return <ExclusiveContent games={games} />;
    }

    return (
        <Suspense fallback={<ExclusiveSkeleton />}>
            <ExclusiveData />
        </Suspense>
    );
}

async function ExclusiveData() {
    const games = await getGamesByTag(GAME_TAGS.EXCLUSIVE, 3);
    if (!games || games.length === 0) return null;
    return <ExclusiveContent games={games} />;
}

function ExclusiveContent({ games }: { games: TaggedGame[] }) {
    return (
        <section className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#080808] py-24">
            <div className="absolute inset-0">
                <Image
                    src="https://wallpapercave.com/wp/wp13908216.jpg"
                    alt="Exclusive Games Background"
                    fill
                    sizes = "100vw"
                    className="object-cover object-center"
                    priority
                />
                <div className="absolute inset-0 bg-[#080808]/78" />
            </div>

            <div className="relative w-full max-w-screen-2xl mx-auto px-6 md:px-12 flex flex-col items-center">
                <div className="flex flex-col items-center text-center max-w-3xl mb-20">
                    <h2 className="font-jk text-4xl md:text-6xl font-medium leading-[1.05em] mb-6 text-[#f4efe4] tracking-tight">
                        Masterpieces you can&apos;t <br />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-[#c4a97d] to-[#7a6b4f]">
                            play anywhere else.
                        </span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 w-full mb-20">
                    {games.map((game) => {
                        const feature = game.tagFeatures.find((t)=> t.type === GAME_TAGS.EXCLUSIVE);
                        return (
                            <div key={game.id} className="transition-transform duration-300 hover:-translate-y-1">
                                <Link
                                    href={`/g/${game.id}/${game.slug}`}
                                    className="group relative block w-full aspect-video rounded-none overflow-hidden border border-[#7a6b4f]/20 bg-[#0c0a08] shadow-lg cursor-pointer"
                                >
                                    <Image
                                        src={feature?.image || game.cover}
                                        alt={game.title}
                                        fill
                                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                    />

                                    {/* Inner Shadow */}
                                    <div className="absolute inset-0 shadow-[0_0_0_1px_rgba(255,255,255,0.05)_inset] pointer-events-none z-10" />

                                    <div
                                        className="absolute inset-0 pointer-events-none z-10 bg-linear-to-t from-black/90 via-black/20 to-transparent opacity-20 group-hover:opacity-70 transition-opacity duration-500"
                                    />

                                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 z-1 flex flex-col justify-end">
                                        <h3 className="font-jk text-lg font-medium text-[#f4efe4] group-hover:text-[#c4a97d] transition-colors duration-300">
                                            {game.title}
                                        </h3>
                                    </div>
                                </Link>
                            </div>
                        );
                    })}
                </div>

                <div>
                    <Link
                        href="/t/exclusive"
                        className="group flex items-center gap-3 px-8 py-4 rounded-none bg-[#c4a97d]/10 hover:bg-[#c4a97d]/20 border border-[#c4a97d]/30 hover:border-[#c4a97d] transition-all duration-300"
                    >
                        <span className="text-[#c4a97d] font-jost uppercase tracking-widest text-sm font-medium">
                            Browse All Exclusives
                        </span>
                        <ArrowRight className="w-4 h-4 text-[#c4a97d] transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>
        </section>
    );
}

export function ExclusiveSkeleton() {
    return (
        <section className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#080808] py-24">
            <div className="absolute inset-0 z-0 bg-[#0c0a08]" />
            <div className="absolute inset-0 bg-[#080808]/85 z-0" />

            <div className="relative z-10 w-full max-w-screen-2xl mx-auto px-6 md:px-12 flex flex-col items-center">
                <div className="flex flex-col items-center text-center w-full max-w-3xl mb-20 space-y-4">
                    <div className="h-12 md:h-16 w-3/4 max-w-md bg-white/10 rounded-none animate-pulse" />
                    <div className="h-12 md:h-16 w-1/2 max-w-xs bg-white/10 rounded-none animate-pulse" />
                    <div className="pt-2 h-5 w-56 bg-white/5 rounded-none animate-pulse" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-[90%] mb-20">
                    {[1, 2, 3].map((id) => (
                        <div key={id} className="flex flex-col">
                            <div className="relative w-full aspect-video rounded-none border border-white/5 bg-white/5 mb-6 animate-pulse" />

                            <div className="flex flex-col px-2 space-y-3">
                                <div className="h-7 w-2/3 bg-white/10 rounded-none animate-pulse" />
                                <div className="space-y-2 pt-1">
                                    <div className="h-4 w-full bg-white/5 rounded-none animate-pulse" />
                                    <div className="h-4 w-full bg-white/5 rounded-none animate-pulse" />
                                    <div className="h-4 w-4/5 bg-white/5 rounded-none animate-pulse" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="w-64 h-14 bg-white/5 border border-white/10 rounded-none animate-pulse" />
            </div>
        </section>
    );
}
