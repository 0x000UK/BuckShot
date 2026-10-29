'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { FaDiscord, FaGithub, FaGlobe, FaInstagram, FaLinkedin, FaReddit, FaSteam, FaTwitch, FaXTwitter, FaYoutube } from 'react-icons/fa6'
import { EASE, BRAND, BRAND_LIGHT } from '@/lib/utils'
import { Edit3, X, Loader2 } from 'lucide-react'
import type { ProfileData } from '@/types/profile'
import { updateUserBio } from '@/app/actions/dbActions'
import { toast } from '@/stores/alertStore'
import { useRouter } from 'next/navigation'

// Icon mappings for the social row
const SOCIAL_ICONS = {
    twitter: FaXTwitter,
    github: FaGithub,
    linkedin: FaLinkedin,
    instagram: FaInstagram,
    youtube: FaYoutube,
    discord: FaDiscord,
    website: FaGlobe,
    reddit : FaReddit,
    twitch : FaTwitch,
    steam : FaSteam
}

interface OverviewSectionProps {
    profile: ProfileData
    isOwner?: boolean
    onBioUpdated?: (newBio: string) => void
}

export default function OverviewSection({ profile, isOwner = false, onBioUpdated }: OverviewSectionProps) {
    const socials = profile.socials || []
    const router = useRouter()

    const [isBioModalOpen, setIsBioModalOpen] = useState(false)
    const [draftBio, setDraftBio] = useState(profile.about || '')
    const [isSavingBio, setIsSavingBio] = useState(false)
    const [bioError, setBioError] = useState<string | null>(null)

    const handleOpenBioModal = () => {
        setDraftBio(profile.about || '')
        setBioError(null)
        setIsBioModalOpen(true)
    }

    const handleSaveBio = async () => {
        setIsSavingBio(true)
        setBioError(null)

        const res = await updateUserBio(draftBio)
        setIsSavingBio(false)

        if (!res.success) {
            setBioError(res.error || 'Failed to update biography.')
            return
        }

        toast.success('Biography Updated', 'Your bio has been saved.')
        setIsBioModalOpen(false)
        onBioUpdated?.(draftBio)
        router.refresh()
    }

    return (
        <div className="flex flex-col gap-10 max-w-2xl">
            {/* --- BIO SECTION --- */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <span className="font-jost text-[10.5px] font-semibold tracking-[0.2em] uppercase text-white/40 block">
                        Biography
                    </span>
                    {isOwner && (
                        <button
                            type="button"
                            onClick={handleOpenBioModal}
                            className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-jost uppercase tracking-wider text-[#c4a97d] hover:text-white border border-[#7a6b4f]/30 hover:border-[#c4a97d] bg-[#7a6b4f]/10 transition-colors cursor-pointer"
                        >
                            <Edit3 size={12} />
                            <span>Edit Bio</span>
                        </button>
                    )}
                </div>
                <p className="font-jost text-[13.5px] leading-relaxed text-white/75 whitespace-pre-wrap min-h-[48px]">
                    {profile.about || 'No bio provided yet.'}
                </p>
            </div>

            {/* --- FAVORITE GAMES SECTION (COMMENTED OUT AS REQUESTED) --- */}
            {/* 
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <span className="font-jost text-[10.5px] font-semibold tracking-[0.2em] uppercase text-white/40 block">
                        Favorite Titles
                    </span>
                    <div className="h-px flex-1 bg-[#7a6b4f]/20" />
                </div>

                {games.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {games.map((game, index) => (
                            <motion.div
                                key={game.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, ease: EASE, delay: index * 0.05 }}
                                className="group relative aspect-3/4 w-full overflow-hidden bg-[#14120e] border border-[#7a6b4f]/30 hover:border-[#c4a97d] transition-colors duration-300"
                            >
                                <Image
                                    fill
                                    src={game.cover} 
                                    alt={game.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 filter grayscale-20 group-hover:grayscale-0"
                                />
                                <div className="absolute inset-0 border border-transparent group-hover:border-[#c4a97d]/40 transition-colors duration-300 pointer-events-none" />
                                <div className="absolute bottom-0 inset-x-0 bg-linear-to-t from-black via-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <p className="font-jost text-[10px] tracking-wide text-white/90 truncate text-center">
                                        {game.title}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center gap-3 p-4 justify-center">
                        <Gamepad2 size={16} className="text-white/35" />
                        <span className="font-jk text-sm text-white/60">No curated titles selected.</span>
                    </div>
                )}
            </div> 
            */}

            {/* --- QUICK NETWORKS SECTION --- */}
            {socials.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="font-['Jost',sans-serif] text-[10.5px] font-semibold tracking-[0.2em] uppercase text-white/40 block">
                            Connect
                        </span>
                        <div className="h-px flex-1 bg-[#7a6b4f]/20" />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {socials.map((social, index) => {
                            const Icon = SOCIAL_ICONS[social.platform as keyof typeof SOCIAL_ICONS] || FaGlobe
                            return (
                                <a
                                    key={index}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center w-9 h-9 bg-[#0d0c0a] border border-[#7a6b4f]/30 hover:border-[#c4a97d] text-white/40 hover:text-[#c4a97d] transition-all duration-300 rounded-none"
                                    title={`Open ${social.platform}`}
                                >
                                    <Icon size={16} />
                                </a>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Edit Bio Modal */}
            <AnimatePresence>
                {isBioModalOpen && (
                    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isSavingBio && setIsBioModalOpen(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
                        />

                        <motion.div
                            initial={{ scale: 0.96, opacity: 0, y: 12 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.96, opacity: 0, y: 12 }}
                            transition={{ duration: 0.25, ease: EASE }}
                            className="relative w-full max-w-lg bg-[#0d0c0a] border border-[#7a6b4f]/30 p-6 sm:p-8 flex flex-col gap-5 shadow-[0_0_50px_rgba(0,0,0,0.85)] z-10 rounded-none"
                        >
                            <div className="flex items-center justify-between pb-3 border-b border-[#7a6b4f]/20">
                                <div>
                                    <h3 className="font-jk text-lg uppercase tracking-wider text-white/95">
                                        Edit Biography
                                    </h3>
                                    <p className="font-jost text-xs text-white/40 mt-1">
                                        Supports simple text with line breaks (max 500 characters).
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsBioModalOpen(false)}
                                    disabled={isSavingBio}
                                    className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white border border-[#7a6b4f]/20 hover:border-[#c4a97d]/50 bg-black/40 transition-colors cursor-pointer"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="flex flex-col gap-2">
                                <textarea
                                    value={draftBio}
                                    onChange={(e) => setDraftBio(e.target.value.slice(0, 500))}
                                    rows={6}
                                    placeholder="Write a few lines about your gaming journey, favorite platforms, and genres..."
                                    className="w-full bg-[#080808] font-jost text-sm text-white/85 outline-none p-3.5 border border-[#7a6b4f]/30 focus:border-[#c4a97d]/60 placeholder:text-white/20 transition-colors resize-none leading-relaxed"
                                />
                                <div className="flex justify-end">
                                    <span className="font-jost text-[11px] text-white/35">
                                        {draftBio.length} / 500 characters
                                    </span>
                                </div>
                            </div>

                            {bioError && (
                                <div className="px-3.5 py-2 bg-red-950/40 border border-red-500/40 text-red-200 text-xs font-jost">
                                    {bioError}
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#7a6b4f]/20">
                                <button
                                    type="button"
                                    onClick={() => setIsBioModalOpen(false)}
                                    disabled={isSavingBio}
                                    className="px-4 py-2 font-jost text-xs uppercase tracking-wider text-white/60 hover:text-white border border-[#7a6b4f]/25 hover:border-[#7a6b4f]/40 transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveBio}
                                    disabled={isSavingBio}
                                    className="px-6 py-2 font-jost text-xs uppercase tracking-wider bg-[#c4a97d] text-[#080808] font-medium hover:bg-[#d8c199] transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(196,169,125,0.2)] disabled:opacity-40"
                                >
                                    {isSavingBio ? (
                                        <>
                                            <Loader2 size={14} className="animate-spin" />
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        <span>Save Biography</span>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
