'use client'
import { easeIn, easeOut, motion } from 'motion/react'

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 30},
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ...easeOut },
})

export default function Hero() {
    return (
        <div className="relative min-h-screen w-full overflow-hidden flex flex-col bg-[#080808]">

            {/* ── Background Layers ── */}
            <div className="absolute inset-0 z-0 bg-cover bg-center opacity-50"
                style={{ backgroundImage: "url('/images/heros/hero4.jpg')" }} />
            
            <div className="absolute inset-0 z-1 bg-linear-to-b from-transparent from-70% to-[#080808]" />
            <div className="absolute inset-0 z-1 bg-linear-to-r from-[#080808] to-transparent" />
            {/* <div className="absolute inset-0 z-1 bg-[radial-gradient(ellipse_at_center,transparent,rgba(8,8,8)_60%)]" /> */}



            {/* Left vertical accent line */}
            <div className="absolute left-12 top-0 bottom-0 w-px z-1 pointer-events-none opacity-50 bg-linear-to-b from-transparent via-[#7a6b4f] to-transparent" />

            {/* Corner brackets */}
            <div className="absolute top-7 right-10 w-9 h-9 border-t border-r border-[#7a6b4f] opacity-25 z-1 pointer-events-none" />
            <div className="absolute bottom-22 right-10 w-9 h-9 border-b border-r border-[#7a6b4f] opacity-25 z-1 pointer-events-none" />

            {/* ── Hero Content ── */}
            <div className="relative z-10 flex-1 flex flex-col justify-center px-24 pr-8 my-16 max-w">
                {/* Headline stack */}
                <motion.div
                    // {...fadeUp(0.25)}
                    className="tracking-[0.025em] m-0"
                    style={{ lineHeight: 0.9 }}
                >
                    <motion.span 
						initial = {{opacity : 1, x : -700}}
						animate = {{opacity : 1, x : 0}}
						transition={{duration: 0.6}}
						className="block text-[rgba(255,255,255,0.35)]" 
                        style={{ fontSize: 'clamp(56px,9vw,108px)' }}>
                        Your Next
                    </motion.span>
                    <motion.span 
						initial = {{opacity : 0}}
						animate = {{opacity : 1}}
						transition={{duration: 2, ease: easeIn , delay: 0.6}}
						
						className="block text-[rgb(196,169,125)] font-extrabold font-jk" 
                        style={{ fontSize: 'clamp(76px,12.5vw,152px)' }}>
                        EPIC QUEST
                    </motion.span>
                    <motion.span 
						initial = {{opacity : 1, x : -700}}
						animate = {{opacity : 1, x : 0}}
						transition={{duration: 0.6}}
						className="block text-transparent [-webkit-text-stroke:1px_rgba(196,169,125,0.5)]"
                        style={{ fontSize: 'clamp(56px,9vw,108px)' }}>
                        Awaits
                    </motion.span>
                </motion.div>

                {/* Subtext */}
                <motion.p
                    {...fadeUp(0.4)}
                    className="mt-8 max-w-md text-[15px] font-light leading-[1.75] text-white/50 tracking-[0.03em]"
                >
                    Explore a massive collection of games across every genre and begin your next adventure today.
                </motion.p>

                {/* Search bar */}
                <motion.div
                    {...fadeUp(0.52)}
                    className="flex items-center mt-10 max-w-130 border border-white/10 bg-[rgba(8,8,8,0.55)] backdrop-blur-md"
                >
                    <span className="flex items-center px-4 text-[#7a6b4f] text-[17px]">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                        </svg>
                    </span>

                    <input
                        placeholder="Open World , Cyberpunk etc..."
                        className="flex-1 bg-transparent border-none outline-none py-3.75 px-2 font-['Jost',sans-serif] text-[13px] font-light tracking-[0.04em] text-white placeholder:text-white/50"
                    />

                    <motion.button
                        whileHover={{ backgroundColor: '#c4a97d' }}
                        whileTap={{ scale: 0.98 }}
                        className="py-3.75 px-7 bg-[#7a6b4f] border-none font-['Jost',sans-serif] text-[11px] font-medium tracking-[0.22em] uppercase text-black/75 cursor-pointer transition-colors duration-200 whitespace-nowrap"
                    >
                        Explore →
                    </motion.button>
                </motion.div>
            </div>
        </div>
    )
}