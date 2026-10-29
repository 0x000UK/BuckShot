"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Quote,
    Image as ImageIcon,
    Link as LinkIcon,
    Heading,
    X,
    Send,
} from "lucide-react";
import { BRAND, BRAND_GOLD, cn } from "@/lib/utils";

export interface CommentEditorProps {
    value?: string;
    onChange?: (contentHtml: string) => void;
    placeholder?: string;
    submitLabel?: string;
    isSubmitting?: boolean;
    onSubmit?: (contentHtml: string) => Promise<boolean | void>;
    onCancel?: () => void;
    compact?: boolean;
    autoFocus?: boolean;
    enableImages?: boolean;
    enableLinks?: boolean;
    enableLists?: boolean;
    enableQuotes?: boolean;
    enableHeadings?: boolean;
    minHeight?: string;
    className?: string;
    showSubmit?: boolean;
}

export default function CommentEditor({
    value,
    onChange,
    placeholder = "Share your thoughts with the community...",
    submitLabel = "POST",
    isSubmitting = false,
    onSubmit,
    onCancel,
    compact = false,
    autoFocus = false,
    enableImages = true,
    enableLinks = true,
    enableLists = true,
    enableQuotes = true,
    enableHeadings = false,
    minHeight,
    className,
    showSubmit,
}: CommentEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [isEmpty, setIsEmpty] = useState(true);

    // Should we show submit footer controls? Defaults to true if onSubmit is provided
    const shouldShowSubmit = showSubmit !== undefined ? showSubmit : !!onSubmit;

    // Active formatting states
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isBullet, setIsBullet] = useState(false);
    const [isOrdered, setIsOrdered] = useState(false);

    // Popover modals for Link & Image
    const [showImageModal, setShowImageModal] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");
    const savedRangeRef = useRef<Range | null>(null);

    // Initialize or synchronize value
    useEffect(() => {
        if (value !== undefined && editorRef.current) {
            if (editorRef.current.innerHTML !== value) {
                editorRef.current.innerHTML = value || "";
            }
            const text = editorRef.current.innerText || "";
            const hasImg = editorRef.current.querySelector("img") !== null;
            setIsEmpty(text.trim().length === 0 && !hasImg);
        }
    }, [value]);

    // Check formatting state on selection change
    const updateFormatState = useCallback(() => {
        if (!editorRef.current) return;
        try {
            setIsBold(document.queryCommandState("bold"));
            setIsItalic(document.queryCommandState("italic"));
            if (enableLists) {
                setIsBullet(document.queryCommandState("insertUnorderedList"));
                setIsOrdered(document.queryCommandState("insertOrderedList"));
            }
        } catch {
            // Ignore in unsupported environments
        }
    }, [enableLists]);

    useEffect(() => {
        const handleSelectionChange = () => {
            const sel = window.getSelection();
            if (
                editorRef.current &&
                sel &&
                sel.rangeCount > 0 &&
                editorRef.current.contains(sel.anchorNode)
            ) {
                updateFormatState();
            }
        };

        document.addEventListener("selectionchange", handleSelectionChange);
        return () => {
            document.removeEventListener("selectionchange", handleSelectionChange);
        };
    }, [updateFormatState]);

    useEffect(() => {
        if (autoFocus && editorRef.current) {
            editorRef.current.focus();
        }
    }, [autoFocus]);

    const handleContentChange = () => {
        if (!editorRef.current) return;
        const text = editorRef.current.innerText || "";
        const hasImg = editorRef.current.querySelector("img") !== null;
        setIsEmpty(text.trim().length === 0 && !hasImg);
        updateFormatState();
        if (onChange) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const saveSelection = () => {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
            savedRangeRef.current = sel.getRangeAt(0);
        }
    };

    const restoreSelection = () => {
        if (savedRangeRef.current) {
            const sel = window.getSelection();
            if (sel) {
                sel.removeAllRanges();
                sel.addRange(savedRangeRef.current);
            }
        }
    };

    const executeCommand = (cmd: string, val: string = "") => {
        if (!editorRef.current) return;
        editorRef.current.focus();
        document.execCommand(cmd, false, val);
        handleContentChange();
    };

    const handleInsertImage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageUrl.trim() || !editorRef.current) return;

        restoreSelection();
        editorRef.current.focus();

        const imgHtml = `<img src="${imageUrl.trim()}" alt="Article image" class="max-w-full max-h-80 h-auto my-3 rounded-none border border-[#7a6b4f]/30 object-contain block" />&nbsp;`;
        document.execCommand("insertHTML", false, imgHtml);

        setImageUrl("");
        setShowImageModal(false);
        handleContentChange();
    };

    const handleInsertLink = (e: React.FormEvent) => {
        e.preventDefault();
        if (!linkUrl.trim() || !editorRef.current) return;

        restoreSelection();
        editorRef.current.focus();

        let cleanUrl = linkUrl.trim();
        if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
            cleanUrl = `https://${cleanUrl}`;
        }

        const sel = window.getSelection();
        const selectedText = sel ? sel.toString().trim() : "";

        if (selectedText.length > 0) {
            document.execCommand("createLink", false, cleanUrl);
        } else {
            const linkHtml = `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="text-[#c4a97d] underline hover:text-white transition-colors">${cleanUrl}</a>&nbsp;`;
            document.execCommand("insertHTML", false, linkHtml);
        }

        setLinkUrl("");
        setShowLinkModal(false);
        handleContentChange();
    };

    const handleSubmit = async () => {
        if (!editorRef.current || isEmpty || isSubmitting || !onSubmit) return;
        const html = editorRef.current.innerHTML;

        const result = await onSubmit(html);
        if (result !== false && editorRef.current) {
            editorRef.current.innerHTML = "";
            setIsEmpty(true);
        }
    };

    const calculatedMinHeight = minHeight ?? (compact ? "min-h-16" : "min-h-24");

    return (
        <div
            className={cn(
                "w-full bg-[#0d0c0a] border transition-colors duration-200 p-3",
                isFocused ? "border-[#c4a97d]/50 shadow-[0_0_20px_rgba(196,169,125,0.06)]" : "border-[#7a6b4f]/25",
                className
            )}
        >
            {/* ── Toolbar ── */}
            <div className="flex items-center gap-1 pb-2 mb-2 border-b border-[#7a6b4f]/15 flex-wrap">
                {/* Bold */}
                <button
                    type="button"
                    title="Bold (Ctrl+B)"
                    onClick={() => executeCommand("bold")}
                    className={cn(
                        "p-1.5 rounded-none transition-colors cursor-pointer text-white/55 hover:text-white hover:bg-white/5",
                        isBold && "text-[#c4a97d] bg-[#c4a97d]/10 border border-[#c4a97d]/30"
                    )}
                >
                    <Bold className="w-3.5 h-3.5" />
                </button>

                {/* Italic */}
                <button
                    type="button"
                    title="Italic (Ctrl+I)"
                    onClick={() => executeCommand("italic")}
                    className={cn(
                        "p-1.5 rounded-none transition-colors cursor-pointer text-white/55 hover:text-white hover:bg-white/5",
                        isItalic && "text-[#c4a97d] bg-[#c4a97d]/10 border border-[#c4a97d]/30"
                    )}
                >
                    <Italic className="w-3.5 h-3.5" />
                </button>

                {/* Heading 3 (if enabled) */}
                {enableHeadings && (
                    <button
                        type="button"
                        title="Subheading"
                        onClick={() => executeCommand("formatBlock", "<h3>")}
                        className="p-1.5 rounded-none transition-colors cursor-pointer text-white/55 hover:text-white hover:bg-white/5"
                    >
                        <Heading className="w-3.5 h-3.5" />
                    </button>
                )}

                {/* Bullet List */}
                {enableLists && (
                    <>
                        <div className="w-px h-3.5 bg-white/10 mx-1" />
                        <button
                            type="button"
                            title="Bullet List"
                            onClick={() => executeCommand("insertUnorderedList")}
                            className={cn(
                                "p-1.5 rounded-none transition-colors cursor-pointer text-white/55 hover:text-white hover:bg-white/5",
                                isBullet && "text-[#c4a97d] bg-[#c4a97d]/10 border border-[#c4a97d]/30"
                            )}
                        >
                            <List className="w-3.5 h-3.5" />
                        </button>
                        <button
                            type="button"
                            title="Numbered List"
                            onClick={() => executeCommand("insertOrderedList")}
                            className={cn(
                                "p-1.5 rounded-none transition-colors cursor-pointer text-white/55 hover:text-white hover:bg-white/5",
                                isOrdered && "text-[#c4a97d] bg-[#c4a97d]/10 border border-[#c4a97d]/30"
                            )}
                        >
                            <ListOrdered className="w-3.5 h-3.5" />
                        </button>
                    </>
                )}

                {/* Blockquote */}
                {enableQuotes && (
                    <button
                        type="button"
                        title="Blockquote"
                        onClick={() => executeCommand("formatBlock", "<blockquote>")}
                        className="p-1.5 rounded-none transition-colors cursor-pointer text-white/55 hover:text-white hover:bg-white/5"
                    >
                        <Quote className="w-3.5 h-3.5" />
                    </button>
                )}

                {/* Link button */}
                {enableLinks && (
                    <>
                        <div className="w-px h-3.5 bg-white/10 mx-1" />
                        <button
                            type="button"
                            title="Insert Link"
                            onClick={() => {
                                saveSelection();
                                setShowLinkModal(true);
                            }}
                            className="p-1.5 rounded-none transition-colors cursor-pointer text-white/55 hover:text-[#c4a97d] hover:bg-[#c4a97d]/10"
                        >
                            <LinkIcon className="w-3.5 h-3.5" />
                        </button>
                    </>
                )}

                {/* Image button */}
                {enableImages && (
                    <button
                        type="button"
                        title="Insert Image Link / Preview"
                        onClick={() => {
                            saveSelection();
                            setShowImageModal(true);
                        }}
                        className="p-1.5 rounded-none transition-colors cursor-pointer text-white/55 hover:text-[#c4a97d] hover:bg-[#c4a97d]/10 flex items-center gap-1 font-jost text-[10px] uppercase tracking-wider"
                    >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Image</span>
                    </button>
                )}
            </div>

            {/* ── Link Popover Modal ── */}
            {enableLinks && showLinkModal && (
                <div className="mb-3 p-3 bg-[#13110d] border border-[#7a6b4f]/35 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[9px] tracking-widest uppercase text-[#c4a97d]">
                            Insert Hyperlink
                        </span>
                        <button
                            type="button"
                            onClick={() => setShowLinkModal(false)}
                            className="text-white/40 hover:text-white"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <form onSubmit={handleInsertLink} className="flex gap-2">
                        <input
                            type="text"
                            placeholder="https://example.com"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            autoFocus
                            className="flex-1 bg-black/50 border border-[#7a6b4f]/30 px-3 py-1.5 text-xs text-white font-jost outline-none focus:border-[#c4a97d]"
                        />
                        <button
                            type="submit"
                            className="px-3 py-1.5 bg-[#7a6b4f]/30 hover:bg-[#c4a97d] hover:text-[#0b0908] text-[#c4a97d] border border-[#c4a97d]/40 font-jost text-[10px] font-semibold uppercase tracking-wider transition-colors"
                        >
                            Insert
                        </button>
                    </form>
                </div>
            )}

            {/* ── Image Popover Modal ── */}
            {enableImages && showImageModal && (
                <div className="mb-3 p-3 bg-[#13110d] border border-[#7a6b4f]/35 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[9px] tracking-widest uppercase text-[#c4a97d]">
                            Insert Image URL
                        </span>
                        <button
                            type="button"
                            onClick={() => setShowImageModal(false)}
                            className="text-white/40 hover:text-white"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <form onSubmit={handleInsertImage} className="space-y-2">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="https://example.com/screenshot.jpg"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                autoFocus
                                className="flex-1 bg-black/50 border border-[#7a6b4f]/30 px-3 py-1.5 text-xs text-white font-jost outline-none focus:border-[#c4a97d]"
                            />
                            <button
                                type="submit"
                                className="px-3 py-1.5 bg-[#7a6b4f]/30 hover:bg-[#c4a97d] hover:text-[#0b0908] text-[#c4a97d] border border-[#c4a97d]/40 font-jost text-[10px] font-semibold uppercase tracking-wider transition-colors"
                            >
                                Preview & Insert
                            </button>
                        </div>
                        {imageUrl && (
                            <div className="p-2 border border-white/5 bg-black/40 flex items-center justify-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={imageUrl}
                                    alt="Preview"
                                    className="max-h-32 object-contain"
                                    onError={(e) => {
                                        (e.target as HTMLElement).style.display = "none";
                                    }}
                                />
                            </div>
                        )}
                    </form>
                </div>
            )}

            {/* ── ContentEditable Input Area ── */}
            <div className="relative">
                {isEmpty && !isFocused && (
                    <div className="absolute top-2 left-2 pointer-events-none text-white/30 font-jost text-[14px]">
                        {placeholder}
                    </div>
                )}
                <div
                    ref={editorRef}
                    contentEditable
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onInput={handleContentChange}
                    onKeyDown={(e) => {
                        if (shouldShowSubmit && (e.ctrlKey || e.metaKey) && e.key === "Enter") {
                            e.preventDefault();
                            handleSubmit();
                        }
                    }}
                    className={cn(
                        "w-full bg-transparent font-jost text-[14px] leading-relaxed text-white/90 outline-none p-2 overflow-y-auto",
                        "[&_strong]:font-semibold [&_strong]:text-white",
                        "[&_em]:italic [&_em]:text-white/90",
                        "[&_h3]:text-[#c4a97d] [&_h3]:font-semibold [&_h3]:my-2",
                        "[&_ul]:list-disc [&_ul]:list-inside [&_ul]:my-2 [&_ul]:space-y-1 [&_ul]:pl-2",
                        "[&_ol]:list-decimal [&_ol]:list-inside [&_ol]:my-2 [&_ol]:space-y-1 [&_ol]:pl-2",
                        "[&_blockquote]:border-l-2 [&_blockquote]:border-[#c4a97d]/50 [&_blockquote]:pl-3 [&_blockquote]:py-1 [&_blockquote]:my-2 [&_blockquote]:italic [&_blockquote]:bg-[#7a6b4f]/10",
                        "[&_a]:underline [&_a]:text-[#c4a97d]",
                        "[&_img]:max-w-full [&_img]:max-h-80 [&_img]:my-2 [&_img]:border [&_img]:border-[#7a6b4f]/30",
                        calculatedMinHeight,
                        compact ? "max-h-48" : "max-h-80"
                    )}
                    style={{ caretColor: BRAND_GOLD }}
                />
            </div>

            {/* ── Footer Controls (Only when shouldShowSubmit is true) ── */}
            {shouldShowSubmit && (
                <div className="flex items-center justify-between gap-3 pt-3 mt-2 border-t border-[#7a6b4f]/15">
                    <span className="font-jost text-[10px] tracking-wider text-white/35">
                        Tip: Press <kbd className="font-mono text-[#c4a97d]/80 px-1 py-0.5 border border-white/10 bg-black/40">Ctrl</kbd> + <kbd className="font-mono text-[#c4a97d]/80 px-1 py-0.5 border border-white/10 bg-black/40">Enter</kbd> to submit
                    </span>

                    <div className="flex items-center gap-2">
                        {onCancel && (
                            <button
                                type="button"
                                onClick={onCancel}
                                disabled={isSubmitting}
                                className="px-3 py-1.5 font-jost text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40 hover:text-white transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                        )}

                        <button
                            type="button"
                            disabled={isEmpty || isSubmitting}
                            onClick={handleSubmit}
                            className={cn(
                                "inline-flex items-center gap-2 px-5 py-2 font-jost text-[11px] font-bold tracking-[0.2em] uppercase rounded-none transition-all duration-200 cursor-pointer",
                                isEmpty || isSubmitting
                                    ? "bg-white/5 border border-white/10 text-white/25 cursor-not-allowed"
                                    : "bg-[#7a6b4f] hover:bg-[#c4a97d] text-[#f4efe4] hover:text-[#0b0908] border border-[#c4a97d] shadow-[0_0_15px_rgba(196,169,125,0.2)]"
                            )}
                        >
                            <Send className="w-3.5 h-3.5" />
                            <span>{isSubmitting ? "POSTING..." : submitLabel}</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
