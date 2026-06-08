import React from 'react'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'
import { GameData } from '@/types/game'


export default function DiscoverNow({
    game
} : {game : GameData}) {
    return (
        <div className="w-full bg-[#080808] py-16">
            <div className="w-full max-w-7xl mx-auto px-6">
                {/* ── Main Banner Container ── */}
                <div className="relative w-full h-135 overflow-hidden group border border-[#7a6b4f]/15">
                    
                    {/* 1. Background Banner Image */}
                    <Image 
                        src={game.coverImageFile?.previewUrl!}
                        alt={game.title}
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-[1.02] priority"
                    />

                    {/* 2. Cinematic Dark Gradient Overlay */}
                    {/* Fades from your rich dark background at the bottom to transparent at the top */}
                    {/* Fades left-to-right to isolate the text block */}
                    <div className="absolute inset-0 z-1 bg-linear-to-r from-[#080808]/95 via-[#080808]/60 to-transparent pointer-events-none" />
                    <div className="absolute inset-0 z-1 bg-linear-to-t from-[#080808]/80 via-transparent to-transparent pointer-events-none" />

                    {/* 3. Golden bottom-edge glow line*/}
                    <div className="
                        absolute bottom-0 left-0 right-0 h-px z-10 pointer-events-none
                        bg-linear-to-r from-transparent via-[#c4a97d]/55 to-transparent
                    " />

                    {/* 4. Content Container - Pushed to the left */}
                    <div className="relative z-10 flex flex-col justify-end items-start h-full max-w-xl p-12 md:p-16 space-y-4">
                        
                        {/* Genre tags */}
                        <div className="flex flex-wrap gap-2">
                            {game.genres?.map((g) => (
                                <span key={g} className="text-[9px] tracking-[0.15em] uppercase text-[#c4a97d] bg-[#7a6b4f]/10 border border-[#7a6b4f]/30 px-2 py-0.5">
                                    {g}
                                </span>
                            ))}
                        </div>

                        {/* Headings */}
                        <div className="space-y-1">
                            <h3 className="text-white text-4xl md:text-5xl font-medium font-jk tracking-wide uppercase leading-none">
                                {game.title}
                            </h3>
                            <p className="text-[#c4a97d]/70 text-sm tracking-wider uppercase">
                                {game.subtitle}
                            </p>
                        </div>

                        {/* Description */}
                        <p className="text-white/60 text-sm leading-relaxed line-clamp-3 font-mono">
                            {game.description}
                        </p>

                        {/* CTA Operation Centre */}
                        <div className="flex items-center gap-4 pt-3">
                            <motion.button
                                onClick={()=>{}}
                                disabled = {false}
                                whileHover={{backgroundColor: '#c4a97d' , opacity : 0.9 }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ duration: 0.4, ease: 'easeInOut' }} // Handles the background transition smoothly
                                className="relative  flex items-center gap-2 overflow-hidden group/shimmer py-3 px-6 mt-4 bg-[#7a6b4f] border-none rounded-none text-white/90 text-[11px] font-semibold tracking-[0.22em] uppercase cursor-pointer"
                            >
                                
                                Explore Now
                                <ArrowRight className='w-4 h-4'/>
                                
                                {/* Shimmer sweep */}
                                <span className="absolute inset-0 pointer-events-none bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/shimmer:translate-x-full transition-transform duration-550 ease-in-out" />
                                
                            </motion.button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}