"use client";

import { useEffect, useState } from "react";
import { BRAND, BRAND_LIGHT, uid } from "@/lib/utils";
import { Field, Input, TextArea, TabSection } from "../utils";
import type { OfficialDownloadLink, NonOfficialDownloadLink, DownloadCategory } from "@/types/game";
import type { FieldErrors } from "react-hook-form";
import type { GameData } from "@/lib/game";
import { PRESET_SITES, DownloadSiteLogo } from "@/lib/downloadLogos";
import Image from "next/image";
import { fetchLatestCheapSharkPricesAction } from "@/app/actions";
import { toast } from "@/stores/alertStore";


function newOfficialLink(): OfficialDownloadLink {
	return {
		id: `off_${uid()}`,
		name: "",
		url: "",
		logo: "",
		price: "",
		badge: "Official Store",
	};
}

function newNonOfficialLink(): NonOfficialDownloadLink {
	return {
		id: `non_${uid()}`,
		siteName: "",
		url: [],
		logo: "",
		category: "Repack",
		fileSize: "",
		version: "",
		notes: "",
	};
}

const CATEGORIES: DownloadCategory[] = [
	"Repack",
	"Direct",
	"Torrent",
	"Crack Fix",
	"Update Patch",
	"Other",
];


interface OfficialEditorProps {
	link: OfficialDownloadLink;
	index: number;
	error?: any;
	onChange: (updated: OfficialDownloadLink) => void;
	onRemove: () => void;
}

function OfficialEditor({ link, index, error, onChange, onRemove }: OfficialEditorProps) {
	return (
		<div className="p-4 flex flex-col gap-3 bg-[#0a0a0a]" style={{ border: `1px solid ${BRAND}25` }}>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2.5">
					<div className="w-7 h-7 border border-[#7a6b4f]/30 bg-black/60 flex items-center justify-center p-1 shrink-0">
						<DownloadSiteLogo name={link.name} logoUrl={link.logo} className="w-4 h-4" isOfficial />
					</div>
					<span
						className="font-jost text-[10px] tracking-[0.14em] uppercase"
						style={{ color: `${BRAND_LIGHT}80` }}
					>
						Official Store #{index + 1} {link.name && `— ${link.name}`}
					</span>
				</div>

				<button
					type="button"
					onClick={onRemove}
					className="font-jost text-[9px] uppercase tracking-wider text-red-400/60 hover:text-red-400 cursor-pointer transition-colors"
				>
					Remove
				</button>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
				<Field label="Platform Name" error={error?.name?.message}>
					<Input
						value={link.name}
						onChange={(v) => onChange({ ...link, name: v })}
						placeholder="e.g. Steam, Epic Games, GOG"
					/>
				</Field>

				<Field label="Price / Edition Tag" error={error?.price?.message}>
					<Input
						value={link.price || ""}
						onChange={(v) => onChange({ ...link, price: v })}
						placeholder="e.g. $59.99, Free to Play"
					/>
				</Field>

				<Field label="Badge" error={error?.badge?.message}>
					<Input
						value={link.badge || ""}
						onChange={(v) => onChange({ ...link, badge: v })}
						placeholder="e.g. DRM-Free, Standard"
					/>
				</Field>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
				<Field label="Storefront URL" error={error?.url?.message}>
					<Input
						value={link.url}
						onChange={(v) => onChange({ ...link, url: v })}
						placeholder="https://store.steampowered.com/app/..."
					/>
				</Field>

				<Field label="Custom Logo URL (optional)" error={error?.logo?.message}>
					<Input
						value={link.logo || ""}
						onChange={(v) => onChange({ ...link, logo: v })}
						placeholder="https://.../logo.png"
					/>
				</Field>
			</div>

			{link.editions && link.editions.length > 0 && (
				<div className="mt-1 pt-2 border-t border-[#7a6b4f]/15">
					<span className="font-jost text-[9px] uppercase tracking-wider text-[#c4a97d]/80 block mb-1.5">
						Tracked Package Editions ({link.editions.length})
					</span>
					<div className="flex flex-wrap gap-2">
						{link.editions.map((ed, ei) => (
							<div
								key={ei}
								className="px-2.5 py-1 border border-[#7a6b4f]/25 bg-black/40 flex items-center gap-2 text-[11px] font-jost"
							>
								<span className="text-white/80">{ed.edition}</span>
								<span className="text-[#c4a97d] font-medium">{ed.price}</span>
								{Boolean(ed.discountPercent && ed.discountPercent > 0) && (
									<span className="text-[9px] px-1 bg-[#c4a97d]/15 text-[#c4a97d] border border-[#c4a97d]/30">
										-{ed.discountPercent}%
									</span>
								)}
								{Boolean(ed.isLowestPrice) && (
									<span className="text-[8px] px-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase">
										Lowest
									</span>
								)}
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}


interface NonOfficialEditorProps {
	source: NonOfficialDownloadLink;
	index: number;
	error?: any;
	onChange: (updated: NonOfficialDownloadLink) => void;
	onRemove: () => void;
}

function NonOfficialEditor({ source, index, error, onChange, onRemove }: NonOfficialEditorProps) {
	// Maintain raw string state for comfortable multiline editing and Enter key support
	const [rawUrlText, setRawUrlText] = useState(() =>
		Array.isArray(source.url) ? source.url.join("\n") : ""
	);

	useEffect(() => {
		const currentJoined = Array.isArray(source.url) ? source.url.join("\n") : "";
		const rawCleaned = rawUrlText
			.split("\n")
			.map((u) => u.trim())
			.filter(Boolean)
			.join("\n");
		if (rawCleaned !== currentJoined) {
			setRawUrlText(currentJoined);
		}
	}, [source.url]);

	const handleUrlsChange = (text: string) => {
		setRawUrlText(text);
		const parsed = text
			.split("\n")
			.map((u) => u.trim())
			.filter(Boolean);
		onChange({ ...source, url: parsed });
	};

	return (
		<div className="p-4 flex flex-col gap-3 bg-[#0a0a0a]" style={{ border: `1px solid ${BRAND}25` }}>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2.5">
					<div className="w-7 h-7 border border-[#7a6b4f]/30 bg-black/60 flex items-center justify-center p-1 shrink-0">
						<DownloadSiteLogo name={source.siteName} logoUrl={source.logo} className="w-4 h-4" />
					</div>
					<span
						className="font-jost text-[10px] tracking-[0.14em] uppercase"
						style={{ color: `${BRAND_LIGHT}80` }}
					>
						Source #{index + 1} {source.siteName && `— ${source.siteName}`}
					</span>
				</div>

				<button
					type="button"
					onClick={onRemove}
					className="font-jost text-[9px] uppercase tracking-wider text-red-400/60 hover:text-red-400 cursor-pointer transition-colors"
				>
					Remove
				</button>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
				<Field label="Plateform Name" error={error?.siteName?.message}>
					<Input
						value={source.siteName}
						onChange={(v) => onChange({ ...source, siteName: v })}
						placeholder="e.g. FitGirl Repacks, DODI, SteamRIP"
					/>
				</Field>

				<Field label="Category / Type" error={error?.category?.message}>
					<select
						value={source.category || "Repack"}
						onChange={(e) => onChange({ ...source, category: e.target.value as DownloadCategory })}
						className="w-full bg-[#0a0a0a] font-jost text-[13px] text-white/70 outline-none px-3 py-2 border border-[#7a6b4f]/30 focus:border-[#c4a97d]/60 cursor-pointer"
					>
						{CATEGORIES.map((cat) => (
							<option key={cat} value={cat} className="bg-[#0f0e0c] text-white">
								{cat}
							</option>
						))}
					</select>
				</Field>

				<Field label="File Size (optional)" error={error?.fileSize?.message}>
					<Input
						value={source.fileSize || ""}
						onChange={(v) => onChange({ ...source, fileSize: v })}
						placeholder="e.g. 38.5 GB"
					/>
				</Field>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
				<Field label="Custom Logo URL (optional)" hint="Auto-resolves for common releasers if blank" error={error?.logo?.message}>
					<Input
						value={source.logo || ""}
						onChange={(v) => onChange({ ...source, logo: v })}
						placeholder="https://.../logo.png"
					/>
				</Field>

				<Field label="Release Notes / Version" error={error?.notes?.message}>
					<Input
						value={source.notes || ""}
						onChange={(v) => onChange({ ...source, notes: v })}
						placeholder="e.g. Based on v1.0.4. All DLCs included"
					/>
				</Field>
			</div>

			<Field label="Download URLs" hint="One per line for multi-part releases (e.g. Part 1, Part 2) or single direct/magnet URL" error={error?.url?.message}>
				<TextArea
					value={rawUrlText}
					onChange={handleUrlsChange}
					placeholder={"https://drive.google.com/...\nhttps://1fichier.com/...\nmagnet:?xt=urn:btih:..."}
					rows={3}
				/>
			</Field>
		</div>
	);
}


function PresetButtons({
	type,
	onSelect,
}: {
	type: "official" | "non-official";
	onSelect: (preset: (typeof PRESET_SITES)[number]) => void;
}) {
	const filtered = PRESET_SITES.filter((p) => p.type === type);

	return (
		<div className="flex flex-wrap items-center gap-1.5 pt-1">
			<span className="font-jost text-[9px] tracking-wider uppercase text-white/35 mr-1">
				Quick Presets:
			</span>
			{filtered.map((preset) => (
				<button
					key={preset.id}
					type="button"
					onClick={() => onSelect(preset)}
					className="inline-flex items-center gap-1.5 px-2.5 py-1 font-jost text-[10px] tracking-wider uppercase border border-[#7a6b4f]/30 hover:border-[#c4a97d] bg-[#7a6b4f]/10 text-white/70 hover:text-[#c4a97d] transition-all cursor-pointer"
				>
					<span>{preset.name}</span>
				</button>
			))}
		</div>
	);
}

function AddRowBtn({ label, onClick }: { label: string; onClick: () => void }) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="flex items-center justify-center gap-2 px-4 py-2 font-jost text-[10px] tracking-[0.14em] uppercase border transition-all duration-150 cursor-pointer"
			style={{ borderColor: `${BRAND}35`, color: `${BRAND_LIGHT}80`, background: "rgba(122,107,79,0.06)" }}
			onMouseOver={(e) => (e.currentTarget.style.background = "rgba(122,107,79,0.15)")}
			onMouseOut={(e) => (e.currentTarget.style.background = "rgba(122,107,79,0.06)")}
		>
			<svg width="10" height="10" viewBox="0 0 10 10" fill="none">
				<path d="M5 1V9M1 5H9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
			</svg>
			{label}
		</button>
	);
}


interface DownloadTabProps {
	form: GameData;
	up: <K extends keyof GameData>(key: K, value: GameData[K]) => void;
	errors: FieldErrors<GameData>;
}

export function DownloadTab({ form, up, errors }: DownloadTabProps) {
	const official = form.officialDownloads || [];
	const nonOfficial = form.nonOfficialDownloads || [];
	const [isFetchingPrices, setIsFetchingPrices] = useState(false);

	const handleFetchPrices = async () => {
		setIsFetchingPrices(true);
		try {
			const steamLink = official.find(
				(d) => d.name.toLowerCase().includes("steam") || d.url.includes("store.steampowered.com/app/")
			);
			const res = await fetchLatestCheapSharkPricesAction({
				title: form.title,
				steamUrlOrAppId: steamLink?.url,
				existingOfficialDownloads: official,
			});

			if (res.success && res.officialDownloads) {
				up("officialDownloads", res.officialDownloads);
				toast.success(
					"Prices Updated",
					`Refreshed pricing for ${res.updatedCount} official store link(s).`
				);
			} else {
				toast.error("Price Refresh", res.error || "Failed to fetch prices.");
			}
		} catch (err: unknown) {
			toast.error(
				"Price Refresh Error",
				err instanceof Error ? err.message : "Unexpected error."
			);
		} finally {
			setIsFetchingPrices(false);
		}
	};

	const handleAddOfficialPreset = (preset: (typeof PRESET_SITES)[number]) => {
		const newEntry: OfficialDownloadLink = {
			id: `off_${uid()}`,
			name: preset.name,
			url: "",
			logo: "",
			price: "",
			badge: "Official Store",
		};
		up("officialDownloads", [...official, newEntry]);
	};

	const handleAddNonOfficialPreset = (preset: (typeof PRESET_SITES)[number]) => {
		const newEntry: NonOfficialDownloadLink = {
			id: `non_${uid()}`,
			siteName: preset.name,
			url: [],
			logo: "",
			category: preset.defaultCategory || "Repack",
			fileSize: "",
			version: "",
			notes: "",
		};
		up("nonOfficialDownloads", [...nonOfficial, newEntry]);
	};

	return (
		<>
			{/* Official Digital Storefronts  */}
			<TabSection title="Official Digital Storefronts" />

			<div className="col-span-full flex flex-col gap-3">
				<div className="flex flex-wrap items-center justify-between gap-2.5 pb-1">
					<PresetButtons type="official" onSelect={handleAddOfficialPreset} />
					<button
						type="button"
						onClick={handleFetchPrices}
						disabled={isFetchingPrices}
						className="inline-flex items-center gap-1.5 px-3 py-1 font-jost text-[10px] tracking-wider uppercase border border-[#c4a97d]/40 bg-[#c4a97d]/10 hover:bg-[#c4a97d]/20 text-[#c4a97d] transition-all cursor-pointer disabled:opacity-50 select-none rounded-none"
					>
						<svg
							className={`w-3 h-3 ${isFetchingPrices ? "animate-spin text-[#c4a97d]" : ""}`}
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
						</svg>
						<span>{isFetchingPrices ? "Fetching Prices..." : "Fetch Latest Prices (CheapShark)"}</span>
					</button>
				</div>

				{official.map((link, i) => (
					<OfficialEditor
						key={link.id || i}
						link={link}
						index={i}
						onChange={(updated) =>
							up(
								"officialDownloads",
								official.map((x, j) => (j === i ? updated : x))
							)
						}
						onRemove={() =>
							up(
								"officialDownloads",
								official.filter((_, j) => j !== i)
							)
						}
						error={Array.isArray(errors.officialDownloads) ? errors.officialDownloads[i] : undefined}
					/>
				))}

				<AddRowBtn
					label="Add Official Store Link"
					onClick={() => up("officialDownloads", [...official, newOfficialLink()])}
				/>
			</div>

			{/* Non-Official / Community Repacks & Third-Party Mirrors  */}
			<TabSection title="Community Repacks & Third-Party Download Sources" />

			<div className="col-span-full flex flex-col gap-3">
				<PresetButtons type="non-official" onSelect={handleAddNonOfficialPreset} />

				{nonOfficial.map((source, i) => (
					<NonOfficialEditor
						key={source.id || i}
						source={source}
						index={i}
						onChange={(updated) =>
							up(
								"nonOfficialDownloads",
								nonOfficial.map((x, j) => (j === i ? updated : x))
							)
						}
						onRemove={() =>
							up(
								"nonOfficialDownloads",
								nonOfficial.filter((_, j) => j !== i)
							)
						}
						error={Array.isArray(errors.nonOfficialDownloads) ? errors.nonOfficialDownloads[i] : undefined}
					/>
				))}

				<AddRowBtn
					label="Add Third-Party Download Source"
					onClick={() => up("nonOfficialDownloads", [...nonOfficial, newNonOfficialLink()])}
				/>
			</div>
		</>
	);
}
