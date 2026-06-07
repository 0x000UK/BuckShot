'use client'
import Image from 'next/image'
import { motion } from 'motion/react'

const EASE        = [0.22, 1, 0.36, 1] as const

const NAV_LINKS   = ['Backup Site', 'Troubleshooting', 'Contacts', 'Community']
const LEGAL_LINKS = ['Privacy', 'Terms']

const fadeUp = (delay = 0) => ({
    initial:    { opacity: 0, y: 16 },
    whileInView:{ opacity: 1, y: 0 },
    viewport:   { once: true, margin: '-40px' },
    transition: { duration: 0.7, delay, ease: EASE },
})

export default function Footer() {
    return (
        <footer
            className="bg-[#080808] border-t border-[#7a6b4f]/20"
        >
            <div className="flex items-center justify-between px-16 py-14">

                <motion.div {...fadeUp(0)} className="flex items-center gap-4">
                    <Image
                        src="/logo_4x.png"
                        alt="BuckShot"
                        width={200}
                        height={200}
                        className="w-12 h-12 object-contain"
                        style={{ filter: 'brightness(0.82) sepia(0.2)', opacity: 0.85 }}
                    />
                </motion.div>

                {/* Right — nav links */}
                <motion.nav {...fadeUp(0.15)}>
                    <ul className="flex items-center gap-10 list-none m-0 p-0">
                        {NAV_LINKS.map((link) => (
                            <li key={link}>
                                <a
                                    href="#"
                                    style={{
                                        fontFamily: "'Jost', sans-serif",
                                        fontSize: 11,
                                        fontWeight: 400,
                                        letterSpacing: '0.15em',
                                        textTransform: 'uppercase',
                                        textDecoration: 'none',
                                        color: 'rgba(255,255,255,0.3)',
                                        transition: 'color 0.2s',
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
                                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
                                >
                                    {link}
                                </a>
                            </li>
                        ))}
                    </ul>
                </motion.nav>
            </div>

            {/* ── Bottom bar ───────────────────────────────────────────── */}
            <motion.div
                {...fadeUp(0.25)}
                className="flex items-center justify-between px-16 py-4"
                style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
            >
                {/* Copyright */}
                <span style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: 10,
                    fontWeight: 300,
                    letterSpacing: '0.1em',
                    color: 'rgba(255,255,255,0.18)',
                }}>
                    © {new Date().getFullYear()} BuckShot. All rights reserved.
                </span>

                {/* Legal links */}
                <div className="flex items-center gap-1">
                    {LEGAL_LINKS.map((link, i) => (
                        <span key={link} className="flex items-center">
                            {i > 0 && (
                                <span style={{ color: 'rgba(255,255,255,0.1)', margin: '0 10px', fontSize: 10 }}>
                                    ·
                                </span>
                            )}
                            <a
                                href="#"
                                style={{
                                    fontFamily: "'Jost', sans-serif",
                                    fontSize: 10,
                                    fontWeight: 400,
                                    letterSpacing: '0.12em',
                                    textTransform: 'uppercase',
                                    textDecoration: 'none',
                                    color: 'rgba(255,255,255,0.18)',
                                    transition: 'color 0.2s',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
                                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.18)')}
                            >
                                {link}
                            </a>
                        </span>
                    ))}
                </div>
            </motion.div>
        </footer>
    )
}