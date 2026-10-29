"use client";

import type { FieldErrors } from "react-hook-form";
import { ALL_STATUS_OPTIONS, ALL_TAGS_OPTIONS } from "@/lib/utils";
import CustomEditor from "../TextEditor";
import { TogglePills, Field, Input, TextArea, TabSection, Select } from "../utils";
import type { GameData } from "@/lib/game";

interface BasicTabProps {
    form: GameData;
    up: <K extends keyof GameData>(key: K, value: GameData[K]) => void;
    toggleArrayItem: <T>(key: keyof GameData, item: T) => void;
    errors?: FieldErrors<GameData>;
}

export function BasicTab({ form, up, toggleArrayItem, errors }: BasicTabProps) {
    return (
        <>
            <Field label="Title" error={errors?.title?.message}>
                <Input
                    value={form.title}
                    onChange={(v) => up("title", v)}
                    placeholder="e.g. Cyberpunk 2077"
                />
            </Field>

            <Field label="Publishing Status" error={errors?.status?.message}>
                <Select
                    value={form.status || "draft"}
                    onChange={(v) => up("status", v as GameData["status"])}
                    options={ALL_STATUS_OPTIONS}
                    placeholder="Select Status"
                />
            </Field>

            <Field label="Subtitle" fullWidth error={errors?.subtitle?.message}>
                <Input
                    value={form.subtitle!}
                    onChange={(v) => up("subtitle", v as string)}
                    placeholder="e.g. Phantom Liberty"
                />
            </Field>

            <Field label="Synopsis" fullWidth error={errors?.synopsis?.message}>
                <TextArea
                    value={form.synopsis!}
                    onChange={(v) => up("synopsis", v)}
                    placeholder="Game synopsis…"
                    rows={4}
                />
            </Field>

            <Field label="Edition" fullWidth error={errors?.edition?.message}>
                <CustomEditor
                    value={form.edition}
                    onChange={(v) => up("edition", v)}
                    placeholder="Start writing your content here…"
                />
            </Field>

            <Field label="Description" fullWidth error={errors?.description?.message}>
                <CustomEditor
                    value={form.description}
                    onChange={(v) => up("description", v)}
                    placeholder="Start writing your content here…"
                />
            </Field>

            <Field label="Tags" fullWidth error={errors?.tags?.message}>
                <TogglePills
                    options={ALL_TAGS_OPTIONS}
                    selected={form.tags || []}
                    onToggle={(id) => toggleArrayItem("tags", id)}
                />
            </Field>

            <TabSection title="Rating" />

            <Field label="Score" error={errors?.score?.message}>
                <Input
                    value={form.score}
                    onChange={(v) => up("score", v)}
                    placeholder="85"
                    type="number"
                />
            </Field>

            <Field label="Review Count" error={errors?.reviewCount?.message}>
                <Input
                    value={form.reviewCount || 0}
                    onChange={(v) => up("reviewCount", v)}
                    placeholder="1200"
                    type="number"
                />
            </Field>
        </>
    );
}
