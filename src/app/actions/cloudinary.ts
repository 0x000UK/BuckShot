'use server'
import { auth } from '@/auth';
import { v2 as cloudinary } from 'cloudinary';


cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET

})

export type SignState = {
    success : boolean,
    errors : any,
    data : any
}

export async function getCloudinarySignature(folder: string, publicId: string) : Promise<SignState> {

    const session = await auth()
        
    if (!session || !session.user) {
        return { success: false, errors: { message: "User Unauthorized" }, data: null };
    }

    const isAdmin = session.user.role === 'admin';
    const isUserFolder = Boolean(session.user.id && folder.startsWith(`play_store/users/${session.user.id}`));

    if (!isAdmin && !isUserFolder) {
        return { success: false, errors: { message: "User Unauthorized to upload to this location" }, data: null };
    }

    try {
        const timestamp = Math.round(new Date().getTime() / 1000);
        
        const paramsToSign = {
            folder: folder,
            public_id: publicId,
            timestamp: timestamp,
        };

        const signature = cloudinary.utils.api_sign_request(
            paramsToSign,
            process.env.CLOUDINARY_API_SECRET!
        );

        return {
            success: true,
            data: { signature, timestamp },
            errors: null
        };
    } catch (error: any) {
        return {
            success: false,
            data: null,
            errors: { message: error.message || "Signature generation failed" }
        };
    }
}
