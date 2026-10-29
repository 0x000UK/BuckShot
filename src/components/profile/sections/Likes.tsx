'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ThumbsUp, Gamepad2, MessageSquare, ExternalLink } from 'lucide-react'
import { EASE } from '@/lib/utils'
import type { UserLikedItem } from '@/lib/dbQueries'

interface LikesSectionProps {
    profileId?: string
    initialLikes?: UserLikedItem[]
}

type LikeCategory = 'ALL' | 'GAMES' | 'COMMENTS'

export default function LikesSection({ profileId: _profileId, initialLikes = [] }: LikesSectionProps) {
    const [likes, setLikes] = useState<UserLikedItem[]>(initialLikes)
    const [activeTab, setActiveTab] = useState<LikeCategory>('ALL')

    const filteredLikes = useMemo(() => {
        if (activeTab === 'ALL') return likes
        if (activeTab === 'GAMES') return likes.filter(item => item.type === 'GAME')
        if (activeTab === 'COMMENTS') return likes.filter(item => item.type === 'COMMENT')
        return likes
    }, [likes, activeTab])

    const TABS: { key: LikeCategory; label: string }[] = [
        { key: 'ALL', label: 'All Liked' },
        { key: 'GAMES', label: 'Games' },
        { key: 'COMMENTS', label: 'Comments' },
    ]

    return (
        <div className="flex flex-col gap-8 max-w-3xl">
            {/* Header & Filter Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#7a6b4f]/20">
                <div className="flex items-center gap-2.5">
                    <ThumbsUp className="text-[#c4a97d] fill-[#c4a97d]/20" size={18} />
                    <div>
                        <h2 className="font-jost text-sm font-semibold tracking-[0.2em] uppercase text-white/90">
                            Liked Content
                        </h2>
                        <p className="font-jost text-[11px] text-white/40 mt-0.5">
                            {likes.length} {likes.length === 1 ? 'item' : 'items'} appreciated across the platform
                        </p>
                    </div>
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1 bg-[#0d0c0a] p-1 border border-[#7a6b4f]/25 rounded-none">
                    {TABS.map((tab) => {
                        const isActive = activeTab === tab.key
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`px-3 py-1 font-jost text-[11px] uppercase tracking-[0.12em] transition-colors cursor-pointer rounded-none ${
                                    isActive 
                                        ? 'bg-[#c4a97d] text-[#0d0c0a] font-semibold' 
                                        : 'text-white/40 hover:text-white'
                                }`}
                            >
                                {tab.label}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* List */}
            {filteredLikes.length > 0 ? (
                <div className="flex flex-col gap-3">
                    <AnimatePresence mode="popLayout">
                        {filteredLikes.map((item) => (
                            <motion.div
                                layout
                                key={item.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.25, ease: EASE }}
                                className="group relative flex items-center justify-between p-4 bg-[#0d0c0a]/60 border border-[#7a6b4f]/25 hover:border-[#c4a97d]/50 transition-all rounded-none overflow-hidden"
                            >
                                <div className="flex items-center gap-4 min-w-0">
                                    {/* Type Icon or Cover */}
                                    {item.coverUrl ? (
                                        <div className="w-12 h-16 shrink-0 bg-[#14120e] border border-[#7a6b4f]/30 overflow-hidden">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="w-10 h-10 shrink-0 bg-[#14120e] border border-[#7a6b4f]/30 flex items-center justify-center text-[#c4a97d]">
                                            {item.type === 'GAME' ? <Gamepad2 size={18} /> : <MessageSquare size={18} />}
                                        </div>
                                    )}

                                    <div className="flex flex-col min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-jost text-[9.5px] uppercase tracking-[0.15em] text-[#c4a97d] font-semibold px-1.5 py-0.5 bg-[#c4a97d]/10 border border-[#c4a97d]/20">
                                                {item.type}
                                            </span>
                                            <span className="font-jost text-[11px] text-white/30">
                                                {item.likedAt}
                                            </span>
                                        </div>

                                        <h4 className="font-jk text-sm text-white/90 font-medium truncate mt-1">
                                            {item.title}
                                        </h4>
                                        <p className="font-jost text-xs text-white/50 truncate mt-0.5">
                                            {item.subtitle}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <div className="p-2 text-[#c4a97d]">
                                        <ThumbsUp size={14} className="fill-[#c4a97d]/20" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 bg-[#0d0c0a] border border-dashed border-[#7a6b4f]/20 rounded-none gap-2">
                    <ThumbsUp size={28} className="text-white/20 stroke-1" />
                    <p className="font-jost text-xs tracking-wider uppercase text-white/40">
                        No liked items in this category yet.
                    </p>
                </div>
            )}
        </div>
    )
}
