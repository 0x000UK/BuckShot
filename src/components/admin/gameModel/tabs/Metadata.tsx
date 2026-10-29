"use client";

import { useMemo } from "react";
import type { FieldErrors } from "react-hook-form";
import { TogglePills, Field, Input, DropDownSelector } from "../utils";
import type { Genre, Platform } from "@/types/game";
import type { GameData } from "@/lib/game";

const ALL_PLATFORMS: Platform[] = [
	"PC", "PlayStation 5", "PlayStation 4", "Xbox Series X/S",
	"Xbox One", "Nintendo Switch", "macOS", "Linux",
];

interface MetadataTabProps {
	form: GameData;
	up: <K extends keyof GameData>(key: K, value: GameData[K]) => void;
	toggleArrayItem: <T>(key: keyof GameData, item: T) => void;
	genres: Genre[];
	errors: FieldErrors<GameData>;
}

export function MetadataTab({ form, up, toggleArrayItem, genres, errors }: MetadataTabProps) {

	return (
		<>
			<Field label="Developer" error={errors.developer?.message}>
				<Input value={form.developer} onChange={(v) => up("developer", v)} placeholder="e.g. CD Projekt RED" />
			</Field>

			<Field label="Publisher" error={errors.publisher?.message}>
				<Input value={form.publisher} onChange={(v) => up("publisher", v)} placeholder="e.g. CD Projekt" />
			</Field>

			<Field label="Franchise" error={errors.franchise?.message}>
				<Input value={form.franchise || ""} onChange={(v) => up("franchise", v)} placeholder="e.g. The Witcher" />
			</Field>

			<Field label="Game Version" error={errors?.version?.message}>
				<Input value={form.version || ""} onChange={(v) => up("version", v)} placeholder="e.g. 2.1.0" />
			</Field>

			<Field label="Release Date" error={errors.releaseDate?.message}>
				<Input
					value={form.releaseDate}
					onChange={(v) => up("releaseDate", v)}
					type="date"
				/>
			</Field>

			<Field label="Platforms" fullWidth error={errors.platforms?.message}>
				<TogglePills
					options={ALL_PLATFORMS.map((p) => ({ value: p, label: p }))}
					selected={form.platforms!}
					onToggle={(id) => toggleArrayItem("platforms", id)}
				/>
			</Field>

			<Field label="Genres" error={errors.genres?.message}>
				<DropDownSelector
					values={form.genres}
					onChange={(v) => up("genres", v)}
					options={genres.map((g) => ({ value: g.id, label: g.name }))}
					placeholder="Action (Select Genres from dropdown)"
				/>
			</Field>
		</>
	);
}
