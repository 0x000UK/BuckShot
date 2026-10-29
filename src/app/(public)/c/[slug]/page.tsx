import { getAllGamesMeta, getAllGenre } from "@/lib/queries";
import Collection from "@/components/store/Collection";
import connectDB from "@/lib/mongodb";
import GameModel from "@/models/game.model";
import mongoose from "mongoose";
import { notFound } from "next/navigation";
import z from "zod";

const categoryParamsSchema = z.object({
    sort: z.enum(["relevancy", "releaseDate", "title"]).catch("relevancy"),
    ord: z.enum(["asc", "desc", "any"]).catch("any"),
    count: z.coerce.number().int().min(1).max(40).catch(40),
    start: z.coerce.number().int().min(0).catch(0),
    publisher: z.string().optional().transform((val) => (val ? val.split(",") : [])).catch([]),
    platforms: z.string().optional().transform((val) => (val ? val.split(",") : [])).catch([]),
    rating: z.string().optional().transform((val) => (val ? val.split(",") : [])).catch([]),
});

interface CategoryPageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
    const { slug } = await params;
    const rawSearchParams = await searchParams;
    const validatedParams = categoryParamsSchema.parse(rawSearchParams);
    const { sort, ord, count, start, publisher, platforms, rating } = validatedParams;

    await connectDB();
    const [genres, distinctPublishers, distinctPlatforms] = await Promise.all([
        getAllGenre(),
        GameModel.distinct("metadata.publisher", { status: "published" }),
        GameModel.distinct("metadata.platforms", { status: "published" }),
    ]);

    const matchedGenre = genres?.find(
        (g) => g.slug.toLowerCase() === slug.toLowerCase() || g.name.toLowerCase() === slug.toLowerCase()
    );

    if (!matchedGenre) {
        return notFound();
    }

    const dbFilter: Record<string, unknown> = {
        status: "published",
        "metadata.genres": new mongoose.Types.ObjectId(matchedGenre.id),
    };

    if (publisher.length > 0) {
        dbFilter["metadata.publisher"] = {
            $in: publisher.map((p) => new RegExp(`^${p.trim()}$`, "i")),
        };
    }

    if (platforms.length > 0) {
        dbFilter["metadata.platforms"] = {
            $in: platforms.map((p) => new RegExp(`^${p.trim()}$`, "i")),
        };
    }

    if (rating.length > 0) {
        const numericRatings = rating.map(Number).filter((n) => !isNaN(n));
        if (numericRatings.length > 0) {
            const minScore = Math.min(...numericRatings) <= 10
                ? Math.min(...numericRatings) * 10
                : Math.min(...numericRatings);
            dbFilter["rating.score"] = { $gte: minScore };
        }
    }

    const { games, totalCount } = await getAllGamesMeta({
        sort,
        ord,
        count,
        start,
        filter: dbFilter,
    });

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
        <div className="w-full mx-auto px-4 sm:px-6 py-6 sm:py-12">
            <div className="mb-6 sm:mb-8 border-b border-[#7a6b4f]/20 pb-6 px-0 sm:px-2 md:px-6 lg:px-8">
                <span className="font-jost text-[11px] font-medium tracking-[0.22em] uppercase text-[#c4a97d]">
                    Category Collection
                </span>
                <h1 className="font-jk text-2xl sm:text-3xl md:text-5xl uppercase tracking-wide text-[#f4efe4] mt-2">
                    {matchedGenre.name} Games
                </h1>
            </div>

            <Collection
                games={games}
                totalCount={totalCount}
                currentSort={sort}
                currentOrd={ord}
                currentCount={count}
                currentStart={start}
                filterOptions={filterOptions}
                activeFilters={{ genres: [], publisher, platforms, rating }}
                hiddenFilters={["genres"]}
            />
        </div>
    );
}