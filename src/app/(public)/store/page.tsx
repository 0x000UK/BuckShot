import { GameCardSkeleton } from '@/components/GameCard';
import Collection, { type ActiveFilters } from '@/components/store/Collection';
import { getAllGamesMeta, getAllGenre, getStoreFilterOptions } from '@/lib/queries';
import mongoose from 'mongoose';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import z from 'zod';

const storeParamsSchema = z.object({
    // Validate sorting parameters
    sort: z.enum(['relevancy','releaseDate','title']).catch('relevancy'),
    ord: z.enum(['asc', 'desc', 'any']).catch('any'),
    
    // Enforce limits on pagination to prevent memory overflow DoS attacks
    count: z.coerce.number().int().min(1).max(20).catch(20),
    start: z.coerce.number().int().min(0).catch(0),
    
    // Safely parse comma-separated strings into string arrays
    genres: z.string().optional().transform(val => val ? val.split(',') : []).catch([]),
    publisher: z.string().optional().transform(val => val ? val.split(',') : []).catch([]),
    platforms: z.string().optional().transform(val => val ? val.split(',') : []).catch([]),
    rating: z.string().optional().transform(val => val ? val.split(',') : []).catch([]),
});

interface StorePageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function StoreRoot({ searchParams }: StorePageProps) {

    const params = await searchParams
    const validatedParams = storeParamsSchema.parse(params);

    const { sort, ord, count, start, ...activeFilters } = validatedParams;

    const dbFilter: Record<string, unknown> = { status: "published" };

    const [genres, { publishers: distinctPublishers, platforms: distinctPlatforms }] = await Promise.all([
        getAllGenre(),
        getStoreFilterOptions(),
    ]);

    if (activeFilters.genres.length > 0) {
        const genreIds = activeFilters.genres
            .map((g) =>
                genres?.find(
                    (item) =>
                        item.name.toLowerCase() === g.toLowerCase() ||
                        item.slug.toLowerCase() === g.toLowerCase() ||
                        item.id === g
                )?.id
            )
            .filter((id): id is string => Boolean(id));

        if (genreIds.length > 0) {
            dbFilter['metadata.genres'] = {
                $in: genreIds.map((id) => new mongoose.Types.ObjectId(id)),
            };
        }
    }

    if (activeFilters.publisher.length > 0) {
        dbFilter['metadata.publisher'] = {
            $in: activeFilters.publisher.map((p) => new RegExp(`^${p.trim()}$`, 'i')),
        };
    }

    if (activeFilters.platforms.length > 0) {
        dbFilter['metadata.platforms'] = {
            $in: activeFilters.platforms.map((p) => new RegExp(`^${p.trim()}$`, 'i')),
        };
    }

    if (activeFilters.rating.length > 0) {
        const numericRatings = activeFilters.rating.map(Number).filter((n) => !isNaN(n));
        if (numericRatings.length > 0) {
            const minScore = Math.min(...numericRatings) <= 10
                ? Math.min(...numericRatings) * 10
                : Math.min(...numericRatings);
            dbFilter['rating.score'] = { $gte: minScore };
        }
    }

    const data = await getAllGamesMeta({ sort, ord, count, start, filter: dbFilter });
    
    if (!data.games || !genres) return notFound();

    const filterOptions = {
        genres: (genres || []).map((g) => ({ value: g.name, label: g.name })),
        publishers: Array.from(
            new Set((distinctPublishers as string[]).map((p) => p.trim()).filter(Boolean))
        )
            .sort()
            .map((p) => ({ value: p, label: p })),
        platforms: (distinctPlatforms as string[])
            .filter(Boolean)
            .sort()
            .map((p) => ({ value: p, label: p })),
    };

    return (
        <div className='w-full px-4 sm:px-6 py-4'> 
            <Suspense fallback = {<CollectionSkeleton/>}>
                <Collection
                    games={data.games}
                    totalCount={data.totalCount}
                    currentSort={sort}
                    currentOrd={ord}
                    currentCount={count || 20}
                    currentStart={start || 0}
                    filterOptions={filterOptions}
                    activeFilters={activeFilters}
                />
            </Suspense>
        </div>
    );
}

export function CollectionSkeleton() {
    return (
        <div className='mx-auto overflow-hidden my-6 sm:my-10 px-0 sm:px-2 md:px-6 lg:px-8'>
            {/* Header Skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="h-5 w-40 bg-white/5 rounded-none animate-pulse" />
                <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-3">
                    <div className="h-9 w-full sm:w-34 bg-white/5 rounded-none animate-pulse" />
                    <div className="h-9 w-full sm:w-30 bg-white/5 rounded-none animate-pulse" />
                </div>
            </div>
            
            {/* Grid of Card Skeletons */}
            <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6'>
                {/* Render 10 skeletons to match your page limit */}
                {[...Array(10)].map((_, id) => (
                    <GameCardSkeleton key={id} className="w-full" />
                ))}
            </div>
            
            {/* Pagination Skeleton */}
            <div className="mt-10 flex justify-center">
                <div className="h-10 w-64 bg-white/5 rounded-none animate-pulse" />
            </div>
        </div>
    );
}
