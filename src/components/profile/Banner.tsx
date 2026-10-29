import { ProfileData } from '@/types/profile'
import Image from 'next/image'
import { Camera, Edit, Edit2Icon } from 'lucide-react'

interface ProfileBannerProps {
    banner: ProfileData['banner']
    isOwner?: boolean
    onEditBanner?: () => void
}

export default function ProfileBanner({ banner, isOwner = false, onEditBanner }: ProfileBannerProps) {
    return (
        <div className="relative w-full h-64 sm:h-76 md:h-84 lg:h-100 overflow-hidden z-0 group">
            { banner ? (
                <>
                    { banner.type === 'video' && banner.video ? (
                        <>
                            <video
                                src={banner.video}
                                autoPlay
                                muted
                                loop
                                playsInline
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-linear-to-b from-black/70 via-transparent to-transparent" />
                        </>
                    ) : banner.type === "image" && banner.image ? (
                        <>
                            <Image
                                src={banner.image}
                                alt='banner'
                                fill
                                style={{objectFit : 'cover' , opacity : 0.9}}
                                priority
                            />
                            <div className="absolute inset-0 bg-linear-to-b from-black/70 via-transparent to-transparent" />
                        </>
                    ) : banner.type === 'color'  && banner.color ? (
                        <>
                            <div
                                className="absolute inset-0 w-full h-full"
                                style={{ background: banner.color }}
                            />
                        </>
                    ) : <></>
                    }
                </>
            ) : (
                <div
                    className="absolute inset-0 w-full h-full"
                    style={{ backgroundColor: '#7a6b4f' }}
                />
            )}

            {/* Owner Edit Banner Button with White Alpha BG */}
            {isOwner && onEditBanner && (
                <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-10 z-3 opacity-0 group-hover:opacity-100">
                    <button
                        type="button"
                        onClick={onEditBanner}
                        aria-label="Change profile banner"
                        className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 transition-all duration-200 cursor-pointer group/btn"
                    >
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/20 flex items-center justify-center text-white border border-white/25 group-hover/btn:bg-white/30 transition-colors">
                            <Edit2Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                        </div>
                    </button>
                </div>
            )}
        </div>
    )
}
