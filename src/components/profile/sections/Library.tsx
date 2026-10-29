'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Library as LibraryIcon, Search, Gamepad2 } from 'lucide-react'
import { EASE } from '@/lib/utils'
import { GameMeta } from '@/types/game'

interface LibrarySectionProps {
    profileId: string
    initialGames?: GameMeta[]
}

const DEFAULT_LIBRARY: GameMeta[] = [
    { id: 'l1', slug: 'elden-ring', title: 'Elden Ring', cover: 'https://images.unsplash.com/photo-1651079985925-502801449de0?q=80&w=400&auto=format&fit=crop', subtitle: '140 hrs played' },
    { id: 'l2', slug: 'cyberpunk-2077', title: 'Cyberpunk 2077', cover: 'https://images.unsplash.com/photo-1614624532983-4ce03382d63d?q=80&w=400&auto=format&fit=crop', subtitle: '95 hrs played' },
    { id: 'l3', slug: 'ghost-of-tsushima', title: 'Ghost of Tsushima', cover: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=400&auto=format&fit=crop', subtitle: '64 hrs played' },
    { id: 'l4', slug: 'hollow-knight', title: 'Hollow Knight', cover: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=400&auto=format&fit=crop', subtitle: '110 hrs played' },
    { id: 'l5', slug: 'god-of-war-ragnarok', title: 'God of War Ragnarök', cover: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=400&auto=format&fit=crop', subtitle: '45 hrs played' },
    { id: 'l6', slug: 'baldurs-gate-3', title: "Baldur's Gate 3", cover: 'https://images.unsplash.com/photo-1651079985925-502801449de0?q=80&w=400&auto=format&fit=crop', subtitle: '210 hrs played' },
]

export default function LibrarySection({ profileId: _profileId, initialGames = DEFAULT_LIBRARY }: LibrarySectionProps) {
    const [searchQuery, setSearchQuery] = useState('')

    const filteredGames = useMemo(() => {
        return initialGames.filter(game => 
            game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            game.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [initialGames, searchQuery])

    return (
        <div className="flex flex-col gap-8 max-w-4xl">
            {/* Header & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#7a6b4f]/20">
                <div className="flex items-center gap-2.5">
                    <LibraryIcon className="text-[#c4a97d]" size={18} />
                    <div>
                        <h2 className="font-['Jost',sans-serif] text-sm font-semibold tracking-[0.2em] uppercase text-white/90">
                            Game Library
                        </h2>
                        <p className="font-['Jost',sans-serif] text-[11px] text-white/40 mt-0.5">
                            {initialGames.length} {initialGames.length === 1 ? 'title' : 'titles'} owned in total
                        </p>
                    </div>
                </div>

                {/* Search Input */}
                <div className="relative w-full sm:w-64">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search owned titles..."
                        className="w-full bg-[#0d0c0a] border border-[#7a6b4f]/30 focus:border-[#c4a97d] rounded-none pl-9 pr-4 py-2 text-xs text-white placeholder:text-white/30 font-['Jost',sans-serif] outline-none transition-colors"
                    />
                </div>
            </div>

            {/* Library Grid */}
            {filteredGames.length > 0 ? (
                <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                    <AnimatePresence>
                        {filteredGames.map((game) => (
                            <motion.div
                                layout
                                key={game.id || game.slug}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.25, ease: EASE }}
                                className="group relative aspect-[3/4] bg-[#14120e] border border-[#7a6b4f]/25 hover:border-[#c4a97d]/80 overflow-hidden transition-colors duration-300 rounded-none shadow-md"
                            >
                                {/* eslint-disable-next-img-element */}
                                <img
                                    src={game.cover}
                                    alt={game.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 filter grayscale-[20%] group-hover:grayscale-0"
                                />

                                {/* Gradient Bottom Overlay */}
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent pt-10 pb-3 px-3 flex flex-col justify-end">
                                    <p className="font-['Jost',sans-serif] text-[12.5px] font-medium tracking-wide text-white/95 truncate">
                                        {game.title}
                                    </p>
                                    {game.subtitle && (
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#c4a97d]/80" />
                                            <span className="font-['Jost',sans-serif] text-[10px] text-white/60 truncate">
                                                {game.subtitle}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 bg-[#0d0c0a] border border-dashed border-[#7a6b4f]/20 rounded-none gap-3">
                    <Gamepad2 size={28} className="text-white/20" />
                    <p className="font-['Jost',sans-serif] text-xs tracking-wider uppercase text-white/40">
                        {searchQuery ? `No titles found matching "${searchQuery}"` : 'No owned games in this library yet.'}
                    </p>
                </div>
            )}
        </div>
    )
}