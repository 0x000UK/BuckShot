"use client";

import { BRAND, BRAND_LIGHT } from "@/lib/utils";
import { Field, Input } from "../utils";
import type { Platform, SystemSpecs } from "@/types/game";
import type { FieldError, FieldErrors } from "react-hook-form";
import type { GameData } from "@/lib/game";

const ALL_PLATFORMS: Platform[] = [
    "PC", "PlayStation 5", "PlayStation 4", "Xbox Series X/S",
    "Xbox One", "Nintendo Switch", "macOS", "Linux",
];

const EMPTY_SPECS: SystemSpecs = {
    architecture: null,
    os: "",
    cpu: "",
    ram: "",
    gpu: "",
    storage: "",
    directX: null,
    soundcard: null,
    network: null,
    others: null,
    notes: null
};

interface SpecsFormProps {
    label: string;
    specs: SystemSpecs;
    onChange: (s: SystemSpecs) => void;
    errors:   FieldErrors<SystemSpecs> | undefined;
}

function SpecsForm({ label, specs, onChange, errors }: SpecsFormProps) {
    const f = (key: keyof SystemSpecs, error: FieldError|undefined) => (
        <Field 
            label={
                key === "directX" 
                    ? "DirectX" 
                    : key === "architecture" 
                    ? "Architecture" 
                    : key.toUpperCase()
            }
            error={error?.message}
        >
            <Input
                value={specs[key] ?? ""}
                onChange={(v) => onChange({ ...specs, [key]: v })}
                placeholder={
                    key === "ram" ? "e.g. 16 GB" : 
                    key === "directX" ? "e.g. DX12" : 
                    key === "architecture" ? "e.g. 64-bit Operating System" : 
                    key === "notes" ? "e.g. Broadband internet connection required..." : ""
                }
            />
        </Field>
    );

    return (
        <div className="flex flex-col gap-5">
            <div>
                <p
                    className="font-jost text-[9px] tracking-[0.14em] uppercase mb-3"
                    style={{ color: `${BRAND_LIGHT}50` }}
                >
                    {label} Specs
                </p>
                {/* Standard 2-column parameters grid */}
                <div className="grid grid-cols-2 gap-3">
                    {f("os",errors?.os)}
                    {f("cpu" , errors?.cpu)}
                    {f("ram", errors?.ram)}
                    {f("gpu", errors?.gpu)}
                    {f("storage", errors?.storage)}
                    {f("directX", errors?.directX)}
                    {f("soundcard", errors?.soundcard)}
                    {f("network", errors?.network)}
                </div>
            </div>

            {/* Separate section where architecture and notes take full width */}
            <div className="flex flex-col gap-3 pt-3 border-t border-white/5">
                {f("architecture" , errors?.architecture)}
                {f("notes", errors?.notes)}
                {f("others", errors?.others)}
            </div>
        </div>
    );
}

// ─── Platform block ───────────────────────────────────────────────────────────

interface RequirementBlockProps {
    platformKey: string;
    reqs: { minimum: SystemSpecs; recommended: SystemSpecs };
    onChange: (r: { minimum: SystemSpecs; recommended: SystemSpecs }) => void;
    onRemove: () => void;
    errors:  FieldErrors<GameData>;
}

function RequirementBlock({ platformKey, reqs, onChange, onRemove, errors }: RequirementBlockProps) {
    return (
        <div className="border" style={{ borderColor: `${BRAND}22` }}>
            {/* Platform header */}
            <div
                className="flex items-center justify-between px-4 py-2.5"
                style={{ background: `${BRAND}08`, borderBottom: `1px solid ${BRAND}18` }}
            >
                <span
                    className="font-jost text-[11px] tracking-widest uppercase"
                    style={{ color: BRAND_LIGHT }}
                >
                    {platformKey}
                </span>
                <button
                    type="button"
                    onClick={onRemove}
                    className="font-jost text-[9px] tracking-widest uppercase transition-colors duration-150"
                    style={{ color: "rgba(255,255,255,0.2)" }}
                >
                    Remove
                </button>
            </div>

            {/* Specs side-by-side */}
            <div className="grid grid-cols-2 gap-6 p-4 items-start">
                <SpecsForm
                    label="Minimum"
                    specs={reqs.minimum}
                    onChange={(s) => onChange({ ...reqs, minimum: s })}
                    errors={errors?.requirements?.[platformKey]?.minimum}
                />
                <SpecsForm
                    label="Recommended"
                    specs={reqs.recommended}
                    onChange={(s) => onChange({ ...reqs, recommended: s })}
                    errors={errors?.requirements?.[platformKey]?.recommended}
                />
            </div>
        </div>
    );
}

// ─── Main tab ─────────────────────────────────────────────────────────────────

interface RequirementsTabProps {
    form: GameData;
    up: <K extends keyof GameData>(key: K, value: GameData[K]) => void;
    errors:  FieldErrors<GameData>;
}

export function RequirementsTab({ form, up, errors }: RequirementsTabProps) {
    return (
        <div className="col-span-full flex flex-col gap-5">
            {form.requirements && Object.entries(form.requirements).map(([platform, reqs]) => (
                <RequirementBlock
                    key={platform}
                    platformKey={platform}
                    reqs={reqs}
                    onChange={(r) => up("requirements", { ...form.requirements, [platform]: r })}
                    onRemove={() => {
                        const next = { ...form.requirements };
                        delete next[platform];
                        up("requirements", next);
                    }}
                    errors={errors}
                />
            ))}

            {/* Add platform buttons */}
            <div className="flex gap-2 flex-wrap">
                {ALL_PLATFORMS.filter((p) => !form.requirements?.[p]).map((p) => (
                    <button
                        key={p}
                        type="button"
                        onClick={() =>
                            up("requirements", {
                                ...form.requirements,
                                [p]: {
                                    minimum: { ...EMPTY_SPECS },
                                    recommended: { ...EMPTY_SPECS },
                                },
                            })
                        }
                        className="flex items-center gap-1.5 px-3 py-1.5 font-jost text-[10px] tracking-widest uppercase border transition-all duration-150"
                        style={{ borderColor: `${BRAND}28`, color: `${BRAND_LIGHT}50` }}
                    >
                        <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                            <path d="M5 1V9M1 5H9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
                        </svg>
                        {p}
                    </button>
                ))}
            </div>
        </div>
    );
}