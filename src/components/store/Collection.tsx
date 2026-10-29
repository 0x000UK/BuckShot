'use client'

import GameCard from '../GameCard'
import Pagination from '../Pagination'
import type {GameMeta} from '@/types/game'
import Link from 'next/link'
import { usePathname , useRouter } from 'next/navigation'
import type { FilterSectionConfig } from './FilterSection'
import { useMemo, useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import FilterSidebar from './FilterSidebar'
import { Select } from '../admin/gameModel/utils'
import { useSession } from 'next-auth/react'
import { useAuthStore } from '@/stores/authStore'
import { toast } from '@/stores/alertStore'
import { toggleWishlist } from '@/app/actions/wishlist.actions'

export interface ActiveFilters {
    genres: string[]
    publisher: string[]
    rating: string[]
    platforms: string[]
}

interface CollectionProps {
    games: GameMeta[]
    totalCount: number
    currentSort: string
    currentOrd: string
    currentCount: number
    currentStart: number
    filterOptions: {
        genres: { value: string; label: string; count?: number }[]
        publishers: { value: string; label: string; count?: number }[]
        platforms: { value: string; label: string; count?: number }[]
    }
    activeFilters: ActiveFilters
    hiddenFilters?: ('genres' | 'publisher' | 'rating' | 'platforms')[]
}

const RATING_OPTIONS = [
    { value: '9', label: '9 and UP' },
    { value: '8', label: '8 and UP' },
    { value: '7', label: '7 and Up' },
    { value: '6', label: '6 and Up' },
    { value: '5', label: '5 and Up' },
]

export default function Collection({
    games,
    totalCount,
    currentSort,
    currentOrd,
    currentCount,
    currentStart,
    filterOptions,
    activeFilters,
    hiddenFilters,
}: CollectionProps) {
    const router = useRouter()
    const pathname = usePathname()
    const totalPages = Math.ceil(totalCount / currentCount)
    const currentPage = Math.floor(currentStart / currentCount) + 1

    const navigate = (updates: Record<string, string>) => {
        const params = new URLSearchParams()
        
        params.set('sort', currentSort)
        params.set('ord', currentOrd)
        params.set('count', currentCount.toString())
        params.set('start', currentStart.toString())

        const filterKeys: (keyof ActiveFilters)[] = ['genres', 'publisher', 'rating', 'platforms']
        
        filterKeys.forEach((key) => {
            if (!(key in updates)) {
                const values = activeFilters[key] || []
                if (values.length > 0) {
                    params.set(key, values.join(','))
                }
            }
        })

        for (const [key, value] of Object.entries(updates)) {
            if (value && value.trim() !== '') {
                params.set(key, value)
            } else {
                params.delete(key)
            }
        }

        if (!('start' in updates)) {
            params.set('start', '0')
        }

        router.push(`${pathname}?${params.toString()}`)
    }

    const sections: FilterSectionConfig[] = useMemo(() => {
        const allSections: FilterSectionConfig[] = [
            { key: 'genres', title: 'Genres', mode: 'multi', options: filterOptions.genres },
            { key: 'publisher', title: 'Publisher', mode: 'multi', options: filterOptions.publishers },
            { key: 'rating', title: 'Rating', mode: 'single', options: RATING_OPTIONS },
            { key: 'platforms', title: 'Platforms', mode: 'single', options: filterOptions.platforms },
        ]
        if (hiddenFilters && hiddenFilters.length > 0) {
            return allSections.filter((section) => !hiddenFilters.includes(section.key as 'genres' | 'publisher' | 'rating' | 'platforms'))
        }
        return allSections
    }, [filterOptions, hiddenFilters])

    const handleFilterToggle = (key: string, value: string, mode: 'multi' | 'single') => {
        const current = activeFilters[key as keyof ActiveFilters] || []
        
        const next = mode === 'single'
            ? (current.includes(value) ? [] : [value])
            : (current.includes(value) ? current.filter(v => v !== value) : [...current, value])

        // Pass the updated array directly to navigate
        navigate({ [key]: next.join(',') })
    }

    const handleClearAll = () => {
        const clearUpdates: Record<string, string> = {}
        const keys: (keyof ActiveFilters)[] = ['genres', 'publisher', 'rating', 'platforms']
        keys.forEach((k) => {
            if (!hiddenFilters?.includes(k)) {
                clearUpdates[k] = ''
            }
        })
        navigate(clearUpdates)
    }

    const rangeStart = totalCount === 0 ? 0 : currentStart + 1
    const rangeEnd = Math.min(currentStart + currentCount, totalCount)

    const { status } = useSession()
    const openAuth = useAuthStore((state) => state.openAuth)
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

    const activeFilterCount = useMemo(() => {
        return Object.values(activeFilters).reduce((acc, curr) => acc + (curr?.length || 0), 0)
    }, [activeFilters])

    const handleAddToWishlist = (id : string | null , title : string) => {
        if(!id) return
        const coreAction = async () => {
            const res = await toggleWishlist(id)
            if (res.success) {
                if (res.inWishlist) {
                    toast.success('Wishlist Updated', `${title} added to your wishlist!`)
                } else {
                    toast.info('Wishlist Updated', `${title} removed from your wishlist.`)
                }
            } else {
                toast.error('Wishlist Error', res.error || 'Failed to update wishlist')
            }
        }
        if (status === "authenticated") {
            coreAction()
        } else {
            openAuth(coreAction) 
        }
    }
        
    return (
        <div className="mx-auto overflow-y-visible my-6 sm:my-10 px-0 sm:px-2 md:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-12">
                <FilterSidebar
                    sections={sections}
                    activeFilters={activeFilters}
                    onToggle={handleFilterToggle}
                    onClearAll={handleClearAll}
                    isMobileOpen={isMobileFilterOpen}
                    setIsMobileOpen={setIsMobileFilterOpen}
                    showMobileTrigger={false}
                />

                <div className="flex-1 min-w-0">
                    {/* ── Collection Header Toolbar ── */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6">
                        <div className="flex items-center justify-between gap-2">
                            <span className="font-jost text-xs sm:text-[13px] tracking-wide text-white/50">
                                Showing <span className="text-white/90">{rangeStart}–{rangeEnd}</span> of{' '}
                                <span className="text-white/90">{totalCount}</span> items
                            </span>

                            {/* Mobile Filter Button*/}
                            <button
                                type="button"
                                onClick={() => setIsMobileFilterOpen(true)}
                                className="sm:hidden flex items-center gap-1.5 px-2.5 py-1.5 border border-[#7a6b4f]/40 text-[#c4a97d] font-jost text-[10.5px] font-medium tracking-[0.14em] uppercase bg-[#7a6b4f]/10 hover:border-[#c4a97d] transition-colors shrink-0 cursor-pointer"
                            >
                                <SlidersHorizontal size={12} strokeWidth={1.75} />
                                <span>Filters</span>
                                {activeFilterCount > 0 && (
                                    <span className="px-1.5 py-0.2 bg-[#c4a97d] text-[#080808] font-bold text-[9px] leading-none">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </button>
                        </div>

                        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                            {/* Tablet Filter Button*/}
                            <button
                                type="button"
                                onClick={() => setIsMobileFilterOpen(true)}
                                className="hidden sm:flex lg:hidden items-center gap-2 px-3 py-2 border border-[#7a6b4f]/40 text-[#c4a97d] font-jost text-[11px] font-medium tracking-[0.16em] uppercase bg-[#7a6b4f]/10 hover:border-[#c4a97d] transition-colors shrink-0 cursor-pointer"
                            >
                                <SlidersHorizontal size={14} strokeWidth={1.75} />
                                <span>Filters</span>
                                {activeFilterCount > 0 && (
                                    <span className="px-1.5 py-0.5 bg-[#c4a97d] text-[#080808] font-bold text-[9px] leading-none">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </button>

                            {/* Sort By Select */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 w-full sm:w-auto">
                                <span className="font-jost text-[10px] sm:text-xs text-white/40 uppercase tracking-wider whitespace-nowrap">
                                    Sort:
                                </span>
                                <Select
                                    value={currentSort}
                                    onChange={(v) => navigate({ sort: v })}
                                    options={[
                                        { value: "relevancy", label: "Relevant" },
                                        { value: "releaseDate", label: "Release Date" },
                                        { value: "title", label: "Alphabetical" },
                                    ]}
                                    placeholder="Sort By"
                                    className="w-full sm:w-34"
                                />
                            </div>

                            {/* Order By Select */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 w-full sm:w-auto">
                                <span className="font-jost text-[10px] sm:text-xs text-white/40 uppercase tracking-wider whitespace-nowrap">
                                    Order:
                                </span>
                                <Select
                                    value={currentOrd}
                                    onChange={(v) => navigate({ ord: v })}
                                    options={[
                                        { value: 'any', label: 'Any' },
                                        { value: 'asc', label: 'Ascending' },
                                        { value: 'desc', label: 'Descending' },
                                    ]}
                                    placeholder="Order By"
                                    className="w-full sm:w-30"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Active Filter Chips */}
                    {activeFilterCount > 0 && (
                        <div className="flex items-center gap-2 flex-wrap mb-6 -mt-2">
                            <span className="font-jost text-[10.5px] uppercase tracking-wider text-white/40 mr-1">
                                Active:
                            </span>
                            {(Object.entries(activeFilters) as [keyof ActiveFilters, string[]][]).map(([key, values]) =>
                                values.map((val: string) => (
                                    <button
                                        key={`${key}-${val}`}
                                        onClick={() =>
                                            handleFilterToggle(
                                                key,
                                                val,
                                                key === 'rating' || key === 'platforms' ? 'single' : 'multi'
                                            )
                                        }
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#7a6b4f]/15 border border-[#7a6b4f]/35 text-[#c4a97d] font-jost text-[11px] hover:border-[#c4a97d] transition-colors cursor-pointer"
                                    >
                                        <span>{val}</span>
                                        <X size={12} className="opacity-70 hover:opacity-100" />
                                    </button>
                                ))
                            )}
                            <button
                                onClick={handleClearAll}
                                className="font-jost text-[11px] text-[#c4a97d]/70 hover:text-[#c4a97d] uppercase tracking-wider ml-1 underline cursor-pointer"
                            >
                                Clear all
                            </button>
                        </div>
                    )}

                    {games.length > 0 ? (
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
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 border border-[#7a6b4f]/15">
                            <span className="font-jk text-2xl tracking-wider text-white/40">
                                No Games Found
                            </span>
                            <span className="font-jost text-[12px] text-white/25 mt-2">
                                Try adjusting or clearing your filters
                            </span>
                        </div>
                    )}

                    {totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={(page) => navigate({ start: ((page - 1) * currentCount).toString() })}
                            className="mt-10"
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
