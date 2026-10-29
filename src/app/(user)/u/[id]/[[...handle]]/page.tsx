import { auth } from '@/auth';
import Profile from '@/components/profile';
import { getUserById, getUserComments, getUserLikedContent } from '@/lib/dbQueries';
import type { Metadata, Viewport } from 'next';
import { notFound, redirect } from 'next/navigation';

import type { ProfileSectionKey } from '@/types/profile';

interface PageProps {
    params: Promise<{
        id: string;
        handle?: string[];
    }>;
    searchParams?: Promise<{
        section?: string;
    }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const user = await getUserById(id);

    return {
        title: user ? `${user.handle} | Profile` : "Profile",
    };
}

export async function generateViewport({ params }: PageProps): Promise<Viewport> {
    const { id } = await params;
    const user = await getUserById(id);

    return {
        themeColor: user?.background || "#080808",
        colorScheme: 'dark'
    };
}

export default async function ProfilePage({ params, searchParams }: PageProps) {
    const session = await auth();
    const { id, handle } = await params;
    const resolvedSearchParams = searchParams ? await searchParams : {};

    const [profile, comments, likes] = await Promise.all([
        getUserById(id),
        getUserComments(id),
        getUserLikedContent(id),
    ]);

    if (!profile) notFound();

    const currenthandle = handle ? handle[0] : "";
    if (currenthandle !== profile.handle) {
        redirect(`/u/${id}/${profile.handle}`); 
    }

    const isOwner = session?.user?.handle === profile.handle;
    return (
        <Profile
            profile={profile}
            isOwner={isOwner}
            initialSection={resolvedSearchParams.section as ProfileSectionKey}
            initialComments={comments}
            initialLikes={likes}
        />
    );
}
