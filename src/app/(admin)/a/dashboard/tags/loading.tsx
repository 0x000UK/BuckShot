export default function TagsViewSkeleton() {
    const skeletonItems = Array.from({ length: 6 });

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-pulse">
            {skeletonItems.map((_, i) => (
                <div
                    key={i}
                    // Neutral background and border colors for the skeleton state
                    className="p-5 border flex flex-col gap-3 rounded-sm bg-neutral-50/50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800"
                >
                    {/* Header Row: Indicator and Label */}
                    <div className="flex items-center gap-2">
                        {/* Round dot skeleton */}
                        <div className="w-2 h-2 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                        {/* Label text skeleton */}
                        <div className="h-3 w-16 bg-neutral-300 dark:bg-neutral-700 rounded-sm" />
                    </div>

                    {/* Large Stat Count Skeleton */}
                    <div className="h-8 w-12 my-1 bg-neutral-300 dark:bg-neutral-700 rounded-sm" />

                    {/* Subtext Skeleton */}
                    <div className="h-3 w-20 bg-neutral-300 dark:bg-neutral-700 rounded-sm" />
                </div>
            ))}
        </div>
    );
}