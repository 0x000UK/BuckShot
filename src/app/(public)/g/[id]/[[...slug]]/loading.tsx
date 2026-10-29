import React from 'react';

export default function Loading() {
    return (
        <div className="w-full animate-pulse select-none overflow-hidden">
            {/* 1. Hero Skeleton */}
            <div className="h-[60vh] min-h-125 w-full bg-zinc-900 relative">
                <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0a] to-transparent" />
                
                {/* <div className="absolute bottom-12 max-w-7xl mx-auto flex gap-5 w-full">
                    <div className='w-32'></div>
                    <div className="h-14 w-3/4 md:w-2/3 bg-zinc-800 rounded-xl" />
                    <div className="h-6 w-1/2 bg-zinc-800/80 rounded-lg" />
                    <div className="flex gap-4 mt-2">
                        <div className="h-12 w-32 bg-zinc-800 rounded-lg" />
                        <div className="h-12 w-12 bg-zinc-800 rounded-lg" />
                    </div>
                </div> */}
                <div className="relative w-full max-w-7xl mx-auto py-6 sm:py-10 md:py-12 z-10 px-4 sm:px-8 md:px-12 pb-14 sm:pb-24">
                                
                    {/* ── Main Meta Row ── */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5 sm:gap-7">
    
                        {/* ── Game cover ─────────────────────────────────────────────── */}
                        <div className="relative shrink-0 block bg-zinc-800 w-28 xs:w-32 sm:w-36 md:w-44 aspect-3/4 rounded-none"/>
    
                        {/* ── Meta block ─────────────────────────────────────────────── */}
                        <div className="flex-1 min-w-0 w-full pb-1 flex flex-col gap-2.5 sm:gap-3">
    
                            {/* Genre chips */}
                            <div className='flex gap-2 sm:gap-4'>
                                <div className='w-11 h-5 bg-zinc-500 rounded-none'/>
                                <div className='w-14 h-5 bg-zinc-500 rounded-none'/>
                            </div>
    
                            {/* Title & Subtitle Group */}
                            <div className="flex flex-col">
                                {/* Title */}
                                <div className="w-48 sm:w-64 h-8 sm:h-10 bg-zinc-800 rounded-none"/>
                            </div>
    
                            {/* Publisher · Developer · Year */}
                            <div
                                className="flex items-center gap-3 mt-0.5"
                            >
                                <span className="w-20 h-4 bg-zinc-700 rounded-none"/>
                                <span className="text-white/20">·</span>
                                <span className="w-24 h-4 bg-zinc-700 rounded-none"/>
                                <span className="text-white/20">·</span>
                                <span className="w-10 h-4 bg-zinc-700 rounded-none"/>
                            </div>
    
                            {/* Rating row */}
                            <div className='flex gap-3 sm:gap-5'>
                                <span className="w-20 h-5 bg-zinc-800/80 rounded-none"/>
    
                                {/* Divider */}
                                <span className="text-white/15 select-none hidden xs:inline">|</span>
    
                                <span className="w-20 h-5 bg-zinc-800/80 rounded-none"/>
                            </div>
                        </div>
                    </div>
    
                    <div
                        className="mt-5 sm:mt-8 border-t border-[#7a6b4f]/20 pt-4 sm:pt-5"
                    >
                        <div className="space-y-3 max-w-4xl">
                            <div className="h-3.5 w-full bg-zinc-800/40 rounded-none" />
                            <div className="h-3.5 w-[90%] bg-zinc-800/40 rounded-none" />
                            <div className="h-3.5 w-[80%] bg-zinc-800/40 rounded-none" />
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Media Gallery Skeleton */}
            <div className="px-4 sm:px-8 md:px-12 py-6 sm:py-12 bg-[#0a0a0a]">
                <div className="h-6 sm:h-8 w-48 sm:w-64 bg-zinc-800/60 rounded-none mb-4 sm:mb-6" />
                <div className="flex gap-3 sm:gap-4 overflow-hidden">
                    {[1, 2, 3, 4].map((i) => (
                        <div 
                            key={i} 
                            className="w-56 xs:w-64 sm:w-80 md:w-96 aspect-16/10 bg-zinc-800/40 rounded-none shrink-0" 
                        />
                    ))}
                </div>
            </div>

            {/* 3. Tabs & Content Skeleton */}
            {/* <div className="px-8 md:px-16 py-8 w-full">
                <div className="flex gap-8 border-b border-zinc-800 pb-4 mb-8">
                    <div className="h-6 w-24 bg-zinc-800/60 rounded-lg" />
                    <div className="h-6 w-24 bg-zinc-800/60 rounded-lg" />
                    <div className="h-6 w-24 bg-zinc-800/60 rounded-lg" />
                </div>
                <div className="space-y-4 max-w-4xl">
                    <div className="h-4 w-full bg-zinc-800/40 rounded" />
                    <div className="h-4 w-[90%] bg-zinc-800/40 rounded" />
                    <div className="h-4 w-[80%] bg-zinc-800/40 rounded" />
                    <div className="h-4 w-[60%] bg-zinc-800/40 rounded" />
                </div>
            </div> */}
        </div>
    );
}