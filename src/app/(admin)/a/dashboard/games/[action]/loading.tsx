import react from 'react'

export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(8,8,8,0.88)", backdropFilter: "blur(14px)" }}>
            
            <div
                className="w-full flex flex-col overflow-hidden h-full bg-[#0a0908]"
                style={{
                    maxWidth: "1200px",
                    height: "min(88vh, 720px)",
                    border: `1px solid rgba(255,255,255,0.1)`,
                }}
            >
                {/* ── Header Skeleton ── */}
                <div className="flex items-center justify-between px-6 py-4 shrink-0 border-b border-white/5 bg-white/5">
                    <div className="h-4 w-64 bg-white/10 rounded animate-pulse" />
                    <div className="h-3 w-12 bg-white/10 rounded animate-pulse" />
                </div>

                {/* ── Body ── */}
                <div className="flex flex-1 min-h-0">
                    
                    {/* Sidebar Skeleton */}
                    <div className="w-56 shrink-0 flex flex-col py-3 gap-2 border-r border-white/5 bg-white/2">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="flex items-center gap-3 px-4 py-3">
                                <div className="w-4 h-4 rounded-sm bg-white/10 animate-pulse shrink-0" />
                                <div className="h-3 w-full bg-white/10 rounded animate-pulse" />
                            </div>
                        ))}
                    </div>

                    {/* Main Content (Basic Tab) Skeleton */}
                    <div className="flex-1 p-6 grid grid-cols-2 gap-x-5 gap-y-6">
                        {/* Title & Subtitle */}
                        <div className="flex flex-col gap-2">
                            <div className="h-3 w-16 bg-white/10 rounded animate-pulse" />
                            <div className="h-10 w-full bg-white/5 border border-white/5 rounded animate-pulse" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
                            <div className="h-10 w-full bg-white/5 border border-white/5 rounded animate-pulse" />
                        </div>

                        {/* Synopsis (Full Width) */}
                        <div className="flex flex-col gap-2 col-span-2">
                            <div className="h-3 w-24 bg-white/10 rounded animate-pulse" />
                            <div className="h-24 w-full bg-white/5 border border-white/5 rounded animate-pulse" />
                        </div>

                        {/* Description (Full Width) */}
                        <div className="flex flex-col gap-2 col-span-2">
                            <div className="h-3 w-28 bg-white/10 rounded animate-pulse" />
                            <div className="h-40 w-full bg-white/5 border border-white/5 rounded animate-pulse" />
                        </div>

                        {/* Status */}
                        <div className="flex flex-col gap-2">
                            <div className="h-3 w-16 bg-white/10 rounded animate-pulse" />
                            <div className="h-10 w-full bg-white/5 border border-white/5 rounded animate-pulse" />
                        </div>
                    </div>
                </div>

                {/* ── Footer Skeleton ── */}
                <div className="flex items-center justify-between px-6 py-3.5 shrink-0 border-t border-white/5 bg-[#050504]">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-1.5">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="h-0.75 w-4 bg-white/10 animate-pulse" />
                            ))}
                        </div>
                        <div className="flex gap-3 ml-22">
                            <div className="h-8 w-16 bg-white/5 border border-white/10 rounded-sm animate-pulse" />
                            <div className="h-8 w-16 bg-red-500/10 border border-red-500/20 rounded-sm animate-pulse" />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="h-8 w-24 bg-white/5 border border-white/10 rounded-sm animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    );
}