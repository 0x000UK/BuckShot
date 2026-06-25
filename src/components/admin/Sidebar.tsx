'use client'; 

import { BRAND, BRAND_LIGHT } from "@/lib/utils";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import type { SidebarView } from "./ui";


const NAV: { id: SidebarView; label: string; icon: React.ReactNode }[] = [
	{ id: "overview", label: "Overview", icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" stroke="currentColor" strokeWidth="1" /><rect x="8" y="1" width="5" height="5" stroke="currentColor" strokeWidth="1" /><rect x="1" y="8" width="5" height="5" stroke="currentColor" strokeWidth="1" /><rect x="8" y="8" width="5" height="5" stroke="currentColor" strokeWidth="1" /></svg> },
	{ id: "games", label: "Games", icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="2" width="10" height="12" stroke="currentColor" strokeWidth="1" /><path d="M4 5H8M4 8H7" stroke="currentColor" strokeWidth="1" strokeLinecap="square" /></svg> },
	{ id: "genre", label: "Categories", icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 3H13M1 7H9M1 11H11" stroke="currentColor" strokeWidth="1" strokeLinecap="square" /></svg> },
	{ id: "tags", label: "Tags", icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1H6.5L13 7.5L7.5 13L1 6.5V1Z" stroke="currentColor" strokeWidth="1" /><circle cx="4" cy="4" r="1" fill="currentColor" /></svg> },
	{ id: "users", label: "Users", icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="4" r="3" stroke="currentColor" strokeWidth="1" /><path d="M1 13C1 10.2 3.7 8 7 8C10.3 8 13 10.2 13 13" stroke="currentColor" strokeWidth="1" strokeLinecap="square" /></svg> },
];

export default function Sidebar() {
	const router = useRouter();
	const pathname = usePathname();

	return (
		<div className="flex flex-col w-52 shrink-0 border-r h-full" style={{ borderColor: `${BRAND}18`, background: "#0a0908" }}>
			{/* Logo */}
			<div className="flex items-center gap-2.5 px-5 py-5 border-b" style={{ borderColor: `${BRAND}18` }}>
				<Image
					width={200}
					height={200}
					src="/images/logo_4x.png"
					alt="BuckShot Logo"
					className="w-11 h-11 sm:w-12 sm:h-12 object-contain transition-transform duration-300 hover:scale-105"
					style={{ filter: 'brightness(0.92) sepia(0.15)' }}
					priority
				/>
			</div>

			{/* Nav */}
			<nav className="flex-1 py-4 px-3 flex flex-col gap-1">
				{NAV.map((item) => {
					const active = pathname === `/a/dashboard/${item.id}` || (item.id === 'overview' && pathname === '/dashboard');
					
					return (
						<button key={item.id} onClick={() => {
							router.push(`/a/dashboard/${item.id}`)
						}}
							className="flex items-center gap-3 px-3 py-2.5 w-full text-left transition-all duration-150 relative cursor-pointer"
							style={{
								background: active ? `${BRAND}14` : "transparent",
								color: active ? BRAND_LIGHT : "rgba(255,255,255,0.32)",
								border: active ? `1px solid ${BRAND}30` : "1px solid transparent",
							}}>
							{active && (
								<div className="absolute left-0 top-1 bottom-1 w-0.5 bg-[#c4a97d]" />
							)}
							<span style={{ opacity: active ? 1 : 0.5 }}>{item.icon}</span>
							<span className="font-jost text-[12px] tracking-widest uppercase">{item.label}</span>
						</button>
					);
				})}
			</nav>

			{/* Footer */}
			<div className="px-5 py-4 border-t" style={{ borderColor: `${BRAND}15` }}>
				<p className="font-jost text-[10px] tracking-widest uppercase" style={{ color: `${BRAND}` }}>
					v1.0.0 — Production
				</p>
			</div>
		</div>
	);
}
