'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
    User, 
    Mail, 
    Lock, 
    Edit3, 
    Check, 
    X, 
    KeyRound, 
    Eye, 
    EyeOff, 
    ShieldAlert,
    ShieldCheck,
    UserCheck,
    Loader2
} from 'lucide-react'
import { EASE } from '@/lib/utils'
import { updateAccountDetails } from '@/app/actions'
import { toast } from '@/stores/alertStore'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface AccountData {
    name: string
    username: string
    email: string
}

interface AccountsSectionProps {
    user?: {
        name?: string;
        email?: string;
        handle?: string;
        id?: string;
    };
    onUserUpdated?: (updated: { name: string; handle: string; email: string }) => void;
}

export default function AccountsSection({ user, onUserUpdated }: AccountsSectionProps = {}) {
    const { update } = useSession()
    const router = useRouter()

    // User Account State
    const [accountData, setAccountData] = useState<AccountData>({
        name: user?.name || '',
        username: user?.handle || '',
        email: user?.email || '',
    })

    // Inline Editing State
    const [editingField, setEditingField] = useState<'name' | 'username' | 'email' | null>(null)
    const [tempValue, setTempValue] = useState('')
    const [isSavingInline, setIsSavingInline] = useState(false)
    const [inlineError, setInlineError] = useState<string | null>(null)

    // Password Modal State
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    })
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false
    })
    const [passwordError, setPasswordError] = useState<string | null>(null)
    const [passwordSuccess, setPasswordSuccess] = useState(false)

    // --- INLINE EDIT HANDLERS ---
    const handleStartEdit = (field: 'name' | 'username' | 'email') => {
        setEditingField(field)
        setTempValue(accountData[field])
        setInlineError(null)
    }

    const handleSaveInline = async () => {
        if (!editingField || !tempValue.trim()) return
        setIsSavingInline(true)
        setInlineError(null)

        const payload = {
            [editingField === 'username' ? 'handle' : editingField]: tempValue.trim()
        }

        const res = await updateAccountDetails(payload)
        setIsSavingInline(false)

        if (!res.success) {
            setInlineError(res.error || 'Failed to update field.')
            return
        }

        const updatedName = editingField === 'name' ? tempValue.trim() : accountData.name
        const updatedHandle = editingField === 'username' ? tempValue.trim() : accountData.username
        const updatedEmail = editingField === 'email' ? tempValue.trim() : accountData.email

        setAccountData({
            name: updatedName,
            username: updatedHandle,
            email: updatedEmail,
        })

        toast.success(
            'Account Updated',
            `${editingField === 'name' ? 'Full Name' : editingField === 'username' ? 'Username' : 'Email'} has been updated.`
        )

        setEditingField(null)
        onUserUpdated?.({ name: updatedName, handle: updatedHandle, email: updatedEmail })

        // Update NextAuth session
        await update({
            user: {
                name: updatedName,
                handle: updatedHandle,
                email: updatedEmail
            }
        })
        router.refresh()
    }

    const handleCancelInline = () => {
        setEditingField(null)
        setTempValue('')
        setInlineError(null)
    }

    // --- PASSWORD MODAL HANDLERS ---
    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setPasswordError(null)

        if (!passwords.current || !passwords.new || !passwords.confirm) {
            setPasswordError('All fields are required.')
            return
        }
        if (passwords.new !== passwords.confirm) {
            setPasswordError('New passwords do not match.')
            return
        }
        if (passwords.new.length < 8) {
            setPasswordError('New password must be at least 8 characters long.')
            return
        }

        // Simulate password update
        setPasswordSuccess(true)
        setTimeout(() => {
            setIsPasswordModalOpen(false)
            setPasswordSuccess(false)
            setPasswords({ current: '', new: '', confirm: '' })
        }, 1500)
    }

    const closePasswordModal = () => {
        setIsPasswordModalOpen(false)
        setPasswordError(null)
        setPasswordSuccess(false)
        setPasswords({ current: '', new: '', confirm: '' })
    }

    return (
        <div className="space-y-6 max-w-3xl">
            {/* Header */}
            <div className="border-b border-[#7a6b4f]/20 pb-4">
                <h3 className="font-jost text-xs font-semibold tracking-[0.2em] uppercase text-[#c4a97d]">
                    Account Credentials & Security
                </h3>
                <p className="text-sm font-jost text-white/50 mt-1">
                    Manage your personal identification details, full name, and account access methods.
                </p>
            </div>

            {/* Error banner */}
            {inlineError && (
                <div className="p-3 bg-red-950/40 border border-red-500/40 text-red-200 text-xs font-jost">
                    {inlineError}
                </div>
            )}

            {/* Account Rows List */}
            <div className="space-y-3">
                {/* --- FULL NAME ROW --- */}
                <div className="group relative flex items-center justify-between p-4 border border-[#7a6b4f]/30 hover:border-[#c4a97d]/50 transition-all duration-300 no-underline overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-r from-[#7a6b4f]/0 via-[#7a6b4f]/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    <div className="flex items-center gap-3.5 min-w-0">
                        <div className="flex items-center justify-center w-10 h-10 shrink-0 text-[#c4a97d]">
                            <UserCheck size={18} strokeWidth={1.75} />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="font-jost text-[10.5px] font-semibold tracking-[0.15em] uppercase text-white/40">
                                Full Name
                            </span>
                            {editingField === 'name' ? (
                                <input
                                    type="text"
                                    value={tempValue}
                                    onChange={(e) => setTempValue(e.target.value)}
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveInline()}
                                    className="mt-1 bg-[#14120e] border border-[#c4a97d] px-2.5 py-1 text-sm font-jost text-white/90 focus:outline-none w-full sm:w-64"
                                />
                            ) : (
                                <span className="font-jost text-[14px] text-white/90 font-medium mt-0.5 truncate">
                                    {accountData.name || 'Not specified'}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center self-end sm:self-center shrink-0">
                        {editingField === 'name' ? (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleSaveInline}
                                    disabled={isSavingInline}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#c4a97d]/10 border border-[#c4a97d] text-[#c4a97d] font-jost text-[11px] font-semibold uppercase tracking-[0.1em] hover:bg-[#c4a97d]/20 transition-colors cursor-pointer disabled:opacity-40"
                                >
                                    {isSavingInline ? <Loader2 size={13} className="animate-spin" /> : <Check size={14} />} Save
                                </button>
                                <button
                                    onClick={handleCancelInline}
                                    disabled={isSavingInline}
                                    className="flex items-center justify-center w-8 h-8 bg-transparent border border-[#7a6b4f]/30 text-white/50 hover:text-white hover:border-white/40 transition-colors cursor-pointer"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => handleStartEdit('name')}
                                className="flex items-center gap-2 px-3.5 py-2 bg-transparent border border-[#7a6b4f]/30 text-white/70 hover:text-[#c4a97d] hover:border-[#c4a97d] transition-all font-jost text-[11.5px] font-medium uppercase tracking-[0.12em] cursor-pointer"
                            >
                                <Edit3 size={14} strokeWidth={1.75} /> Edit
                            </button>
                        )}
                    </div>
                </div>

                {/* --- USERNAME ROW --- */}
                <div className="group relative flex items-center justify-between p-4 border border-[#7a6b4f]/30 hover:border-[#c4a97d]/50 transition-all duration-300 no-underline overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-r from-[#7a6b4f]/0 via-[#7a6b4f]/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    <div className="flex items-center gap-3.5 min-w-0">
                        <div className="flex items-center justify-center w-10 h-10 shrink-0 text-[#c4a97d]">
                            <User size={18} strokeWidth={1.75} />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="font-jost text-[10.5px] font-semibold tracking-[0.15em] uppercase text-white/40">
                                Username / Handle
                            </span>
                            {editingField === 'username' ? (
                                <input
                                    type="text"
                                    value={tempValue}
                                    onChange={(e) => setTempValue(e.target.value)}
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveInline()}
                                    className="mt-1 bg-[#14120e] border border-[#c4a97d] px-2.5 py-1 text-sm font-mono text-white/90 focus:outline-none w-full sm:w-64"
                                />
                            ) : (
                                <span className="font-mono text-[14px] text-white/90 font-medium mt-0.5 truncate">
                                    @{accountData.username}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center self-end sm:self-center shrink-0">
                        {editingField === 'username' ? (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleSaveInline}
                                    disabled={isSavingInline}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#c4a97d]/10 border border-[#c4a97d] text-[#c4a97d] font-jost text-[11px] font-semibold uppercase tracking-[0.1em] hover:bg-[#c4a97d]/20 transition-colors cursor-pointer disabled:opacity-40"
                                >
                                    {isSavingInline ? <Loader2 size={13} className="animate-spin" /> : <Check size={14} />} Save
                                </button>
                                <button
                                    onClick={handleCancelInline}
                                    disabled={isSavingInline}
                                    className="flex items-center justify-center w-8 h-8 bg-transparent border border-[#7a6b4f]/30 text-white/50 hover:text-white hover:border-white/40 transition-colors cursor-pointer"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => handleStartEdit('username')}
                                className="flex items-center gap-2 px-3.5 py-2 bg-transparent border border-[#7a6b4f]/30 text-white/70 hover:text-[#c4a97d] hover:border-[#c4a97d] transition-all font-jost text-[11.5px] font-medium uppercase tracking-[0.12em] cursor-pointer"
                            >
                                <Edit3 size={14} strokeWidth={1.75} /> Edit
                            </button>
                        )}
                    </div>
                </div>

                {/* --- EMAIL ROW --- */}
                <div className="group relative flex items-center justify-between p-4 border border-[#7a6b4f]/30 hover:border-[#c4a97d]/50 transition-all duration-300 no-underline overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-r from-[#7a6b4f]/0 via-[#7a6b4f]/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    <div className="flex items-center gap-3.5 min-w-0">
                        <div className="flex items-center justify-center w-10 h-10 shrink-0 text-[#c4a97d]">
                            <Mail size={18} strokeWidth={1.75} />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="font-jost text-[10.5px] font-semibold tracking-[0.15em] uppercase text-white/40">
                                Email Address
                            </span>
                            {editingField === 'email' ? (
                                <input
                                    type="email"
                                    value={tempValue}
                                    onChange={(e) => setTempValue(e.target.value)}
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveInline()}
                                    className="mt-1 bg-[#14120e] border border-[#c4a97d] px-2.5 py-1 text-sm font-mono text-white/90 focus:outline-none w-full sm:w-64"
                                />
                            ) : (
                                <span className="font-mono text-[14px] text-white/90 font-medium mt-0.5 truncate">
                                    {accountData.email}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center self-end sm:self-center shrink-0">
                        {editingField === 'email' ? (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleSaveInline}
                                    disabled={isSavingInline}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#c4a97d]/10 border border-[#c4a97d] text-[#c4a97d] font-jost text-[11px] font-semibold uppercase tracking-[0.1em] hover:bg-[#c4a97d]/20 transition-colors cursor-pointer disabled:opacity-40"
                                >
                                    {isSavingInline ? <Loader2 size={13} className="animate-spin" /> : <Check size={14} />} Save
                                </button>
                                <button
                                    onClick={handleCancelInline}
                                    disabled={isSavingInline}
                                    className="flex items-center justify-center w-8 h-8 bg-transparent border border-[#7a6b4f]/30 text-white/50 hover:text-white hover:border-white/40 transition-colors cursor-pointer"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => handleStartEdit('email')}
                                className="flex items-center gap-2 px-3.5 py-2 bg-transparent border border-[#7a6b4f]/30 text-white/70 hover:text-[#c4a97d] hover:border-[#c4a97d] transition-all font-jost text-[11.5px] font-medium uppercase tracking-[0.12em] cursor-pointer"
                            >
                                <Edit3 size={14} strokeWidth={1.75} /> Edit
                            </button>
                        )}
                    </div>
                </div>

                {/* --- PASSWORD ROW --- */}
                <div className="group relative flex items-center justify-between p-4 border border-[#7a6b4f]/30 hover:border-[#c4a97d]/50 transition-all duration-300 no-underline overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-r from-[#7a6b4f]/0 via-[#7a6b4f]/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    <div className="flex items-center gap-3.5 min-w-0">
                        <div className="flex items-center justify-center w-10 h-10 shrink-0 text-[#c4a97d]">
                            <Lock size={18} strokeWidth={1.75} />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="font-jost text-[10.5px] font-semibold tracking-[0.15em] uppercase text-white/40">
                                Password
                            </span>
                            <span className="font-mono text-[16px] text-white/80 font-bold tracking-[0.25em] mt-0.5">
                                ••••••••••••
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center self-end sm:self-center shrink-0">
                        <button
                            onClick={() => setIsPasswordModalOpen(true)}
                            className="flex items-center gap-2 px-3.5 py-2 bg-transparent border border-[#7a6b4f]/30 text-white/70 hover:text-[#c4a97d] hover:border-[#c4a97d] transition-all font-jost text-[11.5px] font-medium uppercase tracking-[0.12em] cursor-pointer"
                        >
                            <KeyRound size={14} strokeWidth={1.75} /> Change
                        </button>
                    </div>
                </div>
            </div>

            {/* --- PASSWORD MODAL POPUP --- */}
            <AnimatePresence>
                {isPasswordModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closePasswordModal}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />

                        {/* Modal Box */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ duration: 0.25, ease: EASE }}
                            className="relative w-full max-w-md bg-[#0d0c0a] border border-[#7a6b4f]/50 p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.7)] z-10"
                        >
                            {/* Close Header Button */}
                            <button
                                onClick={closePasswordModal}
                                className="absolute top-5 right-5 text-white/40 hover:text-white transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>

                            <div className="flex items-center gap-3 border-b border-[#7a6b4f]/20 pb-4 mb-6">
                                <KeyRound size={20} className="text-[#c4a97d]" />
                                <h4 className="font-jost text-sm font-semibold tracking-[0.15em] uppercase text-white/90">
                                    Update Security Password
                                </h4>
                            </div>

                            <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                {passwordError && (
                                    <div className="flex items-center gap-2.5 p-3 bg-red-950/40 border border-red-500/50 text-red-300 text-xs font-mono">
                                        <ShieldAlert size={16} className="shrink-0 text-red-400" />
                                        <span>{passwordError}</span>
                                    </div>
                                )}

                                {passwordSuccess && (
                                    <div className="flex items-center gap-2.5 p-3 bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-xs font-mono">
                                        <ShieldCheck size={16} className="shrink-0 text-emerald-400" />
                                        <span>Password updated successfully!</span>
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <label className="font-jost text-[11px] font-medium tracking-[0.12em] uppercase text-white/60">
                                        Current Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword.current ? 'text' : 'password'}
                                            value={passwords.current}
                                            onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                            placeholder="••••••••••••"
                                            className="w-full bg-[#14120e] border border-[#7a6b4f]/40 px-3 py-2.5 text-sm font-mono text-white placeholder-white/20 focus:border-[#c4a97d] focus:outline-none pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(p => ({ ...p, current: !p.current }))}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
                                        >
                                            {showPassword.current ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1.5 pt-2">
                                    <label className="font-jost text-[11px] font-medium tracking-[0.12em] uppercase text-white/60">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword.new ? 'text' : 'password'}
                                            value={passwords.new}
                                            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                            placeholder="Min. 8 characters"
                                            className="w-full bg-[#14120e] border border-[#7a6b4f]/40 px-3 py-2.5 text-sm font-mono text-white placeholder-white/20 focus:border-[#c4a97d] focus:outline-none pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(p => ({ ...p, new: !p.new }))}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
                                        >
                                            {showPassword.new ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="font-jost text-[11px] font-medium tracking-[0.12em] uppercase text-white/60">
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword.confirm ? 'text' : 'password'}
                                            value={passwords.confirm}
                                            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                            placeholder="Repeat new password"
                                            className="w-full bg-[#14120e] border border-[#7a6b4f]/40 px-3 py-2.5 text-sm font-mono text-white placeholder-white/20 focus:border-[#c4a97d] focus:outline-none pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(p => ({ ...p, confirm: !p.confirm }))}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
                                        >
                                            {showPassword.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#7a6b4f]/20 mt-6">
                                    <button
                                        type="button"
                                        onClick={closePasswordModal}
                                        className="px-4 py-2.5 bg-transparent border border-transparent text-white/60 hover:text-white font-jost text-xs font-semibold uppercase tracking-[0.12em] transition-colors cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={passwordSuccess}
                                        className="px-5 py-2.5 bg-[#c4a97d] hover:bg-[#b39668] text-[#0d0c0a] font-jost text-xs font-bold uppercase tracking-[0.15em] transition-colors shadow-[0_0_15px_rgba(196,169,125,0.3)] cursor-pointer disabled:opacity-50"
                                    >
                                        {passwordSuccess ? 'Updated!' : 'Update Password'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
