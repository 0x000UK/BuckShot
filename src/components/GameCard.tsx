import Image from "next/image";
import { type GameMeta } from "@/types/game";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface GameCardProps {
    game: GameMeta;
    variant?: "default" | "large";
    className?: string;
    onClick?: () => void;
    onAddtoWishlist?: () => void;
    priority?: boolean;
}

export function GameCardSkeleton({ variant = "default", className }: { variant?: "default" | "large"; className?: string }) {
    const isLarge = variant === "large";
    const defaultWidth = isLarge ? "w-52 sm:w-64" : "w-38 sm:w-44 md:w-48";
    const footerPadding = isLarge ? "p-3 sm:p-5" : "p-2.5 sm:p-4";

    return (
        <div 
            className={cn(
                "relative flex flex-col rounded-none bg-[#080808] border border-[#7a6b4f]/22 animate-pulse overflow-hidden",
                className ? className : `shrink-0 ${defaultWidth} mb-6`
            )}
        >
            <div className="relative w-full aspect-3/4 bg-white/5" />

            <div className={`relative z-9 flex justify-between items-end bg-[#080808] ${footerPadding}`}>
                <div className="flex flex-wrap gap-2 mb-1 w-full">
                    <div className="h-3.5 sm:h-4 w-12 bg-white/5 rounded-none" />
                    <div className="h-3.5 sm:h-4 w-16 bg-white/5 rounded-none" />
                </div>
                
                <div className="shrink-0 w-6.5 h-6.5 sm:w-8 sm:h-8 rounded-none bg-white/5 mb-1" />
            </div>
        </div>
    );
}

export default function GameCard({
    game,
    variant = "default",
    className,
    onClick,
    onAddtoWishlist,
    priority = false,
}: GameCardProps) {
    const isLarge = variant === "large";
    const defaultWidth = isLarge ? "w-52 sm:w-60" : "w-38 sm:w-44 md:w-48";
    const titleSize = isLarge ? "text-[16px] sm:text-[20px]" : "text-[12px] sm:text-[14px]";

    return (
        <div
            className={cn(
                "relative flex flex-col rounded-none border border-[#7a6b4f]/22 hover:border-[#c4a97d]/34 shadow-[0_1px_0_rgba(196,169,125,0.05)_inset] overflow-visible group transition-all duration-500 ease-out cursor-pointer min-w-0",
                className ? className : `shrink-0 ${defaultWidth} mb-6`
            )}
        >
            {/* Bottom shadow bleed */}
            <div className="
                absolute -bottom-2 left-1/2 -translate-x-1/2
                w-full h-6 rounded-full pointer-events-none
                bg-radial from-[#c4a97d]/42 to-transparent blur-lg
                opacity-0 group-hover:opacity-100
                transition-opacity duration-500 ease-out"
            />

            {/* ── IMAGE SECTION ── */}
            <div className="relative w-full overflow-hidden aspect-3/4"
                onClick={onClick}
            >
                <Image
                    src={game.cover}
                    alt={game.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    priority={priority}
                />

                {/* Wishlist button – accessible on mobile by default, reveals on desktop hover */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onAddtoWishlist?.() 
                    }}
                    className="
                        absolute top-2 right-2 sm:top-3 sm:right-3 z-2
                        inline-flex items-center justify-center
                        w-6.5 h-6.5 sm:w-8 sm:h-8 rounded-none
                        text-[#c4a97d]
                        border border-[#c4a97d]/30
                        bg-black/60 backdrop-blur-md
                        opacity-90 md:opacity-0 md:group-hover:opacity-100
                        transition-all duration-300 ease-out
                        hover:bg-[#c4a97d]/15 hover:border-[#c4a97d]/60
                        focus:outline-none
                    "
                    aria-label="Add to wishlist"
                >
                    <Heart size={12} className="sm:w-3.5 sm:h-3.5" />
                </button>

                {/* Image fade at bottom – permanently subtle on mobile, deepens on desktop hover */}
                <div className="
                    absolute inset-x-0 bottom-0 h-20 sm:h-24 pointer-events-none 
                    bg-linear-to-t from-[#080808] via-[#080808]/75 to-transparent
                    opacity-100 md:opacity-0 md:translate-y-2 md:group-hover:opacity-100 md:group-hover:translate-y-0
                    transition-all duration-500 ease-out"
                />
            </div>

            {/* ── FOOTER ── */}
            <div className="absolute bottom-0 z-1 w-full flex flex-col justify-end p-2 sm:p-3.5 pointer-events-none">
                <div className="
                    flex flex-col gap-0.5 sm:gap-1
                    opacity-100 translate-y-0 md:opacity-0 md:translate-y-2
                    md:group-hover:opacity-100 md:group-hover:translate-y-0
                    transition-all duration-500 ease-out
                ">
                    <h3
                        className={`font-jk leading-[1.2em] font-medium text-[#f4efe4] truncate ${titleSize}`}
                        style={{ letterSpacing: "0.01em" }}
                    >
                        {game.title}
                    </h3>
                    {game.subtitle && (
                        <p className="text-[9.5px] sm:text-[11px] leading-[1.3em] text-white/50 font-jost truncate">
                            {game.subtitle}
                        </p>
                    )}
                </div>
            </div>

            {/* Premium feature: Subtle golden wash on image hover */}
            <div className="
                absolute inset-0 pointer-events-none z-1
                bg-linear-to-t from-[#7a6b4f]/12 to-transparent
                opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />

            {/* Golden bottom edge line */}
            <div className="
                absolute bottom-0 left-0 right-0 h-px z-1 pointer-events-none
                bg-linear-to-r from-transparent via-[#c4a97d]/58 to-transparent
                opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500
            " />
        </div>
    );
}