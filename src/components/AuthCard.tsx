'use client'

import Image from 'next/image'
import { motion, AnimatePresence } from 'motion/react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff, ShieldAlert, X } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useState, useActionState, useEffect, startTransition } from "react";
import { EASE} from '@/lib/utils'
import { AuthState, FormErrors, handleAuth } from '@/app/actions/handleAuth'
import { toast } from '@/stores/alertStore'
import type { AuthData } from '@/types/profile'


// Assuming these are imported or defined elsewhere in your file
const PROVIDERS = [
    { id: 'google',  label: 'Google',  Icon: '/Icons/google.svg' }, // Replace with GoogleIcon
    { id: 'discord', label: 'Discord', Icon: '/Icons/discord.svg'}, // Replace with DiscordIcon
    { id: 'steam',   label: 'Steam',   Icon: '/Icons/steam.svg'}, // Replace with SteamIcon
]

function AuthInput({ label, id, trailingLabel, type = 'text', placeholder, value, onChange, trailing, error }: {
    label: string,
    id: string
    value: string
    onChange: (id: string, value: string) => void
    trailingLabel? : React.ReactNode
    type?: string
    placeholder?: string
    trailing?: React.ReactNode
    error?: string
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
                <label
                    htmlFor={id}
                    className="font-jost text-[9px] font-medium uppercase text-[#c4a97d]/75 tracking-[0.22em]"
                >
                    {label}
                </label>
                {trailingLabel}
            </div>
            <div className="relative">
                <Input
                    id={id}
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(id, e.target.value)}
                    className={`
                        bg-white/3 border border-[#7a6b4f]/25 text-white/88 
                        font-jost text-[13px] tracking-[0.03em] 
                        rounded-none h-11 pr-10 transition-all duration-200
                        placeholder:text-white/20
                        focus:border-[#c4a97d]/60 focus:shadow-[0_0_0_2px_rgba(196,169,125,0.08)] focus:outline-none focus:ring-0
                        focus-visible:ring-0 focus-visible:shadow-[0_0_0_2px_rgba(196,169,125,0.08)]
                        ${error ? 'border-destructive focus-visible:ring-red-500' : ''}
                    `}
                />
                {trailing && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {trailing}
                    </div>
                )}
            </div>
            {error && (
                <span className="text-[10px] font-medium text-red-500 mt-0.5">
                    {error}
                </span>
            )}
        </div>
    )
}

export default function AuthCard() {

    const {isAuthOpen , onAuthSuccess , closeAuth} = useAuthStore()

    const [mode, setMode] = useState<'signin' | 'signup'>('signin')
    const [showPass, setShowPass] = useState(false)
    const isSignup = mode === 'signup'

    const [formData, setformData] = useState<AuthData>({password:""})

    // Single action hook running the unified backend pipeline
    const [state, formAction, isPending] = useActionState<AuthState, { type: 'signin' | 'signup'; data: AuthData }>(
        handleAuth,
        { errors: {} }
    )

    const [errors, setErrors] = useState<FormErrors | undefined>({})

    useEffect(() => {
        setErrors(state.errors)
    }, [state.errors])

    useEffect(() => {
        setErrors({})
    }, [mode])

    const handleValueChange = (id: string, value: string) => {

        setformData(prev => ({ ...prev, [id]: value })) // update value to this ID
        
        setErrors(prev => {
            if (prev && (prev[id] || prev.message)) {
                const { [id]: _discardId, message: _discardMessage, ...rest } = prev;
                return rest;
            }
            return prev
        })
    }
    

    useEffect(() => {
        if (state.success) {
            toast.success('Login Successful')
            onAuthSuccess?.()
            closeAuth()
        }
        else if(state.success === false) {
            toast.error('Login Failed', state.errors?.message)
        }
    }, [state.success])

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        setErrors({})
        startTransition(() => {
            formAction({ type: mode, data: formData })
        })
    }

    const handleOAuthClick = (provider: { id: string; label: string }) => {
        if (provider.id === 'google' || provider.id === 'steam') {
            toast.warning(
                `${provider.label} Sign-In Unavailable`,
                'Service temporarily inactive. Please sign in with username/email and password.'
            );
            return;
        }
        toast.warning(
            `${provider.label} Sign-In Unavailable`,
            'Service temporarily inactive.'
        );
    };

    if(!isAuthOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="fixed inset-0 z-100 flex items-center justify-center bg-[#080808]/88 backdrop-blur-sm"
            >
                <div className="absolute inset-0 cursor-pointer" onClick={closeAuth} />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.4, ease: EASE }}
                    className="relative w-full max-w-sm z-10"
                >
                    <Card className="w-full relative overflow-hidden bg-[#080808] border border-[#7a6b4f]/22 rounded-none shadow-[0_20px_60px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(196,169,125,0.06)]">
                        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#c4a97d] to-transparent opacity-45" />

                        <button
                            onClick={closeAuth}
                            className="absolute top-4 right-4 p-1.5 text-white/40 hover:text-[#c4a97d] transition-colors bg-[#080808]/50 rounded-none border border-transparent hover:border-[#7a6b4f]/30 z-20"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <CardHeader className="px-8">
                            <div className="flex items-center justify-center mb-7">
                                <Image
                                    src="/images/logo_4x.png"
                                    alt="BuckShot"
                                    width={500}
                                    height={500}
                                    className="w-16 h-16 object-contain brightness-[0.85] sepia-[0.2]"
                                />
                            </div>

                        </CardHeader>

                        <CardContent className="px-8 pb-8">
                            {/* Third-party providers */}
                            <div className="flex gap-2 mb-6">
                                {PROVIDERS.map(({ id, label, Icon }) => (
                                    <motion.button
                                        key={id}
                                        whileHover={{
                                            borderColor: '#c4a97d73',
                                            backgroundColor: '#7a6b4f14',
                                        }}
                                        whileTap={{ scale: 0.97 }}
                                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-white/8 bg-white/2 rounded-none cursor-pointer"
                                        type="button"
                                        onClick={() => handleOAuthClick({ id, label })}
                                        title={`Continue with ${label}`}
                                    >
                                        <Image src={Icon} alt={label} width={20} height={20}/>
                                        <span className="font-[sans-serif] text-[10px] font-normal tracking-[0.08em] text-white/45">
                                            {label}
                                        </span>
                                    </motion.button>
                                ))}
                            </div>

                            {/* Divider */}
                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex-1 h-px bg-white/7" />
                                <span className="font-['Jost',sans-serif] text-[9px] tracking-[0.2em] uppercase text-white/20">
                                    or
                                </span>
                                <div className="flex-1 h-px bg-white/7" />
                            </div>

                            {errors?.message && (
                                <div className="mb-3 flex items-center gap-2.5 p-3 bg-red-950/40 border border-red-500/50 text-red-300 text-xs font-mono">
                                    <ShieldAlert size={16} className="shrink-0 text-red-400" />
                                    <span>{errors.message}</span>
                                </div>
                            )}
                            {/* Form fields */}
                            <div className="flex flex-col gap-4">
                                <AnimatePresence>
                                    {isSignup && (
                                        <>
                                            <motion.div
                                                key="displayname-field"
                                                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.3, ease: EASE }}
                                                className="overflow-hidden"
                                            >
                                                <AuthInput 
                                                    label="Display Name" 
                                                    id="name" 
                                                    placeholder="John Doe" 
                                                    value={formData.name || ""} 
                                                    onChange={handleValueChange}
                                                    error={errors?.name}
                                                />
                                            </motion.div>
                                            <motion.div
                                                key="username-field"
                                                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.3, ease: EASE }}
                                                className="overflow-hidden"
                                            >
                                                <AuthInput 
                                                    label="User Name" 
                                                    id="handle" 
                                                    placeholder="john_doe" 
                                                    value={formData.handle || ""} 
                                                    onChange={handleValueChange}
                                                    error={errors?.handle}
                                                />
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>

                                {isSignup && <AuthInput 
                                    label="Email" 
                                    id="email" 
                                    type="email" 
                                    placeholder="johndoe@email.com" 
                                    value={formData.email || ""} 
                                    onChange={handleValueChange}
                                    error={errors?.email}
                                />}
                                {!isSignup && <AuthInput 
                                    label="Email or username" 
                                    id="identifier" 
                                    type="text" 
                                    placeholder="johndoe@email.com or johndoe" 
                                    value={formData.identifier || ""} 
                                    onChange={handleValueChange}
                                    error={errors?.identifier}
                                />}


                                
                                <AuthInput
                                    label='Password'
                                    id="password"
                                    type={showPass ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={formData.password || ""}
                                    onChange={handleValueChange}
                                    error={errors?.password}
                                    trailingLabel = {
                                        !isSignup && (
                                            <a href="#" className="font-[sans-serif] text-[10px] font-light tracking-[0.06em] text-white/28 no-underline hover:text-[#c4a97d] transition-colors duration-200">
                                                Forgot password?
                                            </a>
                                    )}
                                    trailing={
                                        <button
                                            type="button"
                                            onClick={() => setShowPass(!showPass)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer p-0 text-white/25 hover:text-white/50 transition-colors duration-200"
                                        >
                                            {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    }
                                />
                            </div>

                            {/* Submit */}
                            <motion.button
                                onClick={handleSubmit}
                                disabled={isPending}
                                whileHover={!isPending ? { backgroundColor: '#c4a97d' } : {}}
                                whileTap={{ scale: 0.98 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="relative w-full mt-6 overflow-hidden group py-3 px-6 bg-[#7a6b4f] border-none rounded-none text-white/90 font-['Jost',sans-serif] text-[11px] font-semibold tracking-[0.22em] uppercase cursor-pointer flex items-center justify-center"
                            >
                                <div className="relative inline-block pb-1">
                                    <span>
                                        {isSignup ? isPending ? 'Creating Account' : 'Create Account' : isPending ? 'Signing In' : 'Sign In'}
                                    </span>
                                    
                                    {isPending && (
                                        <motion.span
                                            className="absolute bottom-0 left-0 h-px bg-white/60"
                                            initial={{ width: "0%", left: "0%" }}
                                            animate={{ 
                                                width: ["0%", "100%", "0%"],
                                                left: ["0%", "0%", "100%"]
                                            }}
                                            transition={{
                                                repeat: Infinity,
                                                duration: 1.5,
                                                ease: "easeInOut",
                                            }}
                                        />
                                    )}
                                </div>
                            </motion.button>


                            <p className="text-center mt-5 font-jost text-[11px] font-light tracking-[0.04em] text-white/25">
                                {isSignup ? 'Already have an account? ' : "Don't have an account? "}
                                <button
                                    onClick={() => setMode(isSignup ? 'signin' : 'signup')}
                                    className="bg-transparent border-none cursor-pointer p-0 text-[#c4a97d] font-[sans-serif] text-[11px] font-normal tracking-[0.04em] underline underline-offset-[3px] decoration-[#c4a97d]/40"
                                >
                                    {isSignup ? 'Sign in' : 'Register'}
                                </button>
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}