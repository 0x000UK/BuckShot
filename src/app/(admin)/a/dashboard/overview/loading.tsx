export default function Loading() {
	// Replicating tag layout array count
	const skeletonTags = Array.from({ length: 5 }); 

	return (
		<>
			{/* Top Header Row */}
			<div className="flex items-center justify-start px-6 py-3 gap-2 border-b border-[#7a6b4f]/10 bg-[#090807] shrink-0">
                <span className="text-[#c4a97d]/50">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M1 3H13M1 7H9M1 11H11" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
                    </svg>
                </span>
                <span className="font-jost text-[24px] tracking-[0.14em] uppercase text-white/90">
                    Overview
                </span>
            </div>

			<div className="flex flex-col gap-6 p-6">
				{/* Stat Cards Grid */}
				<div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
					{Array.from({ length: 3 }).map((_, i) => (
						<div key={i} className="h-23 border border-[#7a6b4f]/10 bg-[#090807]/40 p-4 rounded flex flex-col gap-2 justify-between animate-pulse">
							<div className="flex justify-between items-center">
								<div className="w-20 h-3 bg-white/10 rounded" />
								<div className="w-4 h-4 bg-white/10 rounded" />
							</div>
							<div className="w-12 h-6 bg-white/20 rounded" />
							<div className="w-16 h-3 bg-white/5 rounded" />
						</div>
					))}
				</div>

				{/* Section Separator */}
				<div className="h-px bg-[#7a6b4f]/10 my-2" />

				{/* Recently Added Section */}
				<div>
					<div className="flex items-center gap-3 mb-4 h-4">
						<div className="w-1 h-4 bg-[#c4a97d]/30 rounded animate-pulse" />
						<div className="w-24 h-3 bg-white/10 rounded animate-pulse" />
					</div>
					
					{/* Responsive GameCard Grid matching w-56 (3:4 ratio aspect-[3/4]) */}
					<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
						{Array.from({ length: 4 }).map((_, i) => (
							<div 
								key={i} 
								className="w-full max-w-56 aspect-3/4 bg-[#090807]/60 border border-[#7a6b4f]/10 rounded p-3 flex flex-col justify-end gap-2 animate-pulse"
							>
								<div className="w-3/4 h-4 bg-white/10 rounded" />
								<div className="w-1/2 h-3 bg-white/5 rounded" />
							</div>
						))}
					</div>
				</div>

				{/* Section Separator */}
				<div className="h-px bg-[#7a6b4f]/10 my-2" />

				{/* Tag Distribution Section */}
				<div>
					<div className="flex items-center gap-3 mb-4 h-4">
						<div className="w-1 h-4 bg-[#c4a97d]/30 rounded animate-pulse" />
						<div className="w-28 h-3 bg-white/10 rounded animate-pulse" />
					</div>

					<div className="flex flex-col gap-4">
						{skeletonTags.map((_, i) => (
							<div key={i} className="flex items-center gap-3 h-3.5">
								<div className="w-24 h-2.5 bg-white/10 rounded shrink-0 animate-pulse" />
								<div className="flex-1 h-1.5 bg-white/5 rounded relative overflow-hidden">
									<div className="absolute inset-y-0 left-0 w-1/3 bg-[#c4a97d]/10 animate-pulse" />
								</div>
								<div className="w-6 h-3 bg-white/10 rounded shrink-0 animate-pulse" />
							</div>
						))}
					</div>
				</div>
			</div>
		</>
	);
}
