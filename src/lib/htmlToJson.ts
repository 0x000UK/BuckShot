import type { JSONNode, JSONRoot } from "@/lib/game";

const TAG_CLASSES: Record<string, string> = {
    h1: "font-jk text-2xl font-bold mb-3 tracking-wide text-white",
    h2: "font-jk text-xl font-bold mb-3 tracking-wide text-white",
    h3: "font-jk text-lg font-bold mb-2 tracking-wide text-white",
    h4: "font-jk text-base font-bold mb-2 tracking-wide text-white",
    p: "font-jost text-[14px] leading-relaxed text-white/70 mb-3",
    strong: "font-bold text-white",
    em: "italic text-white/90",
    u: "underline",
    s: "line-through text-white/40",
    blockquote: "border-l-2 border-[#7a6b4f] pl-4 italic text-white/60 mb-3",
    ul: "list-disc pl-5 mb-3 font-jost text-[14px] text-white/70 space-y-1",
    ol: "list-decimal pl-5 mb-3 font-jost text-[14px] text-white/70 space-y-1",
    li: "font-jost text-[14px] text-white/70",
    a: "text-[#c4a97d] underline hover:text-white transition-colors",
    img: "max-w-full my-4 border border-[#7a6b4f]/30",
    video: "w-full my-4 border border-[#7a6b4f]/30",
};

function decodeEntities(str: string): string {
    return str
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, " ")
        .replace(/&#x2F;/g, "/");
}

function normalizeTag(rawTag: string): string {
    const t = rawTag.toLowerCase().trim();
    if (t === "b") return "strong";
    if (t === "i") return "em";
    if (t === "strike" || t === "del") return "s";
    return t;
}

const VOID_TAGS = new Set(["img", "br", "hr", "input", "source"]);
const ALLOWED_TAGS = new Set([
    "h1", "h2", "h3", "h4", "h5", "h6",
    "p", "strong", "em", "u", "s",
    "blockquote", "ul", "ol", "li",
    "a", "img", "video", "br"
]);

interface Token {
    type: "start" | "end" | "text" | "void";
    tag?: string;
    content?: string;
    attrs?: Record<string, string>;
}

function parseAttributes(attrStr: string): Record<string, string> {
    const attrs: Record<string, string> = {};
    const regex = /([a-zA-Z0-9_-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(attrStr)) !== null) {
        const key = match[1].toLowerCase();
        const value = match[2] ?? match[3] ?? match[4] ?? "";
        attrs[key] = value;
    }

    return attrs;
}

function tokenize(html: string): Token[] {
    const tokens: Token[] = [];
    const tagRegex = /<\/?([a-zA-Z0-9_-]+)([^>]*)>/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = tagRegex.exec(html)) !== null) {
        if (match.index > lastIndex) {
            const rawText = html.slice(lastIndex, match.index);
            const decoded = decodeEntities(rawText);
            if (decoded.length > 0) {
                tokens.push({ type: "text", content: decoded });
            }
        }

        const isClosing = match[0].startsWith("</");
        const tagName = normalizeTag(match[1]);
        const attrStr = match[2];

        if (isClosing) {
            tokens.push({ type: "end", tag: tagName });
        } else if (VOID_TAGS.has(tagName) || match[0].endsWith("/>")) {
            tokens.push({
                type: "void",
                tag: tagName,
                attrs: parseAttributes(attrStr),
            });
        } else {
            tokens.push({
                type: "start",
                tag: tagName,
                attrs: parseAttributes(attrStr),
            });
        }

        lastIndex = tagRegex.lastIndex;
    }

    if (lastIndex < html.length) {
        const remaining = decodeEntities(html.slice(lastIndex));
        if (remaining.length > 0) {
            tokens.push({ type: "text", content: remaining });
        }
    }

    return tokens;
}

/**
 * Parses raw HTML directly into the project's native JSONRoot AST.
 */
export function htmlToJSONRoot(rawHtml: string): JSONRoot {
    if (!rawHtml || typeof rawHtml !== "string") {
        return { type: "root", children: [] };
    }

    // Pre-clean Steam-specific wrappers that add no semantic value
    const cleanedHtml = rawHtml
        .replace(/<span class="bb_img_ctn">/gi, "")
        .replace(/<\/span>/gi, "")
        .replace(/<div class="bb_table">/gi, "")
        .replace(/<\/div>/gi, "\n");

    const tokens = tokenize(cleanedHtml);

    interface StackEntry {
        tag: string;
        attrs?: Record<string, string>;
        children: JSONNode[];
    }

    const stack: StackEntry[] = [{ tag: "root", children: [] }];

    for (const token of tokens) {
        if (token.type === "text") {
            const current = stack[stack.length - 1];
            if (token.content) {
                current.children.push({
                    type: "text",
                    content: token.content,
                });
            }
            continue;
        }

        if (token.type === "void") {
            const current = stack[stack.length - 1];
            const tag = token.tag || "br";

            if (tag === "br") {
                current.children.push({ type: "br" });
            } else if (tag === "img") {
                const src = token.attrs?.src;
                if (src) {
                    current.children.push({
                        type: "img",
                        src,
                        classes: TAG_CLASSES.img ? [TAG_CLASSES.img] : [],
                    });
                }
            }
            continue;
        }

        if (token.type === "start") {
            const rawTag = token.tag || "p";
            const tag = ALLOWED_TAGS.has(rawTag) ? rawTag : "p";

            stack.push({
                tag,
                attrs: token.attrs,
                children: [],
            });
            continue;
        }

        if (token.type === "end") {
            const rawTag = token.tag || "p";
            const tag = ALLOWED_TAGS.has(rawTag) ? rawTag : "p";

            let foundIdx = -1;
            for (let i = stack.length - 1; i >= 1; i--) {
                if (stack[i].tag === tag) {
                    foundIdx = i;
                    break;
                }
            }

            if (foundIdx !== -1) {
                while (stack.length > foundIdx) {
                    const finished = stack.pop()!;
                    const parent = stack[stack.length - 1];

                    const jsonNode: JSONNode = {
                        type: finished.tag,
                        classes: TAG_CLASSES[finished.tag] ? [TAG_CLASSES[finished.tag]] : [],
                        children: finished.children.length > 0 ? finished.children : undefined,
                    };

                    if (finished.tag === "a" && finished.attrs?.href) {
                        jsonNode.href = finished.attrs.href;
                    }
                    if (finished.tag === "video" && (finished.attrs?.src || finished.attrs?.poster)) {
                        jsonNode.src = finished.attrs.src || finished.attrs.poster;
                        jsonNode.autoplay = "autoplay" in (finished.attrs || {});
                        jsonNode.loop = "loop" in (finished.attrs || {});
                        jsonNode.muted = "muted" in (finished.attrs || {});
                    }

                    // Only append if it has content, children, or is a visual
                    const hasValidChildren = jsonNode.children && jsonNode.children.length > 0;
                    const isMedia = jsonNode.type === "img" || jsonNode.type === "video";
                    if (hasValidChildren || isMedia) {
                        parent.children.push(jsonNode);
                    }
                }
            }
        }
    }

    // Collapse any unclosed tags into the root
    while (stack.length > 1) {
        const unclosed = stack.pop()!;
        const parent = stack[stack.length - 1];
        if (unclosed.children.length > 0) {
            parent.children.push({
                type: unclosed.tag,
                classes: TAG_CLASSES[unclosed.tag] ? [TAG_CLASSES[unclosed.tag]] : [],
                children: unclosed.children,
            });
        }
    }

    const rootChildren = stack[0].children;

    // Filter out top-level whitespace-only texts to keep AST clean
    const cleanedChildren = rootChildren.filter((node) => {
        if (node.type === "text") {
            return (node.content ?? "").trim().length > 0;
        }
        return true;
    });

    return {
        type: "root",
        children: cleanedChildren.length > 0 ? cleanedChildren : [{
            type: "p",
            classes: TAG_CLASSES.p ? [TAG_CLASSES.p] : [],
            children: [{ type: "text", content: "" }]
        }],
    };
}
