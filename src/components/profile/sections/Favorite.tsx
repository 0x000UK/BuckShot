'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Star, Plus, Trash2, X, Gamepad2 } from 'lucide-react'
import { EASE } from '@/lib/utils'
import type { GameMeta } from '@/types/game'

export const MOCK_AVAILABLE_GAMES: GameMeta[] = [
    { id: 'g5', slug: 'ghost-of-tsushima', title: 'Ghost of Tsushima', cover: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=400&auto=format&fit=crop', subtitle: 'Action • Open World' },
    { id: 'g6', slug: 'hollow-knight', title: 'Hollow Knight', cover: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=400&auto=format&fit=crop', subtitle: 'Metroidvania • Indie' },
    { id: 'g7', slug: 'god-of-war-ragnarok', title: 'God of War Ragnarök', cover: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=400&auto=format&fit=crop', subtitle: 'Action • Adventure' },
    { id: 'g8', slug: 'baldurs-gate-3', title: "Baldur's Gate 3", cover: 'https://images.unsplash.com/photo-1651079985925-502801449de0?q=80&w=400&auto=format&fit=crop', subtitle: 'RPG • Turn-Based' },
]

interface FavoritesSectionProps {
    profileId: string
    initialFavorites?: GameMeta[]
}

const DEFAULT_FAVORITES: GameMeta[] = [
    { id: 'f1', slug: 'elden-ring', title: 'Elden Ring', cover: 'https://images.unsplash.com/photo-1651079985925-502801449de0?q=80&w=400&auto=format&fit=crop', subtitle: 'Masterpiece • 140 hrs' },
    { id: 'f2', slug: 'cyberpunk-2077', title: 'Cyberpunk 2077', cover: 'https://images.unsplash.com/photo-1614624532983-4ce03382d63d?q=80&w=400&auto=format&fit=crop', subtitle: 'RPG • 95 hrs' },
]

export default function FavoritesSection({ profileId: _profileId, initialFavorites = DEFAULT_FAVORITES }: FavoritesSectionProps) {
    const [favorites, setFavorites] = useState<GameMeta[]>(initialFavorites)
    const [isAdding, setIsAdding] = useState(false)
    const [availableGames, setAvailableGames] = useState<GameMeta[]>(MOCK_AVAILABLE_GAMES)

    const handleRemove = (id: string | null) => {
        if (!id) return
        const removed = favorites.find(g => g.id === id)
        setFavorites(prev => prev.filter(g => g.id !== id))
        if (removed) {
            setAvailableGames(prev => [...prev, removed])
        }
    }

    const handleAdd = (game: GameMeta) => {
        setFavorites(prev => [...prev, game])
        setAvailableGames(prev => prev.filter(g => g.id !== game.id))
        setIsAdding(false)
    }

    return (
        <div className="flex flex-col gap-8 max-w-4xl">
            {/* Header & Add Button */}
            <div className="flex items-center justify-between pb-4 border-b border-[#7a6b4f]/20">
                <div className="flex items-center gap-2.5">
                    <Star className="text-[#c4a97d] fill-[#c4a97d]/20" size={18} />
                    <div>
                        <h2 className="font-['Jost',sans-serif] text-sm font-semibold tracking-[0.2em] uppercase text-white/90">
                            Curated Favorites
                        </h2>
                        <p className="font-['Jost',sans-serif] text-[11px] text-white/40 mt-0.5">
                            {favorites.length} {favorites.length === 1 ? 'title' : 'titles'} selected for showcase
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => setIsAdding(!isAdding)}
                    disabled={availableGames.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-[#7a6b4f]/20 hover:bg-[#c4a97d] text-white/80 hover:text-black font-['Jost',sans-serif] text-[11px] font-semibold tracking-[0.15em] uppercase transition-all duration-300 border border-[#7a6b4f]/40 hover:border-[#c4a97d] cursor-pointer disabled:opacity-40 disabled:pointer-events-none rounded-sm"
                >
                    {isAdding ? <X size={14} /> : <Plus size={14} />}
                    <span>{isAdding ? 'Close Picker' : 'Add Favorite'}</span>
                </button>
            </div>

            {/* Game Selector Drawer */}
            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: EASE }}
                        className="overflow-hidden bg-[#0d0c0a] border border-[#7a6b4f]/30 p-5 rounded-none"
                    >
                        <span className="font-['Jost',sans-serif] text-[10px] font-semibold tracking-[0.2em] uppercase text-[#c4a97d] block mb-3">
                            Select a Title to Showcase
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {availableGames.map(game => (
                                <div
                                    key={game.id || game.slug}
                                    onClick={() => handleAdd(game)}
                                    className="flex items-center gap-3 p-2 bg-[#14120e] border border-[#7a6b4f]/20 hover:border-[#c4a97d] cursor-pointer group transition-all duration-200"
                                >
                                    {/* eslint-disable-next-img-element */}
                                    <img src={game.cover} alt={game.title} className="w-10 h-14 object-cover shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="font-['Jost',sans-serif] text-xs font-medium text-white/80 group-hover:text-[#c4a97d] truncate transition-colors">
                                            {game.title}
                                        </p>
                                        {game.subtitle && (
                                            <p className="font-['Jost',sans-serif] text-[10px] text-white/35 truncate mt-0.5">
                                                {game.subtitle}
                                            </p>
                                        )}
                                    </div>
                                    <Plus size={16} className="text-white/20 group-hover:text-[#c4a97d] mr-2 transition-colors" />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Favorites Grid */}
            {favorites.length > 0 ? (
                <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                    <AnimatePresence>
                        {favorites.map((game) => (
                            <motion.div
                                layout
                                key={game.id || game.slug}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.25, ease: EASE }}
                                className="group relative aspect-[3/4] bg-[#14120e] border border-[#7a6b4f]/30 hover:border-[#c4a97d] overflow-hidden transition-colors duration-300 rounded-none shadow-lg"
                            >
                                {/* eslint-disable-next-img-element */}
                                <img
                                    src={game.cover}
                                    alt={game.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 grayscale-[15%] group-hover:grayscale-0"
                                />

                                {/* Subtle Dark Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />

                                {/* Delete / Remove Button (Top Right) */}
                                <button
                                    onClick={() => handleRemove(game.id)}
                                    title="Remove from favorites"
                                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/70 border border-white/10 text-white/50 hover:text-red-400 hover:border-red-500/50 hover:bg-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer z-10"
                                >
                                    <Trash2 size={14} />
                                </button>

                                {/* Game Metadata Label (Bottom) */}
                                <div className="absolute bottom-0 inset-x-0 p-3.5 flex flex-col justify-end">
                                    <p className="font-['Jost',sans-serif] text-[13px] font-medium tracking-wide text-white truncate">
                                        {game.title}
                                    </p>
                                    {game.subtitle && (
                                        <span className="font-['Jost',sans-serif] text-[10.5px] text-[#c4a97d] truncate mt-0.5">
                                            {game.subtitle}
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 bg-[#0d0c0a] border border-dashed border-[#7a6b4f]/20 rounded-md gap-3">
                    <Gamepad2 size={28} className="text-white/20" />
                    <p className="font-['Jost',sans-serif] text-xs tracking-wider uppercase text-white/40">
                        No favorites selected yet. Add your top titles above.
                    </p>
                </div>
            )}
        </div>
    )
}