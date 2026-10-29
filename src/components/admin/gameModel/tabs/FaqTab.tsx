"use client";

import { useState } from "react";
import { BRAND, BRAND_LIGHT, cn } from "@/lib/utils";
import { Field, Input, TabSection } from "../utils";
import type { GameData, GameFaqItem } from "@/lib/game";
import CommentEditor from "@/components/game/CommentEditor";
import { FiChevronDown, FiChevronUp, FiPlus, FiTrash2 } from "react-icons/fi";
import { AnimatePresence, motion } from "motion/react";

const CATEGORY_PRESETS = [
    "General",
    "Installation",
    "Download",
    "Troubleshooting",
    "Performance",
    "Requirements",
];

interface FaqTabProps {
    form: GameData;
    up: <K extends keyof GameData>(key: K, value: GameData[K]) => void;
    errors?: any;
}

export default function FaqTab({ form, up, errors }: FaqTabProps) {
    const faqs: GameFaqItem[] = form.faqs || [];
    const [expandedIndices, setExpandedIndices] = useState<Record<number, boolean>>({
        0: true, // first item expanded by default
    });

    const toggleExpand = (index: number) => {
        setExpandedIndices((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    const handleAddFaq = () => {
        const newFaq: GameFaqItem = {
            title: "",
            body: "",
            category: "General",
        };
        const next = [...faqs, newFaq];
        up("faqs", next as any);
        // Expand the newly added FAQ
        setExpandedIndices((prev) => ({
            ...prev,
            [next.length - 1]: true,
        }));
    };

    const handleRemoveFaq = (index: number) => {
        const next = faqs.filter((_, i) => i !== index);
        up("faqs", next as any);
    };

    const handleUpdateFaq = (index: number, patch: Partial<GameFaqItem>) => {
        const next = faqs.map((item, i) => (i === index ? { ...item, ...patch } : item));
        up("faqs", next as any);
    };

    return (
        <div className="col-span-full flex flex-col gap-4">
            <TabSection title="Frequently Asked Questions (FAQ)" />

            <div className="flex items-center justify-between">
                <p className="font-jost text-[12px] text-white/50 leading-relaxed">
                    Add game-specific FAQs, installation guides, or troubleshooting tips. These will display in the game&apos;s public FAQ tab.
                </p>
                <button
                    type="button"
                    onClick={handleAddFaq}
                    className="flex items-center gap-1.5 px-3 py-1.5 font-jost text-[10px] tracking-widest uppercase bg-[#7a6b4f]/25 border border-[#c4a97d]/40 text-[#c4a97d] hover:bg-[#c4a97d] hover:text-black transition-colors shrink-0 cursor-pointer"
                >
                    <FiPlus className="w-3.5 h-3.5" />
                    <span>Add FAQ</span>
                </button>
            </div>

            {faqs.length === 0 ? (
                <div className="p-8 border border-dashed border-[#7a6b4f]/30 flex flex-col items-center justify-center text-center gap-2 bg-[#0d0c0a]/40 my-2">
                    <span className="font-jost text-[12px] uppercase tracking-wider text-[#c4a97d]/70">
                        No FAQs Added Yet
                    </span>
                    <p className="font-jost text-[11px] text-white/40 max-w-sm">
                        Click &quot;Add FAQ&quot; above to provide answers to common questions about downloads, controls, patches, or system requirements.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-3 mt-1">
                    {faqs.map((faq, index) => {
                        const isExpanded = !!expandedIndices[index];
                        const itemError = errors?.faqs?.[index];

                        return (
                            <div
                                key={index}
                                className="border border-[#7a6b4f]/25 bg-[#0d0c0a]/60 transition-all duration-200"
                            >
                                {/* Header / Summary Bar */}
                                <div
                                    onClick={() => toggleExpand(index)}
                                    className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-[#7a6b4f]/10 transition-colors select-none"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span className="font-mono text-[10px] text-[#c4a97d]/70 px-1.5 py-0.5 border border-[#7a6b4f]/30 bg-black/40">
                                            #{index + 1}
                                        </span>
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="font-jost text-[13px] text-white/90 font-medium truncate">
                                                {faq.title.trim() || "(Untitled Question)"}
                                            </span>
                                            {faq.category && (
                                                <span className="hidden sm:inline-block px-2 py-0.5 font-jost text-[9px] uppercase tracking-wider border border-[#7a6b4f]/30 text-[#c4a97d]/80 bg-[#7a6b4f]/10 shrink-0">
                                                    {faq.category}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveFaq(index);
                                            }}
                                            className="p-1.5 text-white/40 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
                                            title="Delete FAQ"
                                        >
                                            <FiTrash2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            className="p-1 text-[#c4a97d] transition-transform duration-200"
                                        >
                                            {isExpanded ? (
                                                <FiChevronUp className="w-4 h-4" />
                                            ) : (
                                                <FiChevronDown className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Editor Section */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="border-t border-[#7a6b4f]/20 p-4 flex flex-col gap-4 bg-[#0a0908]/50 overflow-hidden"
                                        >
                                            {/* Question Title */}
                                            <Field
                                                label="Question / Title *"
                                                error={itemError?.title?.message}
                                            >
                                                <Input
                                                    value={faq.title}
                                                    onChange={(v: string) => handleUpdateFaq(index, { title: v })}
                                                    placeholder="e.g. How do I apply the latest game patch?"
                                                />
                                            </Field>

                                            {/* Category Tag */}
                                            <div className="flex flex-col gap-1.5">
                                                <Field
                                                    label="Category Tag"
                                                    hint="Used to group and filter FAQs in the store"
                                                >
                                                    <Input
                                                        value={faq.category || "General"}
                                                        onChange={(v: string) => handleUpdateFaq(index, { category: v })}
                                                        placeholder="e.g. Troubleshooting"
                                                    />
                                                </Field>
                                                {/* Preset Category Pills */}
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {CATEGORY_PRESETS.map((cat) => (
                                                        <button
                                                            key={cat}
                                                            type="button"
                                                            onClick={() => handleUpdateFaq(index, { category: cat })}
                                                            className={cn(
                                                                "px-2 py-0.5 font-jost text-[9px] tracking-wider uppercase border transition-colors cursor-pointer",
                                                                (faq.category || "General") === cat
                                                                    ? "border-[#c4a97d] text-[#c4a97d] bg-[#c4a97d]/10"
                                                                    : "border-[#7a6b4f]/30 text-white/40 hover:text-white"
                                                            )}
                                                        >
                                                            {cat}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Rich Format Answer Editor */}
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center justify-between">
                                                    <label
                                                        className="font-jost text-[12px] tracking-[0.14em] uppercase"
                                                        style={{ color: BRAND }}
                                                    >
                                                        Answer / Body (Rich Text) *
                                                    </label>
                                                    <span className="font-jost text-[10px] text-[#c4a97d]/60">
                                                        Formatted text • Headings • Lists • Links
                                                    </span>
                                                </div>

                                                <CommentEditor
                                                    value={faq.body}
                                                    onChange={(html) => handleUpdateFaq(index, { body: html })}
                                                    placeholder="Provide clear steps, download instructions, or troubleshooting details..."
                                                    enableImages={false}
                                                    enableLinks={true}
                                                    enableHeadings={true}
                                                    showSubmit={false}
                                                    minHeight="140px"
                                                    className="bg-[#12110e]"
                                                />
                                                {itemError?.body?.message && (
                                                    <span className="text-red-500 text-xs mt-1">
                                                        {itemError.body.message}
                                                    </span>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
