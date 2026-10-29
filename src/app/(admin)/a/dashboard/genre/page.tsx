import { notFound } from "next/navigation";
import { getAllGenre } from "@/lib/queries";
import CategoriesView from "@/components/admin/CategoryView";
import { Suspense } from "react";

export default async function GenrePage() {
    const g = await getAllGenre();
    if (!g) return notFound();

    return (
        <Suspense fallback={<div className="text-white/40 font-jost text-xs">Loading categories...</div>}>
            <CategoriesView categories={g} />
        </Suspense>
    );
}
