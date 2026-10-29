"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { AgeRating, type AdditionalContent} from "@/types/game";
import { jsonToHTML } from "../admin/gameModel/TextEditor";
import { BRAND, cn } from "@/lib/utils";
import type { GameData } from "@/lib/game";
import { Heart, Share2, Check } from "lucide-react";
import { toggleWishlist } from "@/app/actions/wishlist.actions";
import { toast } from "@/stores/alertStore";

const RATING_LOGOS: Partial<Record<AgeRating, string>> = {
    "M"      : "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/ESRB_2013_Mature.svg/960px-ESRB_2013_Mature.svg.png",
    "T"      : "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/ESRB_2013_Teen.svg/960px-ESRB_2013_Teen.svg.png",
    "E"      : "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/ESRB_2013_Everyone.svg/960px-ESRB_2013_Everyone.svg.png",
    "AO"     : "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/ESRB_2013_Adults_Only_18%2B.svg/960px-ESRB_2013_Adults_Only_18%2B.svg.png",
    "PEGI 18": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/PEGI_18.svg/960px-PEGI_18.svg.png",
    "PEGI 16": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/PEGI_16.svg/960px-PEGI_16.svg.png",
    "PEGI 12": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/PEGI_12.svg/960px-PEGI_12.svg.png",
    "PEGI 7" : "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/PEGI_7.svg/960px-PEGI_7.svg.png",
    "PEGI 3" : "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/PEGI_3.svg/960px-PEGI_3.svg.png",
    "IARC 18": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/IARC_18%2B.svg/960px-IARC_18%2B.svg.png",
    "IARC 16": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/IARC_16%2B.svg/960px-IARC_16%2B.svg.png",
    "IARC 12": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/IARC_12%2B.svg/960px-IARC_12%2B.svg.png",
    "IARC 7" : "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IARC_7%2B.svg/960px-IARC_7%2B.svg.png",
    "IARC 3" : "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/IARC_3%2B.svg/960px-IARC_3%2B.svg.png"
};

function SectionHeading({ text, className = "" }: { text: string; className?: string }) {
    return (
        <h3
            className={`text-[12px] tracking-[0.2em] uppercase font-medium ${className} font-jost`}
            style={{ color: `${BRAND}` }}
        >
            {text}
        </h3>
    );
}

function FieldRow({ label, value, wrap = false }: { label: string; value?: string | number | string[], wrap?: boolean }) {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;

    return (
        <div
            className="flex justify-between items-start py-4 text-[13px] border-b border-white/5 gap-4"
            style={{ fontFamily: "'Jost', sans-serif" }}
        >
            <span className="tracking-widest text-white/40 uppercase text-[10px] shrink-0 mt-0.5">
                {label}
            </span>
            
            <div className="text-white/80 font-light text-right flex flex-col items-end gap-1 max-w-[70%]">
                {Array.isArray(value) ? (
                    wrap ? (
                        value.map((item, index) => (
                            <span key={index} className="wrap-break-word text-right w-full">
                                {item}
                            </span>
                        ))
                    ) : (
                        <span className="text-right">{value.join(", ")}</span>
                    )
                ) : (
                    <span className="wrap-break-word text-right">{value}</span>
                )}
            </div>
        </div>
    );
}

function SpecRow({ label, minimum, recommended }: { label: string; minimum?: string; recommended?: string }) {
    if (!minimum && !recommended) return null;
    return (
        <div
            className="grid grid-cols-[150px_1fr_1fr] sm:grid-cols-[180px_1fr_1fr] md:grid-cols-[250px_1fr_1fr] py-4 gap-6 border-b border-white/5"
            style={{ fontFamily: "'Jost', sans-serif" }}
        >
            <span className="text-[10px] tracking-widest uppercase text-white/40 self-start pt-0.5">{label}</span>
            <span className="text-[13px] leading-relaxed text-white/60 pr-2 whitespace-pre-line font-light wrap-break-word">{minimum || "—"}</span>
            <span className="text-[13px] leading-relaxed text-white/90 whitespace-pre-line font-light wrap-break-word">{recommended || "—"}</span>
        </div>
    );
}

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

interface DetailsTabProps {
    game: GameData;
    currentUser?: {
        id?: string;
        handle?: string;
        role?: string;
        badges?: string[];
    } | null;
    initialInWishlist?: boolean;
    className?: string;
}

export default function DetailsTab({
    game,
    currentUser,
    initialInWishlist = false,
    className,
}: DetailsTabProps) {
    const reqPlatforms = game.requirements ? (Object.keys(game.requirements) as string[]) : [];
    const [selectedPlatform, setSelectedPlatform] = useState<string>(reqPlatforms[0] || "PC");
    const activeRequirements = game.requirements?.[selectedPlatform];

    const [inWishlist, setInWishlist] = useState<boolean>(initialInWishlist);
    const [isWishlistLoading, setIsWishlistLoading] = useState<boolean>(false);
    const [copied, setCopied] = useState<boolean>(false);

    useEffect(() => {
        setInWishlist(Boolean(initialInWishlist));
    }, [initialInWishlist]);

    const handleWishlistToggle = async () => {
        if (!currentUser?.id) {
            toast.info("Sign in required", "Please sign in to save games to your wishlist.");
            return;
        }

        const prev = inWishlist;
        const next = !prev;
        setInWishlist(next);
        setIsWishlistLoading(true);

        try {
            const res = await toggleWishlist(game.id || "");
            if (res.success) {
                setInWishlist(res.inWishlist);
                if (res.inWishlist) {
                    toast.success("Added to Wishlist", `${game.title} has been added to your wishlist.`);
                } else {
                    toast.info("Removed from Wishlist", `${game.title} has been removed from your wishlist.`);
                }
            } else {
                setInWishlist(prev);
                toast.error("Wishlist", res.error || "Failed to update wishlist.");
            }
        } catch (err: unknown) {
            setInWishlist(prev);
            toast.error("Wishlist", err instanceof Error ? err.message : "Failed to update wishlist.");
        } finally {
            setIsWishlistLoading(false);
        }
    };

    const handleShare = async () => {
        const url = typeof window !== "undefined" ? window.location.href : "";
        if (navigator.share) {
            try {
                await navigator.share({
                    title: game.title,
                    text: game.synopsis || `Check out ${game.title}`,
                    url,
                });
                return;
            } catch (err: unknown) {
                if (err && typeof err === "object" && "name" in err && err.name === "AbortError") {
                    return;
                }
            }
        }

        if (navigator.clipboard) {
            try {
                await navigator.clipboard.writeText(url);
                setCopied(true);
                toast.success("Link copied", "Game link copied to clipboard.");
                setTimeout(() => setCopied(false), 2500);
            } catch {
                toast.error("Share", "Failed to copy link to clipboard.");
            }
        }
    };

    const metaFields = [
        { label: "Developer", value: game.developer },
        { label: "Publisher", value: game.publisher },
        { label: "Franchise", value: game.franchise },
        {
            label: "Release Date",
            value: game.releaseDate
                ? new Date(game.releaseDate).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
                : undefined,
        },
        {
            label: "Genre",
            value: game.genreDetails && game.genreDetails.length > 0
                ? game.genreDetails.map((g) => g.name).join(", ")
                : (Array.isArray(game.genres) ? game.genres.join(", ") : game.genres),
        },
        { label: "Version", value: game.version },
    ];

    return (
        <div className={cn("flex flex-col pb-16" , className)}>
            <div className="w-full max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-16 lg:gap-24">
                <div className="space-y-12">
                    {game.edition && (
                        <div className="pt-4 border-t border-white/5">
                            <SectionHeading text="Editions" className="mb-6 mt-6" />
                            <div
                                className="text-[14px] leading-[1.9] font-light tracking-wide text-white/70"
                                style={{ fontFamily: "'Jost', sans-serif" }}
                                dangerouslySetInnerHTML={{ __html: jsonToHTML(game.edition) }}
                            />
                        </div>
                    )}
                    {game.description && (
                        <div>
                            <SectionHeading text="About" className="mb-6" />
                            <div
                                className="text-[14px] leading-[1.9] font-light tracking-wide text-white/70"
                                style={{ fontFamily: "'Jost', sans-serif" }}
                                dangerouslySetInnerHTML={{ __html: jsonToHTML(game.description) }}
                            />
                        </div>
                    )}

                    {/* System Requirements */}
                    <div className="pt-6 border-t border-white/5">
                        <div className="flex flex-wrap gap-y-4 justify-between items-baseline border-b border-white/5 pb-4">
                            <SectionHeading text="System Requirements" className="mb-2" />
                            {reqPlatforms.length > 1 && (
                                <div className="flex gap-2 text-[10px] tracking-wider uppercase font-medium">
                                    {reqPlatforms.map((platform) => (
                                         <button
                                            key={platform}
                                            onClick={() => setSelectedPlatform(platform)}
                                            className="px-4 py-1 transition-colors duration-200 border rounded-none"
                                            style={{
                                                fontFamily: "'Jost', sans-serif",
                                                backgroundColor: selectedPlatform === platform ? `${BRAND}20` : "transparent",
                                                color: selectedPlatform === platform ? BRAND : "rgba(255,255,255,0.3)",
                                                border: `1px solid ${selectedPlatform === platform ? `${BRAND}40` : "transparent"}`,
                                            }}
                                        >
                                            {platform}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {activeRequirements ? (
                            <div className="mt-4">
                                <div className="grid grid-cols-[150px_1fr_1fr] sm:grid-cols-[180px_1fr_1fr] md:grid-cols-[250px_1fr_1fr]  text-[10px] tracking-[0.14em] uppercase pb-4 gap-6 border-b border-[#c4a97d]/25 font-jost">
                                    <span />
                                    <span className="font-medium text-white/90">Minimum</span>
                                    <span className="font-medium text-white/90">Recommended</span>
                                </div>
                                <div className="flex flex-col">
                                    {activeRequirements.minimum.architecture && activeRequirements.recommended.architecture && 
                                    (<SpecRow label="Architecture" minimum={activeRequirements.minimum.architecture} recommended={activeRequirements.recommended.architecture} />)}
                                    <SpecRow label="OS" minimum={activeRequirements.minimum.os} recommended={activeRequirements.recommended.os} />
                                    <SpecRow label="Processor" minimum={activeRequirements.minimum.cpu} recommended={activeRequirements.recommended.cpu} />
                                    <SpecRow label="Memory" minimum={activeRequirements.minimum.ram} recommended={activeRequirements.recommended.ram} />
                                    <SpecRow label="Graphics" minimum={activeRequirements.minimum.gpu} recommended={activeRequirements.recommended.gpu} />
                                    <SpecRow label="Storage" minimum={activeRequirements.minimum.storage} recommended={activeRequirements.recommended.storage} />
                                    {activeRequirements.minimum.directX && activeRequirements.recommended.directX && 
                                    (<SpecRow label="DirectX" minimum={activeRequirements.minimum.directX} recommended={activeRequirements.recommended.directX} />)}
                                    {activeRequirements.minimum.soundcard && activeRequirements.recommended.soundcard && 
                                    (<SpecRow label="Sound Card" minimum={activeRequirements.minimum.soundcard} recommended={activeRequirements.recommended.soundcard} />)}
                                    {activeRequirements.minimum.network && activeRequirements.recommended.network && 
                                    (<SpecRow label="Network" minimum={activeRequirements.minimum.network} recommended={activeRequirements.recommended.network} />)}
                                    {activeRequirements.minimum.others && activeRequirements.recommended.others && 
                                    (<SpecRow label="Other" minimum={activeRequirements.minimum.others} recommended={activeRequirements.recommended.others} />)}
                                    {activeRequirements.minimum.notes && activeRequirements.recommended.notes && 
                                    (<SpecRow label="Additional Notes" minimum={activeRequirements.minimum.notes} recommended={activeRequirements.recommended.notes} />)}
                                </div>
                            </div>
                        ) : (
                            <div className="text-[12px] font-light text-white/30 pt-6 tracking-wide font-['Jost',sans-serif]">
                                System requirement information is unavailable for this entry.
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-10">

                    {/* Game Typography / Logo & Age Rating Block */}
                    <div className="hidden lg:flex flex-col items-start gap-6 border-b border-white/5 pb-8">
                        {game.logo?.url && (
                            <div className="relative w-full items-center mx-auto h-24">
                                <Image
                                    src={game.logo.url}
                                    alt={game.logo.title || 'logo'}
                                    fill
                                    className="object-contain object-center"
                                    sizes="(max-width: 768px) 100vw, 400px"
                                />
                            </div>
                        )}

                        {game.ageRating && (
                            <div className="w-full border mx-auto border-white/10 bg-white/2 flex items-center gap-6 p-4 rounded-none">
                                {RATING_LOGOS[game.ageRating] ? (
                                    <div className="relative w-14 h-20 shrink-0 rounded-none">
                                        <Image
                                            src={RATING_LOGOS[game.ageRating]!}
                                            alt={`Rated ${game.ageRating}`}
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-12 h-16 shrink-0 border border-white/20 flex items-center justify-center font-['Jost',sans-serif] text-white/80 font-bold text-sm bg-black">
                                        {game.ageRating}
                                    </div>
                                )}
                                <div className="flex flex-col w-full gap-1.5 font-jost">
                                    <div className="w-full border-b border-white/20 pb-2">
                                        <span className="text-[20px] font-bold tracking-widest">{game.age}+</span>
                                    </div>
                                    <p className="text-[11px] font-light text-white/50 leading-relaxed max-w-[90%] uppercase tracking-wider mt-1">
                                        {game.descriptors?.length 
                                        ? game.descriptors.join(" • ") 
                                        : "No content descriptors"}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Meta Specifications */}
                    <div>
                        <SectionHeading text="Game Specifications" className="mb-4" />
                        <div className="grid grid-cols-1 gap-x-12">
                            {metaFields.map((f) => f.value && <FieldRow key={f.label} label={f.label} value={f.value}/>)}
                        </div>

                        {/* Action Buttons: Wishlist & Share */}
                        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row gap-3">
                            <button
                                type="button"
                                onClick={handleWishlistToggle}
                                disabled={isWishlistLoading}
                                className={cn(
                                    "flex-1 inline-flex items-center justify-center gap-2.5 py-3 px-4 font-jost text-xs uppercase tracking-[0.16em] transition-all duration-200 border cursor-pointer select-none rounded-none disabled:opacity-60",
                                    inWishlist
                                        ? "bg-[#c4a97d]/15 border-[#c4a97d] text-[#c4a97d] shadow-[0_0_20px_rgba(196,169,125,0.12)]"
                                        : "bg-black/60 border-[#7a6b4f]/35 text-white/80 hover:text-white hover:border-[#c4a97d]/60 hover:bg-[#c4a97d]/5"
                                )}
                            >
                                <Heart
                                    size={15}
                                    className={cn(
                                        "transition-colors duration-200",
                                        inWishlist ? "fill-[#c4a97d] text-[#c4a97d]" : "text-white/70"
                                    )}
                                />
                                <span>{inWishlist ? "In Wishlist" : "Add to Wishlist"}</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleShare}
                                className="flex-1 inline-flex items-center justify-center gap-2.5 py-3 px-4 font-jost text-xs uppercase tracking-[0.16em] transition-all duration-200 border border-[#7a6b4f]/35 bg-black/60 text-white/80 hover:text-white hover:border-[#c4a97d]/60 hover:bg-[#c4a97d]/5 cursor-pointer select-none rounded-none"
                            >
                                {copied ? <Check size={15} className="text-[#c4a97d]" /> : <Share2 size={15} className="text-white/70" />}
                                <span>{copied ? "Link Copied" : "Share"}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
