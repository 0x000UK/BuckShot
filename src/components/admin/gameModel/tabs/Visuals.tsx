"use client";

import { BRAND_LIGHT } from "@/lib/utils";
import { Field, Input } from "../utils";
import { SingleImageInput, MultiMediaInput } from "../utils";
import { Pipette } from "lucide-react";
import type { FieldErrors } from "react-hook-form";
import type { GameData } from "@/lib/game";

interface VisualsTabProps {
    form: GameData;
    up: <K extends keyof GameData>(key: K, value: GameData[K]) => void;
    errors : FieldErrors<GameData>
}

export function VisualsTab({ form, up , errors}: VisualsTabProps) {

    console.log(form.wideCover)
    console.log(errors)
    const isSupported = typeof window !== 'undefined' && 'EyeDropper' in window;
    const pickScreenColor = async () => {
        if (!isSupported) return;
        try {
            const eyeDropper = window.EyeDropper ? new window.EyeDropper() : null;
            if (!eyeDropper) return;
            
            const result = await eyeDropper.open();
            up("ambientColor", result.sRGBHex);
        } catch (err) {
            // Handles user canceling selection
        }
    };

    return (
        <>
            <div className="flex flex-col">
                {/* COLUMN 1: */}
                <div className="grid grid-cols-2 gap-4 h-full">
                    {/* Left Side: Tall Portrait Cover */}
                    <Field label="Cover Image" error={errors.cover?.url?.message || errors.cover?.type?.message || errors.cover?.file?.message}>
                        <SingleImageInput
                            title="cover"
                            value={form.cover}
                            onChange={(f: any) => up("cover", f??{url:"", id:""})}
                            aspectHint="3:4"
                            className="aspect-3/4" 
                        />
                    </Field>

                    {/* Right Side: Square Logo + Color Picker stacked */}
                    <div className="flex flex-col gap-4">
                        <Field label="Logo" error={errors.logo?.url?.message || errors.logo?.type?.message || errors.logo?.file?.message}>
                            <SingleImageInput
                                title="logo"
                                value={form.logo}
                                onChange={(f: any) => up("logo", f??{url:"", id:""})}
                                aspectHint="1:1"
                                className="aspect-square h-full"
                            />
                        </Field>
                        
                        <Field label="Ambient Color" hint="banner dominant color" error={errors.ambientColor?.message}>
                            <div className="flex gap-2 items-center mt-1">
                                {!isSupported ? (
                                    <input
                                        type="color"
                                        value={form.ambientColor}
                                        onChange={(e) => up("ambientColor", e.target.value)}
                                        className="w-9 h-9 cursor-pointer rounded-none bg-transparent overflow-hidden shrink-0"
                                    />
                                ) : (
                                    <button 
                                        onClick={pickScreenColor}
                                        className="w-9 h-9 flex items-center justify-center shrink-0 rounded border border-[#7a6b4f]/30 bg-[#7a6b4f]/10 hover:bg-[#7a6b4f]/25 transition-colors"
                                    >
                                        <Pipette size={16} color={BRAND_LIGHT}/>
                                    </button>
                                )}
                                <div className="flex-1">
                                    <Input
                                        value={form.ambientColor}
                                        onChange={(v: string) => up("ambientColor", v)}
                                        placeholder="#1a1a2e"
                                        bgColor={form.ambientColor}
                                    />
                                </div>
                            </div>
                        </Field>
                    </div>
                    <Field label="Banner Image" fullWidth error={errors.banner?.url?.message || errors.banner?.type?.message || errors.banner?.file?.message}>
                        <SingleImageInput
                            title="background"
                            value={form.banner}
                            onChange={(f: any) => up("banner", f??{url:"", id:""})}
                            aspectHint="16:9"
                            className="aspect-video h-full"
                        />
                    </Field>
                </div>
            </div>

            {/* --- COLUMN 2: Banners --- */}
            <div className="flex flex-col gap-4 h-full justify-between">
                <Field label="Wide Cover" error={errors.wideCover?.url?.message || errors.wideCover?.type?.message || errors.wideCover?.file?.message}>
                    <SingleImageInput
                        title="widecover"
                        value={form.wideCover}
                        onChange={(f: any) => up("wideCover", f??{url:"", id:""})}
                        aspectHint="16:9"
                        className="aspect-video h-full"
                    />
                </Field>

                <Field label="Banner Image 2" error={errors.banner2?.url?.message || errors.banner2?.file?.message}>
                    <SingleImageInput
                        title="banner2"
                        value={form.banner2} 
                        onChange={(f: any) => up("banner2", f)}
                        aspectHint="16:9"
                        className="aspect-video h-full"
                    />
                </Field>
            </div>

            {/* --- FULL WIDTH ROWS --- */}
            <Field label="Screenshots" fullWidth error={errors.screenShots? "File or URL is missing" : undefined}>
                <MultiMediaInput
                    value={form.screenShots || []}
                    onChange={(v: any) => up("screenShots", v)}
                    max={20}
                />
            </Field>
        </>
    );
}