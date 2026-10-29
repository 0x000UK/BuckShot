'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { SlidersHorizontal, X } from 'lucide-react'
import type { FilterSectionConfig } from './FilterSection'
import FilterSection from './FilterSection'
import { EASE } from '@/lib/utils'
import type { ActiveFilters } from './Collection'

interface FilterSidebarProps {
    sections: FilterSectionConfig[]
    activeFilters: ActiveFilters
    onToggle: (key: string, value: string, mode: 'multi' | 'single') => void
    onClearAll: () => void
    isMobileOpen?: boolean
    setIsMobileOpen?: (open: boolean) => void
    showMobileTrigger?: boolean
}

export default function FilterSidebar({
    sections,
    activeFilters,
    onToggle,
    onClearAll,
    isMobileOpen: controlledOpen,
    setIsMobileOpen: setControlledOpen,
    showMobileTrigger = true,
}: FilterSidebarProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const isMobileOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
    const setIsMobileOpen = setControlledOpen || setInternalOpen
    const hasActiveFilters = Object.values(activeFilters).some(v => v.length > 0)

    const content = (
        <>
            <div className="flex items-center justify-between mb-2 pb-5 border-b border-[#7a6b4f]/25">
                <span className="font-jk text-lg tracking-wider uppercase text-primary">
                    Filters
                </span>
                {hasActiveFilters && (
                    <button
                        onClick={onClearAll}
                        className="font-jost text-[10.5px] tracking-[0.15em] uppercase text-[#c4a97d]/70 hover:text-[#c4a97d] bg-transparent border-none cursor-pointer transition-colors"
                    >
                        Clear all
                    </button>
                )}
            </div>

            {sections.map((section) => (
                <FilterSection
                    key={section.key}
                    section={section}
                    activeValues={activeFilters[section.key as keyof ActiveFilters] || []}
                    onToggle={onToggle}
                />
            ))}
        </>
    )

    return (
        <>
            {/* Desktop*/}
            <aside className="hidden lg:block w-64 shrink-0">
                {content}
            </aside>

            {/* Mobile*/}
            {showMobileTrigger && (
                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="lg:hidden flex items-center gap-2 px-4 py-2.5 mb-6 border border-[#7a6b4f]/40 text-[#c4a97d] font-jost text-[11px] font-medium tracking-[0.18em] uppercase bg-transparent cursor-pointer transition-colors hover:border-[#c4a97d]"
                >
                    <SlidersHorizontal size={15} strokeWidth={1.75} />
                    Filters
                    {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-[#c4a97d]" />}
                </button>
            )}

            {/* Mobile Panel */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            onClick={() => setIsMobileOpen(false)}
                            className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 lg:hidden cursor-pointer"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ duration: 0.5, ease: EASE }}
                            className="fixed top-0 left-0 bottom-0 w-[85vw] sm:w-96 bg-[#070707] border-r border-[#7a6b4f]/15 z-50 lg:hidden overflow-y-auto"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-[#7a6b4f]/15">
                                <span className="font-jk text-xl tracking-wider uppercase text-white/90">
                                    Filters
                                </span>
                                <button
                                    onClick={() => setIsMobileOpen(false)}
                                    className="text-[#c4a97d] hover:text-white transition-colors bg-transparent border-none cursor-pointer"
                                >
                                    <X size={22} strokeWidth={1.5} />
                                </button>
                            </div>
                            <div className="p-6">{content}</div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}