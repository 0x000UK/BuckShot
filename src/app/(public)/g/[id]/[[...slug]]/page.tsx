import { getGameById, getGameDiscussions, isGameInUserWishlist, getGamesByPublisher, getSimilarGamesByGenre } from '@/lib/queries';
import { auth } from '@/auth';
import Carousel from '@/components/Carousel';
import MediaGallery from '@/components/game/MediaGallery';
import GameHero from '@/components/game/ProductHero';
import TabSection from '@/components/game/Tabs';
import type { Metadata , Viewport} from 'next';
import { notFound, redirect } from 'next/navigation';
import React from 'react';

interface PageProps {
    params: Promise<{
        id: string;
        slug?: string[]; // Next.js returns catch-all parameters as an array of strings
    }>;
}

export async function generateMetadata({ params }:  PageProps): Promise<Metadata> {
    const { id } = await params;
    const game = await getGameById(id);

    return {
        title: `${game?.title}`,
        description: game?.synopsis,
    };
}

export async function generateViewport({ params }: PageProps): Promise<Viewport> {
     const { id } = await params;
    const game = await getGameById(id);

    return {
        themeColor: game?.ambientColor || '#090908',
        colorScheme: 'dark'
    };
}

export default async function Page({ params }: PageProps) {

    const { id , slug } = await params;
    const [game, discussions, session] = await Promise.all([
        getGameById(id),
        getGameDiscussions(id),
        auth(),
    ]);

    if (!game) notFound();

    const currentUser = session?.user
        ? {
            id: session.user.id,
            handle: session.user.handle,
            role: session.user.role,
            badges: session.user.badges || [],
        }
        : null;

    const genreIdentifiers = game.genreDetails && game.genreDetails.length > 0
        ? game.genreDetails.map((g) => g.id || g.slug)
        : (Array.isArray(game.genres) ? game.genres : []);

    const [inWishlist, publisherGames, similarGames] = await Promise.all([
        session?.user?.id ? isGameInUserWishlist(session.user.id, id) : Promise.resolve(false),
        game.publisher ? getGamesByPublisher(game.publisher, id, 10) : Promise.resolve([]),
        genreIdentifiers.length > 0 ? getSimilarGamesByGenre(genreIdentifiers, id, 10) : Promise.resolve([]),
    ]);

    const currentUrlSlug = slug ? slug[0] : "";

    if (currentUrlSlug !== game.slug) {
        redirect(`/g/${id}/${game.slug}`); 
    }

    return (
        <div style={{ '--ambient': game.ambientColor || '#0a0a0a' } as React.CSSProperties} className='bg-ambient'>
            <GameHero game={game} />
            <div className="relative z-4 mt-0 sm:-mt-8 md:-mt-[12vh]">
                <MediaGallery media={game.screenShots} label="Screenshots & Videos" />
            </div>
            <div className='w-full'>
                <TabSection
                    game={game}
                    discussions={discussions}
                    currentUser={currentUser}
                    inWishlist={inWishlist}
                />
            </div>
            
            {publisherGames.length > 0 && (
                <div className="relative w-full bg-background">
                    <Carousel
                        title={`More from ${game.publisher}`}
                        games={publisherGames}
                        exploreLink={`/store?publisher=${encodeURIComponent(game.publisher)}`}
                    />
                </div>
            )}

            {similarGames.length > 0 && (
                <div className="relative w-full bg-background">
                    <Carousel
                        title="Similar in Genre"
                        games={similarGames}
                        exploreLink={
                            game.genreDetails?.[0]?.slug
                                ? `/c/${game.genreDetails[0].slug}`
                                : "/store"
                        }
                    />
                </div>
            )}
        </div>
    );
}