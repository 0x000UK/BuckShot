'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { User, Settings, Library, Shield } from 'lucide-react'
import { EASE } from '@/lib/utils'

interface AvatarDropdownProps {
    id : string
    handle : string
    name: string
    email?: string
    image?: string | null
    role?: string
}

export default function AvatarDropdown({id, handle, name, email, image, role }: AvatarDropdownProps) {

    const MENU_ITEMS = [
        { label: 'Profile', href: `/u/${id}/${handle}`, icon: User },
        { label: 'Library', href: `/u/${id}/${handle}?section=library`, icon: Library },
        { label: 'Account & Settings', href: `/u/${id}/${handle}?section=account`, icon: Settings },
        ...(role === 'admin' ? [{ label: 'Admin Dashboard', href: '/a/dashboard', icon: Shield }] : [])
    ]

    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('keydown', handleEscape)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleEscape)
        }
    }, [])

    const initials = name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()

    const handleNavigate = (href: string) => {
        setIsOpen(false)
        router.push(href)
    }

    const handleLogout = () => {
        setIsOpen(false)
        signOut({ redirect : false })
    }

    return (
        <div ref={containerRef} className="relative">
            <motion.button
                whileHover={{ color: '#fff', scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setIsOpen(o => !o)}
                className="w-8 h-8 sm:w-8.5 sm:h-8.5 flex text-[#c4a97d] items-center bg-[#0d0c0a] border border-[#7a6b4f]/40 hover:border-[#c4a97d] cursor-pointer justify-center rounded-full overflow-hidden outline-none transition-colors"
                aria-label="User profile menu"
            >
                {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image} alt={name} className="w-full h-full object-cover" />
                ) : (
                    <span className="font-jost text-[12px] sm:text-[13px] font-semibold text-[#c4a97d]">
                        {initials}
                    </span>
                )}
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.25, ease: EASE }}
                        style={{ transformOrigin: 'top right' }}
                        className="absolute right-0 top-[calc(100%+10px)] w-56 bg-[#0d0c0a]/95 border border-[#7a6b4f]/30 shadow-[0_0_30px_rgba(0,0,0,0.5)] z-50 backdrop-blur-2xl"
                    >
                        {/* Identity header */}
                        <div className="px-4 py-3.5 border-b border-[#7a6b4f]/20 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full overflow-hidden border border-[#7a6b4f]/40 bg-[#0d0c0a] flex items-center justify-center shrink-0">
                                {image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={image} alt={name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="font-jost text-xs font-semibold text-[#c4a97d]">{initials}</span>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="font-jost text-[13.5px] font-medium text-white/90 truncate">
                                    {name}
                                </p>
                                {email && (
                                    <p className="font-jost text-[11.5px] text-white/35 truncate mt-0.5">
                                        {email}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Menu items */}
                        <div className="py-2">
                            {MENU_ITEMS.map(({ label, href, icon: Icon }) => (
                                <button
                                    key={label}
                                    onClick={() => handleNavigate(href)}
                                    className="w-full flex items-center gap-3 px-5 py-2.5 font-jost text-[12px] text-white/70 hover:text-white hover:bg-white/5 transition-colors cursor-pointer text-left"
                                >
                                    <Icon size={14} className="text-[#c4a97d] shrink-0" />
                                    <span>{label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Sign out */}
                        <div className="p-2 border-t border-[#7a6b4f]/20">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-3 py-2 font-jost text-[12px] text-red-400/80 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer text-left"
                            >
                                <span className="w-4 h-4 flex items-center justify-center">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                        <polyline points="16 17 21 12 16 7" />
                                        <line x1="21" y1="12" x2="9" y2="12" />
                                    </svg>
                                </span>
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
