'use client'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'motion/react'

const EASE        = [0.22, 1, 0.36, 1] as const

const NAV_LINKS = [
    { label: 'Store', href: '/store' },
    { label: 'Trending', href: '/t/trending' },
    { label: 'Exclusives', href: '/t/exclusive' },
    { label: 'New Releases', href: '/t/new-release' },
    { label: 'Upcoming', href: '/t/upcoming' },
]
const LEGAL_LINKS = [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Use', href: '/terms' },
]

const fadeUp = (delay = 0) => ({
    initial:    { opacity: 0, y: 16 },
    whileInView:{ opacity: 1, y: 0 },
    viewport:   { once: true, margin: '-40px' },
    transition: { duration: 0.7, delay, ease: EASE },
})

export default function Footer() {
    return (
        <footer
            id="footer"
            className=" relative bg-[#080808] border-t border-[#7a6b4f]/20"
        >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 px-6 sm:px-12 md:px-16 py-10 sm:py-14">

                <motion.div {...fadeUp(0)} className="flex items-center gap-4">
                    <Link href="/">
                        <Image
                            src="/images/logo_4x.png"
                            alt="BuckShot"
                            width={200}
                            height={200}
                            className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                            style={{ filter: 'brightness(0.82) sepia(0.2)', opacity: 0.85 }}
                        />
                    </Link>
                </motion.div>

                {/* Right — nav links */}
                <motion.nav {...fadeUp(0.15)} className="w-full sm:w-auto">
                    <ul className="flex items-center gap-4 sm:gap-8 md:gap-10 list-none m-0 p-0 flex-wrap">
                        {NAV_LINKS.map((link) => (
                            <li key={link.label}>
                                <Link
                                    href={link.href}
                                    className="font-jost text-[11px] font-normal tracking-[0.15em] uppercase text-white/40 hover:text-[#c4a97d] transition-colors cursor-pointer"
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </motion.nav>
            </div>

            {/* ── Bottom bar ───────────────────────────────────────────── */}
            <motion.div
                {...fadeUp(0.25)}
                className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 sm:px-12 md:px-16 py-5 sm:py-4 border-t border-white/5 text-center sm:text-left"
            >
                {/* Copyright */}
                <span className="font-jost text-[10px] font-light tracking-[0.1em] text-white/20">
                    © 2026 BuckShot. All rights reserved.
                </span>

                {/* Legal links */}
                <div className="flex items-center gap-1">
                    {LEGAL_LINKS.map((link, i) => (
                        <span key={link.label} className="flex items-center">
                            {i > 0 && (
                                <span className="text-white/10 mx-2.5 text-[10px]">
                                    ·
                                </span>
                            )}
                            <Link
                                href={link.href}
                                className="font-jost text-[10px] font-normal tracking-[0.12em] uppercase text-white/30 hover:text-[#c4a97d] transition-colors cursor-pointer"
                            >
                                {link.label}
                            </Link>
                        </span>
                    ))}
                </div>
            </motion.div>
        </footer>
    )
}