'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { 
    Bell, 
    Shield, 
    Sliders, 
    Check, 
    Loader2 
} from 'lucide-react'
import { EASE } from '@/lib/utils'
import type { ProfileSettings } from '@/types/profile'
import { updateUserSettings } from '@/app/actions'
import { toast } from '@/stores/alertStore'
import { useRouter } from 'next/navigation'

interface SettingsSectionProps {
    profileId: string
    initialSettings?: ProfileSettings | null
    onSettingsUpdated?: (newSettings: ProfileSettings) => void
}

// Reusable animated toggle switch matching the gold theme
interface ToggleProps {
    enabled: boolean
    onChange: (val: boolean) => void
    disabled?: boolean
}

function ToggleSwitch({ enabled, onChange, disabled = false }: ToggleProps) {
    return (
        <button
            type="button"
            onClick={() => !disabled && onChange(!enabled)}
            className={`w-11 h-6 rounded-full border transition-colors duration-300 relative cursor-pointer flex items-center px-0.5 ${
                enabled 
                    ? 'bg-[#7a6b4f]/40 border-[#c4a97d]' 
                    : 'bg-[#0d0c0a] border-[#7a6b4f]/30'
            } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
        >
            <motion.div
                layout
                transition={{ duration: 0.2, ease: EASE }}
                className={`w-4 h-4 rounded-full ${
                    enabled ? 'bg-[#c4a97d] ml-auto' : 'bg-white/40 mr-auto'
                }`}
            />
        </button>
    )
}

export default function SettingsSection({
    profileId: _profileId,
    initialSettings,
    onSettingsUpdated
}: SettingsSectionProps) {
    const router = useRouter()

    // State for Privacy & Visibility
    const [publicProfile, setPublicProfile] = useState(initialSettings?.publicProfile ?? true)
    const [showActivity, setShowActivity] = useState(initialSettings?.showActivity ?? true)
    const [showWishlist, setShowWishlist] = useState(initialSettings?.showWishlist ?? true)

    // State for Notifications
    const [emailNotifs, setEmailNotifs] = useState(initialSettings?.emailNotifs ?? true)
    const [priceAlerts, setPriceAlerts] = useState(initialSettings?.priceAlerts ?? true)
    const [commentReplyNotifs, setCommentReplyNotifs] = useState(initialSettings?.commentReplyNotifs ?? false)

    // State for App Preferences
    const [autoplayTrailers, setAutoplayTrailers] = useState(initialSettings?.autoplayTrailers ?? true)
    const [matureContent, setMatureContent] = useState(initialSettings?.matureContent ?? false)

    const [isSaving, setIsSaving] = useState(false)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)

    const handleSave = async () => {
        setIsSaving(true)
        setErrorMsg(null)

        const payload: ProfileSettings = {
            publicProfile,
            showActivity,
            showWishlist,
            emailNotifs,
            priceAlerts,
            commentReplyNotifs,
            autoplayTrailers,
            matureContent,
        }

        const res = await updateUserSettings(payload)
        setIsSaving(false)

        if (!res.success) {
            setErrorMsg(res.error || 'Failed to update preferences.')
            toast.error('Error', res.error || 'Failed to update preferences.')
            return
        }

        toast.success('Preferences Saved', 'Your privacy and application settings are up to date.')
        onSettingsUpdated?.(payload)
        router.refresh()
    }

    return (
        <div className="flex flex-col gap-10 max-w-2xl">
            {/* Header info */}
            <div>
                <h3 className="font-jk text-lg uppercase tracking-wider text-white/95">
                    Profile & Application Preferences
                </h3>
                <p className="font-jost text-xs text-white/40 mt-1">
                    Configure your public visibility, notifications, and client behaviors.
                </p>
            </div>

            {errorMsg && (
                <div className="p-3 bg-red-950/40 border border-red-500/40 text-red-200 text-xs font-jost">
                    {errorMsg}
                </div>
            )}

            {/* --- SECTION 1: PRIVACY & VISIBILITY --- */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[#7a6b4f]/20">
                    <Shield size={16} className="text-[#c4a97d]" />
                    <span className="font-jost text-[11px] font-semibold tracking-[0.2em] uppercase text-white/60">
                        Privacy & Visibility
                    </span>
                </div>

                <div className="flex flex-col divide-y divide-[#7a6b4f]/10">
                    <div className="flex items-center justify-between py-4">
                        <div>
                            <p className="font-jost text-[13.5px] font-medium text-white/90">Public Profile</p>
                            <p className="font-jost text-[11.5px] text-white/40 mt-0.5">
                                Allow anyone to view your library, wishlist, comments, and biography
                            </p>
                        </div>
                        <ToggleSwitch enabled={publicProfile} onChange={setPublicProfile} />
                    </div>

                    <div className="flex items-center justify-between py-4">
                        <div>
                            <p className="font-jost text-[13.5px] font-medium text-white/90">Activity Status</p>
                            <p className="font-jost text-[11.5px] text-white/40 mt-0.5">
                                Display when you are online or currently active
                            </p>
                        </div>
                        <ToggleSwitch enabled={showActivity} onChange={setShowActivity} disabled={!publicProfile} />
                    </div>

                    <div className="flex items-center justify-between py-4">
                        <div>
                            <p className="font-jost text-[13.5px] font-medium text-white/90">Public Wishlist</p>
                            <p className="font-jost text-[11.5px] text-white/40 mt-0.5">
                                Allow other users to see games you have saved to your wishlist
                            </p>
                        </div>
                        <ToggleSwitch enabled={showWishlist} onChange={setShowWishlist} disabled={!publicProfile} />
                    </div>
                </div>
            </div>

            {/* --- SECTION 2: NOTIFICATIONS --- */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[#7a6b4f]/20">
                    <Bell size={16} className="text-[#c4a97d]" />
                    <span className="font-jost text-[11px] font-semibold tracking-[0.2em] uppercase text-white/60">
                        Notifications
                    </span>
                </div>

                <div className="flex flex-col divide-y divide-[#7a6b4f]/10">
                    <div className="flex items-center justify-between py-4">
                        <div>
                            <p className="font-jost text-[13.5px] font-medium text-white/90">Email Digests</p>
                            <p className="font-jost text-[11.5px] text-white/40 mt-0.5">
                                Receive periodic summaries of activity and store highlights
                            </p>
                        </div>
                        <ToggleSwitch enabled={emailNotifs} onChange={setEmailNotifs} />
                    </div>

                    <div className="flex items-center justify-between py-4">
                        <div>
                            <p className="font-jost text-[13.5px] font-medium text-white/90">Price & Release Alerts</p>
                            <p className="font-jost text-[11.5px] text-white/40 mt-0.5">
                                Notifications when games on your wishlist go on sale or release
                            </p>
                        </div>
                        <ToggleSwitch enabled={priceAlerts} onChange={setPriceAlerts} />
                    </div>

                    <div className="flex items-center justify-between py-4">
                        <div>
                            <p className="font-jost text-[13.5px] font-medium text-white/90">Comment Replies</p>
                            <p className="font-jost text-[11.5px] text-white/40 mt-0.5">
                                Receive alerts when someone replies to your community discussion comments
                            </p>
                        </div>
                        <ToggleSwitch enabled={commentReplyNotifs} onChange={setCommentReplyNotifs} />
                    </div>
                </div>
            </div>

            {/* --- SECTION 3: APPLICATION BEHAVIOR --- */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[#7a6b4f]/20">
                    <Sliders size={16} className="text-[#c4a97d]" />
                    <span className="font-jost text-[11px] font-semibold tracking-[0.2em] uppercase text-white/60">
                        App Preferences
                    </span>
                </div>

                <div className="flex flex-col divide-y divide-[#7a6b4f]/10">
                    <div className="flex items-center justify-between py-4">
                        <div>
                            <p className="font-jost text-[13.5px] font-medium text-white/90">Autoplay Media</p>
                            <p className="font-jost text-[11.5px] text-white/40 mt-0.5">
                                Automatically play trailers and video banners
                            </p>
                        </div>
                        <ToggleSwitch enabled={autoplayTrailers} onChange={setAutoplayTrailers} />
                    </div>

                    <div className="flex items-center justify-between py-4">
                        <div>
                            <p className="font-jost text-[13.5px] font-medium text-white/90">Mature Content Filter</p>
                            <p className="font-jost text-[11.5px] text-white/40 mt-0.5">
                                Hide games and DLCs tagged with mature or adult content
                            </p>
                        </div>
                        <ToggleSwitch enabled={matureContent} onChange={setMatureContent} />
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-[#7a6b4f]/20 flex justify-end">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-2.5 font-jost text-xs uppercase tracking-wider bg-[#c4a97d] text-[#080808] font-medium hover:bg-[#d8c199] transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(196,169,125,0.2)] disabled:opacity-50"
                >
                    {isSaving ? (
                        <>
                            <Loader2 size={14} className="animate-spin" />
                            <span>Saving Changes...</span>
                        </>
                    ) : (
                        <>
                            <Check size={14} />
                            <span>Save Preferences</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}
