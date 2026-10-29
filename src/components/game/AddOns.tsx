"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { type AdditionalContent } from "@/types/game";
import { BRAND, cn } from "@/lib/utils";
import type { GameData } from "@/lib/game";

export function AdditionalContentCard({ item }: { item: AdditionalContent }) {
    const size = item.image?.size || "def";
    const isWide = size === "wide";

    const containerClasses = 
        size === "wide" ? "aspect-video w-full max-w-[600px]" :
        size === "sqr"  ? "aspect-square w-full max-w-[240px]" :
                          "aspect-[3/4] w-full max-w-[240px]"; 

    const imageSizes = isWide ? "(max-width: 768px) 100vw, 600px" : "480px";

    return (
        <motion.div
            whileHover="hover"
            initial="initial"
            className={`relative cursor-pointer overflow-hidden bg-black/40 border ${containerClasses}`}
            variants={{
                initial: { borderColor: "#7a6b4f14" },
                hover:   { borderColor: "#c4a97d61" },
            }}
            transition={{ duration: 0.3 }}
        >
            <Image
                src={item.image.url?? "/images/logo_4x.png"}
                alt={item.title || "Content Image"}
                fill
                className="object-cover"
                sizes={imageSizes}
                unoptimized
            />

            <motion.div
                className="absolute inset-0"
                variants={{ initial: { scale: 1 }, hover: { scale: 1.05 } }}
                transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            >
                <Image
                    src={item.image.url ?? ""}
                    alt=""
                    fill
                    className="object-cover"
                    sizes={imageSizes}
                    aria-hidden
                />
            </motion.div>

            <motion.div
                className="absolute inset-0 bg-black"
                variants={{ 
                    initial: { opacity: isWide ? 0.3 : 0.25 }, 
                    hover: { opacity: isWide ? 0.1 : 0.05 } 
                }}
                transition={{ duration: 0.35 }}
            />

            <motion.div
                className="absolute inset-0 bg-linear-to-t from-[#7a6b4f]/40 via-transparent to-transparent"
                variants={{ initial: { opacity: 0 }, hover: { opacity: 1 } }}
                transition={{ duration: 0.4 }}
            />

            <motion.div
                className="absolute bottom-0 left-0 right-0 h-px z-10 bg-linear-to-r from-transparent via-[#c4a97d]/55 to-transparent"
                variants={{ initial: { opacity: 0 }, hover: { opacity: 1 } }}
                transition={{ duration: 0.4, ease: "easeOut" }}
            />

            <div className={`absolute z-10 ${isWide ? "top-4 right-4" : "top-3 right-3"}`}>
                <span className={`uppercase tracking-[0.15em] text-[#c4a97d] border border-[#c4a97d]/30 font-['Jost',sans-serif] ${
                    isWide 
                        ? "text-[10px] bg-black/70 px-2.5 py-1 backdrop-blur-sm" 
                        : "text-[9px] bg-black/60 px-2 py-0.5"
                }`}>
                    {item.type || "Add-on"}
                </span>
            </div>

            <div className={`absolute bottom-0 left-0 right-0 bg-linear-to-t to-transparent ${
                isWide 
                    ? "p-5 from-black/90 via-black/60 pt-12" 
                    : "p-4 from-black via-black/80 pt-10"
            }`}>
                <div className={`flex ${isWide ? "flex-col sm:flex-row sm:items-end justify-between gap-2" : "flex-col"}`}>
                    <p className={`tracking-wide font-['Jost',sans-serif] font-medium leading-snug line-clamp-2 ${
                        isWide 
                            ? "text-[15px] sm:text-[16px] text-white/90 max-w-[85%]" 
                            : "text-[13px] text-white/75 mb-1.5"
                    }`}>
                        {item.title}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}

export default function AddOnsTab({ game, className }: { game: GameData , className?:string }) {
    const hasDlcs = game.dlcs && game.dlcs.length > 0;
    const hasBonus = game.bonusContent && game.bonusContent.length > 0;

    return (
        <div className={cn("w-full flex flex-col items-center justify-center py-16 bg-ambient/20", className)}>
            {hasDlcs && (
                <section className="mb-16 p-4 max-w-7xl mx-auto w-full">
                    <h3
                        className="font-jk text-2xl md:text-3xl text-center tracking-[0.2em] uppercase mb-12"
                        style={{ color: BRAND }}
                    >
                        Downloadable Content
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-items-center">
                        {game.dlcs!.map((dlc: AdditionalContent) => (
                            <AdditionalContentCard key={dlc.id} item={dlc} />
                        ))}
                    </div>
                </section>
            )}

            {hasBonus && (
                <section className="p-4 max-w-7xl mx-auto w-full">
                    <h3
                        className="font-jk text-xl md:text-2xl text-center tracking-[0.2em] uppercase mb-12"
                        style={{ color: BRAND }}
                    >
                        Bonus Content
                    </h3>
                    <div className="flex flex-wrap justify-center gap-8">
                        {game.bonusContent!.map((bonus: AdditionalContent) => (
                            <AdditionalContentCard key={bonus.id} item={bonus} />
                        ))}
                    </div>
                </section>
            )}

            {!hasDlcs && !hasBonus && (
                <div className="py-24 text-center">
                    <p className="font-jk text-xl text-white/50 tracking-wider uppercase mb-2">
                        No Add-ons Available
                    </p>
                    <p className="font-jost text-xs text-white/30 tracking-widest uppercase">
                        This title does not have additional expansions or downloadable content.
                    </p>
                </div>
            )}
        </div>
    );
}