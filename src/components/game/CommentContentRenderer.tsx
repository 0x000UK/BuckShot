"use client";

import { cn } from "@/lib/utils";

interface CommentContentRendererProps {
    content: string;
    className?: string;
}

// Simple test to see if content has HTML tags
const HTML_REGEX = /<[a-z][\s\S]*>/i;
// Regex to detect standalone image links in text
const IMAGE_URL_REGEX = /(https?:\/\/[^\s]+?\.(?:png|jpg|jpeg|gif|webp|svg)(?:\?[^\s]*)?)/gi;

export default function CommentContentRenderer({
    content,
    className,
}: CommentContentRendererProps) {
    if (!content) return null;

    const hasHTML = HTML_REGEX.test(content);

    if (hasHTML) {
        return (
            <div
                className={cn(
                    "font-jost text-[14px] leading-relaxed text-white/75 wrap-break-word space-y-2",
                    "[&_strong]:font-semibold [&_strong]:text-white",
                    "[&_em]:italic [&_em]:text-white/90",
                    "[&_ul]:list-disc [&_ul]:list-inside [&_ul]:my-2 [&_ul]:space-y-1 [&_ul]:pl-2",
                    "[&_ol]:list-decimal [&_ol]:list-inside [&_ol]:my-2 [&_ol]:space-y-1 [&_ol]:pl-2",
                    "[&_li]:leading-relaxed",
                    "[&_p]:my-1.5 [&_p]:leading-relaxed",
                    "[&_blockquote]:border-l-2 [&_blockquote]:border-[#c4a97d]/50 [&_blockquote]:pl-3 [&_blockquote]:py-1 [&_blockquote]:my-2 [&_blockquote]:italic [&_blockquote]:bg-[#7a6b4f]/10 [&_blockquote]:text-white/70",
                    "[&_a]:underline [&_a]:text-[#c4a97d] [&_a]:hover:text-white [&_a]:transition-colors",
                    "[&_img]:max-w-full [&_img]:max-h-96 [&_img]:h-auto [&_img]:my-3 [&_img]:rounded-none [&_img]:border [&_img]:border-[#7a6b4f]/30 [&_img]:object-contain [&_img]:block",
                    className
                )}
                dangerouslySetInnerHTML={{ __html: content }}
            />
        );
    }

    // If plain text, handle line breaks and auto-detect image links
    const parts = content.split(IMAGE_URL_REGEX);

    return (
        <div className={cn("font-jost text-[14px] leading-relaxed text-white/75 wrap-break-word", className)}>
            {parts.map((part, index) => {
                if (part.match(IMAGE_URL_REGEX)) {
                    return (
                        <div key={index} className="my-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={part}
                                alt="Shared preview"
                                className="max-w-full max-h-96 h-auto rounded-none border border-[#7a6b4f]/30 object-contain block"
                                loading="lazy"
                            />
                        </div>
                    );
                }
                return (
                    <span key={index} className="whitespace-pre-line">
                        {part}
                    </span>
                );
            })}
        </div>
    );
}
