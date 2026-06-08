"use client";

import React, { useRef } from 'react';
import GameCard from './GameCard';
import { Game } from '@/types/game';
import SectionHeader from './SectionHeader';

type CarouselProps = {
    title: string;
    games: Game[];
    exploreLink?: string; // Optional: Passing this will render the "Explore All" button
}

export default function Carousel({
    title,
    games,
    exploreLink
}: CarouselProps) {
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
                title= {title} 
                nav= {{
                    onScroll : handleScroll,
                    disabledLeft : true,
                    disabledRight : true
                }}
                explore={{exploreLink : exploreLink}}
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
                            img={game.coverImage}
                            badge={game.badges}
                            rating={game.rating?.score}
                            genre={game.metadata?.genres}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}