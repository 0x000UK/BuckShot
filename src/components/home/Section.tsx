"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { EASE, cn } from "@/lib/utils";

export interface SectionProps {
    id?: string;
    title: string;
    eyebrow?: string;
    subtitle?: string;
    exploreLink?: string;
    exploreLabel?: string;
    children: React.ReactNode;
    className?: string;
    headerClassName?: string;
    headerRight?: React.ReactNode;
    animate?: boolean;
}

export default function Section({
    id,
    title,
    eyebrow,
    subtitle,
    exploreLink,
    exploreLabel = "Explore All",
    children,
    className,
    headerClassName,
    headerRight,
    animate = true,
}: SectionProps) {
    const HeaderWrapper = animate ? motion.div : "div";
    const animationProps = animate
        ? {
              initial: { opacity: 0, y: 16 },
              whileInView: { opacity: 1, y: 0 },
              viewport: { once: true, margin: "-40px" },
              transition: { duration: 0.7, ease: EASE },
          }
        : {};

    return (
        <section
            id={id}
            className={cn(
                "relative w-full max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16 lg:py-20",
                className
            )}
        >
            <HeaderWrapper
                {...animationProps}
                className={cn(
                    "flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 md:mb-12",
                    headerClassName
                )}
            >
                <div className="min-w-0 max-w-2xl">
                    {/* {eyebrow && (
                        <div className="flex items-center gap-2 mb-2.5">
                            <span className="w-1.5 h-1.5 bg-[#c4a97d] rounded-none shrink-0" />
                            <span className="font-mono text-[10px] md:text-[11px] font-semibold tracking-[0.28em] uppercase text-[#c4a97d]">
                                {eyebrow}
                            </span>
                        </div>
                    )} */}
                    <h2 className="font-jk text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#f4efe4] tracking-tight leading-[1.05]">
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="font-jost text-sm md:text-base text-[#e8e2d2]/70 mt-2.5 leading-relaxed">
                            {subtitle}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-4 shrink-0">
                    {headerRight}
                    {exploreLink && (
                        <Link
                            href={exploreLink}
                            className="group inline-flex items-center gap-2.5 px-4 md:px-5 py-2.5 md:py-3 text-[10px] md:text-[11px] font-jost font-semibold tracking-[0.2em] uppercase rounded-none border border-[#7a6b4f]/30 hover:border-[#c4a97d] bg-[#0d0c0a]/60 hover:bg-[#c4a97d]/10 text-[#c4a97d] transition-all duration-300 shadow-[0_0_20px_rgba(196,169,125,0.04)] hover:shadow-[0_0_25px_rgba(196,169,125,0.12)] cursor-pointer"
                        >
                            <span>{exploreLabel}</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                        </Link>
                    )}
                </div>
            </HeaderWrapper>

            <div className="relative w-full">{children}</div>
        </section>
    );
}

export function SectionSkeleton({
    hasEyebrow = true,
    hasSubtitle = false,
    hasButton = true,
    children,
    className,
}: {
    hasEyebrow?: boolean;
    hasSubtitle?: boolean;
    hasButton?: boolean;
    children?: React.ReactNode;
    className?: string;
}) {
    return (
        <section
            className={cn(
                "relative w-full max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16 lg:py-20",
                className
            )}
        >
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 md:mb-12 animate-pulse">
                <div className="space-y-2.5">
                    {hasEyebrow && (
                        <div className="flex items-center gap-2 mb-2.5">
                            <div className="w-1.5 h-1.5 bg-white/10 rounded-none shrink-0" />
                            <div className="h-3 w-28 bg-white/10 rounded-none" />
                        </div>
                    )}
                    <div className="h-10 md:h-14 w-60 md:w-80 bg-white/10 rounded-none" />
                    {hasSubtitle && (
                        <div className="h-4 w-72 md:w-96 bg-white/5 rounded-none mt-2.5" />
                    )}
                </div>
                {hasButton && (
                    <div className="h-10 md:h-11 w-32 md:w-36 bg-white/5 border border-white/10 rounded-none shrink-0" />
                )}
            </div>
            <div className="relative w-full">{children}</div>
        </section>
    );
}
