import { getGamesByTag } from "@/lib/queries";
import { resolveTagSlug, TAG_CONFIGS, type GameTag } from "@/lib/constants/tags";
import CuratedGrid from "@/components/store/CuratedGrid";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

interface SpecialCategoryPageProps {
    params: Promise<{ tag: string }>;
}

export async function generateMetadata({ params }: SpecialCategoryPageProps): Promise<Metadata> {
    const { tag } = await params;
    const resolvedTag = resolveTagSlug(tag);
    if (!resolvedTag) return { title: "Collection Not Found" };
    const config = TAG_CONFIGS[resolvedTag];
    return {
        title: `${config.title} | BuckShot Store`,
        description: config.subtitle,
    };
}

export default async function SpecialCategoryPage({ params }: SpecialCategoryPageProps) {
    const { tag } = await params;
    const resolvedTag = resolveTagSlug(tag);

    if (!resolvedTag) {
        return notFound();
    }

    const config = TAG_CONFIGS[resolvedTag];
    const games = await getGamesByTag(resolvedTag);

    return (
        <div className="w-full max-w-7xl mx-auto px-6 py-12">
            {/* Breadcrumb / Back Navigation */}
            <div className="mb-6">
                <Link
                    href="/store"
                    className="inline-flex items-center gap-2 font-jost text-xs uppercase tracking-[0.2em] text-white/40 hover:text-[#c4a97d] transition-colors group"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Back to Store</span>
                </Link>
            </div>

            {/* Editorial Header */}
            <div className="border-b border-[#7a6b4f]/20 pb-8 mb-10">
                <span className="font-jost text-[11px] font-medium tracking-[0.25em] uppercase text-[#c4a97d]">
                    {config.badge}
                </span>
                <h1 className="font-jk text-4xl sm:text-5xl md:text-6xl uppercase tracking-tight text-[#f4efe4] mt-2 mb-3">
                    {config.title}
                </h1>
                <p className="font-jost text-white/50 text-base md:text-lg max-w-2xl leading-relaxed">
                    {config.subtitle}
                </p>
            </div>
            <CuratedGrid games={games} />
        </div>
    );
}
