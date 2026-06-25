'use client'
import { AnimatePresence, motion } from "motion/react";
import React, { startTransition, useActionState, useEffect, useState } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { BRAND, BRAND_LIGHT, EASE } from "@/lib/utils";
import { ActionBtn, DeleteBtn, DeleteModal, Modal } from "./ui";
import type { Genre } from "@/types/game";
import { useSearchParams } from "next/navigation";
import { SaveGenre } from "@/app/actions/dbActions";
import { Field, Input } from "./gameModel/utils";


export function AddCategoryModal({ onClose }: { onClose: () => void }) {

	const [genre, setGenre] = useState({id:"" ,name: "", slug: "",gameCount : 0 });
	const [state, formAction, isPending] = useActionState(SaveGenre, { errors: {}, success: false })


	const handleSave = async () => {
		startTransition(() => {
			formAction(genre)
		});
	}

	// Local state to manage errors on the client side
	const [clientErrors, setClientErrors] = useState<any>({});

	// Sync server errors to local state whenever a form submission returns
	useEffect(() => {
		if (state?.errors) {
			setClientErrors(state.errors);
		}
		if(state.success) onClose()
	}, [state]);

	// Handler to clear a specific error when the user types
	const handleInputChange = (fieldName : string, value : string) => {
		setClientErrors((prev: any) => ({
			...prev,
			[fieldName]: null, // Wipe out the error for this field
			server : null
		}));
		setGenre({ ...genre, [fieldName]: value })
	};
	return (
		<Modal title="Add Category" onClose={onClose}>
			<div className="flex flex-col gap-4">
				<Field label="Category Name *">
					<Input value={genre.name} onChange={(v: string) => handleInputChange("name",v)} placeholder="e.g. Souls-like" />
					{clientErrors?.name && (
						<span className="text-[10px] font-medium text-red-500 mt-0.5">
							{state.errors.name}
						</span>
					)}
				</Field>
				<Field label="Slug">
					<Input value={genre.slug} onChange={(v: string) => handleInputChange("slug",v)} placeholder="e.g. souls-like" />
					{clientErrors?.slug && (
						<span className="text-[10px] font-medium text-red-500 mt-0.5">
							{clientErrors.slug}
						</span>
					)}
				</Field>
				<div className="flex justify-between gap-3 pt-2 border-t border-[#7a6b4f]/20">
					<div>
						{state?.errors?.server &&
							<span className="text-[10px] font-medium text-red-500 mt-0.5">
								{state.errors.server}
							</span>}
					</div>
					<div>
						<button
							onClick={onClose}
							className="px-4 py-2 font-jost text-[10px] tracking-[0.14em] uppercase text-white/30 hover:text-white/55 transition-colors duration-150"
						>
							Cancel
						</button>
						<motion.button
							whileHover={{ borderColor: `${BRAND_LIGHT}60`, backgroundColor: `${BRAND}25` }}
							whileTap={{ scale: 0.97 }}
							disabled={isPending}
							onClick={handleSave}
							className="px-5 py-2 font-jost text-[10px] tracking-[0.14em] uppercase border rounded-sm transition-all duration-200"
							style={{ borderColor: `${BRAND_LIGHT}40`, color: BRAND_LIGHT, background: `${BRAND}18` }}
						>
							{isPending ? "Saving..." : "Add Category"}
						</motion.button>
					</div>

				</div>
			</div>
		</Modal>
	);
}

export default function CategoriesView({
    categories,
}: {
    categories: Genre[];
}) {

    const searchParams = useSearchParams();
    const search = searchParams.get('search') || '';
    const filtered = categories.filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()));

    const [addgen, setAddGen] = useState<boolean>(false)
    const [delgen, setDeleteGen] = useState<Genre | null>(null)

    return (
        <>
            <div className="flex items-center justify-start px-6 py-3 gap-2 border-b border-[#7a6b4f]/10 bg-[#090807] shrink-0">
                <span className="text-[#c4a97d]/50">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M1 3H13M1 7H9M1 11H11" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
                    </svg>
                </span>
                <span className="font-jost text-[24px] tracking-[0.14em] uppercase text-white/90">
                    Genres
                </span>
            </div>
            <AnimatePresence mode="wait">
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.32, ease: EASE }}
                    className="flex flex-col flex-1 overflow-hidden" 
                >
                    <div className="flex flex-col gap-5 p-6 h-full">
                        {/* Toolbar / Header Info */}
                        <div className="flex items-center gap-3 shrink-0">
                            <ActionBtn onClick={() => setAddGen(true)}>Add Genre</ActionBtn>
                            <span className="font-jost text-[10px] ml-auto text-[#7a6b4f]/60">
                                {filtered.length} {filtered.length === 1 ? "category" : "categories"}
                            </span>
                        </div>

                        {/* Shadcn Table Wrapper - Added constrained height and scroll */}
                        <div className="rounded-none border border-[#7a6b4f]/20 bg-[#0d0c0a]/50 [&>div]:max-h-[calc(90vh-200px)] [&>div]:overflow-y-auto">
                            <Table>
                                <TableHeader className="sticky top-0 z-10">
                                    <TableRow className="font-jost text-[9px] tracking-[0.16em] uppercase text-[#7a6b4f]/80 bg-muted border-b border-[#7a6b4f]/20">
                                        <TableHead>Name</TableHead>
                                        <TableHead>Slug</TableHead>
                                        <TableHead>Games</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="w-15" />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtered.map((gen, i) => (
                                        <motion.tr
                                            key={gen.id}
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.2, delay: i * 0.04 }}
                                            className="group border-b border-[#7a6b4f]/10 hover:bg-[#7a6b4f]/10 transition-colors duration-100"
                                        >
                                            <TableCell className="font-jost text-[14px] text-white/70 font-medium">
                                                {gen.name}
                                            </TableCell>
                                            <TableCell className="font-jost text-[14px] text-[#c4a97d]/55">
                                                /{gen.slug}
                                            </TableCell>
                                            <TableCell className="font-jost text-[14px] text-white/40">
                                                {gen.gameCount}
                                            </TableCell>
                                            <TableCell className="font-jost text-[14px] text-white/30">
                                                {gen.createdAt}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex justify-end">
                                                    <DeleteBtn onClick={() => setDeleteGen(gen)} />
                                                </div>
                                            </TableCell>
                                        </motion.tr>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Empty State */}
                            {filtered.length === 0 && (
                                <div className="py-12 text-center font-jost text-[11px] tracking-[0.14em] uppercase text-[#7a6b4f]/50">
                                    No categories found.
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {delgen && <DeleteModal
                key="delete-cat"
                title={delgen.name}
                onClose={() => setDeleteGen(null)}
                onConfirm={() => { }}
            />}

            {addgen && <AddCategoryModal
                key="add-cat"
                onClose={() => setAddGen(false)}
            />}
        </>
    );
}

					