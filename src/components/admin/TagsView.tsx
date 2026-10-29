'use client'
import type { TaggedGame } from "@/types/game";
import { EASE, ALL_TAGS } from "@/lib/utils";
import { motion } from "motion/react";


export default function TagsView({ games }: { games: TaggedGame[] }) {
    const tagStats = ALL_TAGS.map((t) => ({
        ...t, count: games.filter((g) => g.tags?.includes(t.id)).length,
    }));

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {tagStats.map((t, i) => (
                    <motion.div
                        key={t.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: EASE, delay: i * 0.07 }}
                        className={`p-5 border flex flex-col gap-3 rounded-sm ${t.bg} ${t.border}`}
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ background: t.color }} />
                            <span className="font-jost text-[10px] tracking-[0.16em] uppercase" style={{ color: t.color }}>{t.label}</span>
                        </div>
                        <p className="font-jk text-[32px] leading-none" style={{ color: t.color }}>{t.count}</p>
                        <p className="font-jost text-[11px]" style={{ color: `${t.color}80` }}>games tagged</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}