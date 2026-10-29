'use client'

import { motion } from 'motion/react'
import { User, MessageSquare, ThumbsUp } from 'lucide-react'
import { EASE } from '@/lib/utils'
import type { ProfileTabsKey } from '@/types/profile'

interface ProfileTopNavProps {
    activeSection: ProfileTabsKey
    onChange: (tab: ProfileTabsKey) => void
    isOwner?: boolean
}

const SECTIONS: { 
    key: ProfileTabsKey; 
    label: string; 
    icon: typeof User; 
    ownerOnly?: boolean 
}[] = [
    { key: 'about', label: 'About Me', icon: User },
    { key: 'comments', label: 'Comments', icon: MessageSquare },
    { key: 'likes', label: 'Likes', icon: ThumbsUp },
]

export default function ProfileTopNav({ activeSection, onChange, isOwner }: ProfileTopNavProps) {
    const visibleSections = SECTIONS.filter(s => !s.ownerOnly || isOwner)

    return (
        <nav className="relative flex items-center justify-center border-b border-b-white/10 gap-1 md:gap-6 overflow-x-auto no-scrollbar px-4 sm:px-8">
            {visibleSections.map((section) => {
                const isActive = activeSection === section.key

                return (
                    <button
                        key={section.key}
                        onClick={() => onChange(section.key)}
                        className="relative flex items-center gap-2.5 py-4 px-3 bg-transparent border-none cursor-pointer group shrink-0 outline-none"
                    >
                        {/* Active Bottom Underline Indicator */}
                        {isActive && (
                            <motion.div
                                layoutId="profile-tab-active"
                                transition={{ duration: 0.35, ease: EASE }}
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20"
                            />
                        )}
                        
                        <span
                            className={`relative z-10 font-jost text-[11px] tracking-[0.12em] uppercase transition-colors duration-200 ${
                                isActive 
                                    ? 'text-white/95 font-semibold' 
                                    : 'text-white/45 group-hover:text-white/75'
                            }`}
                        >
                            {section.label}
                        </span>
                    </button>
                )
            })}
        </nav>
    )
}
