'use client'

import { useEffect, useState } from 'react'
import { motion, useScroll, useTransform, AnimatePresence, useMotionValueEvent } from 'motion/react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useAuthUIStore } from '@/stores/authuiStore'
import { Menu, X, Search } from 'lucide-react'
import { usePathname } from 'next/navigation'
import SearchBar from './SearchBar'

const NAV_LINKS = ['Store', 'Library', 'Deals', 'Community']
const EASE = [0.22, 1, 0.36, 1] as const

export default function Nav() {
    const [heroH, setHeroH] = useState(800)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [navHidden, setNavHidden] = useState(false)
    const [containerPadding, setContainerPadding] = useState('4rem')
    
    const pathname = usePathname()
    const isHomepage = pathname === '/' || pathname.startsWith('/g/')
    const { scrollY } = useScroll()

    // Responsive Margin Matrix Calculator 
    useEffect(() => {
        const measure = () => {
            setHeroH(window.innerHeight)
            if (window.innerWidth < 640) {
                setContainerPadding('2rem')  // maps to px-8
            } else {
                setContainerPadding('4rem')  // maps to sm:px-16
            }
        }
        measure() 
        window.addEventListener('resize', measure)
        return () => window.removeEventListener('resize', measure)
    }, [])

    // Scroll-driven motion configuration
    const navBg = useTransform(
        scrollY,
        [heroH * 0.45, heroH * 0.9],
        isHomepage
            ? ['rgba(8,8,8,0)', 'rgba(8,8,8,0.95)']
            : ['rgba(8,8,8,0.95)', 'rgba(8,8,8,0.95)']
    )

    const borderAlpha = useTransform(
        scrollY,
        [heroH * 0.72, heroH * 0.98],
        isHomepage ? [0, 1] : [1, 1]
    )

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious() || 0
        const scrollingDown = latest > previous
        const hideThreshold = isHomepage ? heroH + 120 : 50

        if (latest < hideThreshold) {
            setNavHidden(false)
            return
        }
        // Force header open if search exploration is active
        if (isSearchOpen) {
            setNavHidden(false)
            return
        }
        setNavHidden(scrollingDown)
    })

    const { data, status } = useSession()
    const openAuth = useAuthUIStore((state) => state.openAuth)
    
    const handleAuthOpen = () => {
        if (status === 'unauthenticated') openAuth()
    }

    useEffect(() => {
        if (isSidebarOpen) document.body.style.overflow = 'hidden'
        else document.body.style.overflow = 'auto'
        return () => { document.body.style.overflow = 'auto' }
    }, [isSidebarOpen])

    return (
        <div className='bg-background/5'>
            <motion.nav
                animate={{ y: navHidden ? '-100%' : '0%' }}
                transition={{ duration: 0.6, ease: EASE }}
                style={{ backgroundColor: navBg }}
                className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-8 sm:px-16 h-22 border-b border-transparent"
            >
                {/* Dynamic Accent Border Row  */}
                <motion.div
                    style={{ opacity: borderAlpha, background: `linear-gradient(to right, transparent, rgba(196,169,125,0.35), transparent)` }}
                    className="pointer-events-none absolute bottom-0 left-0 right-0 h-px"
                />

                {/* Menu & Alternate Logo Crossfade */}
                <div className="flex-1 flex justify-start items-center relative z-30 h-full">
                    
                    {/* Burger Menu */}
                    <motion.button 
                        animate={{ 
                            opacity: isSearchOpen ? 0 : 1, 
                            scale: isSearchOpen ? 0.95 : 1,
                            filter: isSearchOpen ? 'blur(4px)' : 'blur(0px)',
                            pointerEvents: isSearchOpen ? 'none' : 'auto' 
                        }}
                        transition={{ duration: 0.4, ease: EASE }}
                        onClick={() => setIsSidebarOpen(true)}
                        className="flex items-center gap-3 text-[#c4a97d] hover:text-white transition-colors cursor-pointer bg-transparent border-none outline-none group"
                    >
                        <Menu size={22} strokeWidth={1.5} className="group-hover:rotate-180 transition-transform duration-500" />
                        <span className="hidden sm:block font-['Jost',sans-serif] text-[11px] font-medium tracking-[0.2em] uppercase mt-0.5 text-shadow-sm">
                            Menu
                        </span>
                    </motion.button>

                    {/* Left-Aligned Logo (Fades IN when search opens) */}
                    <motion.div
                        animate={{ 
                            opacity: isSearchOpen ? 1 : 0, 
                            scale: isSearchOpen ? 1 : 0.95,
                            filter: isSearchOpen ? 'blur(0px)' : 'blur(4px)',
                            pointerEvents: isSearchOpen ? 'auto' : 'none' 
                        }}
                        transition={{ duration: 0.4, ease: EASE }}
                        className="absolute left-0 cursor-pointer select-none flex justify-center"
                    >
                        <Image
                            width={200}
                            height={200}
                            src="/images/logo_4x.png"  //TODO :
                            alt="BuckShot Logo"
                            className="w-11 h-11 sm:w-12 sm:h-12 object-contain transition-transform duration-300 hover:scale-105"
                            style={{ filter: 'brightness(0.92) sepia(0.15)' }}
                            priority
                        />
                    </motion.div>
                </div>

                {/* CENTER: Primary Logo (Fades OUT when search opens)  */}
                <motion.div 
                    animate={{
                        opacity: isSearchOpen ? 0 : 1,
                        scale: isSearchOpen ? 0.95 : 1,
                        filter: isSearchOpen ? 'blur(4px)' : 'blur(0px)',
                        pointerEvents: isSearchOpen ? 'none' : 'auto'
                    }}
                    style={{ top: "50%", left: "50%", x: "-50%", y: "-50%" }}
                    transition={{ duration: 0.5, ease: EASE }}
                    className="absolute z-30 cursor-pointer select-none flex justify-center"
                >
                    <Image
                        width={200}
                        height={200}
                        src="/images/logo_4x.png"
                        alt="BuckShot Logo"
                        className="w-11 h-11 sm:w-12 sm:h-12 object-contain transition-transform duration-300 hover:scale-105"
                        style={{ filter: 'brightness(0.92) sepia(0.15)' }}
                        priority
                    />
                </motion.div>

                {/* RIGHT: Primary Interface Controls */}
                <motion.div 
                    animate={{ 
                        opacity: isSearchOpen ? 0 : 1, 
                        x: isSearchOpen ? 24 : 0,
                        pointerEvents: isSearchOpen ? 'none' : 'auto' 
                    }}
                    transition={{ duration: 0.45, ease: EASE }}
                    className="flex-1 flex justify-end items-center gap-3 sm:gap-5 z-10"
                >
                    {/* Inline Search Panel Opener */}
                    <motion.button
                        whileHover={{ color: '#fff', scale: 1.05 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setIsSearchOpen(true)}
                        className="text-[#c4a97d] bg-transparent border-none cursor-pointer p-2 flex items-center justify-center rounded-none outline-none"
                    >
                        <Search size={21} strokeWidth={1.75} />
                    </motion.button>

                    {status === 'unauthenticated' ? (
                        <motion.button
                            whileHover={{ backgroundColor: 'rgba(196,169,125,0.08)', color: '#fff', borderColor: '#c4a97d' }}
                            whileTap={{ scale: 0.97 }}
                            onClick={handleAuthOpen}
                            className="px-5 py-2 bg-transparent border border-[#7a6b4f]/50 text-[#c4a97d] font-['Jost',sans-serif] font-medium tracking-[0.18em] uppercase text-[10.5px] rounded-none cursor-pointer transition-all duration-200"
                        >
                            Sign In
                        </motion.button>
                    ) : (
                        <div className="px-5 py-2 bg-transparent border border-[#7a6b4f]/40 text-[#c4a97d]/90 font-['Jost',sans-serif] font-medium tracking-[0.18em] uppercase text-[10.5px] rounded-none select-none">
                            {data?.user?.name || 'Profile'}
                        </div>
                    )}
                </motion.div>

                {/* Search expand */}
                <AnimatePresence>
                    {isSearchOpen && (
                        <motion.div
                            initial={{ opacity: 0, scaleX: 0.98 }}
                            animate={{ opacity: 1, scaleX: 1 }}
                            exit={{ opacity: 0, scaleX: 0.98 }}
                            transition={{ duration: 0.65, ease: EASE }}
                            className="absolute inset-y-0 right-0 flex items-center gap-4 z-20 origin-right"
                            style={{
                                left: `calc(${containerPadding} + 4.5rem)`, 
                                marginRight: containerPadding
                            }}
                        >
                            <SearchBar onClose={() => setIsSearchOpen(false)} />
                            
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.nav>

            {/* Sidebar */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            onClick={() => setIsSidebarOpen(false)}
                            className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 cursor-pointer"
                        />

                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 26, stiffness: 190 }}
                            className="fixed top-0 left-0 bottom-0 w-[85vw] sm:w-96 bg-[#070707] border-r border-[#7a6b4f]/15 z-50 flex flex-col"
                        >
                            <div className="flex items-center justify-between p-8 border-b border-[#7a6b4f]/15">
                                <span className="font-['Bebas_Neue',sans-serif] text-2xl tracking-widest text-white/90">
                                    Navigation
                                </span>
                                <button 
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="text-[#c4a97d] hover:text-white transition-colors bg-transparent border-none cursor-pointer"
                                >
                                    <X size={22} strokeWidth={1.5} />
                                </button>
                            </div>

                            <ul className="flex flex-col gap-6 p-10 list-none m-0">
                                {NAV_LINKS.map((link, i) => (
                                    <motion.li 
                                        key={link}
                                        initial={{ opacity: 0, x: -16 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.08 + (i * 0.04), ease: EASE }}
                                    >
                                        <a
                                            href={`/${link.toLowerCase()}`}
                                            onClick={() => setIsSidebarOpen(false)}
                                            className="group flex items-center gap-4 text-white/45 hover:text-[#c4a97d] transition-colors text-3xl font-['Bebas_Neue',sans-serif] tracking-wider text-none"
                                        >
                                            <span className="text-sm font-['Jost',sans-serif] tracking-[0.2em] opacity-30 group-hover:opacity-100 transition-opacity">
                                                0{i + 1}
                                            </span>
                                            {link}
                                        </a>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}