'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { FileText, MessageSquare, ThumbsUp, Trash2, Share2, Plus, Clock } from 'lucide-react'
import { EASE } from '@/lib/utils'

interface PostsSectionProps {
    profileId: string
    isOwner?: boolean
}

interface PostMeta {
    id: string
    title: string
    content: string
    gameTag?: string
    timestamp: string
    likesCount: number
    commentsCount: number
    isLiked?: boolean
}

const DEFAULT_POSTS: PostMeta[] = [
    {
        id: 'p1',
        title: 'Elden Ring Shadow of the Erdtree is a Masterpiece',
        content: 'Just finished the final DLC boss after 6 hours of attempts. The level design in the Realm of Shadow surpasses even the base game. Make sure you collect all the Scadutree Fragments before taking on Messmer!',
        gameTag: 'Elden Ring',
        timestamp: '2 days ago',
        likesCount: 34,
        commentsCount: 12,
        isLiked: true,
    },
    {
        id: 'p2',
        title: 'Why Cyberpunk 2077 2.0 changed my mind completely',
        content: 'I was one of the harsh critics back at launch in 2020. Jumping back in with Phantom Liberty and the revamped skill trees feels like a sequel rather than a patch. Truly one of the greatest redemption arcs in gaming history.',
        gameTag: 'Cyberpunk 2077',
        timestamp: '1 week ago',
        likesCount: 89,
        commentsCount: 24,
    },
]

export default function PostsSection({ profileId: _profileId, isOwner = true }: PostsSectionProps) {
    const [posts, setPosts] = useState<PostMeta[]>(DEFAULT_POSTS)
    const [isCreating, setIsCreating] = useState(false)
    const [newTitle, setNewTitle] = useState('')
    const [newContent, setNewContent] = useState('')
    const [newTag, setNewTag] = useState('')

    const handleLikeToggle = (id: string) => {
        setPosts(prev => prev.map(post => {
            if (post.id === id) {
                const isLiked = !post.isLiked
                return {
                    ...post,
                    isLiked,
                    likesCount: isLiked ? post.likesCount + 1 : post.likesCount - 1
                }
            }
            return post
        }))
    }

    const handleDelete = (id: string) => {
        setPosts(prev => prev.filter(p => p.id !== id))
    }

    const handleCreatePost = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newTitle.trim() || !newContent.trim()) return

        const created: PostMeta = {
            id: 'p-' + Date.now(),
            title: newTitle,
            content: newContent,
            gameTag: newTag || undefined,
            timestamp: 'Just now',
            likesCount: 1,
            commentsCount: 0,
            isLiked: true
        }

        setPosts([created, ...posts])
        setNewTitle('')
        setNewContent('')
        setNewTag('')
        setIsCreating(false)
    }

    return (
        <div className="flex flex-col gap-8 max-w-3xl">
            {/* Header & Create Button */}
            <div className="flex items-center justify-between pb-4 border-b border-[#7a6b4f]/20">
                <div className="flex items-center gap-2.5">
                    <FileText className="text-[#c4a97d]" size={18} />
                    <div>
                        <h2 className="font-['Jost',sans-serif] text-sm font-semibold tracking-[0.2em] uppercase text-white/90">
                            Published Posts
                        </h2>
                        <p className="font-['Jost',sans-serif] text-[11px] text-white/40 mt-0.5">
                            {posts.length} {posts.length === 1 ? 'article' : 'articles'} & updates written
                        </p>
                    </div>
                </div>

                {isOwner && (
                    <button
                        onClick={() => setIsCreating(!isCreating)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#7a6b4f]/20 hover:bg-[#c4a97d] text-white/80 hover:text-black font-['Jost',sans-serif] text-[11px] font-semibold tracking-[0.15em] uppercase transition-all duration-300 border border-[#7a6b4f]/40 hover:border-[#c4a97d] cursor-pointer rounded-none"
                    >
                        <Plus size={14} />
                        <span>{isCreating ? 'Cancel' : 'New Post'}</span>
                    </button>
                )}
            </div>

            {/* Create Post Drawer */}
            <AnimatePresence>
                {isCreating && (
                    <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: EASE }}
                        onSubmit={handleCreatePost}
                        className="overflow-hidden bg-[#0d0c0a] border border-[#7a6b4f]/30 p-5 rounded-none flex flex-col gap-3"
                    >
                        <span className="font-['Jost',sans-serif] text-[10px] font-semibold tracking-[0.2em] uppercase text-[#c4a97d]">
                            Draft New Post
                        </span>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="text"
                                placeholder="Post Title..."
                                value={newTitle}
                                onChange={e => setNewTitle(e.target.value)}
                                className="flex-1 bg-[#14120e] border border-[#7a6b4f]/30 focus:border-[#c4a97d] p-2.5 rounded-none text-xs text-white placeholder:text-white/30 font-['Jost',sans-serif] outline-none"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Game Tag (e.g. Hades II)"
                                value={newTag}
                                onChange={e => setNewTag(e.target.value)}
                                className="sm:w-48 bg-[#14120e] border border-[#7a6b4f]/30 focus:border-[#c4a97d] p-2.5 rounded-none text-xs text-white placeholder:text-white/30 font-['Jost',sans-serif] outline-none"
                            />
                        </div>
                        <textarea
                            placeholder="Share your gaming thoughts, guides, or reviews..."
                            rows={4}
                            value={newContent}
                            onChange={e => setNewContent(e.target.value)}
                            className="w-full bg-[#14120e] border border-[#7a6b4f]/30 focus:border-[#c4a97d] p-2.5 rounded-none text-xs text-white/80 placeholder:text-white/30 font-['Jost',sans-serif] outline-none resize-none leading-relaxed"
                            required
                        />
                        <div className="flex justify-end pt-1">
                            <button
                                type="submit"
                                className="px-5 py-2 bg-[#c4a97d] text-black font-['Jost',sans-serif] text-xs font-semibold uppercase tracking-[0.15em] hover:bg-white transition-colors cursor-pointer rounded-none"
                            >
                                Publish Post
                            </button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* Posts Feed */}
            {posts.length > 0 ? (
                <div className="flex flex-col gap-4">
                    <AnimatePresence>
                        {posts.map((post) => (
                            <motion.article
                                layout
                                key={post.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.25, ease: EASE }}
                                className="bg-[#0d0c0a]/60 border border-[#7a6b4f]/25 hover:border-[#7a6b4f]/50 p-6 rounded-none transition-colors flex flex-col gap-3 group relative"
                            >
                                {/* Header Info */}
                                <div className="flex items-center justify-between text-[11px] font-['Jost',sans-serif]">
                                    <div className="flex items-center gap-2">
                                        {post.gameTag && (
                                            <span className="px-2 py-0.5 bg-[#7a6b4f]/20 text-[#c4a97d] font-semibold tracking-wider uppercase rounded-none">
                                                {post.gameTag}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1 text-white/40">
                                            <Clock size={12} /> {post.timestamp}
                                        </span>
                                    </div>

                                    {isOwner && (
                                        <button
                                            onClick={() => handleDelete(post.id)}
                                            title="Delete Post"
                                            className="text-white/20 hover:text-red-400 transition-colors cursor-pointer p-1"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>

                                {/* Body */}
                                <div>
                                    <h3 className="font-['Jost',sans-serif] text-base font-semibold text-white/95 tracking-wide mb-1.5 group-hover:text-[#c4a97d] transition-colors">
                                        {post.title}
                                    </h3>
                                    <p className="font-['Jost',sans-serif] text-xs leading-relaxed text-white/65">
                                        {post.content}
                                    </p>
                                </div>

                                {/* Footer Bar */}
                                <div className="flex items-center gap-6 pt-3 mt-1 border-t border-[#7a6b4f]/10 font-['Jost',sans-serif] text-xs">
                                    <button
                                        onClick={() => handleLikeToggle(post.id)}
                                        className={`flex items-center gap-1.5 cursor-pointer transition-colors ${
                                            post.isLiked ? 'text-[#c4a97d] font-semibold' : 'text-white/40 hover:text-white/80'
                                        }`}
                                    >
                                        <ThumbsUp size={14} className={post.isLiked ? 'fill-[#c4a97d]' : ''} />
                                        <span>{post.likesCount} {post.likesCount === 1 ? 'Like' : 'Likes'}</span>
                                    </button>

                                    <div className="flex items-center gap-1.5 text-white/40">
                                        <MessageSquare size={14} />
                                        <span>{post.commentsCount} {post.commentsCount === 1 ? 'Reply' : 'Replies'}</span>
                                    </div>

                                    <button className="flex items-center gap-1.5 text-white/40 hover:text-white/80 ml-auto transition-colors cursor-pointer">
                                        <Share2 size={13} />
                                        <span className="text-[11px] uppercase tracking-wider">Share</span>
                                    </button>
                                </div>
                            </motion.article>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 bg-[#0d0c0a] border border-dashed border-[#7a6b4f]/20 rounded-none gap-2">
                    <FileText size={28} className="text-white/20" />
                    <p className="font-['Jost',sans-serif] text-xs tracking-wider uppercase text-white/40">
                        No posts published yet.
                    </p>
                </div>
            )}
        </div>
    )
}