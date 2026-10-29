
import { BRAND, BRAND_LIGHT, cn, uid } from "@/lib/utils";
import { MediaType, type MediaItem} from "@/types/game";
import { useCallback, useEffect, useRef, useState } from "react";

import { getVideoMediaDetails } from "@/lib/videoUtils";

const inputCls = "w-full bg-transparent font-jost text-[13px] text-white/70 outline-none px-3 py-2 border border-[#7a6b4f]/30 transition-all duration-200 placeholder:text-white/10 focus:border-[#c4a97d]/60 focus:bg-[#7a6b4f]/[0.03]";

interface TitledListItem {
    title: string;
    value: string;
}

interface TitledStringListEditorProps {
    values: TitledListItem[];
    onChange: (v: TitledListItem[]) => void;
    placeholder?: string;
    titlePlaceholder?: string;
    label?: string;
}

export function TitledStringListEditor({
    values,
    onChange,
    placeholder = "Enter value...",
    titlePlaceholder = "Title...",
    label,
}: TitledStringListEditorProps) {
    const [draftTitle, setDraftTitle] = useState("");
    const [draftValue, setDraftValue] = useState("");

    const add = () => {
        const t = draftTitle.trim();
        const v = draftValue.trim();
        
        // Prevent empty values or exact duplicates
        if (!v || !t) return;
        if (values.some((item) => item.title === t && item.value === v)) return;

        onChange([...values, { title: t, value: v }]);
        setDraftTitle("");
        setDraftValue("");
    };

    return (
        <div className="flex flex-col gap-2">
            {label && (
                <span className="font-jost text-[10px] tracking-[0.14em] uppercase opacity-60">
                    {label}
                </span>
            )}

            <div className="flex gap-2">
                <input
                    className={cn(inputCls, "flex-1")}
                    style={{ caretColor: BRAND_LIGHT, borderColor: `${BRAND}40`, color: BRAND_LIGHT }}
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    placeholder={titlePlaceholder}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            add();
                        }
                    }}
                />
                <input
                    className={cn(inputCls, "flex-2")} // slightly wider if layout permits
                    style={{ caretColor: BRAND_LIGHT, borderColor: `${BRAND}40`, color: BRAND_LIGHT }}
                    value={draftValue}
                    onChange={(e) => setDraftValue(e.target.value)}
                    placeholder={placeholder}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            add();
                        }
                    }}
                />
                <button
                    type="button"
                    onClick={add}
                    className="px-3 py-1.5 font-jost text-[10px] tracking-[0.12em] uppercase border transition-all duration-150 shrink-0"
                    style={{ borderColor: `${BRAND}40`, color: `${BRAND_LIGHT}70`, background: `${BRAND}10` }}
                >
                    Add
                </button>
            </div>

            {values.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {values.map((item, i) => (
                        <span
                            key={i}
                            className="flex items-center gap-1.5 px-2.5 py-1 font-jost text-[11px]"
                            style={{ border: `1px solid ${BRAND}30`, color: "rgba(255,255,255,0.7)" }}
                        >
                            <strong style={{ color: BRAND_LIGHT }} className="font-semibold mr-0.5">
                                {item.title}:
                            </strong>
                            <span>{item.value}</span>
                            
                            <button
                                type="button"
                                onClick={() => onChange(values.filter((_, j) => j !== i))}
                                style={{ color: `${BRAND_LIGHT}55` }}
                                className="hover:text-white transition-colors ml-1"
                            >
                                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                                    <path d="M1 1L7 7M7 1L1 7" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
                                </svg>
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

export function StringListEditor({
	values, onChange, placeholder, label,
}: {
	values: string[]; onChange: (v: string[]) => void; placeholder?: string; label?: string;
}) {
	const [draft, setDraft] = useState("");

	const add = () => {
		const v = draft.trim();
		if (!v || values.includes(v)) return;
		onChange([...values, v]);
		setDraft("");
	};

	return (
		<div className="flex flex-col gap-2">
			<div className="flex gap-2">
				<input
					className={cn(inputCls, "flex-1")}
					style={{ caretColor: BRAND_LIGHT }}
					value={draft}
					onChange={(e) => setDraft(e.target.value)}
					placeholder={placeholder}
					onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
				/>
				<button
					type="button"
					onClick={add}
					className="px-3 py-1.5 font-jost text-[10px] tracking-[0.12em] uppercase border transition-all duration-150"
					style={{ borderColor: `${BRAND}40`, color: `${BRAND_LIGHT}70`, background: `${BRAND}10` }}
				>
					Add
				</button>
			</div>
			{values.length > 0 && (
				<div className="flex flex-wrap gap-1.5">
					{values.map((v, i) => (
						<span
							key={i}
							className="flex items-center gap-1.5 px-2.5 py-1 font-jost text-[11px]"
							style={{ border: `1px solid ${BRAND}30`, color: "rgba(255,255,255,0.5)" }}
						>
							{v}
							<button
								type="button"
								onClick={() => onChange(values.filter((_, j) => j !== i))}
								style={{ color: `${BRAND_LIGHT}55` }}
							>
								<svg width="8" height="8" viewBox="0 0 8 8" fill="none">
									<path d="M1 1L7 7M7 1L1 7" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
								</svg>
							</button>
						</span>
					))}
				</div>
			)}
		</div>
	);
}

export function TabSection({ title }: { title: string }) {
	return (
		<div className="col-span-full flex items-center gap-3 mt-2 mb-0.5">
			<div className="w-0.5 h-3.5 shrink-0" style={{ background: `linear-gradient(180deg,${BRAND_LIGHT},${BRAND})` }} />
			<span className="font-jost text-[9px] tracking-[0.18em] uppercase" style={{ color: `${BRAND_LIGHT}65` }}>
				{title}
			</span>
			<div className="flex-1 h-px" style={{ background: `${BRAND}22` }} />
		</div>
	);
}

export function TogglePills<T extends string>({
	options, selected, onToggle,
}: {
	options: { value: T; label: string }[];
	selected: T[];
	onToggle: (id: T) => void;
}) {
	return (
		<div className="flex flex-wrap gap-1.5">
			{options.map((o , i) => {
				const on = selected.includes(o.value);
				return (
					<button
						key={o.value??o.label}
						type="button"
						onClick={() => onToggle(o.value)}
						className="px-2.5 py-1 font-jost text-[9px] tracking-widest uppercase border transition-all duration-150"
						style={{
							borderColor: on ? `${BRAND_LIGHT}55` : `${BRAND}28`,
							color: on ? BRAND_LIGHT : "rgba(255,255,255,0.3)",
							background: on ? `${BRAND}18` : "transparent",
						}}
					>
						{o.label}
					</button>
				);
			})}
		</div>
	);
}

export function Field({
	label, children, fullWidth, hint, className , error
}: {
	label: string; children: React.ReactNode; fullWidth?: boolean; hint?: string; className? :string; error? : string
}) {
	return (
		<div className={cn("flex flex-col gap-1.5", fullWidth && "col-span-full", className)}>
			<div className="flex items-baseline justify-between">
				<label className="font-jost text-[12px] tracking-[0.14em] uppercase" style={{ color: `${BRAND}` }}>
					{label}
				</label>
				{hint && <span className="font-jost text-[10px]" style={{ color: `${BRAND}55` }}>{hint}</span>}
			</div>
			{children}
            {error && (
                <span className="text-red-500 text-xs">{error}</span>
            )}
		</div>

	);
}

export function Input<T extends string | number>({
    value,
    onChange,
    placeholder,
    type = "text",
    className,
    bgColor,
}: {
    value: T;
    onChange: (v: T) => void;
    placeholder?: string;
    type?: string;
    className?: string;
    bgColor?: string;
}) {
    return (
        <input
            type={type}
            className={cn(inputCls, className)}
            style={{ caretColor: BRAND_LIGHT, backgroundColor: bgColor }}
            value={value || ""}
            onChange={(e) => {
                const val = e.target.value;
                if (type === "number") {
                    onChange((val === "" ? 0 : parseFloat(val)) as T);
                } else {
                    onChange(val as T);
                }
            }}
            placeholder={placeholder}
            step={type === "number" ? "any" : undefined}
        />
    );
}

export function TextArea({ value, onChange, placeholder, className, rows = 4,}: {
	value: string; 
    onChange: (v: string) => void; 
    placeholder?: string;
    className?:string
    rows?: number;
}) {
	return (
		<textarea
			className={cn(inputCls, "resize-none",className)}
			style={{ caretColor: BRAND_LIGHT }}
			value={value}
			onChange={(e) => onChange(e.target.value)}
			placeholder={placeholder}
			rows={rows}
		/>
	);
}

export function Select({
    value,
    onChange,
    options,
    placeholder = "Select...",
    className,
}: {
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
    placeholder?: string;
    className?: string;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find((o) => o.value === value);

    return (
        <div ref={wrapperRef} className={cn("relative w-full", className)}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    inputCls,
                    "flex items-center justify-between text-left",
                    isOpen && "border-b-transparent focus:border-b-transparent transition-none"
                )}
            >
                <span className={cn(!selectedOption && "text-white/30")}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>

                <svg
                    width="10"
                    height="6"
                    viewBox="0 0 10 6"
                    fill="none"
                    className={cn("transition-transform duration-200", isOpen && "rotate-180")}
                >
                    <path
                        d="M1 1L5 5L9 1"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ color: `${BRAND_LIGHT}70` }}
                    />
                </svg>
            </button>

            {isOpen && (
                <div
                    className="absolute left-0 right-0 top-full z-20 flex flex-col border border-t-0 shadow-xl max-h-48 overflow-y-auto"
                    style={{
                        borderColor: `${BRAND_LIGHT}99`,
                        backgroundColor: "#0a0908",
                    }}
                >
                    {options.map((opt) => {
                        const isSelected = opt.value === value;
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                    onChange(opt.value);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "text-left px-3 py-2 text-[13px] font-jost transition-colors flex items-center justify-between",
                                    "hover:bg-[#c4a97d]/10 hover:text-[#e6d7c3]",
                                    isSelected ? "bg-[#c4a97d]/15 text-[#e6d7c3]" : "text-white/70"
                                )}
                                style={{ borderBottom: `1px solid ${BRAND}15` }}
                            >
                                {opt.label}

                                {isSelected && (
                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                        <path
                                            d="M1 4L3.5 6.5L9 1"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export function DropDownSelector<T extends string | number , V extends {value : T, label : string}>({
    values,
    onChange,
    options,
    placeholder,
}: {
    values: T[];
    onChange: (v: T[]) => void;
    options: V[];
    placeholder?: string;
}) {

    console.log(values)
    console.log(options)
    const [draft, setDraft] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Helper to check if an option is already selected
    const isSelected = (opt: V) => {
        return values.some((v) => (v === opt.value));
    };

    // Filter out already selected values, then match against user input
    const filteredOptions = options.filter(
        (opt) =>
            opt.label.toLowerCase().includes(draft.toLowerCase()) &&
            !isSelected(opt)
    );

    const showSuggestions = isFocused && filteredOptions.length > 0;

    const add = (val: V) => {
        if (!isSelected(val)) {
            onChange([...values, val.value]);
        }
        setDraft("");
        setIsFocused(true);
        
        //input regains DOM focus after the React render cycle
        setTimeout(() => {
            const inputElem = wrapperRef.current?.querySelector("input");
            if (inputElem) inputElem.focus();
        }, 0);
    };

    const remove = (indexToRemove: number) => {
        onChange(values.filter((_, i) => i !== indexToRemove));
    };

    // Handle clicking outside to close suggestions if focus is lost
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="flex flex-col gap-2">
            <div ref={wrapperRef} className="relative z-20">
                <input
                    className={cn(
                        inputCls,
                        showSuggestions && "border-b-transparent focus:border-b-transparent transition-none"
                    )}
                    style={{ caretColor: BRAND_LIGHT }}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    placeholder={placeholder}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            if (showSuggestions && filteredOptions.length > 0) {
                                add(filteredOptions[0]);
                            }
                        }
                    }}
                />

                {showSuggestions && (
                    <div
                        className="absolute left-0 right-0 top-full flex flex-col border border-t-0 shadow-xl max-h-48 overflow-y-auto"
                        style={{
                            borderColor: `${BRAND_LIGHT}99`,
                            backgroundColor: "#0a0908",
                        }}
                    >
                        {filteredOptions.map((opt , i) => (
                            <button
                                // Fallback to name if id is undefined
                                key={opt.value} 
                                type="button"
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    add(opt);
                                }}
                                className="text-left px-3 py-2 font-jost text-[13px] text-white/70 transition-colors"
                                style={{ borderBottom: `1px solid ${BRAND}15` }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = `${BRAND}15`;
                                    e.currentTarget.style.color = BRAND_LIGHT;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = "transparent";
                                    e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                                }}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {values.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {values.map((v, i) => (
                        <span
                            key={v}
                            className="flex items-center gap-1.5 px-2.5 py-1 font-jost text-[11px]"
                            style={{ border: `1px solid ${BRAND}30`, color: "rgba(255,255,255,0.5)" }}
                        >
                            {options.find(opt=>opt.value == v)?.label}
                            <button
                                type="button"
                                onClick={() => remove(i)}
                                style={{ color: `${BRAND_LIGHT}55` }}
                            >
                                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                                    <path d="M1 1L7 7M7 1L1 7" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
                                </svg>
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

function fileToImageFile(file: File , title? : string): any {
    return {
        id: `img_${uid()}`,
        type : "image",
        file,
        url: URL.createObjectURL(file),
        title : title || file.name
    };
}

function isImage(file: File) {
    return file.type.startsWith("image/");
}

function useDrag() {
    const [isDragging, setIsDragging] = useState(false);

    const handlers = {
        onDragOver: (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); },
        onDragLeave: () => setIsDragging(false),
        onDrop: (e: React.DragEvent, onFiles: (files: File[]) => void) => {
            e.preventDefault();
            setIsDragging(false);
            const files = Array.from(e.dataTransfer.files).filter(isImage);
            if (files.length) onFiles(files);
        },
    };

    return { isDragging, handlers };
}

function CloseIcon({ size = 10 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 10 10" fill="none">
            <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
        </svg>
    );
}

interface SingleImageInputProps {
    value: MediaItem | null | undefined;
    title? : string
    onChange: (img: MediaItem | null) => void;
    aspectHint?: string;
    height?: number;
    className ? : string
    hideUrlInput?: boolean;
}

interface MultiMediaInputProps {
    label?: string;
    value: MediaItem[];
    onChange: (media: MediaItem[]) => void;
    max?: number;
}

export function SingleImageInput({
    value,
    title,
    onChange,
    aspectHint = "16 / 9",
    height = undefined,
    className,
    hideUrlInput = false
}: SingleImageInputProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const { isDragging, handlers } = useDrag();

    const handleFiles = useCallback(
        (files: File[]) => {
            const first = files[0];
            if (!first) return;
            if (value?.url && value?.file) URL.revokeObjectURL(value.url);
            onChange(fileToImageFile(first,title));
        },
        [value, onChange]
    );

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []).filter(isImage);
        if (files.length) handleFiles(files);
        e.target.value = "";
    };

    const handleUrlInput = (newUrl : string) => {
        if (!newUrl && !value?.file) {
            onChange({type : "image", url: "" , id:""});
        } else {
            onChange({ ...value,type : "image", url: newUrl , id : `img_${uid()}` });
        }
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (value?.url && value?.file) URL.revokeObjectURL(value.url);
        onChange(null);
    };

    return (
        <div className="flex flex-col gap-2">
            {/* Drop Zone */}
            <div
                onClick={() => inputRef.current?.click()}
                onDragOver={handlers.onDragOver}
                onDragLeave={handlers.onDragLeave}
                onDrop={(e) => handlers.onDrop(e, handleFiles)}
                className={cn("relative overflow-hidden cursor-pointer select-none transition-all duration-200", className)}
                style={{
                    height: height ?? "auto",
                    border: `1px solid ${isDragging ? `${BRAND_LIGHT}60` : value?.url ? `${BRAND}40` : `${BRAND}28`}`,
                    background: isDragging ? `${BRAND}10` : value?.url ? "transparent" : `${BRAND}05`,
                }}
            >
                {(value?.file || value?.url) ? (
                    <>
                        <img
                            src={value.url}
                            alt="preview"
                            className="w-full h-full object-contain"
                        />
                        <div
                            className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200"
                            style={{ background: "rgba(8,8,8,0.65)" }}
                        >
                            <span className="font-jost text-[10px] tracking-[0.16em] uppercase" style={{ color: BRAND_LIGHT }}>
                                Replace image
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center transition-all duration-150 z-10"
                            style={{ background: "rgba(8,8,8,0.8)", border: `1px solid ${BRAND}40`, color: `${BRAND_LIGHT}80` }}
                        >
                            <CloseIcon />
                        </button>
                        {value.file?.name && (
                            <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5" style={{ background: "rgba(8,8,8,0.75)" }}>
                                <p className="font-jost text-[11px] truncate" style={{ color: `${BRAND_LIGHT}70` }}>
                                    {value.file.name}
                                </p>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-2.5 px-4 absolute inset-0">
                        <div style={{ color: isDragging ? BRAND_LIGHT : `${BRAND_LIGHT}50` }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                        </div>
                        <div className="text-center">
                            <p className="font-jost text-[12px]" style={{ color: isDragging ? `${BRAND_LIGHT}90` : `rgba(255,255,255,0.25)` }}>
                                Drop image or <span style={{ color: isDragging ? BRAND_LIGHT : `${BRAND_LIGHT}60` }}>click to browse</span>
                            </p>
                            <p className="font-jost text-[10px] tracking-wide mt-0.5" style={{ color: `rgba(255,255,255,0.15)` }}>
                                PNG, JPG, WEBP · Ratio hint: {aspectHint}
                            </p>
                        </div>
                    </div>
                )}
                {isDragging && (
                    <div className="absolute inset-0 pointer-events-none" style={{ border: `1px solid ${BRAND_LIGHT}50` }} />
                )}
            </div>

            {/* URL Input Box */}
            {!hideUrlInput && (
                <Input 
                    value={value?.url || ""}
                    onChange={handleUrlInput}
                    placeholder="Or enter image URL..."
                />
            )}

            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
        </div>
    );
}

export function MultiMediaInput({
    label,
    value,
    onChange,
    max = 25,
}: MultiMediaInputProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [newUrl, setNewUrl] = useState("");
    const [newTitle, setNewTitle] = useState("");
    const [type, setType] = useState<MediaType>("image");

    const addFiles = useCallback(
        (files: File[]) => {
            const remaining = max - value.length;
            const toAdd = files.slice(0, remaining).map((file) => fileToImageFile(file));
            onChange([...value, ...toAdd]);
        },
        [value, onChange, max]
    );

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []).filter(isImage);
        if (files.length) addFiles(files);
        e.target.value = "";
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isDragging) setIsDragging(true);
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
        const files = Array.from(e.dataTransfer.files).filter(isImage);
        if (files.length) addFiles(files);
    };

    const handleAddUrl = () => {
        if (!newUrl.trim()) return;
        onChange([
            ...value,
            {
                type,
                id: `scs_${uid()}`,
                url: newUrl.trim(),
                title: newTitle.trim() || undefined,
            },
        ]);
        setNewUrl("");
        setNewTitle("");
    };

    const handleRemove = (id: string) => {
        const item = value.find((i) => i.id === id);
        if (item?.file) URL.revokeObjectURL(item.url || "");
        onChange(value.filter((i) => i.id !== id));
    };

    const canAdd = value.length < max;

    return (
        <div className="flex flex-col gap-1.5">
            {label && (
                <div className="flex items-center justify-between">
                    <span className="font-jost text-[10px] tracking-[0.14em] uppercase text-white/90">
                        {label}
                    </span>
                    <span className="font-jost text-[9px]" style={{ color: `${BRAND}60` }}>
                        {value.length}/{max}
                    </span>
                </div>
            )}

            {/* Thumbnails grid */}
            {value.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-1">
                    {value.map((img, idx) => {
                        const mediaDetails = getVideoMediaDetails(img.url);
                        const isVideo = img.type === "video" || mediaDetails.isYouTube || mediaDetails.isDirectVideo;
                        const displayThumb = mediaDetails.isYouTube ? mediaDetails.thumbnailUrl : img.url;

                        return (
                            <div
                                key={img.id}
                                className="relative group overflow-hidden border"
                                style={{ aspectRatio: "16/9", borderColor: `${BRAND}28` }}
                            >
                                <img
                                    src={displayThumb}
                                    alt={img.title || `media item ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                />
                                
                                {/* Index / Type Badge */}
                                <div
                                    className="absolute top-1 left-1 px-1 h-4 flex items-center gap-1 justify-center font-jost text-[8px] uppercase tracking-wider"
                                    style={{ background: "rgba(8,8,8,0.75)", color: `${BRAND_LIGHT}70` }}
                                >
                                    <span>{idx + 1}</span>
                                    {isVideo && <span className="text-[7px] text-[#c4a97d]">VID</span>}
                                </div>

                            <button
                                type="button"
                                onClick={() => handleRemove(img.id)}
                                className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                                style={{
                                    background: "rgba(8,8,8,0.85)",
                                    border: `1px solid ${BRAND}35`,
                                    color: `${BRAND_LIGHT}70`,
                                }}
                            >
                                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>

                            {(img.title || img.file?.name) && (
                                <div
                                    className="absolute bottom-0 left-0 right-0 px-1.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                                    style={{ background: "rgba(8,8,8,0.8)" }}
                                >
                                    <p className="font-jost text-[8px] truncate" style={{ color: `${BRAND_LIGHT}60` }}>
                                        {img.title || img.file?.name}
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                    })}
                </div>
            )}

            {/* Drop zone */}
            {canAdd && (
                <div
                    onClick={() => inputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className="flex items-center justify-center gap-3 py-3.5 cursor-pointer transition-all duration-200"
                    style={{
                        border: `1px dashed ${isDragging ? `${BRAND_LIGHT}80` : `${BRAND}60`}`,
                        background: isDragging ? `${BRAND}15` : "transparent",
                    }}
                >
                    <div style={{ color: isDragging ? BRAND_LIGHT : `${BRAND_LIGHT}60` }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                        </svg>
                    </div>
                    <span
                        className="font-jost text-[11px]"
                        style={{ color: isDragging ? `${BRAND_LIGHT}85` : "rgba(255,255,255,0.22)" }}
                    >
                        {value.length === 0 ? "Drop screenshots or click to browse" : `Add more · ${max - value.length} remaining`}
                    </span>
                </div>
            )}

            {/* Custom URL Adder */}
            <div className="flex gap-2 mt-2">
                <Select
                    className="w-28"
                    value={type}
                    options={[
                        { value: "image", label: "Image" },
                        { value: "video", label: "Video" },
                    ]}
                    onChange={(v) => setType(v as MediaType)}
                />
                <Input
                    type="text"
                    value={newTitle}
                    onChange={setNewTitle}
                    placeholder="Title (optional)"
                    className="flex-1 px-3 py-1.5 text-sm"
                />
                <Input
                    type="text"
                    value={newUrl}
                    onChange={setNewUrl}
                    placeholder="Enter media URL..."
                    className="flex-1 px-3 py-1.5 text-sm"
                />
                <button
                    type="button"
                    onClick={handleAddUrl}
                    className="w-max px-3 py-1.5 font-jost text-[10px] tracking-[0.12em] uppercase border transition-all duration-150 hover:bg-[#c4a97d]/20"
                    style={{ borderColor: `${BRAND}40`, color: `${BRAND_LIGHT}70`, background: `${BRAND}10` }}
                >
                    Add URL
                </button>
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileInput}
            />
        </div>
    );
}