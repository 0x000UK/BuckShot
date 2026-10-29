import { getAllGamesSummary } from "@/lib/queries";
import { GamesView } from "@/components/admin/GamesView";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default async function GamesPage() {
    const g = await getAllGamesSummary();
    if (!g.games) return notFound();

    return (
        <Suspense fallback={<div className="text-white/40 font-jost text-xs">Loading games...</div>}>
            <GamesView games={g.games}/>
        </Suspense>
    );
}
