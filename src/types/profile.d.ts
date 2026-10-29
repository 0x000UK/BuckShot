import type { GameMeta } from "./game"

export interface AuthData {
    identifier?:string
    name?: string
    handle?: string
    email?: string
    password: string
}

export type BannerType = 'video' | 'image' | 'color'

export type Badge = "admin" | "moderator" | "veteran" | "seeder" | "repacker" | "cracker"

export type SocialLink ={
    platform: 'twitter' | 'reddit' | 'twitch' | 'github' | 'linkedin' | 'instagram' | 'youtube' | 'discord' | 'steam'
    username?: string | null
    url: string
}

export type ProfileSettings = {
    publicProfile?: boolean
    showActivity?: boolean
    showWishlist?: boolean
    emailNotifs?: boolean
    priceAlerts?: boolean
    commentReplyNotifs?: boolean
    autoplayTrailers?: boolean
    matureContent?: boolean
}

export type ProfileData = {
    id: string
    name: string
    handle: string
    email: string
    avatar?: string | null
    about: string
    joinedDate: string
    favoriteGames : GameMeta[]
    library?: GameMeta[]
    wishlist?: GameMeta[]
    socials: SocialLink[]
    badges : Badge[]
    stats?: {
        gamesOwned: number
        followers?: number
        following?: number
    } | null
    banner?: {
        type: BannerType
        image?: string | null
        video?: string | null
        color?: string | null
    } | null
    background ? : string | null
    settings?: ProfileSettings | null
    warnings?: Array<{
        reason: string
        issuedBy?: string
        createdAt?: string
    }>
    isBanned?: boolean
    banReason?: string | null
}

export type ProfileMeta = {
    id : string,
    name : string,
    avatar : string,
    banner: {
        type: BannerType
        imgUrl?: string
        videoUrl?: string
        colors?: string[]
        angle? : string
    }
    badges : Badge[]
    background ? :{
        colors : string[]
        angle : string
    }
}

export type UserMeta = {
    id : string,
    name : string,
    handle : string,
    email : string,
    role : string,
}

export type UserSummary = {
    id : string,
    handle : string,
    name?: string,
    avatar?: string | null,
    role?: string,
    email : string,
    badges : Badge[],
    createdAt : string,
    updatedAt : string,
    isBanned?: boolean,
    banReason?: string | null,
    warningsCount?: number,
}

export type ProfileSectionKey = 
    | 'overview' 
    | 'socials' 
    | 'library' 
    | 'wishlist' 
    | 'favorites' 
    | 'posts' 
    | 'comments' 
    | 'likes' 
    | 'profile'
    | 'account' 
    | 'settings'

export type ProfileTabsKey = 
    | 'about' 
    | 'posts' 
    | 'comments'
    | 'likes'
