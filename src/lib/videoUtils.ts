export interface VideoMediaDetails {
    isYouTube: boolean;
    videoId: string | null;
    embedUrl: string;
    thumbnailUrl: string;
    isDirectVideo: boolean;
}

/**
 * Parses a media URL and returns embedding and thumbnail details for YouTube and direct video files.
 */
export function getVideoMediaDetails(url?: string | null): VideoMediaDetails {
    if (!url || typeof url !== "string") {
        return {
            isYouTube: false,
            videoId: null,
            embedUrl: "",
            thumbnailUrl: "",
            isDirectVideo: false,
        };
    }

    const trimmed = url.trim();

    // Match various YouTube URL formats:
    // - https://www.youtube.com/watch?v=VIDEO_ID (with any query params)
    // - https://youtu.be/VIDEO_ID
    // - https://www.youtube.com/embed/VIDEO_ID or youtube-nocookie.com/embed/VIDEO_ID
    // - https://www.youtube.com/shorts/VIDEO_ID
    // - https://www.youtube.com/live/VIDEO_ID
    let videoId: string | null = null;

    try {
        if (trimmed.includes("youtu.be/")) {
            const path = trimmed.split("youtu.be/")[1]?.split(/[?#&]/)[0];
            if (path && /^[a-zA-Z0-9_-]{11}$/.test(path)) {
                videoId = path;
            }
        } else if (trimmed.includes("youtube.com/") || trimmed.includes("youtube-nocookie.com/")) {
            const urlObj = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
            if (urlObj.searchParams.has("v")) {
                videoId = urlObj.searchParams.get("v");
            } else {
                const match = urlObj.pathname.match(/\/(?:embed|shorts|live|v)\/([a-zA-Z0-9_-]{11})/i);
                if (match) {
                    videoId = match[1];
                }
            }
        }
    } catch {
        // Fallback to regex if URL parsing fails
    }

    if (!videoId) {
        const ytMatch = trimmed.match(
            /(?:youtube(?:-nocookie)?\.com\/(?:watch\?.*v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i
        );
        if (ytMatch && ytMatch[1]) {
            videoId = ytMatch[1];
        }
    }

    if (videoId) {
        return {
            isYouTube: true,
            videoId,
            embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`,
            thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
            isDirectVideo: false,
        };
    }

    const isDirect = /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(trimmed);

    return {
        isYouTube: false,
        videoId: null,
        embedUrl: trimmed,
        thumbnailUrl: trimmed,
        isDirectVideo: isDirect,
    };
}
