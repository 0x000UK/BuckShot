'use client'

import { motion } from 'motion/react'
import Image from 'next/image'
import { EASE } from '@/lib/utils'

const cinematicFadeUp = {
    initial: { opacity: 0, y: 30, filter: "blur(4px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: { duration: 0.8, ease: EASE }
}

export default function Hero() {
    return (
        <div className="relative h-[65svh] sm:h-[75svh] md:h-screen min-h-[460px] sm:min-h-[540px] md:min-h-[680px] w-full overflow-hidden flex flex-col justify-end bg-[#080808]">

            <div className="absolute inset-0">
                <Image
                    src="/images/heros/hero.jpg"
                    alt="Hero Cinematic Background"
                    fill
                    priority
                    className="object-cover object-center opacity-70 scale-105"
                />

                <div className="absolute inset-0 bg-linear-to-t from-[#080808] via-[#080808]/30 to-[#080808]/70" />
                <div className="absolute inset-0 bg-radial from-transparent via-[#080808]/10 to-[#080808]/85" />

                <div
                    className="absolute inset-0 opacity-[0.06] mix-blend-overlay pointer-events-none"
                    style={{
                        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"
                    }}
                />
            </div>

            {/* ── Mobile Layout */}
            <div className="md:hidden absolute bottom-0 left-0 right-0 px-6 sm:px-10 pb-8 sm:pb-12 flex flex-col items-start pointer-events-none select-none z-10">
                <motion.span
                    variants={cinematicFadeUp}
                    initial="initial"
                    animate="animate"
                    className="font-jost text-[#f4efe4]/80 font-light text-lg sm:text-2xl uppercase tracking-[0.25em]"
                >
                    Forge Your
                </motion.span>
                <motion.h1
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: EASE, delay: 0.08 }}
                    className="font-jk text-transparent bg-clip-text bg-linear-to-r from-[#c4a97d] via-[#f0e6d2] to-[#7a6b4f] font-extrabold tracking-tight text-6xl sm:text-7xl leading-[0.9] drop-shadow-[0_0_30px_rgba(196,169,125,0.2)] my-1"
                >
                    EPIC
                </motion.h1>

                <div className="flex items-baseline gap-2.5 mt-1">
                    <motion.span
                        variants={cinematicFadeUp}
                        initial="initial"
                        animate="animate"
                        className="font-jost text-[#f4efe4]/75 font-light text-sm sm:text-base uppercase tracking-[0.2em]"
                    >
                        Next
                    </motion.span>
                    <motion.span
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
                        className="font-jk text-[#c4a97d] font-bold text-3xl sm:text-4xl tracking-wider uppercase drop-shadow-[0_0_20px_rgba(196,169,125,0.15)]"
                    >
                        QUEST
                    </motion.span>
                </div>
            </div>

            {/* ── Desktop Layout (>= md): Dual Corner Split ── */}
            <div
                className="hidden md:flex absolute bottom-0 left-0 px-8 lg:px-16 xl:px-24 pb-12 lg:pb-16 flex-col items-start text-start pointer-events-none z-10"
            >
                <h1 className="font-jost leading-[0.9] tracking-tighter select-none">
                    <motion.span
                        variants={cinematicFadeUp}
                        initial="initial"
                        animate="animate"
                        className="block text-[#f4efe4]/90 font-light text-3xl md:text-4xl lg:text-5xl"
                    >
                        Forge Your
                    </motion.span>
                    <motion.span
                        initial={{ opacity: 0, x: -40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
                        className="block font-jk text-transparent bg-clip-text bg-linear-to-r from-[#c4a97d] via-[#e5d4b3] to-[#7a6b4f] font-extrabold tracking-tight md:text-8xl lg:text-9xl xl:text-[12rem] drop-shadow-[0_0_40px_rgba(196,169,125,0.15)] leading-none"
                    >
                        EPIC
                    </motion.span>
                </h1>
            </div>

            <div
                className="hidden md:flex absolute bottom-0 right-0 px-8 lg:px-16 xl:px-24 pb-12 lg:pb-16 flex-col items-end text-right pointer-events-none z-10"
            >
                <h2 className="font-jost leading-[0.85] tracking-tighter select-none">
                    <motion.span
                        variants={cinematicFadeUp}
                        initial="initial"
                        animate="animate"
                        className="block text-[#f4efe4]/90 font-light text-3xl md:text-4xl lg:text-5xl"
                    >
                        Next
                    </motion.span>
                    <motion.span
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
                        className="block font-jk text-transparent bg-clip-text bg-linear-to-r from-[#c4a97d] via-[#e5d4b3] to-[#7a6b4f] font-extrabold tracking-tight md:text-8xl lg:text-9xl xl:text-[12rem] drop-shadow-[0_0_40px_rgba(196,169,125,0.15)] leading-none"
                    >
                        QUEST
                    </motion.span>
                </h2>
            </div>
        </div>
    );
}