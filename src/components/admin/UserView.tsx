'use client'
import type { Badge, ProfileData, UserSummary } from "@/types/profile";
import { AnimatePresence, motion } from "motion/react";
import { useState, useMemo, useActionState, startTransition, useEffect, useRef } from "react";
import { BADGE_CONFIG, EASE, ALL_BADGE_OPTIONS } from "@/lib/utils";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Modal } from "./ui";
import { DropDownSelector } from "./gameModel/utils";
import { UpdateUserData, deleteUserAccount } from "@/app/actions";
import { toast } from "@/stores/alertStore";
import { useRouter } from "next/navigation";

export default function UserView({ users }: { users: UserSummary[] }) {
    const [search, setSearch] = useState("");
    const [userToDelete, setUserToDelete] = useState<UserSummary | null>(null);
    const [userForBadges, setUserForBadges] = useState<UserSummary | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleConfirmDelete = async () => {
        if (!userToDelete) return;
        setIsDeleting(true);
        try {
            const res = await deleteUserAccount(userToDelete.id);
            if (res.success) {
                toast.success("User Deleted", `@${userToDelete.handle} has been deleted.`);
                setUserToDelete(null);
                router.refresh();
            } else {
                toast.error("Failed to Delete", res.error || "An error occurred.");
            }
        } catch (err: unknown) {
            toast.error("Error", err instanceof Error ? err.message : "Failed to delete user.");
        } finally {
            setIsDeleting(false);
        }
    };

    const filtered = useMemo(() => {
        return users.filter((u) => {
            if (search) {
                const s = search.toLowerCase();
                const nameMatch = u.name?.toLowerCase().includes(s);
                const handleMatch = u.handle.toLowerCase().includes(s);
                const emailMatch = u.email.toLowerCase().includes(s);
                if (!nameMatch && !handleMatch && !emailMatch) return false;
            }
            return true;
        });
    }, [users, search]);

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
                        {/* Search and Filters */}
                        <div className="flex items-center gap-3">
                            <input
                                type="text"
                                placeholder="Search by name, handle, or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full max-w-sm px-3.5 py-1.5 bg-[#151210] border border-[#7a6b4f]/30 font-jost text-xs text-white placeholder-white/30 outline-none focus:border-[#c4a97d] transition-colors"
                            />
                        </div>

                        {/* Users Table */}
                        <div className="rounded-none max-h-145 border border-[#7a6b4f]/20 bg-[#0d0c0a]/50 overflow-auto">
                            <Table className="min-w-200">
                                <TableHeader>
                                    <TableRow className="bg-[#151210] border-b border-[#7a6b4f]/30">
                                        <TableHead className="font-jost text-[10px] tracking-[0.16em] uppercase text-[#7a6b4f]/80">
                                            User
                                        </TableHead>
                                        <TableHead className="font-jost text-[10px] tracking-[0.16em] uppercase text-[#7a6b4f]/80">
                                            Email
                                        </TableHead>
                                        <TableHead className="font-jost text-[10px] tracking-[0.16em] uppercase text-[#7a6b4f]/80">
                                            Role
                                        </TableHead>
                                        <TableHead className="font-jost text-[10px] tracking-[0.16em] uppercase text-[#7a6b4f]/80">
                                            Badges
                                        </TableHead>
                                        <TableHead className="font-jost text-[10px] tracking-[0.16em] uppercase text-[#7a6b4f]/80">
                                            Moderation
                                        </TableHead>
                                        <TableHead className="font-jost text-[10px] tracking-[0.16em] uppercase text-[#7a6b4f]/80">
                                            Joined
                                        </TableHead>
                                        <TableHead className="w-10 text-right pr-4 font-jost text-[10px] tracking-[0.16em] uppercase text-[#7a6b4f]/80">
                                            Action
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtered.map((u, i) => (
                                        <UserRow
                                            key={u.id}
                                            index={i}
                                            user={u}
                                            onOpenBadges={() => setUserForBadges(u)}
                                            onDelete={() => setUserToDelete(u)}
                                        />
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Empty State */}
                            {filtered.length === 0 && (
                                <div className="py-12 text-center font-jost text-[11px] tracking-[0.14em] uppercase text-[#7a6b4f]/50">
                                    No users found matching your search.
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Elevated Modals outside Table container (Prevents validateDOMNesting warning & hydration mismatch) */}
            <AnimatePresence>
                {userToDelete && (
                    <Modal 
                        title={`Delete @${userToDelete.handle}`} 
                        message={`Are you sure you want to delete ${userToDelete.handle}? All account data and permissions will be permanently removed. This action cannot be undone.`}
                        cancelText="Cancel"
                        confirmText={isDeleting ? "Deleting..." : "Delete User"}
                        destructive
                        loading={isDeleting}
                        onCancel={() => setUserToDelete(null)}
                        onConfirm={handleConfirmDelete}
                    />
                )}

                {userForBadges && (
                    <ManageBadgesModal
                        user={userForBadges}
                        onClose={() => setUserForBadges(null)}
                        onSuccess={(updatedBadges) => {
                            userForBadges.badges = updatedBadges;
                            setUserForBadges(null);
                            router.refresh();
                        }}
                    />
                )}
            </AnimatePresence>
        </>
    );
}

export function UserRow({ 
    user,
    index,
    onOpenBadges,
    onDelete 
}: { 
    user: UserSummary; 
    index: number;
    onOpenBadges: () => void;
    onDelete: () => void; 
}) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Handle outside clicks to close the kebab menu
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
            <TableCell>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-none bg-[#7a6b4f]/20 border border-[#7a6b4f]/30 flex items-center justify-center font-jost text-xs uppercase text-[#c4a97d]">
                        {user.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={user.avatar} alt={user.handle} className="w-full h-full object-cover" />
                        ) : (
                            user.name?.[0] || user.handle[0]
                        )}
                    </div>
                    <div>
                        <p className="font-medium text-white/90 leading-tight">{user.name || user.handle}</p>
                        <p className="font-jost text-xs text-white/40">@{user.handle}</p>
                    </div>
                </div>
            </TableCell>
            <TableCell className="font-jost text-[14px] text-white/60">
                {user.email}
            </TableCell>
            <TableCell>
                <span className={`inline-block px-2 py-0.5 text-[10px] tracking-wider uppercase font-jost border ${
                    user.role === 'admin'
                        ? 'border-[#c4a97d]/50 bg-[#c4a97d]/10 text-[#c4a97d]'
                        : 'border-[#7a6b4f]/30 bg-[#7a6b4f]/10 text-[#7a6b4f]'
                }`}>
                    {user.role}
                </span>
            </TableCell>
            <TableCell className="font-jost text-[14px]">
                {user.badges && user.badges.map((badgeKey: Badge) => {
                    const config = BADGE_CONFIG[badgeKey];
                    if (!config) return null;
                    
                    return (
                        <span
                            key={badgeKey}
                            className={`items-center gap-1.5 px-2.5 py-1 rounded-none border text-[10.5px] font-jost font-semibold uppercase tracking-[0.15em] transition-all duration-300 cursor-default select-none ${config.className}`}
                            title={`Verified ${config.label}`}
                        >
                            <span>{config.label}</span>
                        </span>
                    );
                })}
            </TableCell>
            <TableCell className="font-jost text-[14px]">
                <div className="flex items-center gap-1.5 flex-wrap">
                    {user.isBanned ? (
                        <span
                            className="px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider border border-red-500/40 text-red-400 bg-red-500/10"
                            title={user.banReason ? `Banned: ${user.banReason}` : "Account Banned"}
                        >
                            Banned
                        </span>
                    ) : (
                        <span className="px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider border border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                            Active
                        </span>
                    )}
                    {Boolean(user.warningsCount && user.warningsCount > 0) && (
                        <span
                            className="px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider border border-amber-500/40 text-amber-400 bg-amber-500/10"
                            title={`${user.warningsCount} warning(s) issued`}
                        >
                            {user.warningsCount} Warn
                        </span>
                    )}
                </div>
            </TableCell>
            <TableCell className="font-jost text-[14px] text-white/30">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
            </TableCell>

            {/* Actions Menu */}
            <TableCell className="relative overflow-visible">
                <div ref={menuRef} className="relative inline-block text-left">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsMenuOpen(!isMenuOpen);
                        }}
                        className="p-1 hidden group-hover:block rounded hover:bg-[#7a6b4f]/20 text-[#7a6b4f] hover:text-[#c4a97d] transition-colors focus:outline-none cursor-pointer"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="1" />
                            <circle cx="12" cy="5" r="1" />
                            <circle cx="12" cy="19" r="1" />
                        </svg>
                    </button>

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
                                    onClick={() => { setIsMenuOpen(false); onOpenBadges(); }}
                                    className="w-full text-left px-4 py-2.5 text-white/80 hover:bg-[#7a6b4f]/20 hover:text-[#c4a97d] transition-colors flex items-center gap-2 cursor-pointer"
                                >
                                    Manage Badges
                                </button>
                                <div className="my-1 border-t border-[#7a6b4f]/20" />
                                <button
                                    onClick={() => { setIsMenuOpen(false); onDelete(); }}
                                    className="w-full text-left px-4 py-2.5 text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2 cursor-pointer"
                                >
                                    Delete User
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </TableCell>
        </motion.tr>
    );
}

function ManageBadgesModal({
    user,
    onClose,
    onSuccess,
}: {
    user: UserSummary;
    onClose: () => void;
    onSuccess: (badges: Badge[]) => void;
}) {
    const [localBadges, setLocalBadges] = useState<Badge[]>(user.badges ?? []);
    const [state, updateAction, isPending] = useActionState(UpdateUserData, { success: null, errors: {} });

    useEffect(() => {
        if (state.success) {
            toast.success(`${user.handle} badges updated`);
            onSuccess(localBadges);
        } else if (state.success === false) {
            toast.error("Update failed", state.errors?.message || "Unknown error");
        }
    }, [state.success, user.handle, localBadges, onSuccess, state.errors?.message]);

    const handleSave = () => {
        const dataObject: Partial<ProfileData> = {
            badges: localBadges,
        };

        startTransition(() => {
            updateAction({
                id: user.id,
                data: dataObject,
            });
        });
    };

    return (
        <Modal
            title={`Manage Badges: @${user.handle}`}
            cancelText="Cancel"
            onCancel={onClose}
            confirmText="Save Badges"
            onConfirm={handleSave}
            loading={isPending}
        >
            <div className="space-y-4 mt-4">
                <p className="font-jost text-xs text-white/60">
                    Assign or revoke platform badges (e.g., admin, moderator, veteran) for this user.
                </p>
                <DropDownSelector 
                    values={localBadges}
                    onChange={(v) => setLocalBadges(v as Badge[])} 
                    options={ALL_BADGE_OPTIONS}
                    placeholder="Select badges..." 
                />
            </div>
        </Modal>
    );
}
