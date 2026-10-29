"use client"

import Image from "next/image";
import { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { BRAND, BRAND_GOLD, EASE, GAME_TAGS } from "@/lib/utils";
import type { TaggedGame } from "@/types/game";

export default function FeaturedSpotlight({ games }: { games: TaggedGame[] }) {
     const [idx, setIdx] = useState(0);
     const [cardWidth, setCardWidth] = useState(800);
     const [gap, setGap] = useState(24);
     const touchStartX = useRef<number | null>(null);

     const updateDimensions = useCallback(() => {
          if (typeof window === "undefined") return;
          const w = window.innerWidth;
          if (w < 640) {
               setCardWidth(Math.max(280, Math.min(w - 36, 460)));
               setGap(16);
          } else if (w < 1024) {
               setCardWidth(Math.min(w - 80, 680));
               setGap(20);
          } else {
               setCardWidth(800);
               setGap(24);
          }
     }, []);

     useEffect(() => {
          updateDimensions();
          window.addEventListener("resize", updateDimensions);
          return () => window.removeEventListener("resize", updateDimensions);
     }, [updateDimensions]);

     const go = useCallback(
          (d: 1 | -1) => {
               setIdx((i) => {
                    const nextIdx = i + d;
                    if (nextIdx < 0) return games.length - 1;
                    if (nextIdx >= games.length) return 0;
                    return nextIdx;
               });
          },
          [games.length]
     );

     const prev = useCallback(() => go(-1), [go]);
     const next = useCallback(() => go(1), [go]);

     const handleTouchStart = (e: React.TouchEvent) => {
          touchStartX.current = e.touches[0].clientX;
     };

     const handleTouchEnd = (e: React.TouchEvent) => {
          if (touchStartX.current === null) return;
          const diff = touchStartX.current - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 40) {
               if (diff > 0) next();
               else prev();
          }
          touchStartX.current = null;
     };

     if (!games || games.length === 0) return null;

     return (
          <AnimatePresence>
               <section className="relative w-full overflow-hidden pt-12 pb-18 sm:pt-16 sm:pb-24 font-sans text-white bg-[#0b0908]">
                    <div className="absolute inset-0 bg-radial from-[#7a6b4f]/10 via-transparent to-[#080808] pointer-events-none" />

                    <div className="relative flex flex-col items-center justify-center text-center px-4 mb-6 sm:mb-10 max-w-7xl mx-auto">
                         <motion.h2 
                              initial={{ opacity: 0, y: 16 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.8, ease: EASE }}
                              className="font-jk font-light text-3xl sm:text-4xl md:text-6xl mb-2 sm:mb-4 uppercase tracking-tight text-[#f4efe4]"
                         >
                              Featured Spotlight
                         </motion.h2>
                         <motion.p 
                              initial={{ opacity: 0 }}
                              whileInView={{ opacity: 1 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.6, ease: EASE, delay: 0.25 }}
                              className="max-w-2xl text-xs sm:text-sm md:text-base leading-relaxed text-[#e8e2d2]/60 px-4"
                         >
                              Handpicked flagship titles curated for groundbreaking narratives and unmatched visual mastery.
                         </motion.p>
                    </div>

                    <div 
                         className="relative w-full flex justify-center items-center py-4 sm:py-6"
                         onTouchStart={handleTouchStart}
                         onTouchEnd={handleTouchEnd}
                    >
                         {/* Previous Button */}
                         <button
                              onClick={prev}
                              className="absolute left-2 sm:left-4 md:left-8 lg:left-12 z-30 w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 flex items-center justify-center rounded-none shadow-xl border border-[#7a6b4f]/30 bg-[#0b0908]/90 text-[#f4efe4] hover:text-[#c4a97d] hover:border-[#c4a97d]/50 transition-all cursor-pointer backdrop-blur-sm"
                              aria-label="Previous slide"
                         >
                              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 -ml-0.5" />
                         </button>

                         {/* Carousel Track */}
                         <div className="w-full max-w-7xl mx-auto overflow-visible relative h-95 sm:h-105 md:h-115">
                              <motion.div
                                   className="flex items-center h-full"
                                   style={{ gap: `${gap}px` }}
                                   initial={false}
                                   animate={{
                                        x: `calc(50% - ${idx * (cardWidth + gap) + cardWidth / 2}px)`,
                                   }}
                                   transition={{ duration: 0.5, ease: EASE }}
                              >
                                   {games.map((game, i) => {
                                        const isActive = i === idx;
                                        const img = game.tagFeatures.find((t) => t.type == GAME_TAGS.FEATURED)?.image;

                                        return (
                                             <motion.div
                                                  key={game.id}
                                                  animate={{
                                                       scale: isActive ? 1 : 0.94,
                                                       opacity: isActive ? 1 : 0.55,
                                                  }}
                                                  transition={{ duration: 0.4, ease: EASE }}
                                                  style={{ width: `${cardWidth}px` }}
                                                  className="relative shrink-0 h-full rounded-none overflow-hidden shadow-2xl border border-[#7a6b4f]/25 hover:border-[#c4a97d]/40 transition-colors group"
                                             >
                                                  <Link href={`/g/${game.id}/${game.slug}`} className="block w-full h-full relative">
                                                       
                                                       {/* 
                                                       Optimized Next.js Image Component 
                                                       Replaces the absolute div with background-image
                                                       */}
                                                       {img && (
                                                            <Image
                                                                 src={img}
                                                                 alt={`${game.title} featured image`}
                                                                 fill
                                                                 sizes="(max-width: 768px) 100vw, (max-width: 1280px) 60vw, 33vw"
                                                                 priority={i < 2}
                                                                 className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                                                            />
                                                       )}

                                                       <div className="absolute inset-0 bg-linear-to-t md:bg-linear-to-r from-black/95 via-black/80 md:via-black/65 to-black/30 md:to-transparent pointer-events-none" />

                                                       {/* Card Content */}
                                                       <div className="relative z-1 w-full md:w-3/5 h-full p-6 sm:p-8 md:p-10 flex flex-col justify-end md:justify-center text-white">
                                                            {/* Badge/Tag */}
                                                            <div className="mb-2.5 sm:mb-3 md:mb-4">
                                                            <span 
                                                                 className="font-jost font-semibold tracking-[0.2em] uppercase text-[10px] sm:text-xs px-2.5 sm:px-3.5 py-1 rounded-none border border-[#c4a97d]/35 inline-block"
                                                                 style={{ background: `${BRAND}95`, color: "#f4efe4" }}
                                                            >
                                                                 {game.tags && game.tags[0] ? game.tags[0] : "FEATURED"}
                                                            </span>
                                                            </div>

                                                            <h3 className="font-jk text-2xl sm:text-3xl md:text-4xl font-light mb-2 sm:mb-3 leading-tight tracking-tight text-[#f4efe4] line-clamp-2">
                                                                 {game.title}
                                                            </h3>

                                                            <p className="font-jost text-xs sm:text-sm md:text-base leading-relaxed line-clamp-2 sm:line-clamp-3 md:line-clamp-4 text-white/75">
                                                                 {game.synopsis}
                                                            </p>

                                                            {/* Action Link */}
                                                            <div className="mt-3 sm:mt-5 flex items-center gap-1.5 text-[#c4a97d] font-jost text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase group-hover:text-white transition-colors">
                                                            <span>Explore Title</span>
                                                            <ChevronRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
                                                            </div>
                                                       </div>
                                                  </Link>
                                             </motion.div>
                                        );
                                        })}
                              </motion.div>
                         </div>

                         {/* Next Button */}
                         <button
                              onClick={next}
                              className="absolute right-2 sm:right-4 md:right-8 lg:right-12 z-30 w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 flex items-center justify-center rounded-none shadow-xl border border-[#7a6b4f]/30 bg-[#0b0908]/90 text-[#f4efe4] hover:text-[#c4a97d] hover:border-[#c4a97d]/50 transition-all cursor-pointer backdrop-blur-sm"
                              aria-label="Next slide"
                         >
                              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 -mr-0.5" />
                         </button>
                    </div>

                    {/* Pagination Indicators */}
                    <div className="relative z-20 flex items-center justify-center gap-2 mt-4 sm:mt-6">
                         {games.map((_, i) => (
                              <button
                                   key={i}
                                   onClick={() => setIdx(i)}
                                   className={`h-0.5 transition-all duration-300 rounded-none cursor-pointer ${
                                        i === idx ? "w-8 sm:w-10" : "w-5 sm:w-6 hover:opacity-80"
                                   }`}
                                   style={{
                                        background: i === idx ? BRAND_GOLD : "rgba(232, 226, 210, 0.25)",
                                   }}
                                   aria-label={`Go to slide ${i + 1}`}
                              />
                         ))}
                    </div>
               </section>
          </AnimatePresence>
     );
}