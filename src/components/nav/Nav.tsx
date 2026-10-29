'use client'

import { useEffect, useState } from 'react'
import { motion, useScroll, useTransform, AnimatePresence, useMotionValueEvent } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useAuthStore } from '@/stores/authStore'
import { Menu, X, Search, Loader2, LogIn, User, LogOut, ChevronRight } from 'lucide-react'
import { usePathname } from 'next/navigation'
import SearchBar from './SearchBar'
import { EASE, hexToRgba } from '@/lib/utils'
import AvatarDropdown from './AvatarDropdown'

const NAV_LINKS = [
    { name: 'Home', link: '/' },
    { name: 'Store', link: '/store' },
    { name: 'About', link: '/about' },
    { name: 'Contact', link: '/contact' },
]

export default function Nav() {
    const [heroH, setHeroH] = useState(800)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [navHidden, setNavHidden] = useState(false)
    const [containerPadding, setContainerPadding] = useState('4rem')
    
    const pathname = usePathname()
    const isHomepage = pathname === '/' || pathname.startsWith('/g') || pathname.startsWith('/u' )
    const { scrollY } = useScroll()


    // Dynamic boundary matrices
    const transparentAmbient = hexToRgba("#090908", 0);
    const solidAmbient = hexToRgba("#090908", 0.95);

    const navBg = useTransform(
        scrollY,
        [heroH * 0.45, heroH * 0.9],
        isHomepage
            ? [transparentAmbient, solidAmbient]
            : [solidAmbient, solidAmbient]
    );

    // Responsive Margin & Hero Height Matrix Calculator 
    useEffect(() => {
        const measure = () => {
            const isMobile = window.innerWidth < 640;
            setHeroH(isMobile ? window.innerHeight * 0.7 : window.innerHeight);
            if (isMobile) {
                setContainerPadding('1rem');
            } else if (window.innerWidth < 1024) {
                setContainerPadding('2rem');
            } else {
                setContainerPadding('4rem');
            }
        }
        measure() 
        window.addEventListener('resize', measure)
        return () => window.removeEventListener('resize', measure)
    }, [])

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

    const { data, status , update} = useSession()
    const openAuth = useAuthStore((state) => state.openAuth)
    
    const handleAuthOpen = () => {
        if (status === 'unauthenticated') {
            openAuth(async () => {
                await update(); 
            })
        }
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
                className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between px-4 sm:px-8 md:px-16 h-16 sm:h-18 border-b border-transparent"
            >
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
                        aria-label="Open menu"
                        className="flex items-center gap-2 sm:gap-3 text-[#c4a97d] hover:text-white transition-colors cursor-pointer bg-transparent border-none outline-none group p-1 -ml-1"
                    >
                        <Menu size={22} strokeWidth={1.5} className="group-hover:rotate-180 transition-transform duration-500" />
                        <span className="hidden sm:block font-jost text-[11px] font-medium tracking-[0.2em] uppercase mt-0.5 text-shadow-sm">
                            Menu
                        </span>
                    </motion.button>

                    {/* Left-Aligned Logo (Fades IN on desktop when search opens) */}
                    <motion.div
                        animate={{ 
                            opacity: isSearchOpen ? 1 : 0, 
                            scale: isSearchOpen ? 1 : 0.95,
                            filter: isSearchOpen ? 'blur(0px)' : 'blur(4px)',
                            pointerEvents: isSearchOpen ? 'auto' : 'none' 
                        }}
                        transition={{ duration: 0.4, ease: EASE }}
                        className="hidden sm:flex absolute left-0 cursor-pointer select-none justify-center"
                    >
                        <Link href="/" aria-label="BuckShot Home">
                            <Image
                                width={200}
                                height={200}
                                src="/images/logo_4x.png"
                                alt="BuckShot Logo"
                                className="w-10 h-10 sm:w-12 sm:h-12 object-contain transition-transform duration-300 hover:scale-105"
                                style={{ filter: 'brightness(0.92) sepia(0.15)' }}
                                priority
                            />
                        </Link>
                    </motion.div>
                </div>

                {/* Center Logo (Fades out when search is active) */}
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
                    <Link href="/" aria-label="BuckShot Home">
                        <Image
                            width={200}
                            height={200}
                            src="/images/logo_4x.png"
                            alt="BuckShot Logo"
                            className="w-10 h-10 sm:w-12 sm:h-12 object-contain transition-transform duration-300 hover:scale-105"
                            style={{ filter: 'brightness(0.92) sepia(0.15)' }}
                            priority
                        />
                    </Link>
                </motion.div>

                {/* RIGHT: Primary Interface Controls */}
                <motion.div 
                    animate={{ 
                        opacity: isSearchOpen ? 0 : 1, 
                        x: isSearchOpen ? 24 : 0,
                        pointerEvents: isSearchOpen ? 'none' : 'auto' 
                    }}
                    transition={{ duration: 0.45, ease: EASE }}
                    className="flex-1 flex justify-end items-center gap-2 sm:gap-5 z-10"
                >
                    {/* Inline Search Panel Opener */}
                    <motion.button
                        whileHover={{ color: '#fff', scale: 1.05 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setIsSearchOpen(true)}
                        aria-label="Open search"
                        className="text-[#c4a97d] bg-transparent border-none cursor-pointer p-2 flex items-center justify-center rounded-none outline-none"
                    >
                        <Search size={21} strokeWidth={1.75} />
                    </motion.button>

                    {/* Top Bar Sign In: Visible on desktop; mobile accesses via sidebar menu */}
                    {status === 'unauthenticated' ? (
                        <motion.button
                            whileHover={{ backgroundColor: 'rgba(196,169,125,0.08)', color: '#fff', borderColor: '#c4a97d' }}
                            whileTap={{ scale: 0.97 }}
                            onClick={handleAuthOpen}
                            className="hidden sm:block px-5 py-2 bg-transparent border border-[#7a6b4f]/50 text-[#c4a97d] font-jost font-medium tracking-[0.18em] uppercase text-[10.5px] rounded-none cursor-pointer transition-all duration-200"
                        >
                            Sign In
                        </motion.button>
                    ) : 
                    status === "loading" ?
                    (
                        <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-white-500" />
                    ) : (
                        <AvatarDropdown
                            id={data?.user.id || ""}
                            handle={data?.user.handle || ''}
                            name={data?.user?.name || 'Profile'}
                            email={data?.user?.email || 'Your email'}
                            image={data?.user?.image}
                            role={data?.user?.role}
                        />
                    )}
                </motion.div>

                {/* Search expand: Full overlay on mobile, clean extension on desktop */}
                <AnimatePresence>
                    {isSearchOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.35, ease: EASE }}
                            className="absolute inset-0 px-3 sm:px-8 md:px-16 flex items-center justify-between z-40"
                        >
                            <div className="w-full flex items-center justify-center">
                                <SearchBar onClose={() => setIsSearchOpen(false)} />
                            </div>
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
                            className="fixed top-0 left-0 bottom-0 w-[85vw] max-w-sm sm:w-96 bg-[#070707] border-r border-[#7a6b4f]/15 z-50 flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center justify-between p-6 sm:p-8 border-b border-[#7a6b4f]/15">
                                    <span className="font-jk text-xl sm:text-2xl tracking-widest text-white/90">
                                        Navigation
                                    </span>
                                    <button 
                                        onClick={() => setIsSidebarOpen(false)}
                                        aria-label="Close menu"
                                        className="text-[#c4a97d] hover:text-white transition-colors bg-transparent border-none cursor-pointer p-1"
                                    >
                                        <X size={22} strokeWidth={1.5} />
                                    </button>
                                </div>

                                <ul className="flex flex-col gap-5 sm:gap-6 p-6 sm:p-10 list-none m-0">
                                    {NAV_LINKS.map((l, i) => (
                                        <motion.li 
                                            key={l.name}
                                            initial={{ opacity: 0, x: -16 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.08 + (i * 0.04), ease: EASE }}
                                        >
                                            <Link
                                                href={l.link}
                                                onClick={() => setIsSidebarOpen(false)}
                                                className="group flex items-center gap-4 text-white/45 hover:text-[#c4a97d] transition-colors text-2xl sm:text-3xl font-['Bebas_Neue',sans-serif] tracking-wider text-none"
                                            >
                                                <span className="text-xs sm:text-sm font-jost tracking-[0.2em] opacity-30 group-hover:opacity-100 transition-opacity">
                                                    0{i + 1}
                                                </span>
                                                {l.name}
                                            </Link>
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>

                            {/* Mobile Drawer Auth & Account Section - Hidden on large screens */}
                            <div className="border-t border-[#7a6b4f]/20 bg-[#090807]/90 p-6 sm:p-8 lg:hidden">
                                {status === 'unauthenticated' ? (
                                    <div className="flex flex-col gap-3">
                                        <button
                                            onClick={() => {
                                                setIsSidebarOpen(false);
                                                handleAuthOpen();
                                            }}
                                            className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 bg-[#7a6b4f]/15 hover:bg-[#c4a97d]/20 text-[#c4a97d] hover:text-white border border-[#7a6b4f]/50 hover:border-[#c4a97d] font-jost text-[11px] font-semibold tracking-[0.2em] uppercase rounded-none transition-all duration-200 cursor-pointer"
                                        >
                                            <LogIn size={15} strokeWidth={2} />
                                            <span>Sign In / Register</span>
                                        </button>
                                        <p className="font-jost text-[10px] tracking-wider text-center text-white/35 uppercase">
                                            Access your library & community
                                        </p>
                                    </div>
                                ) : status === 'loading' ? (
                                    <div className="flex items-center justify-center py-4">
                                        <Loader2 className="w-5 h-5 animate-spin text-[#c4a97d]" />
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        {/* User Identity info */}
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-10 h-10 border border-[#7a6b4f]/40 overflow-hidden bg-[#0d0c0a] flex items-center justify-center text-[#c4a97d] font-jost font-semibold shrink-0">
                                                {data?.user?.image ? (
                                                    <Image src={data.user.image} alt={data.user.name || 'User'} fill className="object-cover" />
                                                ) : (
                                                    <span>{(data?.user?.name || data?.user?.handle || 'U').slice(0, 2).toUpperCase()}</span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-jost text-sm font-medium text-white/90 truncate">
                                                    {data?.user?.name || data?.user?.handle}
                                                </p>
                                                <p className="font-jost text-xs text-[#c4a97d]/70 truncate">
                                                    @{data?.user?.handle}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-1.5 pt-1">
                                            <Link
                                                href={`/u/${data?.user?.id || ''}`}
                                                onClick={() => setIsSidebarOpen(false)}
                                                className="flex items-center justify-between px-3 py-2.5 text-white/70 hover:text-white hover:bg-white/5 border border-transparent hover:border-[#7a6b4f]/30 font-jost text-xs uppercase tracking-wider transition-colors"
                                            >
                                                <span className="flex items-center gap-2.5">
                                                    <User size={14} className="text-[#c4a97d]" />
                                                    View Profile
                                                </span>
                                                <ChevronRight size={14} className="text-white/30" />
                                            </Link>

                                            <button
                                                onClick={async () => {
                                                    setIsSidebarOpen(false);
                                                    await signOut({ callbackUrl: '/' });
                                                }}
                                                className="flex items-center gap-2.5 px-3 py-2.5 text-red-400/80 hover:text-red-300 hover:bg-red-500/10 border border-transparent font-jost text-xs uppercase tracking-wider transition-colors cursor-pointer text-left w-full"
                                            >
                                                <LogOut size={14} />
                                                <span>Sign Out</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}