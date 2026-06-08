'use client'
import { useState, useCallback} from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import {ArrowRight } from 'lucide-react'
import {type GameData } from '@/types/game'
import SectionHeader from '../SectionHeader'
import { BRAND_LIGHT, EASE } from '@/lib/utils'

/* ── Brand tokens ── */
const PANEL_H = 400

type Props = {
    title?: string
    games: GameData[]
}

/* ── Corner Bracket Component ── */
function CornerBracket({ position }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'}) {
    const isLeft = position === 'top-left' || position === 'bottom-left'
    const isTop = position === 'top-left' || position === 'top-right'
    return (
        <div
            className={`absolute ${isTop ? 'top-3' : 'bottom-3'} ${isLeft ? 'left-3' : 'right-3'} w-7 h-7 pointer-events-none opacity-40`}
            style={{
                [isTop? 'borderTop' : 'borderBottom']: `1px solid ${BRAND_LIGHT}`,
                [isLeft ? 'borderLeft' : 'borderRight']: `1px solid ${BRAND_LIGHT}`,
            }}
        />
    )
}


export default function FeaturedSpotlight({ title = 'Featured', games }: Props) {
    const [idx, setIdx] = useState(0)
    const game = games[idx]


    const prev = useCallback(() => {
        setIdx((i) => (i - 1 + games.length) % games.length)
    }, [games.length])

    const next = useCallback(() => {
        setIdx((i) => (i + 1 + games.length) % games.length)
    }, [games.length])  


    if (!games.length) return null

    return (
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-12 bg-background">

            <SectionHeader 
                title={title} 
                nav = {{
                    onPrev : prev,
                    onNext: next,
                    disabledLeft : false,
                    disabledRight : false
                }}
            />

            {/* ── Content ── */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={idx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="flex flex-col lg:flex-row gap-6 lg:gap-8"
                    style={{ minHeight: PANEL_H }}
                >
                    {/* ── Banner Image ── */}
                    <motion.div
                        initial={{ opacity: 0, x: -24 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, ease: EASE }}
                        className="relative overflow-hidden w-full lg:w-[62%] border border-[#7a6b4f]/55"
                        style={{ height: PANEL_H }}
                    >
                        {/* Image */}
                        {game.bannerImageFile?.previewUrl || game.coverImageFile?.previewUrl ? (
                            <Image
                                src={game.bannerImageFile?.previewUrl ?? game.coverImageFile?.previewUrl!}
                                alt={game.title}
                                fill
                                className="object-cover object-center"
                                priority
                            />
                        ) : (
                            <div className="w-full h-full bg-linear-to-br from-[#1a1208] to-[#0d1520]" />
                        )}

                        {/* Gradient overlays */}
                        <div className="absolute inset-x-0 top-0 h-16 pointer-events-none bg-linear-to-b from-[#080808]/60 to-transparent" />
                        <div className="absolute inset-y-0 right-0 w-14 pointer-events-none bg-linear-to-r from-transparent to-[#080808]/60" />
                        <div className="absolute inset-y-0 left-0 w-14 pointer-events-none bg-linear-to-r to-transparent from-[#080808]/60" />
                        <div className="absolute inset-x-0 bottom-0 h-16 pointer-events-none bg-linear-to-t from-[#080808]/60 to-transparent" />

                        {/* Corner brackets */}
                        <CornerBracket position="top-left" />
                        <CornerBracket position="top-right" />
                        <CornerBracket position="bottom-right" />
                        <CornerBracket position="bottom-left" />



                        {/* Pagination indicator */}
                        {games.length > 1 && (
                            <div className="absolute bottom-5 right-5 pointer-events-none font-['Jost',sans-serif] text-[9px] tracking-[0.22em] text-white/35">
                                {String(idx + 1).padStart(2, '0')}&nbsp;/&nbsp;
                                {String(games.length).padStart(2, '0')}
                            </div>
                        )}
                    </motion.div>

                    {/* ── Game Info ── */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
                        className="flex flex-col justify-center flex-1 min-w-0 lg:pl-2"
                    >
                        {/* Featured badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
                            className="mb-4"
                        >
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 font-['Jost',sans-serif] text-[9px] font-medium tracking-[0.22em] uppercase text-[#c4a97d] border border-[#7a6b4f]/45 bg-[#7a6b4f]/10">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#c4a97d] inline-block" />
                                {game.tags?.[0] || 'featured'}
                            </span>
                        </motion.div>

                        {/* Genre tags */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.25, ease: EASE }}
                            className="flex flex-wrap gap-1.5 mb-3"
                        >
                            {game.genres?.slice(0, 3).map((genre) => (
                                <span
                                    key={genre}
                                    className="font-['Jost',sans-serif] text-[8px] font-normal tracking-[0.15em] uppercase text-white/35 border border-white/10 px-1.5 py-0.5"
                                >
                                    {genre}
                                </span>
                            ))}
                        </motion.div>

                        {/* Title */}
                        <motion.h3
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
                            className="font-jk text-[28px] uppercase font-bold tracking-[0.04em] leading-[0.95] text-white/90 mb-4"
                        >
                            {game.title}
                        </motion.h3>


                        {/* Description */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.38, ease: EASE }}
                            className="text-[13.5px] font-light leading-[1.7] tracking-[0.02em] text-white/45 mb-7 line-clamp-3"
                        >
                            {game.description || 'No description available for this title. asco val porto basel salche juventus milano sassualo elche celta vigo rayo valencayo'}
                        </motion.p>

                        {/* Action buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.46, ease: EASE }}
                            className="flex flex-wrap gap-3"
                        >
                            <Link href={`/game/${game.id || game.title}`} className="no-underline">
                                <motion.span
                                    whileHover={{ backgroundColor: BRAND_LIGHT, color: '#080808' }}
                                    whileTap={{ scale: 0.97 }}
                                    className="inline-flex items-center gap-2 px-6 py-2.75 bg-[#7a6b4f] text-white/90 font-['jost',sans-serif] text-[11px] font-semibold tracking-[0.18em] uppercase cursor-pointer transition-colors duration-250"
                                >
                                    Explore Now
                                    <ArrowRight size={13} />
                                </motion.span>
                            </Link>

                            <motion.button
                                whileHover={{ backgroundColor:'#7a6b4f1f', borderColor:'#c4a97d"', color: '#fff' }}
                                whileTap={{ scale: 0.97 }}
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevents the card click event from firing when clicking the button
                                    console.log(`Added ${title} to wishlist`);
                                }}
                                className="
                                    relative z-10 
                                    px-5 py-2
                                    bg-transparent
                                    border border-[#7a6b4f]/55 
                                    text-[10px] text-[#c4a97d] font-medium tracking-[0.14em] uppercase
                                    rounded-none cursor-pointer transition-all duration-200
                                "
                            >
                                Wishlist Now
                            </motion.button>
                        </motion.div>

                        {/* Navigation dots */}
                        {games.length > 1 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.5 }}
                                className="flex gap-1.5 mt-6"
                            >
                                {games.map((_, i) => (
                                    <motion.button
                                        key={i}
                                        onClick={() => setIdx(i)}
                                        animate={{
                                            width: i === idx ? 18 : 6,
                                            backgroundColor: i === idx ? BRAND_LIGHT : 'rgba(122,107,79,0.3)',
                                        }}
                                        transition={{ duration: 0.3, ease: EASE }}
                                        className="h-0.5 border-none cursor-pointer p-0"
                                    />
                                ))}
                            </motion.div>
                        )}
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        </section>
    )
}