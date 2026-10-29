'use client'; 

import { useState, useEffect } from "react";
import { BRAND, BRAND_LIGHT } from "@/lib/utils";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import type { SidebarView } from "./ui";
import { 
    FiGrid, 
    FiCompass, 
    FiFolder, 
    FiTag, 
    FiUsers, 
    FiFileText, 
    FiChevronDown 
} from "react-icons/fi";

interface SubOption {
    id: string;
    label: string;
    href: string;
}

interface NavItem {
    id: SidebarView | "posts";
    label: string;
    icon: React.ReactNode;
    href: string;
    subOptions?: SubOption[];
}

const NAV: NavItem[] = [
    { 
        id: "overview", 
        label: "Overview", 
        icon: <FiGrid className="w-4 h-4" />,
        href: "/a/dashboard/overview"
    },
    { 
        id: "games", 
        label: "Games", 
        icon: <FiCompass className="w-4 h-4" />,
        href: "/a/dashboard/games"
    },
    { 
        id: "genre", 
        label: "Categories", 
        icon: <FiFolder className="w-4 h-4" />,
        href: "/a/dashboard/genre"
    },
    { 
        id: "tags", 
        label: "Tags", 
        icon: <FiTag className="w-4 h-4" />,
        href: "/a/dashboard/tags",
        subOptions: [
            { id: "exclusive", label: "Exclusive", href: "/a/dashboard/tags/exclusive" },
            { id: "featured", label: "Featured", href: "/a/dashboard/tags/featured" },
            { id: "upcoming", label: "Upcoming", href: "/a/dashboard/tags/coming-soon" },
            { id: "new-release", label: "New Releases", href: "/a/dashboard/tags/new-release" },
            { id: "recently-updated", label: "Recently Updated", href: "/a/dashboard/tags/recently-updated" },
        ]
    },
    { 
        id: "users", 
        label: "Users", 
        icon: <FiUsers className="w-4 h-4" />,
        href: "/a/dashboard/users",
        subOptions: [
            { id: "badges", label: "Badges", href: "/a/dashboard/users/badges" },
        ]
    },
    { 
        id: "posts", 
        label: "Posts", 
        icon: <FiFileText className="w-4 h-4" />,
        href: "/a/dashboard/posts"
    },
];

export default function Sidebar() {
    const router = useRouter();
    const pathname = usePathname();
    
    // Keep track of which menu is expanded
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

    // Automatically expand parent menu if a child sub-route is active on mount/navigation
    useEffect(() => {
        NAV.forEach((item) => {
            if (item.subOptions?.some(sub => pathname.startsWith(sub.href))) {
                setOpenMenus(prev => ({ ...prev, [item.id]: true }));
            }
        });
    }, [pathname]);

    const toggleSubMenu = (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent the main button click from firing
        setOpenMenus(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="relative shrink-0 h-full w-16 md:w-52 z-40 transition-[width] duration-300">
            <div 
                className="absolute md:static 
                inset-y-0 left-0 flex flex-col w-20 hover:w-52 md:w-52 h-full 
                border-r border-[#7a6b4f]/20 bg-[#0a0908]
                overflow-hidden group shadow-2xl md:shadow-none 
                transition-[width] duration-300" 
            >
                {/* Logo */}
                <div className="flex items-center gap-2.5 px-4 md:px-5 py-2.5 border-b shrink-0 border-[#7a6b4f]/20">
                    <Image
                        width={200}
                        height={200}
                        src="/images/logo_4x.png"
                        alt="Logo"
                        className="w-11 h-11 sm:w-12 sm:h-12 shrink-0 object-contain transition-transform duration-300 hover:scale-105"
                        style={{ filter: 'brightness(0.92) sepia(0.15)' }}
                        priority
                    />
                </div>

                {/* Nav */}
                <nav className="flex-1 py-4 px-3 flex flex-col gap-1 overflow-x-hidden overflow-y-auto">
                    {NAV.map((item) => {
                        const isMainActive = pathname === item.href || (item.id === 'overview' && pathname === '/dashboard');
                        const isChildActive = item.subOptions?.some(sub => pathname.startsWith(sub.href)) ?? false;
                        const active = isMainActive || isChildActive;
                        const isOpen = openMenus[item.id] || false;
                        const hasSubOptions = Boolean(item.subOptions?.length);
                        
                        return (
                            <div key={item.id} className="flex flex-col">
                                {/* Main Option Header */}
                                <div 
                                    onClick={() => router.push(item.href)}
                                    className="flex items-center justify-between px-2.5 md:px-3 py-2.5 w-full text-left transition-all duration-150 relative cursor-pointer overflow-hidden rounded-sm select-none group/btn"
                                    style={{
                                        background: active ? `${BRAND}14` : "transparent",
                                        color: active ? BRAND_LIGHT : "rgba(255,255,255,0.4)",
                                        border: active ? `1px solid ${BRAND}30` : "1px solid transparent",
                                    }}
                                >
                                    {active && (
                                        <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-[#c4a97d]" />
                                    )}
                                    
                                    <div className="flex items-center gap-4 truncate">
                                        {/* Icon Container */}
                                        <span className="shrink-0 flex items-center justify-center w-5" style={{ opacity: active ? 1 : 0.6 }}>
                                            {item.icon}
                                        </span>
                                        
                                        {/* Label Text */}
                                        <span className="font-jost text-[12px] tracking-widest uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity duration-300">
                                            {item.label}
                                        </span>
                                    </div>

                                    {/* Chevron Toggle Button (Only renders if subOptions exist) */}
                                    {hasSubOptions && (
                                        <button
                                            type="button"
                                            onClick={(e) => toggleSubMenu(item.id, e)}
                                            className="p-1 rounded hover:bg-white/5 opacity-0 group-hover:opacity-100 md:opacity-100 transition-all duration-200 text-white/50 hover:text-white shrink-0"
                                            aria-label="Toggle Submenu"
                                        >
                                            <FiChevronDown 
                                                className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#c4a97d]" : ""}`} 
                                            />
                                        </button>
                                    )}
                                </div>

                                {/* Animated Sub Options Menu */}
                                {hasSubOptions && (
                                    <div 
                                        className={`grid transition-all duration-300 ease-in-out overflow-hidden ${
                                            isOpen ? "grid-rows-[1fr] opacity-100 mt-1" : "grid-rows-[0fr] opacity-0"
                                        }`}
                                    >
                                        <div className="min-h-0 flex flex-col gap-0.5 pl-9 pr-2 border-l ml-5 my-0.5" style={{ borderColor: `${BRAND}25` }}>
                                            {item.subOptions?.map((sub) => {
                                                const isSubActive = pathname === sub.href;
                                                return (
                                                    <button
                                                        key={sub.id}
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            router.push(sub.href);
                                                        }}
                                                        className="flex items-center gap-2 py-1.5 px-2 text-left w-full transition-colors duration-150 rounded-sm cursor-pointer"
                                                        style={{
                                                            color: isSubActive ? BRAND_LIGHT : "rgba(255,255,255,0.35)",
                                                            background: isSubActive ? `${BRAND}0A` : "transparent",
                                                            fontWeight: isSubActive ? 500 : 400
                                                        }}
                                                    >
                                                        {/* Sub-item dot */}
                                                        <span 
                                                            className="w-1 h-1 rounded-full shrink-0 transition-transform duration-200" 
                                                            style={{ 
                                                                background: isSubActive ? BRAND : "rgba(255,255,255,0.2)",
                                                                transform: isSubActive ? "scale(1.5)" : "scale(1)"
                                                            }} 
                                                        />
                                                        <span className="font-jost text-[11px] tracking-wider uppercase truncate opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity duration-300">
                                                            {sub.label}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="px-5 py-4 border-t shrink-0 flex items-center" style={{ borderColor: `${BRAND}15` }}>
                    <p className="font-jost text-[10px] tracking-widest uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity duration-300" style={{ color: `${BRAND}` }}>
                        v1.0.0 — Production
                    </p>
                </div>
            </div>
        </div>
    );
}