'use client'

import { useState, useRef, useEffect} from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useRouter} from 'next/navigation'
import Image from 'next/image'
import { Search, X, ChevronRight, ArrowRight, Building2 } from 'lucide-react'
import type { GameMeta } from '@/types/game'
import { BRAND, EASE } from '@/lib/utils'
import { debouncedSearch } from '@/app/actions/search.actions'


interface SearchBarProps {
    onClose: () => void;
}

export default function SearchBar({ onClose }: SearchBarProps) {
    const router = useRouter()
    const [query, setQuery] = useState<string>("")
    const [results, setResults] = useState<{games : GameMeta[], publishers : string[]}>({games : [], publishers  : []})
    const [isLoading, setLoading] = useState(false)
    const [isFocused, setFocused] = useState(true)

    /* Refs for outside-click dismissal */
    const searchRef = useRef<HTMLDivElement>(null)

    /* Close on outside click */
    useEffect(() => {
        const fn = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                onClose()
            }
        }
        document.addEventListener('mousedown', fn)
        return () => document.removeEventListener('mousedown', fn)
    }, [onClose])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [onClose])

    useEffect(() => {
        if (query.trim().length < 2) {
            setResults({ games: [], publishers: []});
            return;
        }

        setLoading(true);

        const delayDebounceFn = setTimeout(async () => {
            try {
                const data = await debouncedSearch(query); 
                setResults(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const viewAll = () => {
        router.push(`/store?q=${encodeURIComponent(query.trim())}`)
        onClose()
    }

    const hasResults = results.games.length > 0 || results.publishers.length > 0
    const dropdownOpen = isFocused && (hasResults || query.trim().length > 0)

    return (
        <div ref={searchRef} className="flex items-center gap-2 sm:gap-4 mx-auto w-full max-w-2xl h-full">

            <div className="relative flex-1">

                <div className={`flex items-center h-10 sm:h-11 transition-all duration-300 bg-[#080808]/65 backdrop-blur-md px-3 sm:px-4 shadow-[0_0_20px_rgba(0,0,0,0.6)] ${
                        dropdownOpen
                            ? 'border-b-transparent border-t border-x border-[#7a6b4f]/50'
                            : 'border border-[#7a6b4f]/50'
                    }`}
                >
                    <div className="flex-1 flex items-center h-full min-w-0">
                        <Search size={15} className="text-[#c4a97d] mr-2.5 sm:mr-3.5 shrink-0" strokeWidth={2} />
                        <input
                            autoFocus
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={() => setFocused(true)}
                            placeholder="SEARCH GAMES, TITLES, PUBLISHERS..."
                            className="flex-1 bg-transparent border-none outline-none text-white font-jost text-[11px] sm:text-[12px] font-medium tracking-[0.06em] uppercase placeholder:text-white/30 h-full min-w-0 truncate"
                        />

                        <AnimatePresence>
                            {query && (
                                <motion.button
                                    type="button"
                                    initial={{ opacity: 0, scale: 0.7 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.7 }}
                                    transition={{ duration: 0.15 }}
                                    onClick={() => {
                                        setQuery('')
                                        setResults({ games: [], publishers: [] })
                                        setFocused(true)
                                    }}
                                    className="ml-2 text-white/40 hover:text-white transition-colors cursor-pointer bg-transparent border-none outline-none flex items-center justify-center p-1"
                                >
                                    <X size={14} strokeWidth={2} />
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <AnimatePresence>
                {dropdownOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -2 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -2 }}
                        transition={{ duration: 0.18, ease: EASE }}
                        className="absolute top-full left-0 right-0 z-50 bg-[#0d0c0a]/95 backdrop-blur-xl shadow-[0_14px_40px_-4px_rgba(0,0,0,0.85)] max-h-[65vh] sm:max-h-[70vh] overflow-y-auto"
                        style={{ border: `1px solid ${BRAND}80`, borderTop: 'none' }}
                    >
                            {/* Loading skeleton */}
                            {isLoading && (
                                <div className='flex flex-col gap-3'>
                                {[1,2,3,4].map((_, i) => (
                                    <div key={i} className="flex items-center gap-3 px-5 py-4 animate-pulse">
                                        <div className="w-12 aspect-3/4 rounded-none bg-[#7a6b4f]/20"/>
                                        <div className="h-2 w-1/2 rounded-none bg-[#7a6b4f]/20"/>
                                    </div>
                                ))}
                                </div>
                            )}

                            {/* No results */}
                            {!isLoading && !hasResults && query.trim() && (
                                <div className="px-5 py-4 flex items-center gap-3">
                                    <Search size={14} className="text-[#7a6b4f]/50" />
                                    <span className="text-white/40 text-[11px] font-jost tracking-wider uppercase">
                                        No results for{' '}
                                        <span className="text-[#c4a97d] not-italic ml-1">&quot;{query}&quot;</span>
                                    </span>
                                </div>
                            )}

                            {/* GAMES SECTION */}
                            {!isLoading && results.games.length > 0 && (
                                <div>
                                    <div className="px-4 py-2 text-[10px] font-jost tracking-[0.2em] uppercase text-[#c4a97d]/60 border-b border-[#7a6b4f]/15">
                                        Games
                                    </div>
                                    {results.games.map((game, i) => (
                                        <motion.button
                                            key={game.id}
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.18, delay: i * 0.04, ease: EASE }}
                                            onClick={() => {
                                                router.push(`/g/${game.id}${game.slug ? `/${game.slug}` : ''}`)
                                                onClose()
                                            }}
                                            className="w-full flex items-center gap-4 px-4 py-3 text-left border-b border-[#7a6b4f]/10 hover:bg-[#7a6b4f]/8 transition-colors duration-150 group cursor-pointer outline-none"
                                        >
                                            <div className="relative w-12 aspect-3/4 shrink-0 overflow-hidden border border-[#7a6b4f]/30">
                                                {game.cover ? (
                                                    <Image src={game.cover} alt={game.title} fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-linear-to-b from-[#1a1208] to-[#0d0d1a]" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-jost tracking-[0.04em] text-[12px] font-medium text-white/85 truncate group-hover:text-[#c4a97d] transition-colors duration-150 uppercase">
                                                    {game.title}
                                                </p>
                                            </div>
                                            <ChevronRight
                                                size={14}
                                                strokeWidth={1.5}
                                                className="shrink-0 text-[#7a6b4f]/40 group-hover:text-[#c4a97d] transition-transform duration-300 group-hover:translate-x-1"
                                            />
                                        </motion.button>
                                    ))}
                                </div>
                            )}

                            {/* PUBLISHERS SECTION */}
                            {!isLoading && results.publishers.length > 0 && (
                                <div>
                                    <div className="px-4 py-2 text-[10px] font-jost tracking-[0.2em] uppercase text-[#c4a97d]/60 border-b border-[#7a6b4f]/15">
                                        Publishers
                                    </div>
                                    {results.publishers.map((publisher, i) => (
                                        <motion.button
                                            key={publisher}
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.18, delay: i * 0.04, ease: EASE }}
                                            onClick={() => {
                                                router.push(`/store?publisher=${encodeURIComponent(publisher)}`)
                                                onClose()
                                            }}
                                            className="w-full flex items-center gap-4 px-4 py-3 text-left border-b border-[#7a6b4f]/10 hover:bg-[#7a6b4f]/8 transition-colors duration-150 group cursor-pointer bg-transparent outline-none"
                                        >
                                            <Building2 size={14} className="text-[#c4a97d]/50 group-hover:text-[#c4a97d] shrink-0" />
                                            <span className="flex-1 font-jost text-[12px] font-medium text-white/85 group-hover:text-[#c4a97d] transition-colors uppercase truncate">
                                                {publisher}
                                            </span>
                                            <ChevronRight
                                                size={14}
                                                strokeWidth={1.5}
                                                className="shrink-0 text-[#7a6b4f]/40 group-hover:text-[#c4a97d] transition-transform duration-300 group-hover:translate-x-1"
                                            />
                                        </motion.button>
                                    ))}
                                </div>
                            )}

                            {/* View all footer */}
                            {!isLoading && query.trim() && hasResults && (
                                <button
                                    onClick={viewAll}
                                    className="w-full flex items-center justify-between px-5 py-3.5 cursor-pointer border-t border-[#7a6b4f]/25 bg-black/20 hover:bg-[#7a6b4f]/10 transition-colors duration-150 group outline-none"
                                >
                                    <span className="text-[#c4a97d]/50 text-[10px] tracking-[0.18em] uppercase font-['Jost',sans-serif]">
                                        Showing top results
                                    </span>
                                    <span className="flex items-center gap-2 text-[#c4a97d] text-[10px] font-medium tracking-[0.2em] uppercase transition-all duration-200 group-hover:pr-1 font-['Jost',sans-serif]">
                                        View All <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                                    </span>
                                </button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Close button */}
            <motion.button
                whileHover={{ scale: 1.08, color: '#fff', rotate: 90 }}
                whileTap={{ scale: 0.94 }}
                transition={{ duration: 0.2 }}
                onClick={onClose}
                aria-label="Close search"
                className="text-[#c4a97d] hover:text-white transition-colors bg-transparent border-none cursor-pointer p-1.5 sm:p-2 shrink-0 flex items-center justify-center outline-none"
            >
                <X size={22} className="sm:w-6 sm:h-6" strokeWidth={1.5} />
            </motion.button>
        </div>
    )
}