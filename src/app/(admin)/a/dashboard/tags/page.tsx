import { getAllTaggedGames } from "@/lib/queries";
import TagsView from "@/components/admin/TagsView";
import { notFound } from "next/navigation";

export default async function TagsPage() {

    const g = await getAllTaggedGames();
    if (!g) return notFound();
    return <TagsView games={g}/>
}