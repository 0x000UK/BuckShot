'use client'

import { motion } from 'motion/react'
import Image from 'next/image'
import { EASE } from '@/lib/utils'
import { ProfileData } from '@/types/profile'
import UserBadge from '@/components/shared/BadgeTooltip'
import { AlertTriangle, ShieldAlert, Camera } from 'lucide-react'

interface ProfileIdentityProps {
    profile: ProfileData
    isOwner?: boolean
    onEditProfile?: () => void
}

export default function ProfileIdentity({ profile, isOwner = false, onEditProfile }: ProfileIdentityProps) {
    const initials = profile.name?.[0]?.toUpperCase() || '?'

    return (
        <div className="flex max-w-7xl w-full mx-auto px-6 sm:px-16 gap-5 -mt-6 sm:-mt-9 md:-mt-12 lg:-mt-15 relative flex-wrap sm:flex-nowrap">
            {/* Avatar Container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-44 lg:h-44 shrink-0"
            >
                <div 
                    className="relative w-full h-full bg-[#0d0c0a] border-8 rounded-full overflow-hidden group" 
                    style={{ borderColor: profile.background || '#232323' }}
                >
                    {profile.avatar ? (
                        <Image src={profile.avatar} alt={profile.name} fill className="object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="font-jk text-4xl sm:text-5xl md:text-6xl text-[#c4a97d]">
                                {initials}
                            </span>
                        </div>
                    )}

                    {/* Hover edit overlay */}
                    {isOwner && (
                        <button
                            type="button"
                            onClick={onEditProfile}
                            aria-label="Change profile picture"
                            className="absolute inset-0 flex flex-col items-center justify-center bg-black/45 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer focus:opacity-100 z-10"
                        >
                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white shadow-lg transition-transform duration-200 group-hover:scale-105">
                                <Camera className="w-5 h-5 text-white drop-shadow" />
                            </div>
                            <span className="font-jost text-[10px] sm:text-[11px] uppercase tracking-wider text-white/90 mt-1.5 font-medium drop-shadow">
                                Edit
                            </span>
                        </button>
                    )}
                </div>
            </motion.div>

            {/* Profile Info & Badges */}
            <div className="flex-1 min-w-0 pt-6 sm:pt-10 md:pt-14 lg:pt-18 flex flex-col justify-center">
                <h1 className="font-jk text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-wider text-white/95 truncate">
                    {profile.name}
                </h1>
                
                <p className="font-jost text-[18px] text-[#c4a97d]/70 tracking-wide mt-0.5">
                    @{profile.handle}
                </p>

                {/* Badges List with Hover Tooltips */}
                {profile.badges && profile.badges.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1, ease: EASE }}
                        className="flex flex-wrap items-center gap-2 mt-3"
                    >
                        {profile.badges.map((badgeKey) => (
                            <UserBadge key={badgeKey} badge={badgeKey} size="md" />
                        ))}
                    </motion.div>
                )}

                {/* Banned Notice Banner */}
                {profile.isBanned && (
                    <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 p-3.5 bg-red-950/30 border border-red-500/40 rounded-none flex items-start gap-3 text-red-200"
                    >
                        <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-jk text-xs font-semibold text-red-300 uppercase tracking-widest">
                                Account Suspended
                            </p>
                            <p className="font-jost text-xs text-red-200/80 mt-1 leading-relaxed">
                                This account has been banned from community discussions.
                                {profile.banReason ? ` Reason: ${profile.banReason}` : ""}
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* Warning Infractions Notice (Owner or Users with Warnings) */}
                {profile.warnings && profile.warnings.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-3.5 p-3.5 bg-amber-950/20 border border-amber-500/35 rounded-none flex items-start gap-3 text-amber-200"
                    >
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                            <p className="font-jk text-xs font-semibold text-amber-300 uppercase tracking-widest">
                                {isOwner ? "Account Warnings" : "Community Infractions"} ({profile.warnings.length})
                            </p>
                            <div className="mt-1.5 space-y-1">
                                {profile.warnings.slice(-3).map((w, idx) => (
                                    <p key={idx} className="font-jost text-[11px] text-amber-200/80">
                                        • {w.reason}
                                    </p>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
