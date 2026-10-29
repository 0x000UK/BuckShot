'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
    LayoutGrid, 
    Library, 
    Heart, 
    Star, 
    MessageSquare, 
    ThumbsUp, 
    User2Icon, 
    Globe, 
    Settings, 
    ChevronDown,
    LucideIcon
} from 'lucide-react'
import { EASE } from '@/lib/utils'
import { ProfileSectionKey } from '@/types/profile'

interface ProfileSidebarNavProps {
    activeSection: ProfileSectionKey
    onChange: (section: ProfileSectionKey) => void
    isOwner?: boolean
}

interface SidebarItem {
    key: ProfileSectionKey
    label: string
    icon: LucideIcon
}

interface SidebarGroup {
    id: string
    title: string
    items: SidebarItem[]
}

const SECTION_GROUPS: SidebarGroup[] = [
    {
        id: 'personal',
        title: 'Personal',
        items: [
            { key: 'overview', label: 'Overview', icon: LayoutGrid },
            { key: 'socials', label: 'Socials', icon: Globe },
        ]
    },
    {
        id: 'collections',
        title: 'Collections',
        items: [
            { key: 'library', label: 'Library', icon: Library },
            { key: 'wishlist', label: 'Wishlist', icon: Heart },
            // { key: 'favorites', label: 'Favorites', icon: Star },
        ]
    },
    {
        id: 'contributions',
        title: 'Contributions',
        items: [
            { key: 'comments', label: 'Comments', icon: MessageSquare },
            { key: 'likes', label: 'Likes', icon: ThumbsUp },
        ]
    },
    {
        id: 'control-panel',
        title: 'Control Panel',
        items: [
            { key: 'account', label: 'My Account', icon: User2Icon },
            { key: 'settings', label: 'Settings', icon: Settings },
        ]
    }
]

export default function ProfileSidebarNav({ activeSection, onChange, isOwner: _isOwner }: ProfileSidebarNavProps) {
    const [isMobileExpanded, setIsMobileExpanded] = useState(false)

    // Flat list of all visible sections (useful for quick lookups)
    const flatVisibleSections = SECTION_GROUPS.flatMap(g => g.items)
    const activeLabel = flatVisibleSections.find(s => s.key === activeSection)?.label

    const handleSelect = (key: ProfileSectionKey) => {
        onChange(key)
        setIsMobileExpanded(false)
    }

    return (
        <>
            {/* Desktop: Grouped vertical sidebar */}
            <nav className="hidden sticky top-22 lg:flex flex-col gap-4 py-4 w-58 shrink-0 bg-[#0d0c0a]/65 border border-[#7a6b4f]/20 rounded-none overflow-hidden h-fit shadow-[0_15px_40px_rgba(0,0,0,0.4)]">
                {SECTION_GROUPS.map((group, groupIndex) => (
                    <div key={group.id} className="flex flex-col gap-0.5">
                        {/* Group Header */}
                        <div className="px-4 pb-1.5 flex items-center justify-between">
                            <span className="font-jost text-[9.5px] font-semibold tracking-[0.2em] uppercase text-[#c4a97d]/65">
                                {group.title}
                            </span>
                            {groupIndex > 0 && <div className="h-[1px] flex-1 ml-3 bg-[#7a6b4f]/10" />}
                        </div>

                        {/* Group Buttons */}
                        <div className="flex flex-col">
                            {group.items.map((section) => {
                                const Icon = section.icon
                                const isActive = activeSection === section.key
                                return (
                                    <button
                                        key={section.key}
                                        onClick={() => handleSelect(section.key)}
                                        className="relative flex items-center gap-3 px-4 py-2.5 bg-transparent border-none cursor-pointer group text-left outline-none transition-colors"
                                    >
                                        {/* Premium active background highlight */}
                                        {isActive && (
                                            <motion.div
                                                layoutId="profile-sidebar-active"
                                                transition={{ duration: 0.3, ease: EASE }}
                                                className="absolute inset-y-0 left-0 right-1 border-l-2 border-[#c4a97d] bg-[#7a6b4f]/10"
                                            />
                                        )}
                                        <Icon
                                            size={15}
                                            strokeWidth={1.75}
                                            className={`relative z-10 transition-colors duration-200 ${
                                                isActive ? 'text-[#c4a97d]' : 'text-white/35 group-hover:text-white/60'
                                            }`}
                                        />
                                        <span
                                            className={`relative z-10 font-jost text-[12px] font-medium tracking-[0.1em] uppercase transition-colors duration-200 ${
                                                isActive ? 'text-white/95 font-semibold' : 'text-white/40 group-hover:text-white/75'
                                            }`}
                                        >
                                            {section.label}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Mobile: Collapsible dropdown selector */}
            <div className="lg:hidden relative z-30">
                <button
                    onClick={() => setIsMobileExpanded(o => !o)}
                    className="w-full flex items-center justify-between px-5 py-3.5 bg-[#0d0c0a] border border-[#7a6b4f]/30 cursor-pointer rounded-none"
                >
                    <span className="font-jost text-[12.5px] font-semibold tracking-[0.15em] uppercase text-white/90">
                        {activeLabel || 'Select Section'}
                    </span>
                    <motion.span
                        animate={{ rotate: isMobileExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3, ease: EASE }}
                        className="text-[#7a6b4f]"
                    >
                        <ChevronDown size={16} strokeWidth={1.75} />
                    </motion.span>
                </button>

                <AnimatePresence>
                    {isMobileExpanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: EASE }}
                            className="absolute top-[calc(100%+6px)] left-0 right-0 bg-[#0d0c0a] border border-[#7a6b4f]/30 overflow-hidden rounded-none shadow-[0_15px_40px_rgba(0,0,0,0.6)] max-h-96 overflow-y-auto"
                        >
                            {SECTION_GROUPS.map((group) => (
                                <div key={group.id} className="border-b border-[#7a6b4f]/15 last:border-b-0 py-2 bg-[#11100f]/40">
                                    <div className="px-5 py-1 text-[8.5px] font-bold tracking-[0.2em] uppercase text-[#c4a97d]/50">
                                        {group.title}
                                    </div>
                                    {group.items.map((section) => {
                                        const Icon = section.icon
                                        const isActive = activeSection === section.key
                                        return (
                                            <button
                                                key={section.key}
                                                onClick={() => handleSelect(section.key)}
                                                className={`w-full flex items-center gap-3 px-6 py-2.5 bg-transparent border-none cursor-pointer transition-colors ${
                                                    isActive ? 'bg-[#7a6b4f]/10' : 'hover:bg-[#7a6b4f]/5'
                                                }`}
                                            >
                                                <Icon 
                                                    size={14} 
                                                    strokeWidth={1.75} 
                                                    className={isActive ? 'text-[#c4a97d]' : 'text-white/35'} 
                                                />
                                                <span className={`font-jost text-[12px] font-medium tracking-[0.1em] uppercase ${
                                                    isActive ? 'text-white/95' : 'text-white/50'
                                                }`}>
                                                    {section.label}
                                                </span>
                                            </button>
                                        )
                                    })}
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    )
}
