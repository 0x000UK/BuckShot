'use client'
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function TopBar() {

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    function handleSearch(term: string) {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('q', term);
        } else {
            params.delete('q');
        }
        // router.replace updates the URL instantly without adding to browser history
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }

    return (
        <div className="flex items-center gap-4 px-6 py-4 border-b border-[#7a6b4f]/20 bg-[#080808]">

            <div className="flex-1 flex items-center gap-3 border border-[#7a6b4f]/30 bg-[#7a6b4f]/5 px-3 py-2 max-w-md rounded-sm focus-within:border-[#c4a97d]/50 transition-colors">
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="text-[#c4a97d]/45 shrink-0">
                    <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1" />
                    <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
                </svg>
                <input
                    value={searchParams.get('q') || ""}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search items..."
                    className="flex-1 bg-transparent font-jost text-[12px] text-white/70 outline-none placeholder:text-white/20 caret-[#c4a97d]"
                />
                {searchParams.get('q') &&
                (<button onClick={() => handleSearch("")} className="text-[#7a6b4f]/70 hover:text-[#c4a97d] transition-colors duration-150">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
                    </svg>
                </button>
                )}
            </div>

            <div className="flex-1" />

            <div className="flex items-center gap-2 px-3 py-1.5 border border-[#7a6b4f]/30 rounded-sm">
                <span className="font-jost text-[10px] tracking-wide text-[#c4a97d]/70">Admin</span>
            </div>
        </div>
    );
}