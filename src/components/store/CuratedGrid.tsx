'use client';

import GameCard from '@/components/GameCard';
import type { GameMeta } from '@/types/game';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/stores/alertStore';
import { toggleWishlist } from '@/app/actions/wishlist.actions';

interface CuratedGridProps {
    games: GameMeta[];
}

export default function CuratedGrid({ games }: CuratedGridProps) {
    const { status } = useSession();
    const openAuth = useAuthStore((state) => state.openAuth);

    const handleAddToWishlist = (id: string | null, title: string) => {
        if (!id) return;
        const coreAction = async () => {
            const res = await toggleWishlist(id);
            if (res.success) {
                if (res.inWishlist) {
                    toast.success('Wishlist Updated', `${title} added to your wishlist!`);
                } else {
                    toast.info('Wishlist Updated', `${title} removed from your wishlist.`);
                }
            } else {
                toast.error('Wishlist Error', res.error || 'Failed to update wishlist');
            }
        };
        if (status === 'authenticated') {
            coreAction();
        } else {
            openAuth(coreAction);
        }
    };

    if (games.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 border border-[#7a6b4f]/15 bg-[#0a0a0a]">
                <span className="font-jk text-2xl tracking-wider text-white/40 uppercase">
                    No Titles Found
                </span>
                <span className="font-jost text-[12px] text-white/30 mt-2">
                    Check back soon as new titles are added to this collection.
                </span>
                <Link
                    href="/store"
                    className="mt-6 px-6 py-2.5 border border-[#c4a97d]/30 text-[#c4a97d] hover:border-[#c4a97d] font-jost text-xs uppercase tracking-widest transition-colors"
                >
                    Browse Store Catalog
                </Link>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {games.map((game) => (
                <Link
                    key={game.id}
                    href={`/g/${game.id}/${game.slug}`}
                    className="block focus:outline-none w-full"
                >
                    <GameCard
                        game={game}
                        className="w-full"
                        onAddtoWishlist={() => handleAddToWishlist(game.id, game.title)}
                    />
                </Link>
            ))}
        </div>
    );
}
