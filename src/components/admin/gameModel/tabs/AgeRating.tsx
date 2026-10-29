"use client";

import { BRAND, BRAND_LIGHT } from "@/lib/utils";
import { Field, Input, Select } from "../utils";
import type { AgeRating, ContentDescriptor} from "@/types/game";
import type { GameData } from "@/lib/game";

const AGE_RATINGS: AgeRating[] = [
	"E", "T", "M", "AO", "PEGI 3", "PEGI 7", "PEGI 12", "PEGI 16", "PEGI 18",
	"IARC 3", "IARC 7", "IARC 12", "IARC 16", "IARC 18", "Unrated",
];

const ALL_DESCRIPTORS: ContentDescriptor[] = [
	"Blood and Gore", "Intense Violence", "Strong Language", "Sexual Themes",
	"Nudity", "Use of Drugs", "In-Game Purchases",
];

interface RatingTabProps {
	form: GameData;
	up: <K extends keyof GameData>(key: K, value: GameData[K]) => void;
	toggleArrayItem: <T>(key: keyof GameData, item: T) => void;
	errors : any
}

export function RatingTab({ form, up, toggleArrayItem , errors}: RatingTabProps) {
	return (
		<>
			<Field label="Age Rating">
				<Select
					value={form.ageRating}
					onChange={(v) => up("ageRating", v as AgeRating)}
					options={[
						{ value: "", label: "— Select rating —" },
						...AGE_RATINGS.map((r) => ({ value: r, label: r })),
					]}
				/>
				{errors.ageRating && (
                   <span className="text-red-500 text-xs">{errors.ageRating.message}</span>
                )}
			</Field>

			<Field label="Minimum Age">
				<Input
					value={form.age}
					onChange={(v) => up("age", v)}
					placeholder="e.g. 17"
					type="number"
				/>
				{errors.age && (
                   <span className="text-red-500 text-xs">{errors.age.message}</span>
                )}
			</Field>

			<Field label="Content Descriptors" fullWidth>
				<div className="grid grid-cols-2 gap-2 pt-1">
					{ALL_DESCRIPTORS.map((d) => {
						const on = form.descriptors ? form.descriptors.includes(d) : false;
						return (
							<button
								key={d}
								type="button"
								onClick={() => toggleArrayItem("descriptors", d)}
								className="flex items-center gap-2.5 px-3 py-2 text-left border transition-all duration-150"
								style={{
									borderColor: on ? `${BRAND_LIGHT}45` : `${BRAND}22`,
									background: on ? `${BRAND}14` : "transparent",
									color: on ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.28)",
								}}
							>
								{/* Custom checkbox */}
								<div
									className="w-3.5 h-3.5 flex items-center justify-center shrink-0"
									style={{
										border: `1px solid ${on ? BRAND_LIGHT : BRAND}`,
										background: on ? `${BRAND}30` : "transparent",
									}}
								>
									{on && (
										<svg width="8" height="8" viewBox="0 0 8 8" fill="none">
											<path d="M1 4L3 6.5L7 1.5" stroke={BRAND_LIGHT} strokeWidth="1" strokeLinecap="square" />
										</svg>
									)}
								</div>
								<span className="font-jost text-[11px]">{d}</span>
							</button>
						);
					})}
				</div>
				{errors.descriptors && (
                   <span className="text-red-500 text-xs">{errors.descriptors.message}</span>
                )}
			</Field>
		</>
	);
}