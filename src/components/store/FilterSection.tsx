'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronDown, Check } from 'lucide-react'
import { EASE } from '@/lib/utils'

export type FilterOptionType = {
    value: string
    label: string
}

export type FilterSectionConfig = {
    key: string
    title: string
    mode: 'multi' | 'single'
    options: FilterOptionType[]
}

interface FilterSectionProps {
    section: FilterSectionConfig
    activeValues: string[] | string
    onToggle: (key: string, value: string, mode: 'multi' | 'single') => void
    defaultOpen?: boolean
}

export default function FilterSection({ section, activeValues, onToggle, defaultOpen = false }: FilterSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    return (
        <div className="border-b border-[#7a6b4f]/20 py-5 first:pt-0">
            <button
                onClick={() => setIsOpen(o => !o)}
                className="w-full flex items-center justify-between bg-transparent border-none cursor-pointer p-0 group"
            >
                <span className="font-['Jost',sans-serif] text-[11px] font-semibold tracking-[0.2em] uppercase text-primary/55 group-hover:text-[#c4a97d] transition-colors">
                    {section.title}
                </span>
                <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="text-[#7a6b4f] group-hover:text-[#c4a97d] transition-colors"
                >
                    <ChevronDown size={15} strokeWidth={1.75} />
                </motion.span>
            </button>

            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: EASE }}
                        className="overflow-hidden"
                    >
                        <div className="flex flex-col gap-3 pt-4">
                            {section.options.map((opt) => {
                                const isActive = activeValues.includes(opt.value)
                                return (
                                    <button
                                        key={opt.value}
                                        onClick={() => onToggle(section.key, opt.value, section.mode)}
                                        className="group/opt flex items-center justify-between gap-3 bg-transparent border-none cursor-pointer p-0 text-left"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span
                                                className={`flex items-center justify-center w-4 h-4 border shrink-0 transition-colors duration-200 ${
                                                    isActive
                                                        ? 'bg-[#7a6b4f] border-[#c4a97d]'
                                                        : 'bg-transparent border-[#7a6b4f]/40 group-hover/opt:border-[#c4a97d]/70'
                                                }`}
                                            >
                                                <AnimatePresence>
                                                    {isActive && (
                                                        <motion.span
                                                            initial={{ scale: 0, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                            exit={{ scale: 0, opacity: 0 }}
                                                            transition={{ duration: 0.2, ease: EASE }}
                                                            className="flex"
                                                        >
                                                            <Check size={11} strokeWidth={3} className="text-black" />
                                                        </motion.span>
                                                    )}
                                                </AnimatePresence>
                                            </span>
                                            <span
                                                className={`font-['Jost',sans-serif] text-[13px] tracking-wide transition-colors ${
                                                    isActive ? 'text-white' : 'text-white/50 group-hover/opt:text-white/80'
                                                }`}
                                            >
                                                {opt.label}
                                            </span>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}