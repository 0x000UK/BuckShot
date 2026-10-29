'use client'
import type { GameSummary, GameTag, GameStatus } from "@/types/game";
import { AnimatePresence, motion } from "motion/react";
import { useState, useMemo, useActionState, startTransition, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation"; 

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ActionBtn, Modal, StatusBadge, TagPill } from "./ui";
import { ALL_STATUS_OPTIONS, ALL_TAGS, ALL_TAGS_OPTIONS, EASE } from "@/lib/utils";
import { DropDownSelector, Select } from "./gameModel/utils";
import { UpdateGameData, deleteGame, scheduleGamePublish } from "@/app/actions/games.actions";
import { toast } from "@/stores/alertStore";
import type { GameData } from "@/lib/game";

function SortableHead({ children, onClick, sorted }: { children: React.ReactNode; onClick?: () => void; sorted?: "asc" | "desc" | null }) {
    return (
        <TableHead
            className="font-jost text-[10px] tracking-[0.16em] uppercase cursor-pointer select-none text-[#7a6b4f]/80 transition-colors duration-150 hover:text-white/60"
            onClick={onClick}
        >
            <span className="flex items-center gap-1.5">
                {children}
                {sorted && (
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="text-[#c4a97d]">
                        {sorted === "asc"
                            ? <path d="M1 6L4 2L7 6" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
                            : <path d="M1 2L4 6L7 2" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />}
                    </svg>
                )}
            </span>
        </TableHead>
    );
}

type SortKey = "title" | "rating" | "addedAt" | "updatedAt" | "publishedAt";

export function GamesView({ games }: { games: GameSummary[] }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
  
    const search = searchParams.get('q') || '';
    const tagFilter = (searchParams.get('tag') as GameTag | "all") || 'all';
    const statusFilter = (searchParams.get('status') as GameStatus | "all") || 'all';

    const [sortKey, setSortKey] = useState<SortKey>("addedAt");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
    const [gameToDelete, setGameToDelete] = useState<GameSummary | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Elevated action modal state (prevents hydration warnings by keeping modals outside <tbody>)
    const [actionModal, setActionModal] = useState<{
        type: "status" | "schedulePublish" | "tags";
        game: GameSummary;
    } | null>(null);

    const updateFilters = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== 'all') {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.replace(`${pathname}?${params.toString()}`);
    };

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortKey(key);
            setSortDir("asc");
        }
    };

    const onAdd = () => {
        router.push('/a/dashboard/games/new');
    };

    const onEdit = (game: GameSummary) => {
        router.push(`/a/dashboard/games/edit?id=${game.id}`);
    };

    const handleDeleteGame = async () => {
        if (!gameToDelete) return;
        setIsDeleting(true);
        try {
            const res = await deleteGame(gameToDelete.id);
            if (res.success) {
                toast.success("Game Deleted", `"${gameToDelete.title}" and its related data were deleted.`);
                setGameToDelete(null);
                router.refresh();
            } else {
                toast.error("Delete Failed", res.error || "Could not delete game.");
            }
        } catch (err: unknown) {
            toast.error("Delete Error", err instanceof Error ? err.message : "Unexpected error.");
        } finally {
            setIsDeleting(false);
        }
    };

    const filtered = useMemo(() => {
        return games
            .filter((g) => {
                if (tagFilter !== "all" && !g.tags?.includes(tagFilter as GameTag)) return false;
                if (statusFilter !== "all" && g.status !== statusFilter) return false;
                if (search && !g.title.toLowerCase().includes(search.toLowerCase()) && !g.publisher.toLowerCase().includes(search.toLowerCase())) {
                    return false;
                }
                return true;
            })
            .sort((a, b) => {
                const dir = sortDir === "asc" ? 1 : -1;
                if (sortKey === "title") return a.title.localeCompare(b.title) * dir;
                if (sortKey === "rating") return ((a.score ?? 0) - (b.score ?? 0)) * dir;
                if (sortKey === "addedAt") return ((a.createdAt ? new Date(a.createdAt).getTime() : 0) - (b.createdAt ? new Date(b.createdAt).getTime() : 0)) * dir;
                if (sortKey === "updatedAt") return ((a.updatedAt ? new Date(a.updatedAt).getTime() : 0) - (b.updatedAt ? new Date(b.updatedAt).getTime() : 0)) * dir;
                if (sortKey === "publishedAt") return ((a.publishedAt ? new Date(a.publishedAt).getTime() : 0) - (b.publishedAt ? new Date(b.publishedAt).getTime() : 0)) * dir;
                return 0;
            });
    }, [games, tagFilter, statusFilter, search, sortKey, sortDir]);

    return (
        <>
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.32, ease: EASE }}
                    className="flex flex-col flex-1" 
                >
                    <div className="flex flex-col gap-5 px-6 h-full">
                        {/* Toolbar */}
                        <div className="flex items-center gap-3 flex-wrap">
                            <ActionBtn onClick={onAdd}>Add Game</ActionBtn>

                            {/* Tag filter */}
                            <div className="flex items-center gap-2 ml-auto">
                                {(["all", ...ALL_TAGS.map((t) => t.id)] as (GameTag | "all")[]).map((t) => {
                                    const isActive = t === tagFilter;
                                    return (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => updateFilters('tag', t)}
                                            className={`font-jost text-[10px] tracking-[0.14em] uppercase px-2.5 py-1 transition-colors duration-150 rounded-none border ${
                                                isActive
                                                    ? "bg-[#c4a97d]/15 border-[#c4a97d]/50 text-[#c4a97d]"
                                                    : "bg-transparent border-[#7a6b4f]/20 text-[#7a6b4f] hover:text-white/60 hover:border-[#7a6b4f]/40"
                                            }`}
                                        >
                                            {t === "all" ? "All Tags" : ALL_TAGS.find((tag) => tag.id === t)?.label || t}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Status filter */}
                            <div className="flex items-center gap-2">
                                {(["all", "published", "draft", "delisted"] as (GameStatus | "all")[]).map((s) => {
                                    const isActive = s === statusFilter;
                                    return (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => updateFilters('status', s)}
                                            className={`font-jost text-[10px] tracking-[0.14em] uppercase px-2.5 py-1 transition-colors duration-150 rounded-none border ${
                                                isActive
                                                    ? "bg-[#c4a97d]/15 border-[#c4a97d]/50 text-[#c4a97d]"
                                                    : "bg-transparent border-[#7a6b4f]/20 text-[#7a6b4f] hover:text-white/60 hover:border-[#7a6b4f]/40"
                                            }`}
                                        >
                                            {s === "all" ? "All Status" : s}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Shadcn Table */}
                        <div className="rounded-none max-h-145 border border-[#7a6b4f]/20 bg-[#0d0c0a]/50 overflow-auto">
                            <Table className="min-w-225">
                                <TableHeader>
                                    <TableRow className=" bg-[#151210] border-b border-[#7a6b4f]/30">
                                        <SortableHead onClick={() => handleSort("title")} sorted={sortKey === "title" ? sortDir : null}>
                                            Title
                                        </SortableHead>
                                        <TableHead className="font-jost text-[10px] tracking-[0.16em] uppercase text-[#7a6b4f]/80">
                                            Publisher
                                        </TableHead>
                                        <SortableHead onClick={() => handleSort("rating")} sorted={sortKey === "rating" ? sortDir : null}>
                                            Score
                                        </SortableHead>
                                        <TableHead className="font-jost text-[10px] tracking-[0.16em] uppercase text-[#7a6b4f]/80">
                                            Tags
                                        </TableHead>
                                        <TableHead className="font-jost text-[10px] tracking-[0.16em] uppercase text-[#7a6b4f]/80">
                                            Status
                                        </TableHead>
                                        <SortableHead onClick={() => handleSort("addedAt")} sorted={sortKey === "addedAt" ? sortDir : null}>
                                            Created
                                        </SortableHead>
                                        <SortableHead onClick={() => handleSort("updatedAt")} sorted={sortKey === "updatedAt" ? sortDir : null}>
                                            Updated
                                        </SortableHead>
                                        <SortableHead onClick={() => handleSort("publishedAt")} sorted={sortKey === "publishedAt" ? sortDir : null}>
                                            Published
                                        </SortableHead>
                                        <TableHead className="w-10 text-right pr-4 font-jost text-[10px] tracking-[0.16em] uppercase text-[#7a6b4f]/80">
                                            Action
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtered.map((game, i) => (
                                        <GameRow 
                                            key={game.id}
                                            index={i}
                                            game={game} 
                                            onEdit={onEdit} 
                                            onOpenModal={(type, g) => setActionModal({ type, game: g })}
                                            onDelete={() => setGameToDelete(game)} 
                                        />
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Empty State */}
                            {filtered.length === 0 && (
                                <div className="py-16 text-center font-jost text-[11px] tracking-[0.14em] uppercase text-[#7a6b4f]/60 bg-[#7a6b4f]/5">
                                    No games found matching your criteria.
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Elevated Modals outside Table container (Prevents validateDOMNesting warning & hydration mismatch) */}
            <AnimatePresence>
                {gameToDelete && (
                    <Modal 
                        title={`Deleting ${gameToDelete.title}`} 
                        message={`Are you sure you want to delete "${gameToDelete.title}"? All associated download mirrors, ratings, and discussion comments will be permanently deleted. This action cannot be undone.`}
                        cancelText="Go Back"
                        confirmText="Delete"
                        destructive
                        loading={isDeleting}
                        onCancel={() => setGameToDelete(null)}
                        onConfirm={handleDeleteGame} 
                    />
                )}

                {actionModal?.type === "status" && (
                    <StatusOverrideModal
                        game={actionModal.game}
                        onClose={() => setActionModal(null)}
                        onSuccess={() => {
                            setActionModal(null);
                            router.refresh();
                        }}
                    />
                )}

                {actionModal?.type === "schedulePublish" && (
                    <SchedulePublishModal
                        game={actionModal.game}
                        onClose={() => setActionModal(null)}
                        onSuccess={() => {
                            setActionModal(null);
                            router.refresh();
                        }}
                    />
                )}

                {actionModal?.type === "tags" && (
                    <TagsUpdateModal
                        game={actionModal.game}
                        onClose={() => setActionModal(null)}
                        onSuccess={() => {
                            setActionModal(null);
                            router.refresh();
                        }}
                    />
                )}
            </AnimatePresence>
        </>
    );
}

export function GameRow({ 
    game, 
    index,
    onEdit, 
    onOpenModal,
    onDelete 
}: { 
    game: GameSummary; 
    index : number;
    onEdit: (g: GameSummary) => void; 
    onOpenModal: (type: "status" | "schedulePublish" | "tags", g: GameSummary) => void;
    onDelete: () => void; 
}) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Handle outside clicks to close kebab menu
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isMenuOpen]);

    return (
        <motion.tr 
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className="group border-b font-jost text-[14px] border-[#7a6b4f]/10 transition-colors duration-100 hover:bg-[#7a6b4f]/15"
        >
            <TableCell className="text-white/80 font-medium max-w-40 truncate">
                {game.title} {game.subtitle ? `: ${game.subtitle}` : ""}
            </TableCell>
            <TableCell className="max-w-40 overflow-hidden text-white/40 text-ellipsis">
                {game.publisher}
            </TableCell>
            <TableCell className="text-white/50">
                {game.score! > 0 ? game.score!.toFixed(1) : "—"}
            </TableCell>
            <TableCell>
                <div className="flex gap-1 flex-wrap">
                    {game.tags!.map((t) => <TagPill key={t} tag={t} />)}
                </div>
            </TableCell>
            <TableCell><StatusBadge status={game.status!} /></TableCell>
            <TableCell className="text-white/30">{game.createdAt}</TableCell>
            <TableCell className="text-white/30">{game.updatedAt}</TableCell>
            <TableCell className="text-white/30">
                {game.scheduledPublishAt ? (
                    <span
                        className="inline-flex items-center gap-1.5 text-[#c4a97d] bg-[#c4a97d]/10 border border-[#c4a97d]/35 px-1 py-0.5 text-[12px] tracking-wider uppercase font-jost"
                        title={`Scheduled to publish on ${new Date(game.scheduledPublishAt).toLocaleString()}`}
                    >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span>
                            {new Date(game.scheduledPublishAt).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </span>
                    </span>
                ) : (
                    game.publishedAt || "—"
                )}
            </TableCell>
            
            {/* Action Column with Kebab Menu */}
            <TableCell className="relative overflow-visible">
                <div ref={menuRef} className="relative inline-block text-left">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsMenuOpen(!isMenuOpen);
                        }}
                        className="p-1 hidden group-hover:block rounded hover:bg-[#7a6b4f]/20 text-[#7a6b4f] hover:text-[#c4a97d] transition-colors focus:outline-none cursor-pointer"
                        aria-label="Open actions menu"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="1" />
                            <circle cx="12" cy="5" r="1" />
                            <circle cx="12" cy="19" r="1" />
                        </svg>
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                        {isMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 mt-1 w-48 z-50 rounded-none bg-[#090807] border border-[#7a6b4f]/30 shadow-xl py-1 text-xs font-jost"
                            >
                                <button
                                    onClick={() => { setIsMenuOpen(false); onEdit(game); }}
                                    className="w-full text-left px-4 py-2.5 text-white/80 hover:bg-[#7a6b4f]/20 hover:text-[#c4a97d] transition-colors flex items-center gap-2 cursor-pointer"
                                >
                                    Edit Game
                                </button>
                                <button
                                    onClick={() => { setIsMenuOpen(false); onOpenModal("status", game); }}
                                    className="w-full text-left px-4 py-2.5 text-white/80 hover:bg-[#7a6b4f]/20 hover:text-[#c4a97d] transition-colors flex items-center gap-2 cursor-pointer"
                                >
                                    Override Status
                                </button>
                                <button
                                    onClick={() => { setIsMenuOpen(false); onOpenModal("schedulePublish", game); }}
                                    className="w-full text-left px-4 py-2.5 text-white/80 hover:bg-[#7a6b4f]/20 hover:text-[#c4a97d] transition-colors flex items-center gap-2 cursor-pointer"
                                >
                                    Set Publish Date & Time
                                </button>
                                <button
                                    onClick={() => { setIsMenuOpen(false); onOpenModal("tags", game); }}
                                    className="w-full text-left px-4 py-2.5 text-white/80 hover:bg-[#7a6b4f]/20 hover:text-[#c4a97d] transition-colors flex items-center gap-2 cursor-pointer"
                                >
                                    Update Tags
                                </button>
                                <div className="my-1 border-t border-[#7a6b4f]/20" />
                                <button
                                    onClick={() => { setIsMenuOpen(false); onDelete(); }}
                                    className="w-full text-left px-4 py-2.5 text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2 cursor-pointer"
                                >
                                    Delete
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </TableCell>
        </motion.tr>
    );
}

function StatusOverrideModal({
    game,
    onClose,
    onSuccess,
}: {
    game: GameSummary;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [localStatus, setLocalStatus] = useState<GameStatus>(game.status);
    const [state, updateAction, isPending] = useActionState(UpdateGameData, { success: null, errors: {} });

    useEffect(() => {
        if (state.success) {
            toast.success(`${game.title} status updated`);
            onSuccess();
        } else if (state.success === false) {
            toast.error("Update failed", state.errors?.message || "Unknown error");
        }
    }, [state.success, game.title, onSuccess, state.errors?.message]);

    const handleSave = () => {
        const dataObject: Partial<GameData> = { status: localStatus };
        startTransition(() => {
            updateAction([{
                id: game.id,
                keysToValidate: ['status'],
                data: dataObject
            }]);
        });
    };

    return (
        <Modal
            title="Override Game Status"
            cancelText="Cancel"
            onCancel={onClose}
            confirmText="Update Status"
            onConfirm={handleSave}
            loading={isPending}
        >
            <div className="space-y-4 mt-4">
                <Select 
                    value={localStatus} 
                    onChange={(v) => setLocalStatus(v as GameStatus)} 
                    options={ALL_STATUS_OPTIONS}
                />
            </div>
        </Modal>
    );
}

function TagsUpdateModal({
    game,
    onClose,
    onSuccess,
}: {
    game: GameSummary;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [localTags, setLocalTags] = useState<GameTag[]>(game.tags ?? []);
    const [state, updateAction, isPending] = useActionState(UpdateGameData, { success: null, errors: {} });

    useEffect(() => {
        if (state.success) {
            toast.success(`${game.title} tags updated`);
            onSuccess();
        } else if (state.success === false) {
            toast.error("Update failed", state.errors?.message || "Unknown error");
        }
    }, [state.success, game.title, onSuccess, state.errors?.message]);

    const handleSave = () => {
        const dataObject: Partial<GameData> = { tags: localTags };
        startTransition(() => {
            updateAction([{
                id: game.id,
                keysToValidate: ['tags'],
                data: dataObject
            }]);
        });
    };

    return (
        <Modal
            title="Update Game Tags"
            cancelText="Cancel"
            onCancel={onClose}
            confirmText="Save Tags"
            onConfirm={handleSave}
            loading={isPending}
        >
            <div className="space-y-4 mt-4">
                <DropDownSelector 
                    values={localTags}
                    onChange={(v) => setLocalTags(v as GameTag[])} 
                    options={ALL_TAGS_OPTIONS}
                    placeholder="Type to filter tags..." 
                />
            </div>
        </Modal>
    );
}

function SchedulePublishModal({
    game,
    onClose,
    onSuccess,
}: {
    game: GameSummary;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [scheduledDateTime, setScheduledDateTime] = useState<string>(
        game.scheduledPublishAt
            ? new Date(game.scheduledPublishAt).toISOString().slice(0, 16)
            : ""
    );
    const [isScheduling, setIsScheduling] = useState(false);

    const handleSaveSchedule = async () => {
        setIsScheduling(true);
        try {
            const res = await scheduleGamePublish(game.id, scheduledDateTime || null);
            if (res.success) {
                if (res.status === "published") {
                    toast.success("Published", `"${game.title}" is now published.`);
                } else if (res.scheduledPublishAt) {
                    const formatted = new Date(res.scheduledPublishAt).toLocaleString();
                    toast.success(
                        "Schedule Saved",
                        `"${game.title}" scheduled to publish at ${formatted}.`
                    );
                } else {
                    toast.info("Schedule Cleared", `Publish schedule removed for "${game.title}".`);
                }
                onSuccess();
            } else {
                toast.error("Schedule Failed", res.error || "Could not set schedule.");
            }
        } catch (err: unknown) {
            toast.error("Schedule Error", err instanceof Error ? err.message : "Unexpected error.");
        } finally {
            setIsScheduling(false);
        }
    };

    const handleClearSchedule = async () => {
        setIsScheduling(true);
        try {
            const res = await scheduleGamePublish(game.id, null);
            if (res.success) {
                setScheduledDateTime("");
                toast.info("Schedule Cleared", `Publish schedule removed for "${game.title}".`);
                onSuccess();
            } else {
                toast.error("Schedule Failed", res.error || "Could not clear schedule.");
            }
        } catch (err: unknown) {
            toast.error("Schedule Error", err instanceof Error ? err.message : "Unexpected error.");
        } finally {
            setIsScheduling(false);
        }
    };

    return (
        <Modal
            title={`Schedule Publication — ${game.title}`}
            cancelText="Cancel"
            onCancel={onClose}
            confirmText="Save Schedule"
            onConfirm={handleSaveSchedule}
            loading={isScheduling}
        >
            <div className="space-y-4 mt-4 text-left">
                <p className="text-white/60 font-jost text-[12px] leading-relaxed">
                    Choose the exact date and time for when this game should automatically transition to{" "}
                    <span className="text-[#c4a97d] font-medium">Published</span>. When that time arrives, if the server is active, it will automatically go live.
                </p>

                {game.scheduledPublishAt && (
                    <div className="p-2.5 bg-[#c4a97d]/10 border border-[#c4a97d]/30 text-[#c4a97d] font-jost text-[11px] flex items-center justify-between">
                        <span>
                            Currently scheduled for:{" "}
                            <strong className="font-medium">
                                {new Date(game.scheduledPublishAt).toLocaleString()}
                            </strong>
                        </span>
                        <button
                            type="button"
                            onClick={handleClearSchedule}
                            disabled={isScheduling}
                            className="text-[10px] tracking-wider uppercase underline hover:text-white transition-colors cursor-pointer ml-2"
                        >
                            Clear Schedule
                        </button>
                    </div>
                )}

                <div>
                    <label className="block font-jost text-[10px] tracking-[0.14em] uppercase text-white/50 mb-1.5">
                        Publication Date & Time
                    </label>
                    <input
                        type="datetime-local"
                        value={scheduledDateTime}
                        onChange={(e) => setScheduledDateTime(e.target.value)}
                        className="w-full bg-[#0a0a0a] text-white/90 font-jost text-xs px-3 py-2 border border-[#7a6b4f]/40 outline-none focus:border-[#c4a97d] transition-colors rounded-none scheme-dark"
                    />
                </div>
            </div>
        </Modal>
    );
}
