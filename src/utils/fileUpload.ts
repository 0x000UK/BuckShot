import { getCloudinarySignature } from "@/app/actions/cloudinary";
import type { ImageFile, GameData, AdditionalContent } from "@/types/game";

export async function handleFileUpload(files: ImageFile[] | ImageFile, gameId: string, folder?: string): Promise<string[]> {
    const folderPath = folder 
        ? `play_store/games/${gameId}/${folder}` 
        : `play_store/games/${gameId}`;

    const upload = async (target: ImageFile) => {
        if (!target.file) return "";
        
        const fileNameWithoutExtension = target.title ? target.title.replace(/\.[^/.]+$/, "") : `asset_${Date.now()}`;

        // 1. Fetch a unique signature tailored to this specific file's public_id
        const { success, errors, data } = await getCloudinarySignature(folderPath, fileNameWithoutExtension);

        if (!success) {
            throw new Error(errors?.message || `Failed to generate token for ${fileNameWithoutExtension}`);
        }
        
        const formData = new FormData();
        formData.append("file", target.file);
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
            throw new Error(errJson.error?.message || `Upload failed for asset: ${target.title}`);
        }
        
        const cloudinary_data = await res.json();
        return cloudinary_data.secure_url;
    };

    const uploadPromises = Array.isArray(files) ? files.map(upload) : [upload(files)];
    return await Promise.all(uploadPromises);
}

export async function processAllFileUploads(data: GameData, setValue: any) {
    const payload = { ...data } as Record<keyof GameData, any>;
    const uploadQueue: Promise<void>[] = [];

    // Helper 1: Process Single Image Fields
    const queueSingleImage = (fieldKey: keyof GameData) => {
        const imageObj = payload[fieldKey] as any;
        if (imageObj?.file) {
            uploadQueue.push(
                handleFileUpload(imageObj, data.id).then((urls) => {
                    if (urls.length && urls[0]) {
                        payload[fieldKey] = { ...imageObj, previewUrl: urls[0], file: undefined };
                        setValue(fieldKey, payload[fieldKey]);
                    }
                })
            );
        }
    };

    // Helper 2: Process Arrays of Additional Content (DLCs, Bonus Content)
    const queueAdditionalContent = (fieldKey: "bonusContent" | "dlcs") => {
        const items = payload[fieldKey];
        if (!items || items.length === 0) return;

        const itemsWithFiles = items.filter((item : any) => item.imageFile?.file);
        if (itemsWithFiles.length > 0) {
            // Extract just the imageFile objects for the batch upload
            const filesToUpload = itemsWithFiles.map((item : any) => item.imageFile);
            
            uploadQueue.push(
                handleFileUpload(filesToUpload, data.id, fieldKey).then((urls) => {
                    let urlIdx = 0;
                    payload[fieldKey] = items.map((item : any) => {
                        if (item.imageFile?.file) {
                            const updatedItem = {
                                ...item,
                                imageFile: {
                                    ...item.imageFile,
                                    previewUrl: urls[urlIdx++],
                                    file: undefined,
                                },
                            };
                            return updatedItem;
                        }
                        return item;
                    });
                    setValue(fieldKey, payload[fieldKey]);
                })
            );
        }
    };

    // 1. Queue Single Files
    queueSingleImage("logoImageFile");
    queueSingleImage("coverImageFile");
    queueSingleImage("bannerImageFile");
    queueSingleImage("bannerImageFile2");

    // 2. Queue Screenshots Batch
    if (payload.previewImages && payload.previewImages.length > 0) {
        const newScreenshots = payload.previewImages.filter((img : ImageFile) => img.file);
        if (newScreenshots.length > 0) {
            uploadQueue.push(
                handleFileUpload(newScreenshots, data.id, "screenshots").then((urls) => {
                    let urlIdx = 0;
                    payload.previewImages = payload.previewImages.map((img : ImageFile) => {
                        if (img.file) {
                            return { ...img, previewUrl: urls[urlIdx++], file: undefined };
                        }
                        return img;
                    });
                    setValue("previewImages", payload.previewImages);
                })
            );
        }
    }

    // 3. Queue Nested Content Files
    queueAdditionalContent("dlcs");
    queueAdditionalContent("bonusContent");

    // Wait for all uploads (concurrently) to finish
    if (uploadQueue.length > 0) {
        await Promise.all(uploadQueue);
    }

    // 4. Final safety strip: Ensure absolutely no `file` blobs leak into the DB payload
    const stripFile = (imgObj: any) => (imgObj ? { ...imgObj, file: undefined } : imgObj);

    return {
        ...payload,
        logoImageFile: stripFile(payload.logoImageFile),
        coverImageFile: stripFile(payload.coverImageFile),
        bannerImageFile: stripFile(payload.bannerImageFile),
        bannerImageFile2: payload.bannerImageFile2 ? stripFile(payload.bannerImageFile2) : null,
        previewImages: payload.previewImages?.map(stripFile) || [],
        bonusContent: payload.bonusContent?.map((item : AdditionalContent) => ({ ...item, imageFile: stripFile(item.imageFile) })) || null,
        dlcs: payload.dlcs?.map((item : AdditionalContent) => ({ ...item, imageFile: stripFile(item.imageFile) })) || null,
    };
}