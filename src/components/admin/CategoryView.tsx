'use client'
import { AnimatePresence, motion } from "motion/react";
import { startTransition, useActionState, useEffect, useState } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import {EASE } from "@/lib/utils";
import { ActionBtn, DeleteBtn, Modal } from "./ui";
import type { Genre } from "@/types/game";
import { useSearchParams } from "next/navigation";
import { SaveGenre } from "@/app/actions/games.actions";
import { Field, Input } from "./gameModel/utils";
import { toast } from "@/stores/alertStore";


function AddCategoryModal({value , setValue , errors} : {value : Genre , setValue : (v:Genre)=>void , errors? : any}) {

	// Local state to manage errors on the client side
	const [clientErrors, setClientErrors] = useState<any>({});

	// Handler to clear a specific error when the user types
	const handleInputChange = (fieldName : string, v : string) => {
		setClientErrors((prev: any) => ({
			...prev,
			[fieldName]: null, // Wipe out the error for this field
			server : null
		}));
		setValue({ ...value, [fieldName]: v })
	};
	return (
        <motion.div 
            initial={{ scale: 0.96, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 10 }}
            className="w-full max-w-md  flex flex-col gap-4 shadow-2xl mt-3"
        >
            <div className="flex flex-col gap-4">
                <Field label="Category Name *">
                    <Input value={value.name} onChange={(v: string) => handleInputChange("name",v)} placeholder="e.g. Souls-like" />
                    {clientErrors?.name && (
                        <span className="text-[10px] font-medium text-red-500 mt-0.5">
                            {errors.name}
                        </span>
                    )}
                </Field>
                <Field label="Slug">
                    <Input value={value.slug} onChange={(v: string) => handleInputChange("slug",v)} placeholder="e.g. souls-like" />
                    {clientErrors?.slug && (
                        <span className="text-[10px] font-medium text-red-500 mt-0.5">
                            {clientErrors.slug}
                        </span>
                    )}
                </Field>
                <div className="flex justify-between gap-3 pt-2 border-t border-[#7a6b4f]/20">
                    <div>
                        {errors?.server &&
                            <span className="text-[10px] font-medium text-red-500 mt-0.5">
                                {errors.server}
                            </span>}
                    </div>
                </div>
            </div>
        </motion.div >
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

    const defaultGen = () => ({id:"" ,name: "", slug: ""})

    const [genre, setGenre] = useState(defaultGen);
	const [state, formAction, isPending] = useActionState(SaveGenre, { errors: {}, success: null })


    useEffect(() => {
        if (state.success) {
            toast.success(`Genre added successfully`);
            queueMicrotask(() => {
                setGenre(defaultGen());
                setAddGen(false);
            });
        } else if (state.success === false) {
            toast.error(state.errors?.message || `Failed to add genre`);
        }
    }, [state]);

	const handleSave = async () => {
		startTransition(() => {
			formAction(genre)
		});
	}

    return (
        <>
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

                        {/* Shadcn Table Wrapper with added constrained height and scroll */}
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

            {delgen && 
                <Modal
                    title={delgen.name}
                    cancelText="Go Back"
                    onCancel={() => setDeleteGen(null)}
                    confirmText="Delete"
                    onConfirm={() => { }}
                    destructive
                >
                    Permanently delete <span className="text-white font-medium">${delgen.name}</span> ? This action cannot be undone.
                </Modal>
            }

            {addgen && 
                <Modal
                    title="Add Category"
                    cancelText="Cancel"
                    onCancel={() => setAddGen(false)}
                    confirmText="Add"
                    onConfirm={handleSave}
                    loading={isPending}
                >
                    <AddCategoryModal
                        value={genre}
                        setValue={setGenre}
                        errors={state.errors}
                        key="add-cat"
                    />
                </Modal>
            }
        </>
    );
}

					