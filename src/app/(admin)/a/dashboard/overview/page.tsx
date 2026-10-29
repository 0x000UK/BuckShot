import { getAllGamesSummary, getAllGenre, getAdminOverviewStats, getDailyMetrics } from "@/lib/queries";
import Overview from "@/components/admin/Overview";
import { notFound } from "next/navigation";

export default async function OverviewPage() {
    const [data, genres, stats, metrics] = await Promise.all([
        getAllGamesSummary(),
        getAllGenre(),
        getAdminOverviewStats(),
        getDailyMetrics(30),
    ]);

    if (!data.games) return notFound();
    if (!genres) return notFound();

    return (
        <Overview
            games={data.games}
            categories={genres}
            stats={stats}
            metrics={metrics}
        />
    );
}
