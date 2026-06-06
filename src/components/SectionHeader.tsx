import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import {easeIn, motion } from 'motion/react'
import Link from 'next/link'
import React from 'react'
import FilterButton from './FilterButton'

type SectionHeaderProps = {
    title: string,
    nav?: {  // renders navigation button
        onScroll?: (direction: 'left' | 'right') => void
        onPrev?: ()=>void
        onNext?: ()=>void
        disabledLeft: boolean
        disabledRight: boolean
        snap? : boolean
    }
    filter? : boolean // renders filter button
    explore?: { //renders explore all button
        exploreLink? : string
    }
}

function NavBtn({
    onClick,
    disabled,
    children,
}: {
    onClick: () => void
    disabled: boolean
    children: React.ReactNode
}) {
    return (
        <motion.button
            onClick={onClick}
            disabled={disabled}
            whileHover={disabled ? {} : { borderColor: '#c4a97d', backgroundColor: 'rgba(122,107,79,0.1)' }}
            whileTap={disabled ? {} : { scale: 0.94 }}
            className="
                w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 flex items-center justify-center
                bg-transparent text-primary border border-secondary/30
                hover:bg-secondary/10 hover:border-primary/60
                active:scale-95 transition-all duration-200 cursor-pointer
            "
            style={{
                borderColor: disabled ? 'rgba(255,255,255,0.08)' : '#7a6b4f',
                color: disabled ? 'rgba(255,255,255,0.15)' : '#c4a97d',
            }}
        >
            {children}
        </motion.button>
    )
}

export default function SectionHeader({ title, nav, filter, explore }: SectionHeaderProps) {

    

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, ease: easeIn }}
            className="flex items-center justify-between mb-2 sm:mb-4 md:mb-6 pb-4"
            style={{ borderBottom: '1px solid rgba(122,107,79,0.12)' }}
        >
            <div className="flex items-center gap-3">
                <div className='w-0.75 h-5.5 bg-secondary shrink-0' />
                <h2
                    className='text-[16px] sm:text-xl md:text-2xl font-medium tracking-[0.12em] uppercase font-jost text-white/85'
                >
                    {title}
                </h2>
            </div>
            {/* Right Side Controls: Explore Button & Arrows */}
            <div className="flex items-center gap-3">

                {filter && <FilterButton/>}
                {/* Render Explore link only if prop is provided */}
                {explore && explore.exploreLink && (
                    <Link
                        href={explore.exploreLink}
                        className="
                            hidden sm:flex items-center gap-2 h-10 px-4 rounded-none
                            text-[10px] font-semibold tracking-[0.2em] uppercase
                            text-accent border border-secondary/30
                            hover:bg-secondary/10 hover:border-accent/60 hover:text-white
                            transition-all duration-200
                        "
                    >
                        Explore All
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                )}

                {/* Navigation Arrows */}
                {nav && <div className="flex gap-1 sm:gap-2">
                    <NavBtn 
                        onClick={() => {
                            if(nav.onScroll) nav.onScroll('left')
                            if(nav.onPrev) nav.onPrev()
                        }} 
                        disabled={nav.disabledLeft}
                    >
                        <ChevronLeft size={14} />
                    </NavBtn>
                    <NavBtn onClick={() => {
                            if(nav.onScroll) nav.onScroll('right')
                            if(nav.onNext) nav.onNext()
                        }} 
                        disabled={nav.disabledRight}>
                        <ChevronRight size={14} />
                    </NavBtn>
                </div>}

            </div>
        </motion.div>

    )
}
