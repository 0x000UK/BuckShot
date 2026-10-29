import { TagSubMenuView } from "@/components/admin/TagSubMenu";
import { getAdminGamesByTag, getAllGamesForSelect } from "@/lib/queries";
import { ADMIN_FEATURED_TAGS, resolveTagSlug, type GameTag } from "@/lib/constants/tags";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const resolvedTag = resolveTagSlug(slug);

    if (!resolvedTag || !ADMIN_FEATURED_TAGS.includes(resolvedTag)) {
        return notFound();
    }

    const [games, allGames] = await Promise.all([
        getAdminGamesByTag(resolvedTag),
        getAllGamesForSelect(),
    ]);

    return (
        <Suspense fallback={<TagSubMenuLoading />}>
            <TagSubMenuView tag={resolvedTag} games={games} allGames={allGames} />
        </Suspense>
    );
}

export function TagSubMenuLoading() {
    return (
        <div className="p-6 md:p-8 flex flex-col gap-8 w-full animate-pulse">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between border-b border-[#7a6b4f]/20 pb-6">
                <div className="flex flex-col gap-2">
                    <div className="h-3 w-24 bg-[#7a6b4f]/20 rounded-xs" />
                    <div className="h-8 w-48 bg-[#7a6b4f]/30 rounded-xs" />
                </div>
                <div className="h-9 w-32 bg-[#7a6b4f]/20 rounded-xs" />
            </div>

            {/* Horizontal Scroll Cards Skeleton */}
            <div className="flex flex-col gap-3">
                <div className="h-4 w-36 bg-[#7a6b4f]/20 rounded-xs" />
                <div className="flex gap-4 overflow-x-hidden pb-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="shrink-0 w-[300px] aspect-video bg-[#7a6b4f]/10 border border-[#7a6b4f]/20 rounded-xs"
                        />
                    ))}
                </div>
            </div>

            {/* Main Content Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-48 bg-[#7a6b4f]/10 border border-[#7a6b4f]/20 rounded-xs" />
                ))}
            </div>
        </div>
    );
}