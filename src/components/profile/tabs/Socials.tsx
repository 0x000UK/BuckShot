'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
    Globe, 
    ExternalLink,
    Trash2,
    Plus,
    X,
    Loader2,
    Check,
    Edit2
} from 'lucide-react'
import { EASE } from '@/lib/utils'
import { 
    FaDiscord, 
    FaGithub, 
    FaInstagram, 
    FaLinkedin, 
    FaReddit, 
    FaSteam, 
    FaTwitch, 
    FaXTwitter, 
    FaYoutube 
} from 'react-icons/fa6'
import type { IconType } from 'react-icons/lib'
import type { SocialLink } from '@/types/profile'
import { updateUserSocials } from '@/app/actions/dbActions'
import { toast } from '@/stores/alertStore'
import { useRouter } from 'next/navigation'

interface SocialsTabProps {
    socials?: SocialLink[]
    isOwner?: boolean
    onSocialsUpdated?: (newSocials: SocialLink[]) => void
}

type PlatformKey = 'discord' | 'steam' | 'twitch' | 'youtube' | 'instagram' | 'reddit' | 'twitter' | 'github' | 'linkedin'

interface PlatformMeta {
    key: PlatformKey
    label: string
    icon: IconType
    urlPlaceholder: string
    example: string
}

const ALL_PLATFORMS: PlatformMeta[] = [
    { key: 'discord', label: 'Discord', icon: FaDiscord, urlPlaceholder: 'https://discord.gg/yourinvite or username', example: 'https://discord.gg/valhalla' },
    { key: 'steam', label: 'Steam', icon: FaSteam, urlPlaceholder: 'https://steamcommunity.com/id/yourid', example: 'https://steamcommunity.com/id/hunter' },
    { key: 'twitch', label: 'Twitch', icon: FaTwitch, urlPlaceholder: 'https://twitch.tv/yourchannel', example: 'https://twitch.tv/valhalla' },
    { key: 'youtube', label: 'YouTube', icon: FaYoutube, urlPlaceholder: 'https://youtube.com/@yourchannel', example: 'https://youtube.com/@valhallagaming' },
    { key: 'instagram', label: 'Instagram', icon: FaInstagram, urlPlaceholder: 'https://instagram.com/yourhandle', example: 'https://instagram.com/valhalla' },
    { key: 'reddit', label: 'Reddit', icon: FaReddit, urlPlaceholder: 'https://reddit.com/user/yourusername', example: 'https://reddit.com/user/valhalla' },
    { key: 'twitter', label: 'Twitter / X', icon: FaXTwitter, urlPlaceholder: 'https://x.com/yourhandle', example: 'https://x.com/valhalla' },
    { key: 'github', label: 'GitHub', icon: FaGithub, urlPlaceholder: 'https://github.com/yourusername', example: 'https://github.com/valhalla' },
    { key: 'linkedin', label: 'LinkedIn', icon: FaLinkedin, urlPlaceholder: 'https://linkedin.com/in/yourprofile', example: 'https://linkedin.com/in/valhalla' },
]

export default function SocialsTab({ socials = [], isOwner = false, onSocialsUpdated }: SocialsTabProps) {
    const router = useRouter()
    const [socialList, setSocialList] = useState<SocialLink[]>(socials)
    const [selectedPlatform, setSelectedPlatform] = useState<PlatformMeta | null>(null)
    const [inputUrl, setInputUrl] = useState('')
    const [inputUsername, setInputUsername] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)

    const existingMap = new Map<string, SocialLink>(
        socialList.map(s => [s.platform, s])
    )

    const handleOpenEdit = (p: PlatformMeta) => {
        if (!isOwner) return
        const existing = existingMap.get(p.key)
        setSelectedPlatform(p)
        setInputUrl(existing?.url || '')
        setInputUsername(existing?.username || '')
        setErrorMsg(null)
    }

    const handleSaveConnection = async () => {
        if (!selectedPlatform) return
        if (!inputUrl.trim()) {
            setErrorMsg('Please enter a URL or handle.')
            return
        }

        setIsSaving(true)
        setErrorMsg(null)

        const updated = socialList.filter(s => s.platform !== selectedPlatform.key)
        const newEntry: SocialLink = {
            platform: selectedPlatform.key,
            url: inputUrl.trim(),
            username: inputUsername.trim() || inputUrl.replace(/^https?:\/\/(www\.)?/, '').split('/')[1] || selectedPlatform.label
        }
        updated.push(newEntry)

        const res = await updateUserSocials(updated)
        setIsSaving(false)

        if (!res.success) {
            setErrorMsg(res.error || 'Failed to update social link.')
            return
        }

        toast.success(`${selectedPlatform.label} Connected`, 'Your social link has been saved.')
        setSocialList(updated)
        onSocialsUpdated?.(updated)
        setSelectedPlatform(null)
        router.refresh()
    }

    const handleDisconnect = async (platformKey: string) => {
        setIsSaving(true)
        const updated = socialList.filter(s => s.platform !== platformKey)
        const res = await updateUserSocials(updated)
        setIsSaving(false)

        if (!res.success) {
            toast.error('Failed to Disconnect', res.error || 'Please try again.')
            return
        }

        toast.info('Disconnected', 'Social link removed.')
        setSocialList(updated)
        onSocialsUpdated?.(updated)
        setSelectedPlatform(null)
        router.refresh()
    }

    return (
        <div className="space-y-8 max-w-3xl">
            {/* Header */}
            <div className="border-b border-[#7a6b4f]/20 pb-4">
                <h3 className="font-jost text-xs font-semibold tracking-[0.2em] uppercase text-[#c4a97d]">
                    Social Connections
                </h3>
                <p className="text-sm font-jost text-white/50 mt-1">
                    {isOwner 
                        ? 'Click any social platform to connect or update your profile link.' 
                        : 'Connected public profiles across platforms.'}
                </p>
            </div>

            {/* Platform Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {ALL_PLATFORMS.map((p) => {
                    const connected = existingMap.get(p.key)
                    const Icon = p.icon

                    if (!isOwner && !connected) {
                        return null
                    }

                    return (
                        <div
                            key={p.key}
                            onClick={() => isOwner && handleOpenEdit(p)}
                            className={`p-4 border transition-all duration-200 flex flex-col justify-between gap-3 rounded-none relative select-none ${
                                connected 
                                    ? 'bg-[#12100d] border-[#7a6b4f]/45 hover:border-[#c4a97d]' 
                                    : 'bg-[#090807] border-[#7a6b4f]/20 hover:border-[#7a6b4f]/40 opacity-70 hover:opacity-100'
                            } ${isOwner ? 'cursor-pointer' : ''}`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-none flex items-center justify-center border ${
                                        connected 
                                            ? 'border-[#c4a97d]/50 bg-[#c4a97d]/10 text-[#c4a97d]' 
                                            : 'border-white/10 bg-white/5 text-white/40'
                                    }`}>
                                        <Icon size={18} />
                                    </div>
                                    <div>
                                        <p className="font-jost text-sm font-medium text-white/90">
                                            {p.label}
                                        </p>
                                        <p className="font-jost text-[11px] text-white/40 truncate max-w-[140px]">
                                            {connected ? (connected.username || 'Connected') : 'Not linked'}
                                        </p>
                                    </div>
                                </div>

                                {connected ? (
                                    <div className="flex items-center gap-1.5">
                                        <a
                                            href={connected.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="p-1.5 text-white/40 hover:text-[#c4a97d] transition-colors"
                                            title="Visit profile"
                                        >
                                            <ExternalLink size={14} />
                                        </a>
                                        {isOwner && (
                                            <span className="w-2 h-2 rounded-full bg-emerald-500" title="Connected" />
                                        )}
                                    </div>
                                ) : (
                                    isOwner && (
                                        <Plus size={15} className="text-white/30" />
                                    )
                                )}
                            </div>

                            {connected && !isOwner && (
                                <a
                                    href={connected.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-jost text-xs text-[#c4a97d] hover:underline flex items-center gap-1 mt-1 truncate"
                                >
                                    <span>{connected.url}</span>
                                </a>
                            )}
                        </div>
                    )
                })}
            </div>

            {!isOwner && socialList.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Globe size={28} strokeWidth={1.5} className="text-[#7a6b4f] mb-3" />
                    <p className="font-jost text-sm uppercase tracking-[0.15em] text-white/60 font-medium">
                        No Social Links Added
                    </p>
                </div>
            )}

            {/* Social Link Edit Modal */}
            <AnimatePresence>
                {selectedPlatform && (
                    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isSaving && setSelectedPlatform(null)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
                        />

                        <motion.div
                            initial={{ scale: 0.96, opacity: 0, y: 12 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.96, opacity: 0, y: 12 }}
                            transition={{ duration: 0.25, ease: EASE }}
                            className="relative w-full max-w-md bg-[#0d0c0a] border border-[#7a6b4f]/35 p-6 sm:p-7 flex flex-col gap-5 shadow-[0_0_50px_rgba(0,0,0,0.85)] z-10 rounded-none"
                        >
                            <div className="flex items-center justify-between pb-3 border-b border-[#7a6b4f]/20">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-none border border-[#c4a97d]/50 bg-[#c4a97d]/10 flex items-center justify-center text-[#c4a97d]">
                                        <selectedPlatform.icon size={16} />
                                    </div>
                                    <div>
                                        <h3 className="font-jk text-base uppercase tracking-wider text-white/95">
                                            {existingMap.has(selectedPlatform.key) ? 'Edit Connection' : 'Connect'} {selectedPlatform.label}
                                        </h3>
                                        <p className="font-jost text-[11px] text-white/40">
                                            Enter your profile URL or username.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedPlatform(null)}
                                    disabled={isSaving}
                                    className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white border border-[#7a6b4f]/20 hover:border-[#c4a97d]/50 bg-black/40 transition-colors cursor-pointer"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="flex flex-col gap-3.5">
                                <div className="flex flex-col gap-1.5">
                                    <label className="font-jost text-[10.5px] uppercase tracking-[0.16em] text-white/50">
                                        Profile URL / Link *
                                    </label>
                                    <input
                                        type="text"
                                        value={inputUrl}
                                        onChange={(e) => setInputUrl(e.target.value)}
                                        placeholder={selectedPlatform.urlPlaceholder}
                                        className="w-full bg-[#080808] font-jost text-xs text-white/90 outline-none px-3 py-2.5 border border-[#7a6b4f]/30 focus:border-[#c4a97d]/60 placeholder:text-white/20 transition-colors"
                                    />
                                    <span className="font-jost text-[10.5px] text-white/30">
                                        e.g. {selectedPlatform.example}
                                    </span>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="font-jost text-[10.5px] uppercase tracking-[0.16em] text-white/50">
                                        Display Name / Handle (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={inputUsername}
                                        onChange={(e) => setInputUsername(e.target.value)}
                                        placeholder="e.g. @valhalla"
                                        className="w-full bg-[#080808] font-jost text-xs text-white/90 outline-none px-3 py-2.5 border border-[#7a6b4f]/30 focus:border-[#c4a97d]/60 placeholder:text-white/20 transition-colors"
                                    />
                                </div>
                            </div>

                            {errorMsg && (
                                <div className="px-3.5 py-2 bg-red-950/40 border border-red-500/40 text-red-200 text-xs font-jost">
                                    {errorMsg}
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-3 border-t border-[#7a6b4f]/20">
                                {existingMap.has(selectedPlatform.key) ? (
                                    <button
                                        type="button"
                                        onClick={() => handleDisconnect(selectedPlatform.key)}
                                        disabled={isSaving}
                                        className="flex items-center gap-1.5 px-3 py-2 font-jost text-xs uppercase tracking-wider text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                                    >
                                        <Trash2 size={13} />
                                        <span>Disconnect</span>
                                    </button>
                                ) : <div />}

                                <div className="flex items-center gap-2.5">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedPlatform(null)}
                                        disabled={isSaving}
                                        className="px-4 py-2 font-jost text-xs uppercase tracking-wider text-white/60 hover:text-white border border-[#7a6b4f]/25 hover:border-[#7a6b4f]/40 transition-colors cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSaveConnection}
                                        disabled={isSaving}
                                        className="px-5 py-2 font-jost text-xs uppercase tracking-wider bg-[#c4a97d] text-[#080808] font-medium hover:bg-[#d8c199] transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_20px_rgba(196,169,125,0.2)] disabled:opacity-40"
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 size={13} className="animate-spin" />
                                                <span>Saving...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Check size={13} />
                                                <span>Save Link</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
