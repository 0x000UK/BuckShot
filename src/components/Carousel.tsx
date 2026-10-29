"use client";

import React, { useRef } from 'react';
import Link from 'next/link';
import { type GameMeta } from '@/types/game';
import SectionHeader from './SectionHeader';
import GameCard from './GameCard';

type CarouselProps = {
    title: string;
    games: GameMeta[];
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
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
            
            <SectionHeader 
                title= {title} 
                nav= {{
                    onScroll : handleScroll,
                }}
                exploreLink = {exploreLink}
            />

            <div 
                ref={carouselRef}
                className="
                    flex gap-3.5 sm:gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory py-6
                    [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
                "
            >
                {games.map((game) => (
                    <div key={game.id} className="snap-start shrink-0">
                        <Link href={`/g/${game.id}/${game.slug}`} className="block">
                            <GameCard game={game} />
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}