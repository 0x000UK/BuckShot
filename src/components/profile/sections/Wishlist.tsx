'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Heart, Trash2, Check, Gamepad2, ShoppingBag } from 'lucide-react'
import { EASE } from '@/lib/utils'
import { GameMeta } from '@/types/game'
import { toggleWishlist } from '@/app/actions/dbActions'
import { toast } from '@/stores/alertStore'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface WishlistSectionProps {
    profileId: string
    initialWishlist?: GameMeta[]
}

export default function WishlistSection({ profileId: _profileId, initialWishlist = [] }: WishlistSectionProps) {
    const router = useRouter()
    const [wishlist, setWishlist] = useState<GameMeta[]>(initialWishlist)
    const [removingId, setRemovingId] = useState<string | null>(null)

    const handleRemove = async (id: string | null, title?: string) => {
        if (!id) return
        setRemovingId(id)

        const res = await toggleWishlist(id)
        setRemovingId(null)

        if (!res.success) {
            toast.error('Failed to Remove', res.error || 'Please try again.')
            return
        }

        setWishlist(prev => prev.filter(g => g.id !== id))
        toast.info('Removed from Wishlist', `${title || 'Game'} was removed from your wishlist.`)
        router.refresh()
    }

    return (
        <div className="flex flex-col gap-8 max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#7a6b4f]/20">
                <div className="flex items-center gap-2.5">
                    <Heart className="text-[#c4a97d] fill-[#c4a97d]/20" size={18} />
                    <div>
                        <h2 className="font-jost text-sm font-semibold tracking-[0.2em] uppercase text-white/90">
                            Wishlist & Saved Titles
                        </h2>
                        <p className="font-jost text-[11px] text-white/40 mt-0.5">
                            {wishlist.length} {wishlist.length === 1 ? 'game' : 'games'} waiting to be acquired
                        </p>
                    </div>
                </div>
            </div>

            {/* Wishlist Grid */}
            {wishlist.length > 0 ? (
                <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                    <AnimatePresence>
                        {wishlist.map((game) => {
                            const isRemoving = removingId === game.id
                            return (
                                <motion.div
                                    layout
                                    key={game.id || game.slug}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: isRemoving ? 0.4 : 1, scale: isRemoving ? 0.9 : 1 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                    transition={{ duration: 0.25, ease: EASE }}
                                    className="group relative aspect-3/4 bg-[#14120e] border border-[#7a6b4f]/30 hover:border-[#c4a97d] overflow-hidden transition-all duration-300 rounded-none shadow-lg"
                                >
                                    {/* Cover Image */}
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={game.cover}
                                        alt={game.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />

                                    {/* Dark Gradient Overlay */}
                                    <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/30 to-black/10 opacity-70 group-hover:opacity-90 transition-opacity duration-300" />

                                    {/* Quick Actions (Top Right) */}
                                    <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                                        <button
                                            onClick={() => handleRemove(game.id, game.title)}
                                            title="Remove from Wishlist"
                                            className="w-8 h-8 rounded-full bg-[#0d0c0a]/90 border border-white/20 text-white/60 hover:text-red-400 hover:border-red-500/50 hover:bg-black flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>

                                    {/* Game Info at bottom */}
                                    <div className="absolute bottom-0 inset-x-0 p-3 z-10">
                                        <Link
                                            href={`/g/${game.id}/${game.slug}`}
                                            className="block hover:underline"
                                        >
                                            <h4 className="font-jk text-xs sm:text-sm text-white font-medium truncate drop-shadow">
                                                {game.title}
                                            </h4>
                                        </Link>
                                        {game.subtitle && (
                                            <p className="font-jost text-[10.5px] text-[#c4a97d]/80 truncate mt-0.5">
                                                {game.subtitle}
                                            </p>
                                        )}
                                    </div>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </motion.div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center border border-[#7a6b4f]/20 bg-[#090807]/50 p-8">
                    <Heart size={32} className="text-[#7a6b4f]/60 mb-3 stroke-1" />
                    <h3 className="font-jk text-base uppercase tracking-wider text-white/80">
                        Your Wishlist is Empty
                    </h3>
                    <p className="font-jost text-xs text-white/40 max-w-sm mt-1.5 leading-relaxed">
                        Explore curated titles in the storefront and click the heart icon on any game to save it for later.
                    </p>
                    <Link
                        href="/store"
                        className="mt-5 px-5 py-2.5 bg-[#7a6b4f]/20 hover:bg-[#c4a97d]/20 text-[#c4a97d] hover:text-white border border-[#7a6b4f]/40 hover:border-[#c4a97d] font-jost text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-2"
                    >
                        <ShoppingBag size={14} />
                        <span>Explore Store</span>
                    </Link>
                </div>
            )}
        </div>
    )
}
