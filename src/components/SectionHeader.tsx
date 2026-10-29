import { motion } from "motion/react";
import { BRAND, BRAND_GOLD, BRAND_LIGHT, EASE } from "@/lib/utils"
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Select } from "./admin/gameModel/utils";

type Props = {
    title?: string;
    nav?: {
        onScroll?: (dir: 'left' | 'right') => void
        onPrev?: () => void;
        onNext?: () => void;
        count?: string;
    }
    exploreLink?: string
    filters? : {
        sortBy : string, // 'default' | 'title' | 'createdAt'
        sortByOptions : {value : string, label : string}[] 
        onChangeSortBy : (v:string)=>void,
        sortOrder : string // 'none' | 'asc' | 'desc' 
        sortOrderOptions : {value : string , label : string}[]
        onChangeSortOrder : (v:string)=> void
    }
};

export default function SectionHeader({
    title,
    nav,
    exploreLink,
    filters
}: Props) {
    return (
        <div className="flex items-end justify-between gap-6 my-2 flex-wrap">
            {title && 
            <div className="min-w-0">
                <motion.h2
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
                    className="font-jk text-[20px] md:text-xl uppercase tracking-wide"
                    style={{ color: "#f4efe4" }}
                >
                    {title}
                </motion.h2>
            </div>}
            <div className="flex gap-3">
                {filters && (
                    <div className="flex gap-3 items-center">
                        {/* <span className="text-[12px] text-nowrap items-center">Sort By : </span> */}
                        <Select
                            value={filters.sortBy}
                            onChange={filters.onChangeSortBy}
                            options={filters.sortByOptions}
                            placeholder="Sort By"
                            className="min-w-32"
                        />
                        
                        {/* <span className="text-[12px] text-nowrap items-center">Order By : </span> */}
                        <Select
                            value={filters.sortOrder}
                            onChange={filters.onChangeSortOrder}
                            options={filters.sortOrderOptions}
                            placeholder="Order By"
                            className="min-w-28"
                        />
                    </div>
                )}
                {exploreLink && (
                    <Link
                        href={exploreLink}
                        className="
                            hidden sm:flex items-center gap-2 h-10 px-4 rounded-none
                            text-[10px] font-semibold tracking-[0.2em] uppercase
                            text-accent border border-secondary/30
                            hover:bg-secondary/10 hover:border-accent/60 hover:text-white
                            transition-all duration-200
                        "
                    >
                        Explore All
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                )}
                {nav && (
                    <div className="flex items-center gap-2">
                        <NavArrow dir="left" onClick={
                            () => {
                                if (nav.onScroll) nav.onScroll('left')
                                if (nav.onPrev) nav.onPrev()
                            }
                        } />
                        <NavArrow dir="right" onClick={
                            () => {
                                if (nav.onScroll) nav.onScroll('right')
                                if (nav.onNext) nav.onNext()
                            }
                        } />
                    </div>
                )}
            </div>

        </div>
    );
}

function NavArrow({ dir, onClick }: { dir: "left" | "right"; onClick: () => void }) {
    return (
        <motion.button
            onClick={onClick}
            whileHover={{ borderColor: BRAND_GOLD, color: BRAND_GOLD }}
            whileTap={{ scale: 0.94 }}
            className="relative w-10 h-10 flex items-center justify-center transition-colors cursor-pointer"
            style={{
                border: `1px solid ${BRAND}66`,
                background: `${BRAND}0a`,
                color: BRAND_LIGHT,
            }}
        >
            <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                style={{ transform: dir === "left" ? "rotate(180deg)" : "none" }}
            >
                <path
                    d="M3 7h8M8 4l3 3-3 3"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="square"
                />
            </svg>
        </motion.button>
    );
}
