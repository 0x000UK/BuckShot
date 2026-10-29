'use client'
import { motion } from 'motion/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { EASE } from '@/lib/utils'


function getRange(current: number, total: number): (number | '…')[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

    const left = current - 1
    const right = current + 1
    const showLeftDot = left > 2
    const showRightDot = right < total - 1

    if (!showLeftDot && showRightDot) return [1, 2, 3, 4, 5, '…', total]
    if (showLeftDot && !showRightDot) return [1, '…', total - 4, total - 3, total - 2, total - 1, total]
    return [1, '…', left, current, right, '…', total]
}

function PageBtn({
    page,
    active,
    onClick,
}: {
    page: number
    active: boolean
    onClick: () => void
}) {
    return (
        <motion.button
            onClick={onClick}
            whileTap={{ scale: 0.92 }}
            className={`
        relative w-8 h-8 sm:w-9 sm:h-9 shrink-0 flex items-center justify-center
        text-xs sm:text-[13px] select-none border cursor-pointer rounded-none font-jost
        transition-colors duration-150
        ${active
                    ? 'font-semibold border-[#c4a97d]/60 bg-[#7a6b4f]/14 text-[#c4a97d] shadow-[0_0_16px_rgba(196,169,125,0.1)]'
                    : 'font-normal border-[#7a6b4f]/22 bg-[#0d0c0a] text-white/38 shadow-none hover:border-[#c4a97d] hover:text-[#c4a97d]'
                }
      `}
        >
            {active && (
                <motion.div
                    layoutId="page-accent"
                    className="absolute top-0 left-0 right-0 h-px bg-[#c4a97d]"
                    transition={{ duration: 0.3, ease: EASE }}
                />
            )}
            {page}
        </motion.button>
    )
}

function Ellipsis() {
    return (
        <div className="w-6 sm:w-9 h-8 sm:h-9 shrink-0 flex items-end justify-center pb-2 select-none text-white/18 tracking-[0.08em] text-xs sm:text-[13px]">
            ···
        </div>
    )
}

function NavButton({
    dir,
    disabled,
    onClick,
}: {
    dir: 'prev' | 'next'
    disabled: boolean
    onClick: () => void
}) {
    const isPrev = dir === 'prev'

    return (
        <motion.button
            onClick={onClick}
            disabled={disabled}
            whileTap={disabled ? {} : { scale: 0.95 }}
            className={`
                h-8 sm:h-9 px-2.5 sm:px-4 shrink-0 flex items-center gap-1.5 sm:gap-2
                font-jost text-[9.5px] sm:text-[10px] font-medium tracking-[0.16em] sm:tracking-[0.18em] uppercase rounded-none
                border transition-all duration-150 select-none
                ${disabled
                    ? 'border-white/[0.07] bg-[#0d0c0a] text-white/14 cursor-not-allowed'
                    : 'border-[#7a6b4f]/35 bg-[#0d0c0a] text-white/42 cursor-pointer hover:border-[#c4a97d] hover:text-[#c4a97d]'
                }
      `}
        >
            {isPrev && <ChevronLeft size={12} className="sm:w-3.5 sm:h-3.5" />}
            {isPrev ? 'Prev' : 'Next'}
            {!isPrev && <ChevronRight size={12} className="sm:w-3.5 sm:h-3.5" />}
        </motion.button>
    )
}

export type PaginationProps = {
    currentPage: number          // 1‑based
    totalPages: number
    onPageChange: (page: number) => void
    showProgress?: boolean       // thin progress bar + “X / Y” label
    className?: string
}

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    showProgress = true,
    className = '',
}: PaginationProps) {
    if (totalPages <= 1) return null

    const range = getRange(currentPage, totalPages)
    const progressPct = ((currentPage - 1) / Math.max(totalPages - 1, 1)) * 100
    const canPrev = currentPage > 1
    const canNext = currentPage < totalPages

    const go = (page: number) => {
        if (page < 1 || page > totalPages || page === currentPage) return
        onPageChange(page)
    }

    return (
        <div className={`flex flex-col items-center gap-4 ${className} max-w-full overflow-hidden`}>
            {/* ── Pagination row ── */}
            <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-center max-w-full">
                <NavButton dir="prev" disabled={!canPrev} onClick={() => go(currentPage - 1)} />

                <div className="flex items-center gap-1 sm:gap-1.5 mx-0.5 sm:mx-1">
                    {range.map((item, i) =>
                        item === '…' ? (
                            <Ellipsis key={`dot-${i}`} />
                        ) : (
                            <PageBtn
                                key={item}
                                page={item as number}
                                active={item === currentPage}
                                onClick={() => go(item as number)}
                            />
                        )
                    )}
                </div>

                <NavButton dir="next" disabled={!canNext} onClick={() => go(currentPage + 1)} />
            </div>

            {showProgress && (
                <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: EASE }}
                    className="flex items-center gap-2 sm:gap-3 max-w-full px-4"
                >
                    {/* Left decorative line */}
                    <div className="h-px w-12 sm:w-28 md:w-40 bg-linear-to-r from-transparent to-[#7a6b4f]/25" />

                    {/* Page label */}
                    <span className="font-jost text-[9px] font-normal tracking-[0.24em] uppercase text-white/28 tabular-nums whitespace-nowrap">
                        {currentPage}&nbsp;/&nbsp;{totalPages}
                    </span>

                    {/* Right decorative line */}
                    <div className="h-px w-12 sm:w-28 md:w-40 bg-linear-to-l from-transparent to-[#7a6b4f]/25" />
                </motion.div>
            )}
        </div>
    )
}