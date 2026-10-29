import type { GameCreateDocument, GameDocument } from "@/models/game.model";
import type { DBGenreSchema } from "@/models/genre.model";
import type { DownloadCategory, GameMeta, GameSummary, GameTag, Genre, MediaType, NonOfficialDownloadLink, TaggedGame } from "@/types/game";
import { sqids } from "./sqids";
import mongoose from "mongoose";
import type { UserDocument } from "@/models/user.model";
import type { ProfileData, UserSummary } from "@/types/profile";
import type { GameData } from "./game";

export function toGameDocument(data: GameData) : GameCreateDocument {
    
    return {
        title:      data.title,
        subtitle:   data.subtitle,
        edition:    data.edition ? data.edition.children.length > 0 ? {type : data.edition.type, children : data.edition.children as unknown as never} : null : null,
        description:{type : data.description.type, children : data.description.children as unknown as never},
        synopsis:   data.synopsis,
        status:     data.status,
        tags:       data.tags || [],
        
        metadata: {
            developer:  data.developer,
            publisher:  data.publisher,
            franchise:  data.franchise,
            releaseDate: new Date(data.releaseDate),
            genres:     data.genres.map((g) => new mongoose.Types.ObjectId(g)),
            version:    data.version,
            platforms:  data.platforms && data.platforms.length > 0 ? data.platforms : ["PC"]
        },

        visuals: {
            logo:           data.logo.url ?? '',
            cover:          data.cover.url ?? '',
            wideCover:      data.wideCover?.url,
            banner:         data.banner.url ?? '',
            banner2:        data.banner2?.url,
            screenShots:    new mongoose.Types.DocumentArray(data.screenShots.map((media)=>({type : media.type, src : media.url, title : media.title!}))),
            ambientColor:   data.ambientColor
        },

        rating:{
            score:      data.score,
            reviewCount:data.reviewCount
        },

        contentType: {
            age:        data.age,
            ageRating:  data.ageRating,
            descriptors:data.descriptors ?? []
        },

        bonusContent: new mongoose.Types.DocumentArray(data.bonusContent ? data.bonusContent.map(c => ({
            title:  c.title,
            image:  c.image.url,
            type:   c.type,
            size:   c.image.size
        })) : []),

        dlcs: new mongoose.Types.DocumentArray(data.dlcs? data.dlcs.map(c => ({
            title:  c.title,
            image:  c.image?.url,
            type:   c.type,
            size:   c.image.size
        })) : []),

        // Plain objects act perfectly as payloads for Mongoose Maps
        requirements: new Map(Object.entries(data.requirements )),
        
        download: {
            official: new mongoose.Types.DocumentArray(data.officialDownloads ? data.officialDownloads.map((d) => ({
                name: d.name,
                url: d.url,
                logo: d.logo || undefined,
                price: d.price || undefined,
                badge: d.badge || undefined,
                editions: Array.isArray(d.editions) ? d.editions.map((e) => ({
                    edition: e.edition,
                    price: e.price,
                    regularPrice: e.regularPrice || undefined,
                    discountPercent: e.discountPercent ?? 0,
                    url: e.url || undefined,
                    isLowestPrice: Boolean(e.isLowestPrice),
                })) : undefined,
            })) : []),
            nonOfficial: new mongoose.Types.DocumentArray(data.nonOfficialDownloads ? data.nonOfficialDownloads.map((d) => ({
                siteName: d.siteName,
                url: d.url,
                logo: d.logo || undefined,
                category: d.category || "Repack",
                fileSize: d.fileSize || undefined,
                version: d.version || undefined,
                notes: d.notes || undefined,
            })) : []),
        },

        faqs : new mongoose.Types.DocumentArray(data.faqs? data.faqs.map((f)=>({
            title : f.title,
            body : f.body,
            category : f.category,
        })) : [])
    };
}

export function fromGameDocument(doc: GameDocument): GameData {
    // Official downloads mapping
    const officialDownloads = Array.isArray(doc.download?.official)
        ? doc.download.official.map((d, i) => ({
            id: `off_${i}`,
            name: d.name,
            url: d.url,
            logo: d.logo || undefined,
            price: d.price || undefined,
            badge: d.badge || undefined,
            editions: Array.isArray(d.editions)
                ? d.editions.map((e, ei) => ({
                    id: `ed_${i}_${ei}`,
                    edition: e.edition,
                    price: e.price,
                    regularPrice: e.regularPrice || undefined,
                    discountPercent: e.discountPercent ?? 0,
                    url: e.url || undefined,
                    isLowestPrice: Boolean(e.isLowestPrice),
                }))
                : undefined,
        }))
        : [];

    // Non-official downloads mapping with fallback to legacy base/update
    const nonOfficialDownloads = Array.isArray(doc.download?.nonOfficial) ?
        doc.download.nonOfficial.map((d,i) => ({
            id: `non_${i}`,
                siteName: d.siteName,
                url: Array.isArray(d.url) ? d.url : [d.url],
                logo: d.logo || undefined,
                category: (d.category as DownloadCategory) || "Repack",
                fileSize: d.fileSize || undefined,
                version: d.version || undefined,
                notes: d.notes || undefined,
        })) : [];

    return {
        id:             doc.id ?? sqids.encode([doc.gameId!, 1]),
        title:          doc.title,
        subtitle:       doc.subtitle,
        slug:           doc.slug,
        edition:        doc.edition,
        description:    doc.description,
        synopsis:       doc.synopsis,
        status:         doc.status,
        tags:           doc.tags,
        
        // Metadata mapping
        developer:      doc.metadata.developer,
        publisher:      doc.metadata.publisher,
        franchise:      doc.metadata.franchise,
        releaseDate:    doc.metadata.releaseDate.toISOString().split('T')[0],

        genres:         Array.isArray(doc.metadata.genres)
            ? doc.metadata.genres.map((g: any) => (g && g._id ? g._id.toString() : String(g)))
            : [],
        genreDetails:   Array.isArray(doc.metadata.genres)
            ? doc.metadata.genres
                .filter((g: any) => g && typeof g === "object" && "name" in g)
                .map((g: any) => ({
                    id: g._id ? g._id.toString() : "",
                    name: g.name || "",
                    slug: g.slug || "",
                }))
            : undefined,
        version:        doc.metadata?.version,
        platforms:      doc.metadata?.platforms,

        // Content Type
        age:            doc.contentType?.age,
        ageRating:      doc.contentType?.ageRating,
        descriptors:    doc.contentType?.descriptors,

        // Visuals (converting string URLs back to frontend MediaItem shapes)
        cover: { 
            id:     `cov_${doc.gameId}`,
            type:   "image" as MediaType, 
            url:    doc.visuals?.cover
        },

        wideCover : doc.visuals?.wideCover ? {
            id :    `wc_${doc.gameId}`,
            type:   "image" as MediaType,
            url :   doc.visuals.wideCover
        } : null,

        banner: { 
            id :     `ban_${doc.gameId}`,
            type:   "image" as MediaType,
            url:     doc.visuals?.banner 
        },
        
        banner2: doc.visuals?.banner2 ? {
            id :     `ban2_${doc.gameId}`,
            type:   "image" as MediaType,
            url:     doc.visuals.banner2 
        } : null,

        logo: { 
            id :    `logo_${doc.gameId}`,
            type:   "image" as MediaType,
            url:    doc.visuals?.logo
        },
        screenShots:    doc.visuals.screenShots.map((img,i) => ({id : `ss_${i}`, type : img.type, url: img.src , title : img.title})),
        ambientColor:   doc.visuals?.ambientColor,

        // Ratings
        score:              doc.rating?.score,
        reviewCount:        doc.rating?.reviewCount,

        // Add-ons
        dlcs:               Array.isArray(doc.dlcs) ? doc.dlcs.map((dlc, i)=>({
                                id : `dlc_${i}`, 
                                title : dlc.title, 
                                type : dlc.type,
                                image : {
                                    type: "image",
                                    url: dlc.image,
                                    id : `dli_${i}`,
                                    size: dlc.size ? dlc.size : 'def' as const
                                }
                            })) : [],
        bonusContent:       Array.isArray(doc.bonusContent) ? doc.bonusContent.map((dlc, i)=>({
                                id : `bc_${i}`, 
                                title : dlc.title , 
                                type : dlc.type,
                                image : {
                                    type: "image",
                                    url: dlc.image,
                                    id : `bci_${i}`,
                                    size: dlc.size ? dlc.size : 'def' as const
                                }
                            })) : [],

        requirements: doc.requirements instanceof Map ? Object.fromEntries(doc.requirements) : (doc.requirements || {}),

        officialDownloads,
        nonOfficialDownloads,
    };
}

export function summaryFromGameDocument(doc : GameDocument) : GameSummary {
    
    return {
        id:             doc.id ?? sqids.encode([doc.gameId! , 1]),
        title:          doc.title,
        subtitle:       doc.subtitle,
        slug:           doc.slug,
        cover:          doc.visuals?.cover,
        score:          doc.rating.score,
        tags:           doc.tags ?? [],
        status:         doc.status,
        publisher:      doc.metadata.publisher,
        createdAt:      doc.createdAt?.toISOString().split('T')[0],
        updatedAt:      doc.updatedAt?.toISOString().split('T')[0],
        publishedAt:    doc.publishedAt?.toISOString().split('T')[0],
        scheduledPublishAt: doc.scheduledPublishAt?.toISOString(),
    }
}

export function taggedGameFromGameDocument(doc : GameDocument , _tag? : GameTag) : TaggedGame {
    
    return {
        id:             doc.id ?? sqids.encode([doc.gameId!,1]),
        title:          doc.title,
        subtitle:       doc.subtitle,
        score:          doc.rating?.score ?? 0,
        tags:           Array.isArray(doc.tags) ? doc.tags : [],
        publisher:      doc.metadata?.publisher ?? "",
        genres:         Array.isArray(doc.metadata?.genres) ? doc.metadata.genres.map(g=> (g as unknown as DBGenreSchema).name) : [],
        slug:           doc.slug,
        cover:          doc.visuals?.cover ?? "",
        tagFeatures:    Array.isArray(doc.tagFeatures) ? doc.tagFeatures.map((t)=>({
                            type :  t.type as GameTag,
                            image : t.image,
                            video : t.video,
                            blurb : t.blurb
                        })) : [],
        synopsis:       doc.synopsis,
        status:         doc.status,
    }
}

export function metaFromGameDocument(doc : GameDocument) : GameMeta {
    
    return {
        id:             doc.id ?? sqids.encode([doc.gameId!,1]),
        slug:           doc.slug,
        title:          doc.title,
        subtitle:       doc.subtitle,
        cover:          doc.visuals.cover,
    }
}

export function fromGenreDocument(doc : DBGenreSchema) : Genre {
    return {
        id :        doc._id.toString(),
        gameCount:  doc.gameCount,
        slug:       doc.slug,
        name :      doc.name,
        createdAt : doc.createdAt.toISOString().split('T')[0]
    }
}

export function fromUserDocument(doc : UserDocument) : ProfileData {
    const mapGameRef = (ref: unknown): GameMeta => {
        const game = ref as unknown as Partial<GameDocument>;
        return {
            id:         game.id ?? (game.gameId ? sqids.encode([game.gameId, 1]) : ''),
            title:      game.title || '',
            subtitle:   game.subtitle,
            slug:       game.slug || '',
            cover:      game.visuals?.cover || ''
        };
    };

    return {
        id: doc.id,
        favoriteGames: (doc.favoriteGames || []).map(mapGameRef),
        library: ((doc as unknown as { library?: unknown[] }).library || []).map(mapGameRef),
        wishlist: ((doc as unknown as { wishlist?: unknown[] }).wishlist || []).map(mapGameRef),
        joinedDate: doc.createdAt.toLocaleDateString(),
        name: doc.name,
        handle: doc.handle,
        email: doc.email,
        about: doc.about,
        avatar: doc.avatar,
        banner: doc.banner ? {
            type: doc.banner.type as 'video' | 'image' | 'color',
            image: doc.banner.image,
            video: doc.banner.video,
            color: doc.banner.color,
        } : null,
        background: doc.background,
        socials: doc.socials,
        badges: doc.badges,
        stats: doc.stats,
        warnings: (doc.warnings || []).map((w) => ({
            reason: w.reason,
            issuedBy: w.issuedBy ? String(w.issuedBy) : undefined,
            createdAt: w.createdAt ? new Date(w.createdAt).toISOString() : undefined,
        })),
        isBanned: Boolean(doc.isBanned),
        banReason: doc.banReason || null,
    }
}

export function summaryFromUserDocument(doc : UserDocument) : UserSummary {
    return {
        id:         doc.id ?? sqids.encode([doc.userId! , 2]),
        handle:     doc.handle,
        name:       doc.name,
        avatar:     doc.avatar,
        role:       doc.role,
        email:      doc.email,
        badges:     doc.badges,
        createdAt:  doc.createdAt.toISOString().split('T')[0],
        updatedAt:  doc.updatedAt.toISOString().split('T')[0],
        isBanned:   Boolean(doc.isBanned),
        banReason:  doc.banReason || null,
        warningsCount: doc.warnings ? doc.warnings.length : 0,
    }
}
