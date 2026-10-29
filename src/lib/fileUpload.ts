import { getCloudinarySignature } from "@/app/actions/cloudinary";
import type { MediaItem } from "@/types/game";
import type { GameData } from "./game";

async function handleFileUpload(id: string, item: MediaItem, root: string, folder?: string): Promise<string> {
    const folderPath = folder 
        ? `play_store/${root}/${id}/${folder}` 
        : `play_store/${root}/${id}`;

    if (!item.file) throw new Error(`No file provided for item ${item.title}`);
    
    const fileNameWithoutExtension = item.title ? item.title.replace(/\.[^/.]+$/, "") : `asset_${Date.now()}`;

    // 1. Fetch a unique signature tailored to this specific file's public_id
    const { success, errors, data } = await getCloudinarySignature(folderPath, fileNameWithoutExtension);

    if (!success) {
        throw new Error(errors?.message || `Failed to generate token for ${fileNameWithoutExtension}`);
    }
    
    const formData = new FormData();
    formData.append("file", item.file);
    formData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!);
    formData.append("timestamp", data.timestamp.toString());
    formData.append("signature", data.signature);
    formData.append("folder", folderPath); 
    formData.append("public_id", fileNameWithoutExtension);

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
    });

    if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `Upload failed for asset: ${item.title}`);
    }
    
    const cloudinary_data = await res.json();
    return cloudinary_data.secure_url;
}

export async function uploadSingleMedia(id: string, item: MediaItem, folder = "tags"): Promise<string> {
    if (!item.file) {
        return item.url || "";
    }
    return handleFileUpload(id, item, "games", folder);
}

export async function processAllMedia(id : string , data: GameData) {
    const uploadQueue: Promise<void>[] = [];

    const queueMedia = (media : MediaItem | null | undefined, folder? : string) => {
        if (media?.file) {

            const uploadPromise = handleFileUpload(id , media ,"games", folder).then((url)=>{
                media.url = url;
                media.file = undefined;
            });

            uploadQueue.push(uploadPromise)
        }
    };

    // 1. Queue Single Files
    queueMedia(data.logo)
    queueMedia(data.cover)
    queueMedia(data.wideCover)
    queueMedia(data.banner)
    queueMedia(data.banner2)

    // 2. Queue Screenshots Batch
    if (data.screenShots && data.screenShots.length > 0) {
        const newScreenshots = data.screenShots.filter((med : MediaItem) => med.file);
        newScreenshots.forEach(media=>queueMedia(media,"screenshots"))
    }
    
    if(data.dlcs && data.dlcs.length > 0) {
        const newDlcs = data.dlcs.filter((dlc) => dlc.image.file);
        newDlcs.forEach(dlc => queueMedia(dlc.image, "addons"))
    }

    if(data.bonusContent && data.bonusContent.length > 0) {
        const newDlcs = data.bonusContent.filter((dlc) => dlc.image.file);
        newDlcs.forEach(dlc => queueMedia(dlc.image, "addons"))
    }

    
    // Wait for all uploads (concurrently) to finish
    if (uploadQueue.length > 0) {
        await Promise.all(uploadQueue);
    }

    return data;
}

export async function uploadUserMedia(userId: string, file: File, folder: 'avatar' | 'banner'): Promise<string> {
    const folderPath = `play_store/users/${userId}/${folder}`;
    const cleanFileName = `${folder}_${Date.now()}`;

    const { success, errors, data } = await getCloudinarySignature(folderPath, cleanFileName);

    if (!success) {
        throw new Error(errors?.message || `Failed to generate upload signature`);
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!);
    formData.append("timestamp", data.timestamp.toString());
    formData.append("signature", data.signature);
    formData.append("folder", folderPath);
    formData.append("public_id", cleanFileName);

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
    });

    if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `Image upload failed`);
    }

    const cloudinaryData = await res.json();
    return cloudinaryData.secure_url;
}
