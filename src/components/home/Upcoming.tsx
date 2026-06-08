"use client";

import React, { useRef } from 'react';
import GameCard from '@/components/GameCard';
import { GameData } from '@/types/game';
import { motion } from 'motion/react';
import SectionHeader from '@/components/SectionHeader';


export default function Upcoming({
    games
}: {games : GameData[]}) {
    const carouselRef = useRef<HTMLDivElement>(null);

    // Dynamic horizontal scroll controller
    const handleScroll = (direction: 'left' | 'right') => {
        if (carouselRef.current) {
            const { scrollLeft, clientWidth } = carouselRef.current;
            // Scroll roughly 80% of the visible container width per click
            const offset = direction === 'left' ? -clientWidth * 0.8 : clientWidth * 0.8;
            
            carouselRef.current.scrollTo({
                left: scrollLeft + offset,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-6 py-12 bg-background">
            
            <SectionHeader 
                title='Upcoming'
                nav = {{
                    onScroll : handleScroll,
                    disabledLeft : true,
                    disabledRight : true
                }}
            />

            {/* ── Carousel Track ── */}
            <div 
                ref={carouselRef}
                className="
                    flex gap-1 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-6
                    [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
                "
            >
                {games.map((game, idx) => (
                    <div key={idx} className="snap-start shrink-0">
                        <GameCard 
                            title={game.title}
                            img={game.coverImageFile?.previewUrl}
                            genre={game.genres}
                            size="xw"
                            wishlist
                        />
                        <div className={`flex flex-col justify-center flex-1 mx-2 w-100`}>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.38, ease: [0.22, 1, 0.36, 1] as const}}
                                className="text-[16px] font-medium tracking-[0.02em] text-white/60 font-sans my-3 line-clamp-3"
                            >
                            
                                {game.description || 'Lorem ipsum dolor sit amet consectetur adipisicing elitm illum excepturi. Sapiente magnam recusandae incidunt!'}
                            </motion.p>              
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}