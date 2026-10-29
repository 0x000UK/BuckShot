import { getGameById, getAllGenre } from "@/lib/queries";
import { GameEditorModal } from "@/components/admin/gameModel/index";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type Props = {
    params: Promise<{ action: string }>;
    searchParams: Promise<{ id?: string }>;
};

// ── 1. The Main Page Wrapper (Handles fast route validation & Suspense) ──
export default async function Page({ params, searchParams }: Props) {
    const { action } = await params;
    const { id } = await searchParams;

    if (action !== "new" && action !== "edit") {
        notFound();
    }

    if (action === "edit" && !id) {
        notFound();
    }

    const [genre, game] = await Promise.all([
        getAllGenre(),
        id ? getGameById(id) : Promise.resolve(undefined)
    ]);

    if (!genre) {
        notFound();
    }

    if (id && !game) {
        notFound();
    }

    return (
        <Suspense fallback={<div className="text-white/40 font-jost text-xs">Loading editor...</div>}>
            <GameEditorModal game={game??undefined} genre={genre} />
        </Suspense>
    );
}