'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { EASE } from '@/lib/utils'
import ProfileBanner from './Banner'
import ProfileIdentity from './sections/Profile'
import ProfileSidebarNav from './Sidebar'
import OverviewSection from './sections/Overview'
import LibrarySection from './sections/Library'
import WishlistSection from './sections/Wishlist'
import SettingsSection from './sections/Settings'
import { ProfileData, ProfileSectionKey, type ProfileTabsKey } from '@/types/profile'
import ProfileTopNav from './Topnav'
import SocialsTab from './tabs/Socials'
import AccountsSection from './sections/Accounts'
import CommentsSection from './sections/Comments'
import LikesSection from './sections/Likes'
import ProfileMediaModal from './ProfileMediaModal'
import { Lock } from 'lucide-react'
import type { UserCommentItem, UserLikedItem } from '@/lib/queries'

interface ProfileProps {
    profile: ProfileData
    isOwner?: boolean
    initialSection?: ProfileSectionKey
    initialComments?: UserCommentItem[]
    initialLikes?: UserLikedItem[]
}

export default function Profile({
    profile,
    isOwner = false,
    initialSection = 'overview',
    initialComments = [],
    initialLikes = []
}: ProfileProps) {
    const [currentProfile, setCurrentProfile] = useState<ProfileData>(profile)
    const [activeSection, setActiveSection] = useState<ProfileSectionKey>(initialSection)
    const [activeTab, setActiveTab] = useState<ProfileTabsKey>('about')

    // Media Upload Modal State
    const [mediaModal, setMediaModal] = useState<{
        isOpen: boolean;
        type: 'avatar' | 'banner';
    }>({
        isOpen: false,
        type: 'avatar',
    });

    useEffect(() => {
        setCurrentProfile(profile);
    }, [profile]);

    const handleOpenAvatarUpload = () => {
        setMediaModal({ isOpen: true, type: 'avatar' });
    };

    const handleOpenBannerUpload = () => {
        setMediaModal({ isOpen: true, type: 'banner' });
    };

    const handleMediaSuccess = (newUrl: string) => {
        if (mediaModal.type === 'avatar') {
            setCurrentProfile(prev => ({ ...prev, avatar: newUrl }));
        } else {
            setCurrentProfile(prev => ({
                ...prev,
                banner: {
                    type: 'image',
                    image: newUrl,
                    video: prev.banner?.video ?? null,
                    color: prev.banner?.color ?? '#232323',
                }
            }));
        }
    };

    const isPrivate = !isOwner && currentProfile.settings?.publicProfile === false;

    return (
        <div className="min-h-screen" style={{ backgroundColor: currentProfile.background || '#232323' }}>
            <ProfileBanner
                banner={currentProfile.banner}
                isOwner={isOwner}
                onEditBanner={handleOpenBannerUpload}
            />

            <div className="flex flex-col">
                <ProfileIdentity
                    profile={currentProfile}
                    isOwner={isOwner}
                    onEditProfile={handleOpenAvatarUpload}
                />

                <div className='max-w-7xl w-full mx-auto px-6 sm:px-16 pb-24 z-1'>
                    {/* OWNER CONTROLS & MANAGEMENT */}
                    {isOwner && (
                        <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 mt-8">
                            <ProfileSidebarNav
                                activeSection={activeSection}
                                onChange={setActiveSection}
                                isOwner={isOwner}
                            />

                            <div className="flex-1 min-w-0 bg-black/40 overflow-hidden rounded-none border border-[#7a6b4f]/20 p-6 sm:p-10">
                                {currentProfile.settings?.publicProfile === false && (
                                    <div className="mb-6 flex items-center gap-2 p-2.5 bg-[#7a6b4f]/15 border border-[#7a6b4f]/30 text-[#c4a97d] text-xs font-jost">
                                        <Lock size={13} />
                                        <span>Your profile is currently set to Private. Only you can view these details.</span>
                                    </div>
                                )}

                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeSection}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        transition={{ duration: 0.3, ease: EASE }}
                                    >
                                        {activeSection === 'overview' && (
                                            <OverviewSection
                                                profile={currentProfile}
                                                isOwner={isOwner}
                                                onBioUpdated={(newBio) => setCurrentProfile(prev => ({ ...prev, about: newBio }))}
                                            />
                                        )}
                                        {activeSection === 'account' && (
                                            <AccountsSection
                                                user={{
                                                    name: currentProfile.name,
                                                    email: currentProfile.email,
                                                    handle: currentProfile.handle,
                                                    id: currentProfile.id
                                                }}
                                                onUserUpdated={(u) => setCurrentProfile(prev => ({ ...prev, name: u.name, handle: u.handle, email: u.email }))}
                                            />
                                        )}
                                        {activeSection === 'socials' && (
                                            <SocialsTab
                                                socials={currentProfile.socials}
                                                isOwner={isOwner}
                                                onSocialsUpdated={(s) => setCurrentProfile(prev => ({ ...prev, socials: s }))}
                                            />
                                        )}
                                        {activeSection === 'library' && (
                                            <LibrarySection
                                                profileId={currentProfile.id}
                                                initialGames={currentProfile.library}
                                            />
                                        )}
                                        {activeSection === 'wishlist' && (
                                            <WishlistSection
                                                profileId={currentProfile.id}
                                                initialWishlist={currentProfile.wishlist}
                                            />
                                        )}
                                        {activeSection === 'comments' && (
                                            <CommentsSection
                                                profileId={currentProfile.id}
                                                isOwner={isOwner}
                                                initialComments={initialComments}
                                            />
                                        )}
                                        {activeSection === 'likes' && (
                                            <LikesSection
                                                profileId={currentProfile.id}
                                                initialLikes={initialLikes}
                                            />
                                        )}
                                        {activeSection === 'settings' && (
                                            <SettingsSection
                                                profileId={currentProfile.id}
                                                initialSettings={currentProfile.settings}
                                                onSettingsUpdated={(s) => setCurrentProfile(prev => ({ ...prev, settings: s }))}
                                            />
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    )}

                    {/* PUBLIC VISITOR VIEW */}
                    {!isOwner && (
                        isPrivate ? (
                            <div className="mt-10 bg-black/40 border border-[#7a6b4f]/25 p-12 text-center flex flex-col items-center justify-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-[#7a6b4f]/15 border border-[#7a6b4f]/35 flex items-center justify-center text-[#c4a97d]">
                                    <Lock size={20} />
                                </div>
                                <h3 className="font-jk text-lg uppercase tracking-wider text-white/90">
                                    This Profile is Private
                                </h3>
                                <p className="font-jost text-xs text-white/40 max-w-sm leading-relaxed">
                                    The user has set their profile visibility to private. Biography, collection, and community interactions are hidden.
                                </p>
                            </div>
                        ) : (
                            <div className="mt-10 bg-black/40 border border-[#7a6b4f]/20 rounded-none overflow-hidden">
                                {/* Top Tab Bar */}
                                <ProfileTopNav
                                    activeSection={activeTab}
                                    onChange={setActiveTab}
                                    isOwner={false}
                                />

                                {/* Tab Content Area */}
                                <div className="p-6 sm:p-10 min-w-0">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={activeTab}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.25, ease: EASE }}
                                        >
                                            {activeTab === 'about' && (
                                                <OverviewSection profile={currentProfile} isOwner={false} />
                                            )}
                                            {activeTab === 'comments' && (
                                                <CommentsSection
                                                    profileId={currentProfile.id}
                                                    isOwner={false}
                                                    initialComments={initialComments}
                                                />
                                            )}
                                            {activeTab === 'likes' && (
                                                <LikesSection
                                                    profileId={currentProfile.id}
                                                    initialLikes={initialLikes}
                                                />
                                            )}
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* Profile Picture & Banner Upload Modal */}
            <ProfileMediaModal
                isOpen={mediaModal.isOpen}
                onClose={() => setMediaModal(prev => ({ ...prev, isOpen: false }))}
                type={mediaModal.type}
                currentUrl={mediaModal.type === 'avatar' ? currentProfile.avatar : currentProfile.banner?.image}
                userId={currentProfile.id}
                onSuccess={handleMediaSuccess}
            />
        </div>
    )
}
