"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { BRAND, BRAND_LIGHT, EASE } from "@/lib/utils";
import { EditorFooter } from "./EditorFooter";
import { BasicTab } from "./tabs/BasicTab";
import { MetadataTab } from "./tabs/Metadata";
import { RatingTab } from "./tabs/AgeRating";
import { VisualsTab } from "./tabs/Visuals";
import { AddonsTab } from "./tabs/AddOns";
import { RequirementsTab } from "./tabs/Requirements";
import { DownloadTab } from "./tabs/Download";
import FaqTab from "./tabs/FaqTab";
import { TABS, TAB_FIELD_MAP, tabIndexToKey, tabKeyToIndex, type TabKey } from "./types";
import { SaveGameData, reserveGameId } from "@/app/actions/dbActions";
import { EditorSidebar } from "./EditorSidebar";
import { toast } from "@/stores/alertStore";
import MediaGallery from "@/components/game/MediaGallery";
import TabSection from "@/components/game/Tabs";
import GameHero from "@/components/game/ProductHero";
import { Modal } from "../ui";
import { GameValidationSchema, type GameData } from "@/lib/game";
import type { Genre } from "@/types/game";
import { processAllMedia } from "@/lib/fileUpload";
import { Sparkles } from "lucide-react";
import { AutoPopulateModal } from "./AutoPopulateModal";
import type { ConsolidatedGameFetchResult } from "@/lib/gameDataService";

function defaultForm(): GameData {
    return {
        id: null,
        title: "",
        subtitle: null,
        edition: null,
        description: { type: "root", children: [] },
        synopsis: "",
        status: "draft",
        tags: [],
        score: 0,
        reviewCount: null,
        developer: "",
        publisher: "",
        franchise: null,
        version: "",
        releaseDate: "",
        genres: [],
        platforms: [],
        ageRating: "Unrated",
        age: 18,
        descriptors: undefined,
        cover: { type: "image", url: "", id: "" },
        wideCover: null,
        banner: { type: "image", url: "", id: "" },
        logo: { type: "image", url: "", id: "" },
        ambientColor: "#1a1a1a",
        banner2: null,
        screenShots: [],
        dlcs: null,
        bonusContent: null,
        requirements: {},
        officialDownloads: [],
        nonOfficialDownloads: [],
        faqs: [],
    };
}

export function GameEditorModal({ game, genre }: { game?: GameData; genre: Genre[] }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isEditing = game !== undefined;
    const draftKey = game?.id ? `game-draft-${game.id}` : "game-draft-new";

    const tabParam = searchParams.get("tab");
    const initialTab: TabKey = tabParam ? tabIndexToKey(parseInt(tabParam, 10)) : "basic";
    const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

    type PromptType = "cancel" | "abort" | "save" | "restore" | null;
    const [activePrompt, setActivePrompt] = useState<PromptType>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [showAutoPopulate, setShowAutoPopulate] = useState(false);

    // Form values in React state ensure immediate, reactive updates for all tabs and dynamic lists
    const [formValues, setFormValues] = useState<GameData>(() => game || defaultForm());

    const {
        handleSubmit,
        setError,
        setValue,
        getValues,
        trigger,
        reset,
        formState: { errors, isSubmitting, dirtyFields, isDirty },
    } = useForm<GameData>({
        resolver: zodResolver(GameValidationSchema),
        defaultValues: game || defaultForm(),
        mode: "onBlur",
        shouldUnregister: false,
    });

    const hasCheckedDraftRef = useRef(false);

    // Initial check for existing local staging draft (runs only once on mount)
    useEffect(() => {
        if (hasCheckedDraftRef.current) return;
        hasCheckedDraftRef.current = true;

        if (typeof window === "undefined") return;
        const savedDraft = localStorage.getItem(draftKey);
        if (!savedDraft) return;

        try {
            const parsed = JSON.parse(savedDraft);
            if (!parsed) return;

            if (!game) {
                // New game entry: restore draft directly
                reset(parsed);
                setFormValues(parsed);
                toast.info("Draft Restored", "Loaded your previously unsaved new game draft.");
            } else {
                // Editing existing game: compare draft against original database game data
                const isDifferent = Object.keys(parsed).some((k) => {
                    const key = k as keyof GameData;
                    if (["id", "slug", "createdAt", "updatedAt"].includes(key)) return false;
                    const draftVal = parsed[key];
                    const gameVal = game[key];
                    if (draftVal === undefined && (gameVal === undefined || gameVal === null)) return false;
                    if (draftVal === null && (gameVal === undefined || gameVal === null)) return false;
                    return JSON.stringify(draftVal) !== JSON.stringify(gameVal);
                });

                if (isDifferent) {
                    setActivePrompt("restore");
                } else {
                    // Stale draft identical to DB data, wipe it quietly
                    localStorage.removeItem(draftKey);
                }
            }
        } catch (e) {
            console.error("Failed parsing auto-saved draft", e);
            localStorage.removeItem(draftKey);
        }
    }, [draftKey, game, reset]);

    const handleRestoreDraft = () => {
        const savedDraft = localStorage.getItem(draftKey);
        if (savedDraft) {
            try {
                const parsed = JSON.parse(savedDraft);
                reset(parsed);
                setFormValues(parsed);
                toast.success("Draft Restored", "Your previous edits have been applied.");
            } catch (e) {
                console.error("Failed restoring auto-saved draft", e);
            }
        }
        setActivePrompt(null);
    };

    const handleDiscardDraft = () => {
        localStorage.removeItem(draftKey);
        setActivePrompt(null);
    };

    // Auto-save debounced staging draft when form is modified
    useEffect(() => {
        if (!isDirty) return;

        const timer = setTimeout(() => {
            const dataToSave = { ...formValues };

            // Clean up heavy local file objects before serialization
            if (dataToSave.cover?.file) dataToSave.cover = { ...dataToSave.cover, file: undefined };
            if (dataToSave.logo?.file) dataToSave.logo = { ...dataToSave.logo, file: undefined };
            if (dataToSave.banner?.file) dataToSave.banner = { ...dataToSave.banner, file: undefined };
            if (dataToSave.banner2?.file) dataToSave.banner2 = { ...dataToSave.banner2, file: undefined };
            if (dataToSave.wideCover?.file) dataToSave.wideCover = { ...dataToSave.wideCover, file: undefined };

            if (dataToSave.screenShots) {
                dataToSave.screenShots = dataToSave.screenShots.map((s) => ({ ...s, file: undefined }));
            }
            if (dataToSave.dlcs) {
                dataToSave.dlcs = dataToSave.dlcs.map((d) => ({ ...d, image: { ...d.image, file: undefined } }));
            }
            if (dataToSave.bonusContent) {
                dataToSave.bonusContent = dataToSave.bonusContent.map((b) => ({
                    ...b,
                    image: { ...b.image, file: undefined },
                }));
            }

            localStorage.setItem(draftKey, JSON.stringify(dataToSave));
        }, 800);

        return () => clearTimeout(timer);
    }, [formValues, isDirty, draftKey]);

    // Manual draft staging trigger
    const handleSaveDraftManual = () => {
        const currentData = getValues();
        const dataToSave = { ...currentData };
        if (dataToSave.cover?.file) dataToSave.cover = { ...dataToSave.cover, file: undefined };
        if (dataToSave.logo?.file) dataToSave.logo = { ...dataToSave.logo, file: undefined };
        if (dataToSave.banner?.file) dataToSave.banner = { ...dataToSave.banner, file: undefined };
        if (dataToSave.banner2?.file) dataToSave.banner2 = { ...dataToSave.banner2, file: undefined };
        if (dataToSave.wideCover?.file) dataToSave.wideCover = { ...dataToSave.wideCover, file: undefined };
        if (dataToSave.screenShots) {
            dataToSave.screenShots = dataToSave.screenShots.map((s) => ({ ...s, file: undefined }));
        }
        if (dataToSave.dlcs) {
            dataToSave.dlcs = dataToSave.dlcs.map((d) => ({ ...d, image: { ...d.image, file: undefined } }));
        }
        if (dataToSave.bonusContent) {
            dataToSave.bonusContent = dataToSave.bonusContent.map((b) => ({
                ...b,
                image: { ...b.image, file: undefined },
            }));
        }
        localStorage.setItem(draftKey, JSON.stringify(dataToSave));
        toast.success("Draft Staged", "Current changes saved to local staging memory.");
    };

    // Client-side tab navigation using replaceState prevents RSC re-renders and re-fetching
    const navigateToTab = useCallback((key: TabKey) => {
        setActiveTab(key);
        const idx = tabKeyToIndex(key);
        if (typeof window !== "undefined") {
            const url = new URL(window.location.href);
            url.searchParams.set("tab", String(idx));
            window.history.replaceState(null, "", url.pathname + url.search);
        }
    }, []);

    const up = useCallback(
        <K extends keyof GameData>(key: K, value: GameData[K]) => {
            setValue(key as any, value as any, { shouldValidate: true, shouldDirty: true });
            setFormValues((prev) => ({ ...prev, [key]: value }));
        },
        [setValue]
    );

    const toggleArrayItem = useCallback(
        <T,>(key: keyof GameData, val: T) => {
            const arr = (getValues(key as any) as unknown[]) || [];
            const next = arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
            setValue(key as any, next as any, { shouldValidate: true, shouldDirty: true });
            setFormValues((prev) => ({ ...prev, [key]: next }));
        },
        [getValues, setValue]
    );

    const handleAutoPopulate = useCallback((data: NonNullable<ConsolidatedGameFetchResult["data"]>) => {
        // 1. Resolve matching genres from the DB genre list
        const matchedGenreIds: string[] = [];
        if (data.genres && Array.isArray(data.genres)) {
            for (const steamGenre of data.genres) {
                const found = genre.find(
                    (g) => g.name.toLowerCase() === steamGenre.toLowerCase() ||
                           g.slug.toLowerCase() === steamGenre.toLowerCase().replace(/\s+/g, "-")
                );
                if (found && !matchedGenreIds.includes(found.id)) {
                    matchedGenreIds.push(found.id);
                }
            }
        }

        // 2. Prepare visual assets
        const coverMedia = {
            id: `cov_auto_${Date.now()}`,
            type: "image" as const,
            url: data.coverUrl,
        };

        const bannerMedia = {
            id: `ban_auto_${Date.now()}`,
            type: "image" as const,
            url: data.bannerUrl,
        };

        const screenshotsMedia = data.screenshots.map((s, idx) => ({
            id: `ss_auto_${idx}_${Date.now()}`,
            type: s.type,
            url: s.url,
            title: s.title,
        }));

        // 3. Assemble new updated form values
        const updatedValues: GameData = {
            ...formValues,
            title: data.title || formValues.title,
            synopsis: data.synopsis || formValues.synopsis,
            description: data.description || formValues.description,
            edition: data.edition || formValues.edition,
            developer: data.developer || formValues.developer,
            publisher: data.publisher || formValues.publisher,
            releaseDate: data.releaseDate || formValues.releaseDate,
            genres: matchedGenreIds.length > 0 ? matchedGenreIds : formValues.genres,
            platforms: data.platforms.length > 0 ? data.platforms : formValues.platforms,
            score: data.score ?? formValues.score ?? 85,
            age: data.age ?? formValues.age ?? 18,
            ageRating: data.ageRating || formValues.ageRating || "M",
            descriptors: (data.descriptors && data.descriptors.length > 0) ? data.descriptors : formValues.descriptors,
            cover: data.coverUrl ? coverMedia : formValues.cover,
            wideCover: null,
            banner: data.bannerUrl ? bannerMedia : formValues.banner,
            screenShots: screenshotsMedia.length > 0 ? screenshotsMedia : formValues.screenShots,
            requirements: data.requirements || formValues.requirements,
            officialDownloads: data.officialDownloads.length > 0 ? data.officialDownloads : formValues.officialDownloads,
        };

        reset(updatedValues);
        setFormValues(updatedValues);
    }, [formValues, genre, reset]);

    const onSubmit = async (data: GameData) => {
        try {
            let activeId = isEditing && data.id ? data.id : formValues.id;

            // For a new game without a pre-reserved ID, reserve the official SQID from server first
            if (!activeId) {
                const reserveRes = await reserveGameId();
                if (!reserveRes.success || !reserveRes.id) {
                    toast.error("Initialization Failed", reserveRes.error || "Could not reserve a unique game ID.");
                    setActivePrompt(null);
                    return;
                }
                activeId = reserveRes.id;
                up("id", activeId);
                data.id = activeId;
            }

            // Upload all media files directly into the permanent game SQID folder
            await processAllMedia(activeId, data);

            // Save the game document in MongoDB with the permanent SQID
            const res = await SaveGameData({ id: activeId, data });

            if (res.success) {
                localStorage.removeItem(draftKey);
                reset(data);
                setFormValues(data);
                toast.success("Game Saved", `${data.title} has been successfully stored.`);
                router.push("/a/dashboard/games");
            } else {
                console.error("Save failed:", res.errors);
                toast.error("Operation Failed", "Could not complete the save request. Please check inputs.");

                if (res.errors) {
                    Object.entries(res.errors).forEach(([field, message]) => {
                        setError(field as keyof GameData, {
                            type: "server",
                            message: Array.isArray(message) ? message[0] : (message as string),
                        });
                    });
                }
            }
        } catch (err: unknown) {
            console.error("Critical error in onSubmit:", err);
            toast.error("Process Error", err instanceof Error ? err.message : "Media upload or save failed.");
        } finally {
            setActivePrompt(null);
        }
    };

    const handleConfirmCancel = () => {
        setActivePrompt(null);
        router.push("/a/dashboard/games");
    };

    const handleConfirmAbort = () => {
        localStorage.removeItem(draftKey);
        const blank = defaultForm();
        reset(blank);
        setFormValues(blank);
        setActivePrompt(null);
        toast.info("Session Cleared", "Staging memory wiped clean.");
        router.push("/a/dashboard/games");
    };

    const handlePreviewClick = async () => {
        const isValid = await trigger();
        if (isValid) {
            setShowPreview(true);
        } else {
            toast.error("Validation Failed", "Please fill in all required fields before previewing.");
        }
    };

    const tabComplete: Partial<Record<TabKey, boolean>> = {
        basic: !!formValues.title && !!formValues.synopsis,
        metadata: !!(formValues.developer || formValues.publisher),
        rating: !!(formValues.ageRating && formValues.descriptors && formValues.age),
        visuals: !!(formValues.cover && formValues.logo && formValues.ambientColor && formValues.banner),
        requirements: Object.keys(formValues.requirements || {}).length > 0,
        addons: !!formValues.dlcs || !!formValues.bonusContent,
        download:
            (formValues.officialDownloads?.length ?? 0) > 0 ||
            (formValues.nonOfficialDownloads?.length ?? 0) > 0
    };

    const tabDirty: Record<TabKey, boolean> = Object.keys(TAB_FIELD_MAP).reduce((acc, tab) => {
        const fields = TAB_FIELD_MAP[tab as TabKey];
        const hasChanges = fields.some((field) => !!dirtyFields[field]);
        acc[tab as TabKey] = hasChanges;
        return acc;
    }, {} as Record<TabKey, boolean>);

    const tabErrors: Record<TabKey, boolean> = Object.keys(TAB_FIELD_MAP).reduce((acc, tab) => {
        const fields = TAB_FIELD_MAP[tab as TabKey];
        const hasError = fields.some((field) => !!errors[field]);
        acc[tab as TabKey] = hasError;
        return acc;
    }, {} as Record<TabKey, boolean>);

    const sharedProps = { form: formValues, up, toggleArrayItem, errors };

    const renderTab = () => {
        switch (activeTab) {
            case "basic":
                return <BasicTab {...sharedProps} />;
            case "metadata":
                return <MetadataTab {...sharedProps} genres={genre} />;
            case "rating":
                return <RatingTab {...sharedProps} />;
            case "visuals":
                return <VisualsTab form={formValues} up={up} errors={errors} />;
            case "addons":
                return <AddonsTab form={formValues} up={up} errors={errors} />;
            case "requirements":
                return <RequirementsTab form={formValues} up={up} errors={errors} />;
            case "download":
                return <DownloadTab form={formValues} up={up} errors={errors} />;
            case "faq":
                return <FaqTab form={formValues} up={up} errors={errors} />;
        }
    };

    const PROMPT_CONFIG = {
        abort: {
            title: "Confirm Operational Abort",
            message:
                "Are you sure you want to abort? This action will wipe all saved data and completely purge your current local draft memory.",
            confirmText: "Purge & Abort",
            destructive: true,
            onConfirm: handleConfirmAbort,
            onCancel: () => setActivePrompt(null),
            cancelText: "Go Back",
        },
        cancel: {
            title: "Exit Session",
            message:
                "Are you sure you want to exit? Your current session data will remain protected in local staging memory.",
            confirmText: "Confirm Exit",
            onConfirm: handleConfirmCancel,
            onCancel: () => setActivePrompt(null),
            cancelText: "Go Back",
        },
        save: {
            title: `Save ${formValues?.title || "Changes"}`,
            message:
                "Please review the details. Once saved the staging memory will be cleared. Proceed to Save?",
            confirmText: "Confirm Save",
            onConfirm: handleSubmit(onSubmit),
            cancelText: "Go Back",
            onCancel: () => setActivePrompt(null),
            loading: isSubmitting,
        },
        restore: {
            title: "Unsaved Changes Detected",
            message:
                "We found staging memory from a previous session. Would you like to restore your unsaved configurations?",
            confirmText: "Restore Data",
            onConfirm: handleRestoreDraft,
            onCancel: handleDiscardDraft,
            cancelText: "Discard Draft",
        },
    };

    const currentPrompt = activePrompt ? PROMPT_CONFIG[activePrompt] : null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(8,8,8,0.88)", backdropFilter: "blur(14px)" }}
        >
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="w-full flex flex-col overflow-hidden h-full"
                style={{
                    maxWidth: "1200px",
                    height: "min(88vh, 720px)",
                    background: "#0a0908",
                    border: `1px solid ${BRAND}35`,
                }}
            >
                {/* ── Header ── */}
                <div
                    className="flex items-center justify-between px-6 py-4 shrink-0"
                    style={{ borderBottom: `1px solid ${BRAND}18`, background: `${BRAND}04` }}
                >
                    <div className="flex items-center gap-3">
                        <h2
                            className="font-jost text-[14px] tracking-[0.18em] uppercase"
                            style={{ color: `${BRAND_LIGHT}85` }}
                        >
                            {isEditing ? `Edit Game — ${game?.title || formValues.title}` : "Initialize New Game Record"}
                        </h2>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <button
                            type="button"
                            onClick={() => setShowAutoPopulate(true)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 font-jost text-[11px] tracking-widest uppercase border transition-all duration-150 cursor-pointer"
                            style={{
                                color: BRAND_LIGHT,
                                borderColor: `${BRAND}70`,
                                background: `${BRAND}20`,
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.background = `${BRAND}35`)}
                            onMouseOut={(e) => (e.currentTarget.style.background = `${BRAND}20`)}
                        >
                            <Sparkles className="w-3.5 h-3.5 text-[#c4a97d]" />
                            <span>Auto Populate</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleSaveDraftManual}
                            className="px-4 py-1.5 font-jost text-[11px] tracking-widest uppercase border transition-all duration-150 cursor-pointer"
                            style={{
                                color: `${BRAND_LIGHT}90`,
                                borderColor: `${BRAND}40`,
                                background: `${BRAND}10`,
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.background = `${BRAND}25`)}
                            onMouseOut={(e) => (e.currentTarget.style.background = `${BRAND}10`)}
                        >
                            Save Draft
                        </button>

                        <button
                            type="button"
                            onClick={handlePreviewClick}
                            className="px-5 py-1.5 font-jost text-[11px] tracking-widest uppercase border transition-all duration-150 cursor-pointer"
                            style={{
                                color: BRAND_LIGHT,
                                borderColor: `${BRAND}40`,
                                background: `${BRAND}10`,
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.background = `${BRAND}25`)}
                            onMouseOut={(e) => (e.currentTarget.style.background = `${BRAND}10`)}
                        >
                            Preview
                        </button>
                    </div>
                </div>

                {/* ── Body ── */}
                <div className="flex flex-1 min-h-0">
                    <EditorSidebar
                        tabs={TABS}
                        isEditing={isEditing}
                        activeTab={activeTab}
                        tabComplete={tabComplete}
                        tabDirty={tabDirty}
                        tabErrors={tabErrors}
                        onTabChange={navigateToTab}
                    />

                    <form
                        id="game-editor-form"
                        className="flex-1 overflow-y-auto min-w-0"
                        style={{ scrollbarWidth: "thin", scrollbarColor: `${BRAND}25 transparent` }}
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.2, ease: EASE }}
                                className="p-6 grid grid-cols-2 gap-x-5 gap-y-4"
                            >
                                {renderTab()}
                            </motion.div>
                        </AnimatePresence>
                    </form>
                </div>

                {/* ── Footer ── */}
                <EditorFooter
                    tabs={TABS}
                    activeTab={activeTab}
                    tabComplete={tabComplete}
                    isEditing={isEditing}
                    onTabChange={navigateToTab}
                    onSave={() => setActivePrompt("save")}
                    onCancel={() => setActivePrompt("cancel")}
                    onAbort={() => setActivePrompt("abort")}
                />
            </motion.div>

            {/* ── Custom Pop-up Confirmation Dialog Overlay ── */}
            <AnimatePresence>
                <AutoPopulateModal
                    key="auto-populate-modal"
                    isOpen={showAutoPopulate}
                    onClose={() => setShowAutoPopulate(false)}
                    onPopulate={handleAutoPopulate}
                />

                {activePrompt && currentPrompt && <Modal key="prompt-modal" {...currentPrompt} />}

                {showPreview && (
                    <motion.div
                        key="preview-modal"
                        initial={{ opacity: 0, y: 20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.98 }}
                        transition={{ duration: 0.3, ease: EASE }}
                        className="fixed inset-0 z-100 overflow-y-auto bg-[#0a0a0a]"
                    >
                        {/* Sticky Close Button */}
                        <div className="sticky top-6 right-8 flex justify-end z-110 pointer-events-none h-0">
                            <button
                                onClick={() => setShowPreview(false)}
                                className="pointer-events-auto pr-4 text-white backdrop-blur-md font-jost text-[12px] uppercase tracking-widest shadow-xl cursor-pointer"
                            >
                                Close Preview
                            </button>
                        </div>

                        {/* Live Preview Render */}
                        <div
                            className="min-h-screen w-full"
                            style={{ "--ambient": formValues.ambientColor || "#0a0a0a" } as React.CSSProperties}
                        >
                            <GameHero game={formValues} />
                            <div className="relative z-20 -mt-[15vh] bg-linear-to-b from-transparent via-30% via-ambient to-transparent">
                                <MediaGallery media={formValues.screenShots} label="Screenshots & Videos" />
                            </div>
                            <div className="w-full mt-10">
                                <TabSection game={formValues} />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
