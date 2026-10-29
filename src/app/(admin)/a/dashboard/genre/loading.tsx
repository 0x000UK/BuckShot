export default function Loading() {
  return (
    <div>
        <div className="flex flex-col flex-1 overflow-hidden animate-pulse">
        <div className="flex flex-col gap-5 p-6 h-full">
            
            {/* Mock Toolbar */}
            <div className="flex items-center gap-3 shrink-0">
            <div className="h-9 w-24 bg-[#7a6b4f]/10 rounded-none" />
            <div className="h-3 w-16 bg-[#7a6b4f]/10 ml-auto" />
            </div>

            {/* Mock Table Box */}
            <div className="rounded-none border border-[#7a6b4f]/10 bg-[#0d0c0a]/30 h-full p-4 flex flex-col gap-4">
            {/* Mock Header Row */}
            <div className="h-4 bg-[#7a6b4f]/20 w-full" />
            {/* Mock Body Rows */}
            <div className="h-8 bg-[#7a6b4f]/5 w-full" />
            <div className="h-8 bg-[#7a6b4f]/5 w-full" />
            <div className="h-8 bg-[#7a6b4f]/5 w-full" />
            <div className="h-8 bg-[#7a6b4f]/5 w-full" />
            <div className="h-8 bg-[#7a6b4f]/5 w-full" />
            <div className="h-8 bg-[#7a6b4f]/5 w-full" />
            <div className="h-8 bg-[#7a6b4f]/5 w-full" />
            <div className="h-8 bg-[#7a6b4f]/5 w-full" />
            <div className="h-8 bg-[#7a6b4f]/5 w-full" />
            </div>

        </div>
        </div>
    </div>
  );
}
