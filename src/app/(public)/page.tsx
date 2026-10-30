import { Suspense } from "react";
import Hero from "@/components/home/Hero";
import GenresSection from "@/components/home/genreSection";
import NewReleases, { NewReleasesSkeleton } from "@/components/home/NewReleases";
import Updated, { UpdatedSkeleton } from "@/components/home/Updated";
import Trending, { TrendingSkeleton } from "@/components/home/Trending";
import Featured, { FeaturedSpotlightSkeleton } from "@/components/home/Featured";
import Exclusive, { ExclusiveSkeleton } from "@/components/home/Exclusive";
import Upcoming, { UpcomingSkeleton } from "@/components/home/Upcoming";
import { getGamesByTag, getComingSoonGames } from "@/lib/queries";
import { GAME_TAGS } from "@/lib/constants/tags";

export const revalidate = 60;

export default function HomePage() {
    return (
        <div className="relative bg-[#080808] text-white">
            <Hero />
            <Suspense fallback={<HomeFeedSkeleton />}>
                <HomeFeed />
            </Suspense>
        </div>
    );
}

async function HomeFeed() {
    // Parallelize hot queries with precise limits matching UI requirements
    const [newReleases, updated, trending, featured, exclusive, upcoming] = await Promise.all([
        getGamesByTag(GAME_TAGS.NEW_RELEASE, 5),
        getGamesByTag(GAME_TAGS.RECENTLY_UPDATED, 6),
        getGamesByTag(GAME_TAGS.TRENDING, 6),
        getGamesByTag(GAME_TAGS.FEATURED, 6),
        getGamesByTag(GAME_TAGS.EXCLUSIVE, 3),
        getComingSoonGames(4),
    ]);

    return (
        <>
            <NewReleases games={newReleases} />
            <Updated games={updated} />
            <Trending games={trending} />
            <Featured games={featured} />
            <Exclusive games={exclusive} />
            <GenresSection />
            <Upcoming games={upcoming} />
        </>
    );
}

function HomeFeedSkeleton() {
    return (
        <>
            <NewReleasesSkeleton />
            <UpdatedSkeleton />
            <TrendingSkeleton />
            <FeaturedSpotlightSkeleton />
            <ExclusiveSkeleton />
            <GenresSection />
            <UpcomingSkeleton />
        </>
    );
}
