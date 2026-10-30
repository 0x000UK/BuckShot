"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, UploadCloud, Image as ImageIcon, Loader2 } from "lucide-react";
import { BRAND, BRAND_LIGHT, EASE, cn } from "@/lib/utils";
import { uploadUserMedia } from "@/lib/fileUpload";
import { updateUserProfileMedia } from "@/app/actions";
import { toast } from "@/stores/alertStore";
import { useRouter } from "next/navigation";

interface ProfileMediaModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: "avatar" | "banner";
    currentUrl?: string | null;
    userId: string;
    onSuccess: (newUrl: string) => void;
}

export default function ProfileMediaModal({
    isOpen,
    onClose,
    type,
    currentUrl,
    userId,
    onSuccess,
}: ProfileMediaModalProps) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>(currentUrl || "");
    const [urlInput, setUrlInput] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Sync preview with currentUrl on open
    useEffect(() => {
        if (isOpen) {
            setSelectedFile(null);
            setPreviewUrl(currentUrl || "");
            setUrlInput("");
            setErrorMsg(null);
            setIsSubmitting(false);
        }
    }, [isOpen, currentUrl]);

    // Handle Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen && !isSubmitting) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, isSubmitting, onClose]);

    const handleFile = (file: File) => {
        if (!file.type.startsWith("image/")) {
            setErrorMsg("Please upload a valid image file (PNG, JPG, WEBP).");
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setErrorMsg("Image size exceeds the 10MB limit.");
            return;
        }

        setErrorMsg(null);
        setSelectedFile(file);
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files[0]) {
            handleFile(files[0]);
        }
        e.target.value = "";
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleApplyUrl = () => {
        if (!urlInput.trim()) return;
        setErrorMsg(null);
        setSelectedFile(null);
        setPreviewUrl(urlInput.trim());
    };

    const handleSave = async () => {
        if (!previewUrl) {
            setErrorMsg("Please select an image first.");
            return;
        }

        setIsSubmitting(true);
        setErrorMsg(null);

        try {
            let finalUrl = previewUrl;

            // 1. If user selected a file, upload to Cloudinary
            if (selectedFile) {
                finalUrl = await uploadUserMedia(userId, selectedFile, type);
            }

            // 2. Persist to MongoDB
            const payload = type === "avatar" 
                ? { avatar: finalUrl }
                : { banner: { type: "image" as const, image: finalUrl } };

            const res = await updateUserProfileMedia(payload);

            if (!res.success) {
                throw new Error(res.errors?.message || "Failed to update profile media.");
            }

            toast.success(
                type === "avatar" ? "Profile picture updated" : "Profile banner updated",
                "Your profile changes have been saved."
            );

            onSuccess(finalUrl);
            router.refresh();
            onClose();
        } catch (err: unknown) {
            console.error("Save error:", err);
            const msg = err instanceof Error ? err.message : "Upload failed. Please try again.";
            setErrorMsg(msg);
            toast.error("Upload Failed", msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const isAvatar = type === "avatar";

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => !isSubmitting && onClose()}
                    className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ scale: 0.96, opacity: 0, y: 12 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.96, opacity: 0, y: 12 }}
                    transition={{ duration: 0.25, ease: EASE }}
                    className="relative w-full max-w-lg bg-[#0d0c0a] border border-[#7a6b4f]/30 p-6 sm:p-8 flex flex-col gap-6 shadow-[0_0_50px_rgba(0,0,0,0.85)] z-10 rounded-none max-h-[92vh] overflow-y-auto"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-[#7a6b4f]/20">
                        <div>
                            <h2 className="font-jk text-lg sm:text-xl uppercase tracking-wider text-white/95">
                                {isAvatar ? "Upload Profile Picture" : "Upload Profile Banner"}
                            </h2>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white border border-[#7a6b4f]/20 hover:border-[#c4a97d]/50 bg-black/40 transition-colors disabled:opacity-40 cursor-pointer"
                            aria-label="Close modal"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Preview / Drop Area */}
                    <div className="flex flex-col gap-3">
                        {previewUrl ? (
                            <div className="flex flex-col items-center gap-4">
                                {/* Visual Preview with Mask */}
                                <div 
                                    className={cn(
                                        "relative overflow-hidden bg-[#080808] border border-[#7a6b4f]/35 flex items-center justify-center select-none",
                                        isAvatar 
                                            ? "w-64 h-64 sm:w-72 sm:h-72" 
                                            : "w-full aspect-video sm:aspect-21/9"
                                    )}
                                >
                                    {/* Underlying Image */}
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="w-full h-full object-cover select-none pointer-events-none"
                                    />

                                    {/* MASK OVERLAY */}
                                    {isAvatar ? (
                                        // Circular Cutout Mask for Avatar
                                        <svg
                                            className="absolute inset-0 w-full h-full pointer-events-none"
                                            viewBox="0 0 100 100"
                                            preserveAspectRatio="none"
                                        >
                                            <defs>
                                                <mask id="avatarHoleMask">
                                                    <rect width="100" height="100" fill="white" />
                                                    <circle cx="50" cy="50" r="44" fill="black" />
                                                </mask>
                                            </defs>
                                            {/* Darkened region outside circle */}
                                            <rect
                                                width="100"
                                                height="100"
                                                fill="rgba(8, 8, 8, 0.72)"
                                                mask="url(#avatarHoleMask)"
                                            />
                                            {/* Circular guide border */}
                                            <circle
                                                cx="50"
                                                cy="50"
                                                r="44"
                                                fill="none"
                                                stroke={BRAND_LIGHT}
                                                strokeWidth="1"
                                                strokeDasharray="3 3"
                                                opacity="0.85"
                                            />
                                        </svg>
                                    ) : (
                                        // Rectangular Cutout Mask for Banner
                                        <svg
                                            className="absolute inset-0 w-full h-full pointer-events-none"
                                            viewBox="0 0 100 56.25"
                                            preserveAspectRatio="none"
                                        >
                                            <defs>
                                                <mask id="bannerHoleMask">
                                                    <rect width="100" height="56.25" fill="white" />
                                                    <rect x="4" y="4" width="92" height="48.25" fill="black" />
                                                </mask>
                                            </defs>
                                            {/* Darkened letterbox area */}
                                            <rect
                                                width="100"
                                                height="56.25"
                                                fill="rgba(8, 8, 8, 0.72)"
                                                mask="url(#bannerHoleMask)"
                                            />
                                            {/* Banner guide frame */}
                                            <rect
                                                x="4"
                                                y="4"
                                                width="92"
                                                height="48.25"
                                                fill="none"
                                                stroke={BRAND_LIGHT}
                                                strokeWidth="0.8"
                                                strokeDasharray="3 3"
                                                opacity="0.85"
                                            />
                                        </svg>
                                    )}

                                    {/* Action button overlay */}
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute bottom-3 right-3 px-2.5 py-1 text-[11px] font-jost uppercase tracking-wider bg-black/80 hover:bg-black text-[#c4a97d] border border-[#7a6b4f]/40 backdrop-blur-xs transition-colors cursor-pointer"
                                    >
                                        Change Image
                                    </button>
                                </div>

                                {/* Mini UI Appearance Preview */}
                                <div className="flex items-center gap-3 px-3 py-2 bg-black/40 border border-[#7a6b4f]/20 w-full">
                                    {isAvatar ? (
                                        <div className="w-10 h-10 rounded-full overflow-hidden border border-[#c4a97d]/50 shrink-0 bg-[#080808]">
                                            <img src={previewUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="w-16 h-8 overflow-hidden border border-[#c4a97d]/50 shrink-0 bg-[#080808]">
                                            <img src={previewUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className="flex flex-col">
                                        <span className="font-jost text-xs text-white/80 font-medium">
                                            {isAvatar ? "Circular Profile Preview" : "Banner Viewport Preview"}
                                        </span>
                                        <span className="font-jost text-[11px] text-white/40">
                                            {isAvatar 
                                                ? "Unshaded circle shows exact avatar boundary."
                                                : "Unshaded region shows visible desktop banner."}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Drop Zone */
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-3 p-8 border cursor-pointer select-none transition-all duration-200 text-center",
                                    isDragging 
                                        ? "border-[#c4a97d] bg-[#7a6b4f]/15" 
                                        : "border-[#7a6b4f]/30 hover:border-[#c4a97d]/50 bg-black/30"
                                )}
                            >
                                <div className="w-12 h-12 rounded-full bg-[#7a6b4f]/15 flex items-center justify-center text-[#c4a97d]">
                                    <UploadCloud size={24} />
                                </div>

                                <div>
                                    <p className="font-jost text-sm text-white/85">
                                        Drag & drop image here, or{" "}
                                        <span className="text-[#c4a97d] font-medium underline-offset-4 hover:underline">
                                            browse
                                        </span>
                                    </p>
                                    <p className="font-jost text-[11px] text-white/40 mt-1">
                                        PNG, JPG, or WEBP (Max 10MB) · Ratio hint: {isAvatar ? "1:1 Square" : "16:9 Banner"}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            className="hidden"
                            onChange={handleFileInput}
                        />
                    </div>

                    {/* URL Input Fallback */}
                    <div className="flex flex-col gap-2 pt-2 border-t border-[#7a6b4f]/15">
                        <span className="font-jost text-[10.5px] uppercase tracking-[0.16em] text-white/40">
                            Or Use Direct Image URL
                        </span>
                        <div className="flex gap-2">
                            <input
                                type="url"
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                placeholder="https://example.com/image.jpg"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleApplyUrl();
                                    }
                                }}
                                className="flex-1 bg-transparent font-jost text-xs text-white/80 outline-none px-3 py-2 border border-[#7a6b4f]/30 focus:border-[#c4a97d]/60 placeholder:text-white/20 transition-colors"
                            />
                            <button
                                type="button"
                                onClick={handleApplyUrl}
                                disabled={!urlInput.trim()}
                                className="px-4 py-2 font-jost text-xs uppercase tracking-wider bg-[#7a6b4f]/20 hover:bg-[#7a6b4f]/35 text-[#c4a97d] border border-[#7a6b4f]/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            >
                                Preview
                            </button>
                        </div>
                    </div>

                    {/* Error Banner */}
                    {errorMsg && (
                        <div className="px-3.5 py-2 bg-red-950/40 border border-red-500/40 text-red-200 text-xs font-jost">
                            {errorMsg}
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#7a6b4f]/20">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 font-jost text-xs uppercase tracking-wider text-white/60 hover:text-white border border-[#7a6b4f]/25 hover:border-[#7a6b4f]/40 transition-colors disabled:opacity-40 cursor-pointer"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={!previewUrl || isSubmitting}
                            className="px-6 py-2 font-jost text-xs uppercase tracking-wider bg-[#c4a97d] text-[#080808] font-medium hover:bg-[#d8c199] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(196,169,125,0.2)]"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <span>Save Changes</span>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
