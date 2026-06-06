'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Search, X, ChevronRight, ArrowRight } from 'lucide-react'
import { Game } from '@/types/game'

const BRAND = '#7a6b4f'
const BRAND_LIGHT = '#c4a97d'
const EASE = [0.22, 1, 0.36, 1] as const

interface SearchBarProps {
    onClose: () => void;
}

export default function SearchBar({ onClose }: SearchBarProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    /* Search state */
    const [query, setQuery] = useState(searchParams.get('q') ?? '')
    const [results, setResults] = useState<Game[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isFocused, setIsFocused] = useState(true)

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

    /* Close on Escape key */
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [onClose])

    /* Debounced live search */
    useEffect(() => {
        if (!query.trim()) { setResults([]); return }
        setIsLoading(true)
        const t = setTimeout(async () => {
            try {
                const res = await fetch(`/api/games/search?q=${encodeURIComponent(query)}&limit=4`)
                const data = await res.json()
                setResults(data.games ?? [])
            } catch {
                setResults([])
            } finally {
                setIsLoading(false)
            }
        }, 240)
        return () => clearTimeout(t)
    }, [query])

    /* Handlers */
    const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!query.trim()) return
        router.push(`/store?q=${encodeURIComponent(query.trim())}`)
        onClose()
    }, [query, router, onClose])

    const viewAll = () => {
        router.push(`/store?q=${encodeURIComponent(query.trim())}`)
        onClose()
    }

    const dropdownOpen = isFocused && (results.length > 0 || query.trim().length > 0)

    return (
        <div ref={searchRef} className="flex items-center gap-4  mx-auto w-[80%] h-full">

            {/* ── Search Input Core ── */}
            <div className={`relative flex-1 flex items-center h-11 transition-all duration-300 bg-[#090908]/95 backdrop-blur-md px-4 shadow-[0_0_20px_rgba(0,0,0,0.6)] ${dropdownOpen ? 'border-b-transparent border-t border-x border-[#7a6b4f]/50' : 'border border-[#7a6b4f]/50'}`}>
                
                <form onSubmit={handleSubmit} className="flex-1 flex items-center h-full">
                    <Search size={16} className="text-[#c4a97d] mr-3.5 shrink-0" strokeWidth={2} />
                    
                    <input
                        autoFocus
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        placeholder="SEARCH STOREFRONT, LIBRARY, TERMINAL ARCHIVES..."
                        className="flex-1 bg-transparent border-none outline-none text-white font-['Jost',sans-serif] text-[12px] font-medium tracking-[0.06em] uppercase placeholder:text-white/25 h-full"
                    />

                    {/* Internal text clear button */}
                    <AnimatePresence>
                        {query && (
                            <motion.button
                                type="button"
                                initial={{ opacity: 0, scale: 0.7 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.7 }}
                                transition={{ duration: 0.15 }}
                                onClick={() => { setQuery(''); setResults([]); setIsFocused(true) }}
                                className="ml-2 text-white/30 hover:text-white/80 transition-colors cursor-pointer bg-transparent border-none outline-none flex items-center justify-center"
                            >
                                <X size={14} strokeWidth={2} />
                            </motion.button>
                        )}
                    </AnimatePresence>
                </form>

                {/* ── Results Dropdown Panel ── */}
                <AnimatePresence>
                    {dropdownOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -2 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -2 }}
                            transition={{ duration: 0.18, ease: EASE }}
                            className="absolute top-full -left-px -right-px z-50 bg-[#090908]/98 backdrop-blur-xl overflow-hidden shadow-[0_14px_40px_-4px_rgba(0,0,0,0.7)]"
                            style={{ border: `1px solid ${BRAND}80`, borderTop: 'none' }}
                        >
                            {/* Loading Skeleton */}
                            {isLoading && (
                                <div className="flex gap-3 px-5 py-4 animate-pulse">
                                    {[80, 120, 60].map((w, i) => (
                                        <div key={i} className="h-2 rounded-sm bg-[#7a6b4f]/20" style={{ width: w }} />
                                    ))}
                                </div>
                            )}

                            {/* No Results state */}
                            {!isLoading && results.length === 0 && query.trim() && (
                                <div className="px-5 py-4 flex items-center gap-3">
                                    <Search size={14} className="text-[#7a6b4f]/50" />
                                    <span className="text-white/40 text-[11px] font-['Jost',sans-serif] tracking-wider uppercase">
                                        No results for <span className="text-[#c4a97d] not-italic ml-1">&quot;{query}&quot;</span>
                                    </span>
                                </div>
                            )}

                            {/* Data Rows */}
                            {!isLoading && results.map((r, i) => (
                                <motion.button
                                    key={r.id}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.18, delay: i * 0.04, ease: EASE }}
                                    onClick={() => { router.push(`/game/${r.id}`); onClose(); }}
                                    className="w-full flex items-center gap-4 px-4 py-3 text-left border-b border-[#7a6b4f]/10 last:border-0 hover:bg-[#7a6b4f]/8 transition-colors duration-150 group cursor-pointer bg-transparent outline-none"
                                >
                                    <div className="relative w-9 h-12 shrink-0 overflow-hidden border border-[#7a6b4f]/30">
                                        {r.coverImage
                                            ? <Image src={r.coverImage} alt={r.title} fill className="object-cover" />
                                            : <div className="w-full h-full bg-linear-to-b from-[#1a1208] to-[#0d0d1a]" />
                                        }
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="font-['Jost',sans-serif] tracking-[0.04em] text-[12px] font-medium text-white/85 truncate group-hover:text-[#c4a97d] transition-colors duration-150 uppercase">
                                            {r.title}
                                        </p>
                                        <div className="flex gap-2 mt-1">
                                            {r.metadata?.genres?.slice(0, 2).map((g: string) => (
                                                <span key={g} className="text-[8px] font-medium tracking-[0.16em] uppercase text-[#c4a97d]/60 font-['Jost',sans-serif]">
                                                    {g}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <ChevronRight size={14} strokeWidth={1.5} className="shrink-0 text-[#7a6b4f]/40 group-hover:text-[#c4a97d] transition-transform duration-300 group-hover:translate-x-1" />
                                </motion.button>
                            ))}

                            {/* View All Footer */}
                            {!isLoading && query.trim() && (
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

            {/* ── Global Retract Control ── */}
            <motion.button
                whileHover={{ scale: 1.08, color: '#fff', rotate: 90 }}
                whileTap={{ scale: 0.94 }}
                transition={{ duration: 0.2 }}
                onClick={onClose}
                className="text-[#c4a97d] bg-transparent border-none cursor-pointer p-2 shrink-0 flex items-center justify-center outline-none"
            >
                <X size={24} strokeWidth={1.5} />
            </motion.button>
        </div>
    )
}