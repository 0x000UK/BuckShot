'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { MessageSquare, ThumbsUp, Trash2, ExternalLink, CornerDownRight } from 'lucide-react'
import { EASE } from '@/lib/utils'
import { deleteUserComment } from '@/app/actions'
import { toast } from '@/stores/alertStore'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { UserCommentItem } from '@/lib/queries'

interface CommentsSectionProps {
    profileId: string
    isOwner?: boolean
    initialComments?: UserCommentItem[]
}

export default function CommentsSection({
    profileId: _profileId,
    isOwner = true,
    initialComments = []
}: CommentsSectionProps) {
    const router = useRouter()
    const [comments, setComments] = useState<UserCommentItem[]>(initialComments)

    const handleDelete = async (id: string) => {
        const res = await deleteUserComment(id)
        if (!res.success) {
            toast.error('Failed to Delete', res.error || 'Please try again.')
            return
        }

        setComments(prev => prev.filter(c => c.id !== id))
        toast.info('Comment Deleted', 'Your comment was removed.')
        router.refresh()
    }

    return (
        <div className="flex flex-col gap-8 max-w-3xl">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#7a6b4f]/20">
                <div className="flex items-center gap-2.5">
                    <MessageSquare className="text-[#c4a97d]" size={18} />
                    <div>
                        <h2 className="font-jost text-sm font-semibold tracking-[0.2em] uppercase text-white/90">
                            Comment History
                        </h2>
                        <p className="font-jost text-[11px] text-white/40 mt-0.5">
                            {comments.length} {comments.length === 1 ? 'reply' : 'replies'} left across community threads
                        </p>
                    </div>
                </div>
            </div>

            {/* Comments List */}
            {comments.length > 0 ? (
                <div className="flex flex-col gap-3">
                    <AnimatePresence>
                        {comments.map((comment) => (
                            <motion.div
                                layout
                                key={comment.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                transition={{ duration: 0.25, ease: EASE }}
                                className="bg-[#0d0c0a]/60 border border-[#7a6b4f]/20 hover:border-[#7a6b4f]/40 p-5 rounded-none transition-all flex flex-col gap-2.5 group"
                            >
                                {/* Target Context Banner */}
                                <div className="flex items-center justify-between text-[11px] font-jost bg-[#14120e] px-3 py-1.5 rounded-none border border-[#7a6b4f]/10">
                                    <div className="flex items-center gap-2 truncate pr-2">
                                        <CornerDownRight size={12} className="text-[#c4a97d] shrink-0" />
                                        <span className="text-white/40 uppercase tracking-wider text-[10px] shrink-0">
                                            In {comment.targetType}:
                                        </span>
                                        <span className="font-medium text-white/80 hover:text-[#c4a97d] truncate transition-colors">
                                            {comment.targetTitle}
                                        </span>
                                    </div>
                                    
                                    <span className="text-white/35 shrink-0 text-[10.5px]">
                                        {comment.timestamp}
                                    </span>
                                </div>

                                {/* Comment Body */}
                                <p className="font-jost text-xs leading-relaxed text-white/75 pl-1 whitespace-pre-wrap">
                                    &ldquo;{comment.commentText}&rdquo;
                                </p>

                                {/* Footer Controls */}
                                <div className="flex items-center justify-between pt-1 font-jost text-xs">
                                    <div className="flex items-center gap-1.5 text-white/40">
                                        <ThumbsUp size={13} />
                                        <span>{comment.upvotes} {comment.upvotes === 1 ? 'Upvote' : 'Upvotes'}</span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {comment.gameSlug && (
                                            <Link
                                                href={`/g/${comment.gameSlug}`}
                                                className="flex items-center gap-1 text-[11px] uppercase tracking-wider text-white/35 hover:text-[#c4a97d] transition-colors"
                                            >
                                                <span>View Thread</span>
                                                <ExternalLink size={12} />
                                            </Link>
                                        )}

                                        {isOwner && (
                                            <button
                                                onClick={() => handleDelete(comment.id)}
                                                title="Delete Comment"
                                                className="text-white/20 hover:text-red-400 transition-colors cursor-pointer p-1"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 bg-[#0d0c0a] border border-dashed border-[#7a6b4f]/20 rounded-none gap-2">
                    <MessageSquare size={28} className="text-white/20" />
                    <p className="font-jost text-xs tracking-wider uppercase text-white/40">
                        No comments or replies made yet.
                    </p>
                </div>
            )}
        </div>
    )
}
