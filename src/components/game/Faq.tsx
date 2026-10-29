"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { BRAND, BRAND_LIGHT, cn, EASE } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface FaqItem {
    id: string;
    question: string;
    answer: string;
    /** Category label shown as a chip */
    category: string;
    /** Pinned items are always expanded and cannot be collapsed */
    pinned?: boolean;
}

interface FaqTabProps {
    items?: FaqItem[];
    className?:string
}

export const FAQ_DATA: FaqItem[] = [
    // ── Pinned ────────────────────────────────────────────────────────────────
    {
        id: "faq-pin-1",
        pinned: true,
        category: "Getting Started",
        question: "How do I activate my game after purchase?",
        answer:
            "After completing your purchase you will receive a confirmation email containing your unique activation key. Open the launcher, navigate to Library → Add Game, and paste your key into the activation field. The game will be added to your library immediately and begin downloading if you choose. Keys are tied to your account and cannot be transferred. If you purchased a physical edition, the key is printed on the inside of the case sleeve.",
    },
    {
        id: "faq-pin-2",
        pinned: true,
        category: "Important",
        question: "What should I do if my game crashes on launch?",
        answer:
            "A launch crash is almost always caused by one of three things: outdated GPU drivers, a missing Visual C++ Redistributable, or an incomplete installation. Follow these steps in order:\n\n1. Update your GPU drivers to the latest version from NVIDIA, AMD, or Intel's official site.\n2. Install the latest Visual C++ Redistributables from Microsoft (both x64 and x86).\n3. In your library, right-click the game → Verify File Integrity. This checks for missing or corrupted files and re-downloads them automatically.\n4. Disable any overlay software (Discord, GeForce Experience, MSI Afterburner) and try again.\n\nIf the issue persists after all four steps, submit a support ticket with your DxDiag report attached.",
    },

    // ── Download ──────────────────────────────────────────────────────────────
    {
        id: "faq-dl-1",
        category: "Download",
        question: "How do I download the game after purchasing?",
        answer:
            "Once your purchase is confirmed, open the launcher and go to your Library. The game will appear with a Download button. Click it to begin. You can pause and resume downloads at any time — progress is saved. Download speeds depend on your internet connection and current server load. Large titles may take several hours on slower connections; we recommend scheduling downloads overnight using the Scheduled Download feature in Settings → Downloads.",
    },
    {
        id: "faq-dl-2",
        category: "Download",
        question: "Can I install the game on multiple devices?",
        answer:
            "Yes. Your license allows installation on up to three devices simultaneously. Sign in with your account on each machine and download from your Library. Only one device may run the game at a time — launching on a second device while another session is active will close the first session after a 30-second warning. If you need to remove a device from your active list, go to Account → Devices and deauthorise it.",
    },
    {
        id: "faq-dl-3",
        category: "Download",
        question: "How do I move my installation to a different drive?",
        answer:
            "In the launcher go to Settings → Storage. You will see a list of all installed titles and their current locations. Select the game, click Move Installation, and choose your target drive. The launcher handles the transfer without re-downloading any files. Ensure the destination drive has enough free space before starting — the game will display the required space during the move dialog.",
    },
    {
        id: "faq-dl-4",
        category: "Download",
        question: "Why is my download speed slower than expected?",
        answer:
            "Several factors can reduce download speed: server load during peak hours, ISP throttling of large downloads, background applications consuming bandwidth, or a VPN routing traffic inefficiently. Try these fixes: pause other downloads and streaming services, temporarily disable your VPN, switch to a wired connection, or schedule the download for off-peak hours (2–8 AM local time). You can also set a custom download speed limit in Settings → Downloads to prevent the launcher from saturating your connection.",
    },

    // ── Troubleshooting ───────────────────────────────────────────────────────
    {
        id: "faq-ts-1",
        category: "Troubleshooting",
        question: "The game is stuttering or dropping frames — what can I do?",
        answer:
            "Frame rate issues usually come from one of these sources:\n\n• GPU or CPU bottleneck — lower the in-game resolution or graphics preset.\n• VRAM overflow — reduce texture quality. A 6 GB card should not run Ultra textures at 4K.\n• Background processes — close unnecessary applications, especially browsers and streaming software.\n• Shader compilation — on first launch, shaders compile in the background which causes stutters. This resolves itself after 15–30 minutes of play.\n• Outdated drivers — always use the latest stable GPU driver; Game Ready and Adrenalin releases are tested specifically against this title.",
    },
    {
        id: "faq-ts-2",
        category: "Troubleshooting",
        question: "I'm getting a 'DLL not found' error on startup.",
        answer:
            "A missing DLL error means a required system library is absent. The most common culprits are:\n\n• VCRUNTIME140.dll or MSVCP140.dll → Install the Visual C++ 2015–2022 Redistributable from Microsoft.\n• d3dx12.dll → Install the DirectX End-User Runtime from Microsoft's Download Center.\n• PhysXDevice64.dll → Install PhysX from NVIDIA's site.\n\nDo not download DLL files from third-party sites — they are often malicious. Always source libraries from the official vendor. After installing, restart your PC before launching the game again.",
    },
    {
        id: "faq-ts-3",
        category: "Troubleshooting",
        question: "My saves are not syncing across devices.",
        answer:
            "Cloud save sync requires an active internet connection at game launch and close. If you played offline, local saves will not sync automatically. To manually push a local save to the cloud, go to Library → right-click the game → Manage Cloud Saves → Upload Local Save. If there is a conflict between local and cloud saves, the launcher will prompt you to choose which version to keep — always read this dialog carefully before confirming.",
    },
    {
        id: "faq-ts-4",
        category: "Troubleshooting",
        question: "The launcher won't open or gets stuck on the loading screen.",
        answer:
            "Try these steps in order:\n\n1. Kill any lingering launcher processes in Task Manager (Ctrl+Shift+Esc → Details tab).\n2. Delete the launcher cache folder at %AppData%\\Launcher\\Cache and restart.\n3. Run the launcher as Administrator.\n4. Temporarily disable your antivirus — some heuristic engines falsely flag the launcher's auto-update mechanism.\n5. Reinstall the launcher using the latest installer from our website.\n\nIf the launcher opens but freezes on the logo screen, it is likely waiting for a server response. Check our status page at status.example.com for any ongoing incidents.",
    },

    // ── Settings ──────────────────────────────────────────────────────────────
    {
        id: "faq-set-1",
        category: "Settings",
        question: "How do I change the game's display language?",
        answer:
            "The game supports 14 languages including English, French, German, Spanish, Italian, Portuguese, Russian, Japanese, Korean, Simplified Chinese, Traditional Chinese, Polish, Dutch, and Turkish.\n\nTo change the language:\n1. Open the launcher and go to your Library.\n2. Right-click the game and select Properties.\n3. Under the Language tab, choose your preferred language from the dropdown.\n4. Click Apply — the game will restart if it is currently running.\n\nNote: voice acting is available in English and Japanese only. All other languages receive subtitles and text localisation. Some DLC packs may have limited language support; check the DLC description for details.",
    },
    {
        id: "faq-set-2",
        category: "Settings",
        question: "How do I remap controller or keyboard bindings?",
        answer:
            "In-game, navigate to Settings → Controls → Key Bindings. Every action can be remapped by clicking on it and pressing your desired key or button. To reset a single binding to its default, right-click it and select Reset. To reset all bindings at once, click Restore Defaults at the bottom of the screen.\n\nThe game fully supports Xbox, PlayStation, and generic XInput controllers. If your controller is not detected, ensure it is connected before launching the game and check that it appears in Windows' Game Controllers panel (joy.cpl).",
    },
    {
        id: "faq-set-3",
        category: "Settings",
        question: "Can I play with an ultrawide or multi-monitor setup?",
        answer:
            "Ultrawide resolutions (21:9 and 32:9) are natively supported. Select your resolution in Settings → Display and the HUD will reposition automatically. Multi-monitor spanning is not officially supported but can be enabled via community config files — see the Guides section of the community hub.\n\nHDR is supported on Windows 11 and Windows 10 (version 1903+). Enable HDR in Windows display settings first, then toggle it inside the game's Display settings. Peak brightness and paper white can be calibrated in-game.",
    },
    {
        id: "faq-set-4",
        category: "Settings",
        question: "How do I enable or disable motion blur and film grain?",
        answer:
            "Both effects are in Settings → Graphics → Post-Processing. Motion Blur has three levels (Off, Low, High). Film Grain is a simple toggle. These settings take effect immediately without restarting. For competitive play or motion sensitivity, setting both to Off is recommended. These preferences are saved per-account and will sync if cloud save is enabled.",
    },

    // ── Account & Billing ─────────────────────────────────────────────────────
    {
        id: "faq-acc-1",
        category: "Account",
        question: "How do I request a refund?",
        answer:
            "Refunds are available within 14 days of purchase if you have played fewer than 2 hours. To request one, go to Account → Purchase History, select the order, and click Request Refund. You will receive a decision within 3 business days. Refunds are issued to the original payment method and may take 5–10 business days to appear depending on your bank.\n\nDLC and season passes are non-refundable once any included content has been redeemed. Pre-order bonuses must be returned before a pre-order refund can be processed.",
    },
    {
        id: "faq-acc-2",
        category: "Account",
        question: "I forgot my password — how do I reset it?",
        answer:
            "On the launcher login screen click Forgot Password. Enter the email address associated with your account and you will receive a reset link within 5 minutes. The link expires after 30 minutes. If you do not receive the email, check your spam folder and ensure you are searching the correct email address. If your email address has changed, contact support with your account username and proof of original purchase.",
    },

    // ── Multiplayer ───────────────────────────────────────────────────────────
    {
        id: "faq-mp-1",
        category: "Multiplayer",
        question: "Why can't I connect to online multiplayer sessions?",
        answer:
            "Connection failures in multiplayer are usually caused by NAT type restrictions or firewall rules. Check the following:\n\n• Open UDP ports 27015–27030 and 27036–27037 on your router.\n• Ensure UPnP is enabled on your router.\n• If you are on a university or corporate network, outbound UDP may be blocked — use a mobile hotspot to confirm.\n• Check that your NAT type is Open or Moderate in Settings → Network. Strict NAT severely limits matchmaking.\n• Verify that the game is allowed through Windows Defender Firewall.",
    },
    {
        id: "faq-mp-2",
        category: "Multiplayer",
        question: "Is cross-platform play supported?",
        answer:
            "Cross-platform play between PC and console is supported in all co-op modes and open-world sessions. Ranked competitive modes are platform-separated by default to ensure input fairness, but you can opt into cross-platform ranked in Settings → Multiplayer → Cross-Play. Note that voice chat between PC and console requires all players to use the in-game voice system rather than platform-native party chat.",
    },
];

// ─── Category colours ──────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, { text: string; border: string; bg: string }> = {
    "Getting Started": { text: `${BRAND_LIGHT}90`, border: `${BRAND}45`, bg: `${BRAND}18` },
    Important: { text: `${BRAND_LIGHT}`, border: `${BRAND_LIGHT}50`, bg: `${BRAND}25` },
    Download: { text: `${BRAND_LIGHT}75`, border: `${BRAND}35`, bg: `${BRAND}12` },
    Troubleshooting: { text: `${BRAND_LIGHT}70`, border: `${BRAND}30`, bg: `${BRAND}10` },
    Settings: { text: `${BRAND_LIGHT}70`, border: `${BRAND}30`, bg: `${BRAND}10` },
    Account: { text: `${BRAND_LIGHT}70`, border: `${BRAND}30`, bg: `${BRAND}10` },
    Multiplayer: { text: `${BRAND_LIGHT}70`, border: `${BRAND}30`, bg: `${BRAND}10` },
};

function getCategoryStyle(category: string) {
    return CATEGORY_COLORS[category] ?? {
        text: `${BRAND_LIGHT}65`,
        border: `${BRAND}28`,
        bg: `${BRAND}08`,
    };
}

function CategoryChip({ category }: { category: string }) {
    const style = getCategoryStyle(category);
    return (
        <span
            className="inline-flex items-center px-2 py-px font-jost text-[9px] tracking-[0.13em] uppercase shrink-0"
            style={{ color: style.text, border: `1px solid ${style.border}`, background: style.bg }}
        >
            {category}
        </span>
    );
}

function AnswerContent({ text }: { text: string }) {
    const hasHtml = /<\/?[a-z][\s\S]*>/i.test(text);
    if (hasHtml) {
        return (
            <div
                className="font-jost text-[14px] leading-[1.85] text-white/65 space-y-2 [&_strong]:text-white [&_em]:text-white/90 [&_a]:text-[#c4a97d] [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h3]:text-[#c4a97d] [&_code]:text-[#c4a97d] [&_code]:bg-[#7a6b4f]/20 [&_code]:px-1.5 [&_blockquote]:border-l-2 [&_blockquote]:border-[#c4a97d]/50 [&_blockquote]:pl-3 [&_blockquote]:italic"
                dangerouslySetInnerHTML={{ __html: text }}
            />
        );
    }
    const lines = text.split("\n");
    return (
        <div className="font-jost text-[14px] leading-[1.85] text-white/48 space-y-2">
            {lines.map((line, i) =>
                line.trim() === "" ? null : (
                    <p key={i}>{line}</p>
                )
            )}
        </div>
    );
}

interface FaqRowProps {
    item: FaqItem;
    index: number;
    isOpen: boolean;
    onToggle: () => void;
}

function FaqRow({ item, index, isOpen, onToggle }: FaqRowProps) {
    const isPinned = !!item.pinned;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: EASE, delay: Math.min(index * 0.04, 0.28) }}
            className={cn(
                "border-b last:border-b-0",
                isPinned
                    ? "border-[#7a6b4f]/28 bg-[#7a6b4f]/4"
                    : "border-[#7a6b4f]/14"
            )}
        >
            {/* Pinned top stripe */}
            {isPinned && (
                <div
                    className="h-px w-full"
                    style={{ background: `linear-gradient(90deg, ${BRAND}80, ${BRAND_LIGHT}60, ${BRAND}80)` }}
                />
            )}

            {/* Header row */}
            <button
                onClick={isPinned ? undefined : onToggle}
                className={cn(
                    "w-full flex items-start gap-4 px-5 py-4 text-left transition-colors duration-150",
                    isPinned ? "cursor-default" : "cursor-pointer hover:bg-[#7a6b4f]/4"
                )}
                aria-expanded={isPinned ? true : isOpen}
                aria-controls={`faq-answer-${item.id}`}
                disabled={isPinned}
            >
                {/* Pinned pin icon / expand chevron */}
                <div className="shrink-0 mt-0.5 w-5 flex items-center justify-center">
                    {isPinned ? (
                        <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            aria-hidden="true"
                        >
                            <path
                                d="M6 1V7M4 10H8M2 5L6 1L10 5"
                                stroke={BRAND_LIGHT}
                                strokeWidth="1"
                                strokeLinecap="square"
                                strokeOpacity="0.7"
                            />
                        </svg>
                    ) : (
                        <motion.svg
                            animate={{ rotate: isOpen ? 45 : 0 }}
                            transition={{ duration: 0.22, ease: EASE }}
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            aria-hidden="true"
                            style={{ color: isOpen ? BRAND_LIGHT : `${BRAND_LIGHT}50` }}
                        >
                            <path
                                d="M2 6H10M6 2V10"
                                stroke="currentColor"
                                strokeWidth="1"
                                strokeLinecap="square"
                            />
                        </motion.svg>
                    )}
                </div>

                {/* Question + category */}
                <div className="flex-1 min-w-0 flex items-start justify-between gap-4">
                    <span
                        className={cn(
                            "font-jost text-[16px] leading-snug",
                            isPinned
                                ? "text-white/82 font-medium"
                                : isOpen
                                    ? "text-white/80"
                                    : "text-white/60"
                        )}
                    >
                        {item.question}
                    </span>
                    <CategoryChip category={item.category} />
                </div>
            </button>

            {/* Answer body */}
            <AnimatePresence initial={isPinned}>
                {(isOpen || isPinned) && (
                    <motion.div
                        id={`faq-answer-${item.id}`}
                        key="answer"
                        initial={isPinned ? false : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: EASE }}
                        className="overflow-hidden"
                    >
                        <div
                            className={cn(
                                "px-5 pb-5 pl-14",
                                isPinned && "pb-6"
                            )}
                        >
                            <AnswerContent text={item.answer} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ─── Category filter bar ───────────────────────────────────────────────────────

const ALL = "All";

function FilterBar({
    categories,
    active,
    onChange,
}: {
    categories: string[];
    active: string;
    onChange: (c: string) => void;
}) {
    return (
        <div className="flex items-center gap-2 flex-wrap mb-6">
            {[ALL, ...categories].map((cat) => {
                const isActive = cat === active;
                return (
                    <motion.button
                        key={cat}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => onChange(cat)}
                        transition={{ duration: 0.15 }}
                        className={cn(
                            "px-3 py-1.5 font-jost text-[10px] tracking-[0.13em] uppercase border transition-all duration-150",
                            isActive
                                ? "border-[#c4a97d]/50 text-[#c4a97d] bg-[#7a6b4f]/14"
                                : "border-[#7a6b4f]/22 text-white/32 hover:border-[#7a6b4f]/40 hover:text-white/55"
                        )}
                    >
                        {cat}
                    </motion.button>
                );
            })}
        </div>
    );
}

// ─── Root component ────────────────────────────────────────────────────────────

export default function FaqTab({ items = FAQ_DATA  , className}: FaqTabProps) {
    const [openIds, setOpenIds] = useState<Set<string>>(new Set());
    const [activeCategory, setActiveCategory] = useState<string>(ALL);

    const allCategories = Array.from(
        new Set(items.filter((i) => !i.pinned).map((i) => i.category))
    );

    const pinnedItems = items.filter((i) => i.pinned);
    const collapsibleItems = items.filter((i) => !i.pinned);
    const filteredItems =
        activeCategory === ALL
            ? collapsibleItems
            : collapsibleItems.filter((i) => i.category === activeCategory);

    const toggle = (id: string) => {
        setOpenIds((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const openCount = openIds.size;
    const canCollapseAll = openCount > 0;

    return (
        <div className={cn("px-6 py-12" , className)}>
            <div className="width-full max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-0.75 h-4.5 shrink-0"
                            style={{ background: `linear-gradient(180deg, ${BRAND_LIGHT}, ${BRAND})` }}
                        />
                        <span
                            className="font-jost text-[10px] tracking-[0.18em] uppercase"
                            style={{ color: `${BRAND_LIGHT}75` }}
                        >
                            {items.length} articles
                        </span>
                    </div>

                    {canCollapseAll && (
                        <motion.button
                            whileTap={{ scale: 0.96 }}
                            onClick={() => setOpenIds(new Set())}
                            className="font-jost text-[10px] tracking-[0.12em] uppercase text-white/28 hover:text-white/50 transition-colors duration-150"
                        >
                            Collapse all
                        </motion.button>
                    )}
                </div>

                <FilterBar
                    categories={allCategories}
                    active={activeCategory}
                    onChange={setActiveCategory}
                />

                {(activeCategory === ALL) && pinnedItems.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, ease: EASE }}
                        className="mb-6 border border-[#7a6b4f]/22"
                        style={{ background: "rgba(122,107,79,0.03)" }}
                    >
                        {/* Pinned section label */}
                        <div
                            className="flex items-center gap-2 px-5 py-3 border-b border-[#7a6b4f]/18"
                            style={{ background: "rgba(122,107,79,0.05)" }}
                        >
                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                                <path
                                    d="M6 1V7M4 10H8M2 5L6 1L10 5"
                                    stroke={BRAND_LIGHT}
                                    strokeWidth="1"
                                    strokeLinecap="square"
                                    strokeOpacity="0.6"
                                />
                            </svg>
                            <span
                                className="font-jost text-[9px] tracking-[0.18em] uppercase"
                                style={{ color: `${BRAND_LIGHT}55` }}
                            >
                                Pinned — always visible
                            </span>
                        </div>

                        {pinnedItems.map((item, i) => (
                            <FaqRow
                                key={item.id}
                                item={item}
                                index={i}
                                isOpen
                                onToggle={() => { }}
                            />
                        ))}
                    </motion.div>
                )}

                <div className="border border-[#7a6b4f]/18">
                    <AnimatePresence mode="wait">
                        {filteredItems.length > 0 ? (
                            <motion.div
                                key={activeCategory}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.3, ease: EASE }}
                            >
                                {filteredItems.map((item, i) => (
                                    <FaqRow
                                        key={item.id}
                                        item={item}
                                        index={i}
                                        isOpen={openIds.has(item.id)}
                                        onToggle={() => toggle(item.id)}
                                    />
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                className="py-12 flex flex-col items-center gap-2"
                            >
                                <span
                                    className="font-jost text-[11px] tracking-[0.14em] uppercase"
                                    style={{ color: `${BRAND}60` }}
                                >
                                    No articles in this category
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
            
        </div>
    );
}