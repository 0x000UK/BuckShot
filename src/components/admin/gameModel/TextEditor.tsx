"use client";

import type { JSONNode, JSONRoot } from "@/lib/game";
import { BRAND} from "@/lib/utils";
import {Braces, Edit2} from "lucide-react";
import { useRef, useCallback, useEffect, useState } from "react";

interface CustomEditorProps {
    value: JSONRoot | null | undefined;
    onChange: (json: JSONRoot) => void;
    placeholder?: string;
    onToggleJSON?: () => void;
    showJSON?: boolean;
}

// ─── Tag → Tailwind class map ─────────────────────────────────────────────────

const TAG_CLASSES: Record<string, string> = {
    h2: "text-2xl font-bold text-white mt-6 mb-3",
    h3: "text-lg font-semibold text-white mt-4 mb-2",
    p: "text-white/70 leading-relaxed my-2",
    ul: "list-disc list-outside text-white/70 my-2 space-y-1 ml-5",
    ol: "list-decimal list-outside text-white/70 my-2 space-y-1 ml-5",
    li: "leading-relaxed pl-1",
    blockquote: "border-l-4 pl-4 py-2 my-3 italic text-white/60 bg-[#7a6b4f]/10 border-[#7a6b4f]/60 rounded-r",
    strong: "font-bold text-white",
    em: "italic text-white/80",
    a: "underline text-amber-400 hover:text-white transition-colors cursor-pointer",
    img: "w-full my-3",
    video: "w-full my-3",
    span: "",
};

// Predefined colors
const PRESET_COLORS = [
    { name: "White", value: "#ffffff" },
    { name: "Amber", value: "#fbbf24" },
    { name: "Green", value: "#4ade80" },
    { name: "Blue", value: "#60a5fa" },
    { name: "Purple", value: "#c084fc" },
    { name: "Red", value: "#f87171" },
];

// ─── Active formatting state ──────────────────────────────────────────────────

interface FormatState {
    bold: boolean;
    italic: boolean;
    heading2: boolean;
    heading3: boolean;
    paragraph: boolean;
    bulletList: boolean;
    orderedList: boolean;
    blockquote: boolean;
    link: boolean;
    color: string | null;
}

const EMPTY_FORMAT: FormatState = {
    bold: false,
    italic: false,
    heading2: false,
    heading3: false,
    paragraph: false,
    bulletList: false,
    orderedList: false,
    blockquote: false,
    link: false,
    color: null,
};

function getClosestBlock(node: Node | null, boundary: HTMLElement): HTMLElement | null {
    let current = node;
    while (current && current !== boundary) {
        if (current.nodeType === Node.ELEMENT_NODE) {
            const tag = (current as HTMLElement).tagName.toLowerCase();
            if (['p', 'h2', 'h3', 'blockquote', 'li', 'ul', 'ol'].includes(tag)) {
                return current as HTMLElement;
            }
        }
        current = current.parentNode;
    }
    return null;
}

function detectFormatState(editorEl: HTMLElement | null): FormatState {
    if (!editorEl) return EMPTY_FORMAT;

    const state = { ...EMPTY_FORMAT };
    
    // Leverage native command states for accurate inline tracking even on empty lines
    state.bold = document.queryCommandState('bold');
    state.italic = document.queryCommandState('italic');

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return state;

    const anchorNode = sel.anchorNode;
    if (!anchorNode || !editorEl.contains(anchorNode)) return state;

    let node: Node | null = anchorNode.nodeType === Node.TEXT_NODE ? anchorNode.parentElement : anchorNode;

    // Detect structural blocks and colors
    while (node && node !== editorEl) {
        if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;
            const tag = el.tagName.toLowerCase();

            // Extract Tailwind color class
            const colorMatch = el.className.match(/text-\[([^\]]+)\]/);
            if (colorMatch) state.color = colorMatch[1];

            switch (tag) {
                case "h2": state.heading2 = true; break;
                case "h3": state.heading3 = true; break;
                case "p": state.paragraph = true; break;
                case "ul": state.bulletList = true; break;
                case "ol": state.orderedList = true; break;
                case "blockquote": state.blockquote = true; break;
                case "a": state.link = true; break;
            }
        }
        node = node.parentNode;
    }

    return state;
}

// ─── 1. DOM Utility ────────────────────────────────────────────────────────────

function domToJSON(node: ChildNode): JSONNode | null {
    if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent ?? "";
        if (text === "") return null;
        return { type: "text", content: text };
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return null;

    const el = node as HTMLElement;
    let tag = el.nodeName.toLowerCase();
    let extraClasses: string[] = [];

    // Intercept native browser font coloring wrappers
    if (tag === 'font') {
        const colorAttr = (el as HTMLFontElement).color;
        if (colorAttr) extraClasses.push(`text-[${colorAttr}]`);
        tag = 'span';
    }

    if (tag === 'b') tag = 'strong';
    if (tag === 'i') tag = 'em';
    if (tag === "br") return { type: "br" };


    const children: JSONNode[] = Array.from(el.childNodes)
        .map(domToJSON)
        .filter((n): n is JSONNode => n !== null);

    const jsonNode: JSONNode = {
        type: tag,
        classes: [...Array.from(el.classList).filter(Boolean), ...extraClasses],
        children,
    };

    if (tag === "img") jsonNode.src = (el as HTMLImageElement).getAttribute("src") ?? "";
    if (tag === "a") jsonNode.href = (el as HTMLAnchorElement).getAttribute("href") ?? "";
    if (tag === "video") {
        const vid = el as HTMLVideoElement;
        jsonNode.src = vid.getAttribute("src") ?? "";
        jsonNode.autoplay = vid.hasAttribute("autoplay");
        jsonNode.loop = vid.hasAttribute("loop");
        jsonNode.muted = vid.hasAttribute("muted");
        jsonNode.controls = vid.hasAttribute("controls");
        jsonNode.hoverPlay = vid.hasAttribute("data-hover-play");
        jsonNode.tapToggle = vid.hasAttribute("data-tap-toggle");
    }
    return jsonNode;
}

export function jsonToHTML(node: JSONNode): string {
    if (node.type === "text") return escapeHTML(node.content ?? "");
    if (node.type === "br") return "<br />";

    const tag = node.type;
    const canonicalClass = TAG_CLASSES[tag] ?? "";
    let cls = node.classes?.length ? node.classes.join(" ") : canonicalClass;

    // if (cls) {
    //     cls = cls
    //         .replace(/\//g, "/")      // Escapes text-white/70 to text-white\/70
    //         .replace(/\[/g, "[")      // Escapes text-[#60a5fa] to text-\[#60a5fa\]
    //         .replace(/\]/g, "]");
    // }

    const childrenHTML = (node.children ?? []).map(jsonToHTML).join("");

    switch (tag) {
        case "img":
            return `<img src="${escapeAttr(node.src ?? "")}" class="${cls}" />`;
        case "a":
            return `<a href="${escapeAttr(node.href ?? "#")}" class="${cls}">${childrenHTML || "link"}</a>`;
        case "video": {
            const attrs = ["playsinline"];
            if (node.autoplay) attrs.push("autoplay");
            if (node.loop) attrs.push("loop");
            if (node.muted) attrs.push("muted");
            if (node.controls) attrs.push("controls");
            
            // Add custom script bindings for portable viewer compatibility
            if (node.hoverPlay) {
                attrs.push('data-hover-play="true"');
                attrs.push('onmouseenter="this.play().catch(()=>{})"');
                attrs.push('onmouseleave="this.pause()"');
            }
            if (node.tapToggle && !node.controls) {
                attrs.push('data-tap-toggle="true"');
                attrs.push('onclick="this.paused ? this.play().catch(()=>{}) : this.pause()"');
            }
            
            return `<video src="${escapeAttr(node.src ?? "")}" class="${cls}" ${attrs.join(" ")}></video>`;
        }
        default:
            return `<${tag} class="${cls}">${childrenHTML}</${tag}>`;
    }
}

function escapeHTML(str: string): string {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttr(str: string): string {
    return str.replace(/"/g, "&quot;");
}

// ─── 2. Editor Utilities ──────────────────────────────────────────────────────
function insertHTMLBlock(html: string, editorEl: HTMLElement, savedRange?: Range | null): void {
    const sel = window.getSelection();
    const tpl = document.createElement("template");
    tpl.innerHTML = html;
    const frag = tpl.content;
    const firstChild = frag.firstElementChild;

    // Use saved range if it exists, otherwise fall back to current selection
    let range = savedRange;
    if (!range && sel && sel.rangeCount > 0 && editorEl.contains(sel.anchorNode)) {
        range = sel.getRangeAt(0);
    }

    if (range) {
        range.deleteContents();
        range.insertNode(frag);

        // Move cursor safely to the right side of the new image
        if (firstChild && sel) {
            const newRange = document.createRange();
            newRange.setStartAfter(firstChild);
            newRange.collapse(true);
            sel.removeAllRanges();
            sel.addRange(newRange);
        }
    } else {
        editorEl.appendChild(frag);
    }
    editorEl.focus();
}

function clearSelectionFormat(editorEl: HTMLElement): void {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;

    const range = sel.getRangeAt(0);
    if (!editorEl.contains(range.commonAncestorContainer)) return;

    const text = range.toString();
    range.deleteContents();
    const textNode = document.createTextNode(text);
    range.insertNode(textNode);

    const newRange = document.createRange();
    newRange.selectNodeContents(textNode);
    sel.removeAllRanges();
    sel.addRange(newRange);
}

// ─── 3. Component Modals ─────────────────────────────────────────────────────

function LinkModal({ isOpen, onClose, onSubmit, initialText = "" }: any) {
    const [url, setUrl] = useState("https://");
    const [text, setText] = useState(initialText);
    const urlInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setText(initialText);
            setUrl("https://");
            setTimeout(() => urlInputRef.current?.focus(), 50);
        }
    }, [isOpen, initialText]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.MouseEvent) => {
        e.preventDefault();
        if (url && url !== "https://") {
            onSubmit(url, text || url);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 w-full max-w-md mx-4 rounded-xl overflow-hidden shadow-2xl" style={{ background: "#151413", border: "1px solid rgba(122,107,79,0.2)" }}>
                <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "rgba(122,107,79,0.15)" }}>
                    <h3 className="text-white font-medium flex items-center gap-2">Insert Link</h3>
                    <button onClick={onClose} className="text-white/40 hover:text-white transition-colors"><CloseIcon /></button>
                </div>
                <div className="p-5 space-y-4">
                    <div>
                        <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Display Text</label>
                        <input type="text" value={text} onChange={(e) => setText(e.target.value)} className="w-full px-3 py-2.5 rounded-lg text-sm text-white bg-[#7a6b4f]/10 border border-[#7a6b4f]/30 outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">URL</label>
                        <input ref={urlInputRef} type="url" value={url} onChange={(e) => setUrl(e.target.value)} className="w-full px-3 py-2.5 rounded-lg text-sm text-white bg-[#7a6b4f]/10 border border-[#7a6b4f]/30 outline-none" />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg text-sm text-white/60 border border-[#7a6b4f]/30">Cancel</button>
                        <button type="button" onClick={handleSubmit} className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium" style={{ background: BRAND, color: "#0a0908" }}>Insert Link</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ImageModal({ isOpen, onClose, onSubmit }: any) {
    const [url, setUrl] = useState("");
    const urlInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setUrl("");
            setTimeout(() => urlInputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    const handleSubmit = (e: React.MouseEvent) => {
        e.preventDefault();
        onSubmit(url); 
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 w-full max-w-md mx-4 rounded-xl overflow-hidden shadow-2xl" style={{ background: "#151413", border: "1px solid rgba(122,107,79,0.2)" }}>
                <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "rgba(122,107,79,0.15)" }}>
                    <h3 className="text-white font-medium flex items-center gap-2">Insert Image</h3>
                    <button onClick={onClose} className="text-white/40 hover:text-white transition-colors"><CloseIcon /></button>
                </div>
                <div className="p-5 space-y-4">
                    <div>
                        <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Image URL</label>
                        <input ref={urlInputRef} type="url" value={url} onChange={(e) => setUrl(e.target.value)} className="w-full px-3 py-2.5 rounded-lg text-sm text-white bg-[#7a6b4f]/10 border border-[#7a6b4f]/30 outline-none" />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg text-sm text-white/60 border border-[#7a6b4f]/30">Cancel</button>
                        <button type="button" onClick={handleSubmit} className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium" style={{ background: BRAND, color: "#0a0908" }}>Insert Image</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function VideoModal({ isOpen, onClose, onSubmit }: any) {
    const [url, setUrl] = useState("");
    const [autoplay, setAutoplay] = useState(false);
    const [loop, setLoop] = useState(false);
    const [muted, setMuted] = useState(true);
    const [controls, setControls] = useState(true);
    const [hoverPlay, setHoverPlay] = useState(false);
    const [tapToggle, setTapToggle] = useState(false);
    
    const urlInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setUrl("");
            setAutoplay(false);
            setLoop(false);
            setMuted(true);
            setControls(true);
            setHoverPlay(false);
            setTapToggle(false);
            setTimeout(() => urlInputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    const handleSubmit = (e: React.MouseEvent) => {
        e.preventDefault();
        if (url) {
            onSubmit({ url, autoplay, loop, muted, controls, hoverPlay, tapToggle }); 
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 w-full max-w-md mx-4 rounded-xl overflow-hidden shadow-2xl" style={{ background: "#151413", border: "1px solid rgba(122,107,79,0.2)" }}>
                <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "rgba(122,107,79,0.15)" }}>
                    <h3 className="text-white font-medium flex items-center gap-2">Insert Video / Animation</h3>
                    <button onClick={onClose} className="text-white/40 hover:text-white transition-colors"><CloseIcon /></button>
                </div>
                <div className="p-5 space-y-4">
                    <div>
                        <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Video URL (.mp4, .webm)</label>
                        <input ref={urlInputRef} type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/animation.mp4" className="w-full px-3 py-2.5 rounded-lg text-sm text-white bg-[#7a6b4f]/10 border border-[#7a6b4f]/30 outline-none placeholder:text-white/20" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 pt-1">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input type="checkbox" checked={controls} onChange={(e) => {
                                setControls(e.target.checked);
                                if (e.target.checked) setTapToggle(false); // Can't tap-to-toggle if native seekbar captures ticks
                            }} className="rounded border-[#7a6b4f]/40 bg-transparent text-[#c4a97d]" />
                            <span className="text-xs text-white/70">Show Controls</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input type="checkbox" checked={autoplay} onChange={(e) => setAutoplay(e.target.checked)} className="rounded border-[#7a6b4f]/40 bg-transparent text-[#c4a97d]" />
                            <span className="text-xs text-white/70">Autoplay</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input type="checkbox" checked={loop} onChange={(e) => setLoop(e.target.checked)} className="rounded border-[#7a6b4f]/40 bg-transparent text-[#c4a97d]" />
                            <span className="text-xs text-white/70">Loop Video</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input type="checkbox" checked={muted} onChange={(e) => setMuted(e.target.checked)} className="rounded border-[#7a6b4f]/40 bg-transparent text-[#c4a97d]" />
                            <span className="text-xs text-white/70">Muted Audio</span>
                        </label>
                    </div>

                    <div className="border-t pt-3 space-y-2" style={{ borderColor: "rgba(122,107,79,0.1)" }}>
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input type="checkbox" checked={hoverPlay} onChange={(e) => setHoverPlay(e.target.checked)} className="rounded border-[#7a6b4f]/40 bg-transparent text-[#c4a97d]" />
                            <span className="text-xs text-white/70">Play only on Hover (Mouse Over)</span>
                        </label>

                        <label className={`flex items-center gap-2 select-none ${controls ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}>
                            <input type="checkbox" checked={tapToggle} disabled={controls} onChange={(e) => setTapToggle(e.target.checked)} className="rounded border-[#7a6b4f]/40 bg-transparent text-[#c4a97d] disabled:opacity-50" />
                            <span className="text-xs text-white/70">Tap / Click to Play or Pause</span>
                        </label>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg text-sm text-white/60 border border-[#7a6b4f]/30">Cancel</button>
                        <button type="button" onClick={handleSubmit} className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium" style={{ background: BRAND, color: "#0a0908" }}>Insert Video</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ColorPicker({ onSelect, currentColor, disabled }: any) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                disabled={disabled}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`px-2 py-1 text-xs tracking-wide transition-all whitespace-nowrap flex items-center gap-1.5 rounded border ${disabled ? 'opacity-25 cursor-not-allowed border-transparent text-white/20' : isOpen ? 'border-[#7a6b4f]/40 text-[#c4a97d]' : 'border-transparent text-white/40 hover:text-white hover:bg-white/5'}`}
                style={isOpen && !disabled ? { background: `${BRAND}25` } : {}}
            >
                <div className="w-3.5 h-3.5 rounded border border-white/20" style={{ background: currentColor || "#ffffff" }} />
                <span>Color</span>
            </button>
            {isOpen && !disabled && (
                <div className="absolute top-full left-0 mt-1 p-2 rounded-lg shadow-xl z-20" style={{ background: "#1a1918", border: "1px solid rgba(122,107,79,0.2)" }}>
                    <div className="flex gap-1.5">
                        {PRESET_COLORS.map((color) => (
                            <button
                                key={color.value}
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => { onSelect(color.value); setIsOpen(false); }}
                                className={`w-6 h-6 rounded transition-transform hover:scale-110 ${currentColor === color.value ? "ring-2 ring-white ring-offset-1 ring-offset-black" : ""}`}
                                style={{ background: color.value }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function CustomEditor({
    value,
    onChange,
    placeholder = "Write a game description…",
}: CustomEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const savedRangeRef = useRef<Range | null>(null);
    const isHydrated = useRef(false);
    const [formatState, setFormatState] = useState<FormatState>(EMPTY_FORMAT);
    const [isEmpty, setIsEmpty] = useState(true);
    const [linkModalOpen, setLinkModalOpen] = useState(false);
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [videoModalOpen, setVideoModalOpen] = useState(false);
    const [selectedText, setSelectedText] = useState("");
    const [showJSON , onToggleJSON] = useState(false)

    useEffect(() => {
        if (!editorRef.current || isHydrated.current) return;
        if (value?.children?.length) {
            editorRef.current.innerHTML = value.children.map(jsonToHTML).join("");
            setIsEmpty(false);
            isHydrated.current = true;
        }
    }, [value]);

    useEffect(() => {
        const editor = editorRef.current;
        if (!editor) return;

        const handleVideoClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;

            if (target && target.tagName.toLowerCase() === 'video') {
                const sel = window.getSelection();
                if (sel) {
                    const range = document.createRange();
                    range.selectNode(target); // Select the actual element wrapper node
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            }
        };

        editor.addEventListener("click", handleVideoClick);
        return () => editor.removeEventListener("click", handleVideoClick);
    }, [showJSON]);

    const handleInput = useCallback(() => {
        if (!editorRef.current) return;
        
        // Non-intrusively ensure custom classes are maintained on raw blocks
        const blocks = editorRef.current.querySelectorAll('p, h2, h3, ul, ol, li, blockquote, b, i');
        blocks.forEach(el => {
            const tag = el.tagName.toLowerCase();
            const targetClass = TAG_CLASSES[tag === 'b' ? 'strong' : tag === 'i' ? 'em' : tag];
            if (targetClass && el.className !== targetClass) el.className = targetClass;
        });

        const rootNodes = Array.from(editorRef.current.childNodes);
        onChange({ type: "root", children: rootNodes.map(domToJSON).filter(Boolean) as JSONNode[] });
        
        setFormatState(detectFormatState(editorRef.current));
        setIsEmpty((editorRef.current.textContent ?? "").trim() === "");
    }, [onChange]);

    const handleSelectionChange = useCallback(() => {
        setFormatState(detectFormatState(editorRef.current));
    }, []);

    useEffect(() => {
        document.addEventListener("selectionchange", handleSelectionChange);
        return () => document.removeEventListener("selectionchange", handleSelectionChange);
    }, [handleSelectionChange]);

    const executeCommand = (command: string, arg?: string) => {
        document.execCommand(command, false, arg);
        handleInput();
    };

    const toggleBlock = (tag: string) => {
        if (!editorRef.current) return;
        editorRef.current.focus();
        const sel = window.getSelection();
        const closestBlock = getClosestBlock(sel?.anchorNode || null, editorRef.current);
        const currentTag = closestBlock?.tagName.toLowerCase() || 'p';
        
        // If clicking H2 while in H2, revert to P
        const targetTag = currentTag === tag.toLowerCase() ? 'p' : tag;
        executeCommand('formatBlock', targetTag);
    };

    const bold = () => executeCommand('bold');
    const italic = () => executeCommand('italic');
    const heading2 = () => toggleBlock('H2');
    const heading3 = () => toggleBlock('H3');
    const paragraph = () => toggleBlock('P');
    const blockquote = () => toggleBlock('BLOCKQUOTE');
    const bulletList = () => executeCommand('insertUnorderedList');
    
    const openImageModal = () => {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
            savedRangeRef.current = sel.getRangeAt(0).cloneRange();
        } else {
            // Explicitly clear stale states if the cursor isn't active inside the editor
            savedRangeRef.current = null;
        }
        setImageModalOpen(true);
    };

    const handleImageSubmit = (url: string) => {
        // Pass the saved range into helper
        insertHTMLBlock(
            `<img src="${escapeAttr(url)}" class="${TAG_CLASSES.img}" />`, 
            editorRef.current!,
            savedRangeRef.current
        );
        handleInput();
        savedRangeRef.current = null;
    };

    const openLinkModal = () => {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
            savedRangeRef.current = sel.getRangeAt(0).cloneRange();
        } else {
            savedRangeRef.current = null;
        }
        setSelectedText(sel?.toString() || "");
        setLinkModalOpen(true);
    };
    
    const handleLinkSubmit = (url: string, text: string) => {
        const a = document.createElement("a");
        a.href = url;
        a.className = TAG_CLASSES.a;
        a.textContent = text;
        
        // Pass the explicitly saved range reference here
        insertHTMLBlock(a.outerHTML, editorRef.current!, savedRangeRef.current);
        handleInput();
        
        // Clear the range reference so it doesn't pollute subsequent operations
        savedRangeRef.current = null;
    };

    const openVideoModal = () => {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
            savedRangeRef.current = sel.getRangeAt(0).cloneRange();
        } else {
            savedRangeRef.current = null;
        }
        setVideoModalOpen(true);
    };

    // REPLACE your handleVideoSubmit handler with this configuration consumer
    const handleVideoSubmit = (config: {
        url: string;
        autoplay: boolean;
        loop: boolean;
        muted: boolean;
        controls: boolean;
        hoverPlay: boolean;
        tapToggle: boolean;
    }) => {
        const attrs = ["playsinline"];
        if (config.autoplay) attrs.push("autoplay");
        if (config.loop) attrs.push("loop");
        if (config.muted) attrs.push("muted");
        if (config.controls) attrs.push("controls");
        
        if (config.hoverPlay) {
            attrs.push('data-hover-play="true"');
            attrs.push('onmouseenter="this.play().catch(()=>{})"');
            attrs.push('onmouseleave="this.pause()"');
        }
        if (config.tapToggle && !config.controls) {
            attrs.push('data-tap-toggle="true"');
            attrs.push('onclick="this.paused ? this.play().catch(()=>{}) : this.pause()"');
        }

        insertHTMLBlock(
            `<video src="${escapeAttr(config.url)}" class="${TAG_CLASSES.video}" ${attrs.join(" ")}></video>`, 
            editorRef.current!,
            savedRangeRef.current
        );
        
        handleInput();
        savedRangeRef.current = null;
    };

    const handleColorSelect = (color: string) => {
        editorRef.current?.focus();
        document.execCommand('foreColor', false, color);
        handleInput();
    };

    const clearFormat = () => {
        clearSelectionFormat(editorRef.current!);
        handleInput();
    };

    return (
        <>
            <div className="flex flex-col border rounded-lg transition-colors focus-within:border-[#7a6b4f]/60" style={{ borderColor: "rgba(122,107,79,0.2)", background: "#0c0b0a" }}>
                {/* ── Toolbar ── */}
                <div className="sticky top-0 z-20 flex items-center flex-wrap gap-x-0.5 gap-y-1 px-3 py-2 border-b select-none bg-background" style={{ borderColor: "rgba(122,107,79,0.12)", background: "#211e19" }} onMouseDown={(e) => e.preventDefault()}>
                    <ToolBtn onClick={() => executeCommand('undo')} title="Undo" disabled={showJSON || !isHydrated.current}><UndoIcon /></ToolBtn>
                    <ToolBtn onClick={() => executeCommand('redo')} title="Redo" disabled={showJSON || !isHydrated.current}><RedoIcon /></ToolBtn>
                    <Divider />
                    <ToolBtn onClick={bold} title="Bold" label="B" active={formatState.bold} disabled={showJSON} className="font-bold" />
                    <ToolBtn onClick={italic} title="Italic" label="I" active={formatState.italic} disabled={showJSON} className="italic" />
                    <ToolBtn onClick={clearFormat} title="Clear formatting" label="Tx" disabled={showJSON} />
                    <Divider />
                    <ColorPicker onSelect={handleColorSelect} currentColor={formatState.color} disabled={showJSON} />
                    <Divider />
                    <ToolBtn onClick={heading2} label="H2" active={formatState.heading2} disabled={showJSON} />
                    <ToolBtn onClick={heading3} label="H3" active={formatState.heading3} disabled={showJSON} />
                    <ToolBtn onClick={paragraph} label="¶" active={formatState.paragraph} disabled={showJSON} />
                    <ToolBtn onClick={bulletList} active={formatState.bulletList} disabled={showJSON}><ListIcon /></ToolBtn>
                    <ToolBtn onClick={blockquote} label="❝" active={formatState.blockquote} disabled={showJSON} />
                    <Divider />
                    <ToolBtn onClick={openLinkModal} active={formatState.link} disabled={showJSON}><LinkIcon className="w-3.5 h-3.5" /><span>Link</span></ToolBtn>
                    <ToolBtn onClick={openImageModal} disabled={showJSON}><ImageIcon className="w-3.5 h-3.5" /><span>Image</span></ToolBtn>
                    <ToolBtn onClick={openVideoModal} disabled={showJSON}><VideoIcon className="w-3.5 h-3.5" /><span>Video</span></ToolBtn>
                    
                    <div className="flex-1" />

                    {/*JSON and Edit View Toggle */}
                    <div className="flex items-center rounded-none bg-black/40 border border-white/15">
                        <button
                            type="button"
                            onClick={()=>onToggleJSON(false)}
                            className={`p-1 rounded-none text-xs transition-colors ${!showJSON ? 'text-[#c4a97d]' : 'text-white/30 hover:text-white'}`}
                            style={!showJSON ? { background: `${BRAND}20` } : {}}
                            title="Visual Editor"
                        >
                            <Edit2 size={16}/>
                        </button>
                        <button
                            type="button"
                            onClick={() => onToggleJSON(true)}
                            className={`p-1 rounded-none text-xs transition-colors ${showJSON ? 'text-[#c4a97d]' : 'text-white/30 hover:text-white'}`}
                            style={showJSON ? { background: `${BRAND}20` } : {}}
                            title="View JSON Code"
                        >
                            <Braces size= {16}/>
                        </button>
                    </div>
                </div>

                {/* ── Canvas ── */}
                <div className="relative border-b" style={{ borderColor: "rgba(122,107,79,0.08)" }}>
                    {showJSON && (
                        <textarea
                            readOnly
                            value={JSON.stringify(value || { type: "root", children: [] }, null, 2)}
                            className="w-full p-4 min-h-70 font-mono text-xs text-amber-400/80 bg-[#050505] outline-none resize-none"
                            style={{ scrollbarWidth: "thin" }}
                        />
                    )}
                    <div
                        ref={editorRef}
                        contentEditable
                        onInput={handleInput}
                        onBlur={handleInput}
                        suppressContentEditableWarning
                        className={`p-4 min-h-70 outline-none text-white/70 text-sm leading-relaxed ${showJSON ? 'hidden' : 'block'}`}
                        style={{ scrollbarWidth: "thin" }}
                    />
                    {isEmpty && !showJSON && (
                        <div className="absolute top-4 left-4 text-sm pointer-events-none select-none" style={{ color: "rgba(122,107,79,0.35)" }}>
                            {placeholder}
                        </div>
                    )}
                </div>

                {/* ── Footer Control Strip ── */}
                <div className="flex items-center justify-between gap-2 px-3 py-1.5 text-xs select-none" style={{ background: "rgba(122,107,79,0.02)" }}>
                    <span className="text-[9px] uppercase tracking-[0.14em]" style={{ color: `${BRAND}90` }}>
                        Rich Text Format
                    </span>
                    <div>
                        <button
                            type="button"
                            onClick={() => {
                                if (editorRef.current) editorRef.current.innerHTML = "";
                                setIsEmpty(true);
                                setFormatState(EMPTY_FORMAT);
                                onChange({ type: "root", children: [] });
                            }}
                            className="px-2.5 py-1 rounded-none border border-[#f87171]/20 text-[#f87171]/60 hover:text-[#f87171] hover:bg-[#f87171]/5 transition-all font-medium"
                        >
                            Clear All
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                const sampleData: JSONRoot = {
                                    type: "root",
                                    children: [
                                        { type: "h2", classes: [], children: [{ type: "text", content: "Cyberpunk 2077: Phantom Liberty" }] },
                                        { type: "p", classes: [], children: [{ type: "text", content: "Phantom Liberty is an all-new spy-thriller expansion. Play as V, a cyber-enhanced gun-for-hire, and dive deep into a fractured gridlock of espionage and high-level power plays." }] }
                                    ]
                                };
                                if (editorRef.current) {
                                    editorRef.current.innerHTML = sampleData.children.map(jsonToHTML).join("");
                                    setIsEmpty(false);
                                }
                                onChange(sampleData);
                            }}
                            className="px-2.5 py-1 rounded-none border border-[#7a6b4f]/25 text-white/50 hover:text-white hover:bg-white/5 transition-all font-medium"
                        >
                            Load Sample
                        </button>
                    </div>
                </div>
            </div>

            <LinkModal isOpen={linkModalOpen} onClose={() => setLinkModalOpen(false)} onSubmit={handleLinkSubmit} initialText={selectedText} />
            <ImageModal isOpen={imageModalOpen} onClose={() => setImageModalOpen(false)} onSubmit={handleImageSubmit} />
            <VideoModal isOpen={videoModalOpen} onClose={() => setVideoModalOpen(false)} onSubmit={handleVideoSubmit} />
        </>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Divider() {
    return <div className="w-px h-4 mx-1" style={{ background: "rgba(255,255,255,0.08)" }} />;
}

function ToolBtn({ onClick, label, title, className = "", active = false, disabled = false, children }: any) {
    return (
        <button
            type="button"
            title={title}
            disabled={disabled}
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => { e.preventDefault(); if (!disabled) onClick(); }}
            className={`px-2 py-1 text-xs tracking-wide transition-all whitespace-nowrap flex items-center gap-1 rounded border ${disabled ? 'opacity-25 cursor-not-allowed border-transparent text-white/20' : active ? 'border-[#7a6b4f]/40 text-[#c4a97d]' : 'border-transparent text-white/40 hover:text-white hover:bg-white/5'} ${className}`}
            style={active && !disabled ? { background: `${BRAND}25` } : {}}
        >
            {children ?? label}
        </button>
    );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
// ADD this icon at the very bottom of the file:
//function PenIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>; }
function UndoIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" /></svg>; }
function RedoIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6" /><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" /></svg>; }
function ListIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>; }
function LinkIcon({ className = "w-4 h-4" }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>; }
function ImageIcon({ className = "w-4 h-4" }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>; }
function CodeIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>; }
function CloseIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>; }
function VideoIcon({ className = "w-4 h-4" }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>; }