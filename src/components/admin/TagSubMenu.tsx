"use client";

import { EASE, uid, BRAND } from "@/lib/utils";
import { TAG_CONFIGS } from "@/lib/constants/tags";
import type { TagFeatures, GameTag, TaggedGame, MediaItem } from "@/types/game";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { FiTag, FiPlus, FiLayers, FiFilm, FiSave, FiX, FiEdit2, FiTrash2 } from "react-icons/fi";
import { Field, Select, TextArea, SingleImageInput, Input } from "./gameModel/utils";
import { saveGameTagFeatureAction, removeGameTagFeatureAction } from "@/app/actions/games.actions";
import { uploadSingleMedia } from "@/lib/fileUpload";
import { toast } from "@/stores/alertStore";
import { useRouter } from "next/navigation";

export interface GameSelectOption {
    id: string;
    title: string;
    cover?: string;
}

type TagSubMenuProps = {
    tag: GameTag;
    games: TaggedGame[];
    allGames: GameSelectOption[];
};

export function TagSubMenuView({ tag, games, allGames }: TagSubMenuProps) {
    const router = useRouter();
    const [entry, setNewEntry] = useState<FeaturedEntry>();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

    const gameswithTagFeature = games.filter((g) => {
        return g.tagFeatures?.some((t) => t.type === tag);
    });

    const handleOpenModal = () => {
        setNewEntry(emptyEntry(tag));
        setSelectedMedia(null);
        setIsModalOpen(true);
    };

    const handleEditEntry = (game: TaggedGame) => {
        const feature = game.tagFeatures?.find((t) => t.type === tag);
        const imageUrl = feature?.image || game.cover || "";
        setNewEntry({
            id: `fe_${game.id}`,
            gameId: game.id,
            features: {
                type: tag,
                blurb: feature?.blurb || "",
                image: imageUrl,
                video: feature?.video || "",
            },
        });
        setSelectedMedia(imageUrl ? { id: "feat_img", type: "image", url: imageUrl } : null);
        setIsModalOpen(true);
    };

    const handleDeleteEntry = async (gameId: string, title: string) => {
        if (!confirm(`Are you sure you want to remove the ${tag} feature from "${title}"?`)) {
            return;
        }

        try {
            const res = await removeGameTagFeatureAction(gameId, tag);
            if (res.success) {
                toast.success("Removed", `Removed ${tag} feature from "${title}".`);
                router.refresh();
            } else {
                toast.error("Failed", res.error || "Could not remove tag feature.");
            }
        } catch (err) {
            toast.error("Error", err instanceof Error ? err.message : "Unexpected error.");
        }
    };

    const handleSaveModal = async () => {
        if (!entry?.gameId) {
            toast.error("Validation Error", "Please select a game first.");
            return;
        }

        setIsSaving(true);
        try {
            let finalImageUrl = entry.features.image || "";

            // If a new local image file was chosen, upload to Cloudinary
            if (selectedMedia?.file) {
                finalImageUrl = await uploadSingleMedia(entry.gameId, selectedMedia, "tags");
            }

            const res = await saveGameTagFeatureAction(entry.gameId, tag, {
                blurb: entry.features.blurb || undefined,
                image: finalImageUrl || undefined,
                video: entry.features.video || undefined,
            });

            if (res.success) {
                toast.success("Saved", `Tag feature for ${tag} saved successfully.`);
                setIsModalOpen(false);
                router.refresh();
            } else {
                toast.error("Failed to save", res.error || "Could not save tag feature.");
            }
        } catch (err) {
            toast.error("Error", err instanceof Error ? err.message : "Unexpected error.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateEntry = (updated: FeaturedEntry) => {
        setNewEntry(updated);
    };

    return (
        <div className="p-6 md:p-8 flex flex-col gap-8 w-full max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#7a6b4f]/20 pb-6">
                <div>
                    <div className="flex items-center gap-2 font-jost text-[10px] tracking-widest uppercase text-[#c4a97d]">
                        <FiTag className="w-3 h-3" />
                        <span>Tag Directory</span>
                    </div>
                    <h1 className="font-jk text-2xl md:text-3xl tracking-wider uppercase text-white font-medium mt-1">
                        {TAG_CONFIGS[tag]?.label || tag}
                    </h1>
                    <p className="font-jost text-xs text-white/50 mt-1 max-w-xl">
                        Manage highlights and features configured for {TAG_CONFIGS[tag]?.label.toLowerCase() || tag} titles
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleOpenModal}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#c4a97d]/10 border border-[#c4a97d]/40 hover:bg-[#c4a97d]/20 transition-all duration-200 text-[#e6d7c3] font-jost text-[11px] tracking-widest uppercase cursor-pointer"
                >
                    <FiPlus className="w-3.5 h-3.5" />
                    <span>Add {TAG_CONFIGS[tag]?.label || tag} Entry</span>
                </button>
            </div>

            {/* Featured Section */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <h3 className="font-jost text-xs tracking-[0.16em] uppercase text-[#e6d7c3]/80 flex items-center gap-2">
                        <FiLayers className="w-3.5 h-3.5 text-[#c4a97d]" />
                        <span>Featured Highlights</span>
                    </h3>
                    <span className="font-jost text-[10px] text-white/30 uppercase tracking-widest">
                        {gameswithTagFeature.length} Active Highlights
                    </span>
                </div>

                {/* Enhanced Horizontal Cards Carousel */}
                {gameswithTagFeature.length === 0 ? (
                    <div className="p-8 border border-dashed border-[#7a6b4f]/20 text-center bg-[#0d0c0a]/40">
                        <p className="font-jost text-xs text-white/40 uppercase tracking-widest">
                            No featured entries configured for {tag} yet. Click &ldquo;Add Entry&rdquo; above to feature a title.
                        </p>
                    </div>
                ) : (
                    <div className="flex gap-4 pb-4 flex-wrap">
                        {gameswithTagFeature.map((game) => {
                            const feature = game.tagFeatures?.find((t) => t.type === tag) || game.tagFeatures?.[0];
                            const imageSrc = feature?.image || game.cover;
                            const blurb = feature?.blurb || "No blurb provided for this feature.";
                            const hasVideo = Boolean(feature?.video);

                            return (
                                <div
                                    key={game.id}
                                    className="group relative shrink-0 w-72 sm:w-95 aspect-video overflow-hidden border snap-start bg-[#0a0908] transition-all duration-300 hover:border-[#c4a97d]/60 shadow-lg"
                                    style={{ borderColor: `${BRAND}22`, borderRadius: "2px" }}
                                >
                                    {/* Background Image with subtle zoom */}
                                    <img
                                        src={imageSrc}
                                        alt={game.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-85 group-hover:opacity-100"
                                    />

                                    {/* Subtle Overlay Gradient */}
                                    <div className="absolute inset-0 bg-linear-to-t from-[#0a0908] via-transparent to-black/60 opacity-80 pointer-events-none" />

                                    {/* Top Bar: Title, Media Indicator & Actions */}
                                    <div className="absolute top-0 left-0 right-0 p-3 flex items-start justify-between gap-2 z-10">
                                        <h4 className="font-jost text-[12px] tracking-wider uppercase text-white font-medium drop-shadow-md truncate flex-1">
                                            {game.title}
                                        </h4>

                                        <div className="flex items-center gap-1.5 shrink-0">
                                            {hasVideo && (
                                                <span className="flex items-center gap-1 px-1.5 py-0.5 bg-black/80 border border-[#c4a97d]/50 text-[#c4a97d] font-jost text-[8px] tracking-widest uppercase">
                                                    <FiFilm className="w-2.5 h-2.5" />
                                                    <span>Media</span>
                                                </span>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() => handleEditEntry(game)}
                                                className="p-1 bg-black/80 border border-white/20 hover:border-[#c4a97d] text-white/70 hover:text-[#c4a97d] transition-colors cursor-pointer"
                                                title="Edit Entry"
                                            >
                                                <FiEdit2 className="w-3 h-3" />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleDeleteEntry(game.id, game.title)}
                                                className="p-1 bg-black/80 border border-white/20 hover:border-red-400 text-white/70 hover:text-red-400 transition-colors cursor-pointer"
                                                title="Remove Entry"
                                            >
                                                <FiTrash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Bottom Hover Reveal Blurb */}
                                    <div className="absolute bottom-0 left-0 right-0 p-3.5 bg-linear-to-t from-black via-black/90 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-10 border-t border-[#c4a97d]/20">
                                        <p className="font-jost text-[11px] leading-relaxed text-[#e6d7c3]/90 line-clamp-2">
                                            {blurb}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal Overlay */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            transition={{ duration: 0.2, ease: EASE }}
                            className="w-full max-w-4xl bg-[#0a0908] border border-[#7a6b4f]/40 flex flex-col max-h-[90vh] shadow-2xl overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="px-6 py-4 border-b border-[#7a6b4f]/20 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-2">
                                    <FiTag className="w-4 h-4 text-[#c4a97d]" />
                                    <h2 className="font-jost text-sm tracking-widest uppercase text-white font-medium">
                                        {entry?.gameId ? `Configure ${tag} Entry` : `Add New ${tag} Entry`}
                                    </h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-1.5 hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
                                >
                                    <FiX className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 flex flex-col gap-4 flex-1 overflow-y-auto">
                                <FeaturedEntryCard
                                    entry={entry!}
                                    allGames={allGames}
                                    games={games}
                                    tag={tag}
                                    selectedMedia={selectedMedia}
                                    onMediaChange={setSelectedMedia}
                                    onChange={handleUpdateEntry}
                                />
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-4 border-t border-[#7a6b4f]/20 bg-[#060504] flex items-center justify-end gap-3 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border border-[#7a6b4f]/30 text-white/60 hover:text-white font-jost text-[11px] tracking-widest uppercase transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={isSaving}
                                    onClick={handleSaveModal}
                                    className="flex items-center gap-2 px-5 py-2 bg-[#c4a97d] text-black hover:bg-[#e6d7c3] font-jost text-[11px] tracking-widest uppercase font-semibold transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    <FiSave className="w-3.5 h-3.5" />
                                    <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

interface FeaturedEntry {
    id: string;
    gameId: string;
    features: TagFeatures;
}

function emptyEntry(type: GameTag): FeaturedEntry {
    return { id: `fe_${uid()}`, gameId: "", features: { type } };
}

function FeaturedEntryCard({
    entry,
    allGames,
    games,
    tag,
    selectedMedia,
    onMediaChange,
    onChange,
}: {
    entry: FeaturedEntry;
    allGames: GameSelectOption[];
    games: TaggedGame[];
    tag: GameTag;
    selectedMedia: MediaItem | null;
    onMediaChange: (media: MediaItem | null) => void;
    onChange: (updated: FeaturedEntry) => void;
}) {
    const handleGameSelect = (gameId: string) => {
        const selected = allGames.find((g) => g.id === gameId);
        const existingTagged = games.find((g) => g.id === gameId);
        const existingFeature = existingTagged?.tagFeatures?.find((t) => t.type === tag);

        const defaultImage = existingFeature?.image || selected?.cover || "";
        onChange({
            ...entry,
            gameId,
            features: {
                type: tag,
                blurb: existingFeature?.blurb || entry.features.blurb || "",
                image: defaultImage,
                video: existingFeature?.video || entry.features.video || "",
            },
        });

        if (defaultImage) {
            onMediaChange({ id: "feat_img", type: "image", url: defaultImage });
        } else {
            onMediaChange(null);
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -14, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.32, ease: EASE }}
            className="overflow-hidden"
        >
            <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
                    {/* LEFT COLUMN: Game & Blurb */}
                    <div className="flex flex-col gap-4 h-full">
                        <Field label="Game (All Available Titles)">
                            <Select
                                value={entry.gameId}
                                onChange={handleGameSelect}
                                options={allGames.map((g) => ({ value: g.id, label: g.title }))}
                                placeholder="— — Select a game to feature — —"
                            />
                        </Field>

                        <Field label="Editorial Blurb" className="flex-1">
                            <TextArea
                                value={entry.features.blurb ?? ""}
                                onChange={(v) =>
                                    onChange({ ...entry, features: { ...entry.features, blurb: v } })
                                }
                                placeholder="Short editorial line shown with this highlight…"
                                className="flex-1 h-full min-h-25"
                            />
                        </Field>
                    </div>

                    {/* RIGHT COLUMN: Image Input */}
                    <div className="h-full">
                        <Field label="Custom Feature Image">
                            <SingleImageInput
                                value={selectedMedia || (entry.features.image ? { url: entry.features.image, id: "featuredImage", type: "image" } : null)}
                                onChange={(v) => {
                                    onMediaChange(v);
                                    onChange({
                                        ...entry,
                                        features: { ...entry.features, image: v?.url || "" },
                                    });
                                }}
                                aspectHint="16/9"
                                className="aspect-video min-h-40 h-full"
                            />
                        </Field>
                    </div>

                    {/* BOTTOM ROW: Video URL */}
                    <div className="lg:col-span-2">
                        <Field label="Video Trailer / Clip URL">
                            <Input
                                value={entry.features.video ?? ""}
                                onChange={(v) =>
                                    onChange({ ...entry, features: { ...entry.features, video: v } })
                                }
                                placeholder="https://youtube.com/watch?v=..."
                            />
                        </Field>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
