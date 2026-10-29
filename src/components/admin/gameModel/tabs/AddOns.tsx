"use client";

import { BRAND, BRAND_LIGHT, uid } from "@/lib/utils";
import { Field, Input, TabSection, SingleImageInput, Select } from "../utils";
import type { AdditionalContent} from "@/types/game";
import type {  FieldErrors } from "react-hook-form";
import type { GameData } from "@/lib/game";


interface AddonItemProps {
	item: AdditionalContent;
	index: number;
	label: string;
	onChange: (updated: AdditionalContent) => void;
	onRemove: () => void;
	errors : FieldErrors<AdditionalContent> | undefined
}

function AddonItem({ item, index, label, onChange, onRemove, errors }: AddonItemProps) {
    const isWide = item.image?.size === "wide";
	const isSqr = item.image?.size === "sqr";
    const currentSize = item.image?.size || "def";

    // Handles typing/pasting into the shared URL input
    const handleSharedUrl = (url: string) => {
        if (!url && !item.image?.file) {
            onChange({ ...item, image: { type : "image", url: "", id: "", size: currentSize } });
        } else {
            onChange({ ...item, image: { ...item.image, url: url, id: `img_${Date.now()}`, size: currentSize } });
        }
    };

    // Handles changing the size via dropdown
    const handleSizeChange = (v: string) => {
        const newSize = v as "def" | "sqr" | "wide";
        onChange({ ...item, image: { ...item.image, size: newSize } });
    };

    return (
        <div
            className="p-5 flex flex-col gap-5"
            style={{ border: `1px solid ${BRAND}20`,background: `${BRAND}05` }}
        >
            <div className="flex items-center justify-between">
                <span
                    className="font-jost text-[9px] tracking-[0.14em] uppercase"
                    style={{ color: `${BRAND_LIGHT}60` }}
                >
                    {label} #{index + 1}
                </span>
                <button
                    type="button"
                    onClick={onRemove}
                    className="w-6 h-6 flex items-center justify-center border transition-colors duration-150 hover:border-red-900/40"
                    style={{ borderColor: `${BRAND}25`, color: "rgba(255,255,255,0.22)" }}
                >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
                    </svg>
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Field label="Title" error={errors?.title?.message}>
                    <Input
                        value={item.title}
                        onChange={(v) => onChange({ ...item, title: v })}
                        placeholder="e.g. Season Pass"
                    />
                </Field>
                <Field label="Type">
                    <Input
                        value={item.type ?? ""}
                        onChange={(v) => onChange({ ...item, type: v })}
                        placeholder="e.g. DLC, Bonus"
                    />
                    {errors?.type && <span className="text-red-500 text-xs">{errors.type.message}</span>}
                </Field>
            </div>

            {/* ── Visual Assets Section ── */}
            <div className="flex flex-col gap-3">
                <div className="flex gap-4 items-start">
                    <Field label="Cover Image">
                        <SingleImageInput
                            // Only show value here if size is NOT wide
                            value={(!isWide  && !isSqr ) ? item.image : null}
                            onChange={(f) => onChange({ 
                                ...item, 
                                image: f ? { ...f,type:"image", size: currentSize === 'sqr' ? 'sqr' : 'def' } : {type:"image", url: "", id: "" } 
                            })}
                            aspectHint={currentSize === 'sqr' ? "1 / 1" : "3 / 4"}
                            className="w-40.5 aspect-3/4"
                            hideUrlInput
                        />
                    </Field>

					<Field label="Square Cover">
                        <SingleImageInput
                            // Only show value here if size IS wide
                            value={isSqr ? item.image: null}
                            onChange={(f) => onChange({ 
                                ...item, 
                                image: f ? { ...f, type:"image", size: 'sqr' } : {type:"image", url: "", id: "" } 
                            })}
                            aspectHint="1 / 1"
                            className="w-54 aspect-square"
                            hideUrlInput
                        />
                    </Field>

                    {/* Wide/Landscape Dropzone */}
                    <Field label="Wide Cover">
                        <SingleImageInput
                            // Only show value here if size IS wide
                            value={isWide ? item.image: null}
                            onChange={(f) => onChange({ 
                                ...item, 
                                image: f ? { ...f, type:"image", size: 'wide' } : {type:"image", url: "", id: "" } 
                            })}
                            aspectHint="16 / 9"
                            className="w-96 aspect-video"
                            hideUrlInput
                        />
                    </Field>
                </div>

                <Field label="Image URL & Size Configuration" error={errors?.image?.url?.message || errors?.image?.file?.message}>
                    <div 
                        className="flex items-stretch transition-colors"
                    >
                        <Select 
                            value={currentSize}
                            onChange={handleSizeChange}
							options={[
								{value : "def" , label:"Default"},
								{value : "sqr" , label:"Square"},
								{value : "wide" , label:"Wide"},
							]}
							className="max-w-28"
                        >
                        </Select>
						<Input 
							value={item.image?.url || ""}
							onChange={handleSharedUrl}
							placeholder="Or enter image URL..."
						/>
                    </div>
                </Field>
            </div>
        </div>
    );
}

function AddRowBtn({ label, onClick }: { label: string; onClick: () => void }) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="flex items-center gap-2 px-3 py-2 font-jost text-[10px] tracking-[0.12em] uppercase border transition-all duration-150"
			style={{ borderColor: `${BRAND}28`, color: `${BRAND_LIGHT}55`, background: "transparent" }}
		>
			<svg width="10" height="10" viewBox="0 0 10 10" fill="none">
				<path d="M5 1V9M1 5H9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
			</svg>
			{label}
		</button>
	);
}

function newAddon(): AdditionalContent {
	return { id: `ac_${uid()}`, title: "", image : {type : "image", url :"" , id:""} , type:"DLC"};
}

interface AddonsTabProps {
	form: GameData;
	up: <K extends keyof GameData>(key: K, value: GameData[K]) => void;
	errors : FieldErrors<GameData>
}

export function AddonsTab({ form, up , errors }: AddonsTabProps) {
    console.log(errors)
	return (
		<>
			<TabSection title="DLCs" />

			<div className="col-span-full flex flex-col gap-3">
				{form.dlcs ? form.dlcs!.map((dlc, i) => (
					<AddonItem
						key={dlc.id}
						item={dlc}
						index={i}
						label="DLC"
						errors={errors.dlcs?.[i]}
						onChange={(updated) =>
							up("dlcs", form.dlcs!.map((d, j) => (j === i ? updated : d)))
						}
						onRemove={() => up("dlcs", form.dlcs!.filter((_, j) => j !== i))}
					/>
				)) : []}
				<AddRowBtn
					label="Add DLC"
					onClick={() => up("dlcs", [...form.dlcs ?? [], newAddon()])}
				/>
			</div>

			<TabSection title="Bonus Content" />

			<div className="col-span-full flex flex-col gap-3">
				{form.bonusContent ? form.bonusContent.map((bonus, i) => (
					<AddonItem
						key={bonus.id}
						item={bonus}
						index={i}
						label="Bonus"
						errors={errors.bonusContent?.[i]}
						onChange={(updated) =>
							up("bonusContent", form.bonusContent!.map((b, j) => (j === i ? updated : b)))
						}
						onRemove={() =>
							up("bonusContent", form.bonusContent!.filter((_, j) => j !== i))
						}
					/>
				)) : []}
				<AddRowBtn
					label="Add Bonus Content"
					onClick={() => up("bonusContent", [...form.bonusContent ?? [], newAddon()])}
				/>
			</div>
		</>
	);
}